import Papa from "papaparse";
import type {
  EtsyCSVRow,
  ParsedTransaction,
  Order,
  Deposit,
  Summary,
} from "@/app/types/etsy";
import { isAfter, isBefore } from "date-fns";

import {
  parseAmount,
  parseDate,
  extractOrderNumber,
  extractListingNumber,
} from "@/app/lib/etsy/util";

export function parseCSV(csvText: string): ParsedTransaction[] {
  const result = Papa.parse<EtsyCSVRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return result.data.map((row) => {
    const orderNumber = extractOrderNumber(row);
    const listingNumber = extractListingNumber(row);

    let availabilityDate: Date | undefined;

    if (row.Info) {
      let dateMatch = undefined;
      if (row.Info.includes("Funds will be available on")) {
        dateMatch = row.Info.match(/Funds will be available on (.+)/);
      } else if (row.Info.includes("placed in reserve until ")) {
        dateMatch = row.Info.match(/placed in reserve until (.+)/);
      }

      if (dateMatch) {
        availabilityDate = parseDate(dateMatch[1]);
      }
    }

    return {
      date: parseDate(row.Date),
      type: row.Type as ParsedTransaction["type"],
      title: row.Title,
      info: row.Info,
      currency: row.Currency,
      amount: parseAmount(row.Amount),
      fees: parseAmount(row["Fees & Taxes"]),
      net: parseAmount(row.Net),
      taxDetails: row["Tax Details"],
      status: row["Status"] as ParsedTransaction["status"],
      availabilityDate: availabilityDate,
      orderNumber: orderNumber,
      listingNumber: listingNumber,
    };
  });
}

export function groupTransactionsByOrder(
  transactions: ParsedTransaction[],
): Order[] {
  const orderMap = new Map<string, ParsedTransaction[]>();

  transactions.forEach((transaction) => {
    let transactionNumber = undefined;
    if (transaction.orderNumber) {
      transactionNumber = transaction.orderNumber;
    } else if (transaction.type === "Sale") {
      transactionNumber = transaction.title.replace("Payment for Order #", "");
    } else if (transaction.type === "Refund") {
      transactionNumber = transaction.title.replace("Refund for Order #", "");
    }

    if (transactionNumber !== undefined) {
      if (!orderMap.has(transactionNumber)) {
        orderMap.set(transactionNumber, []);
      }
      orderMap.get(transactionNumber)!.push(transaction);
    }
  });

  const orders: Order[] = [];

  orderMap.forEach((txns, orderNumber) => {
    const saleTxn = txns.find((t) => t.type === "Sale");
    if (!saleTxn) return;

    const fees = txns
      .filter((t) => t.type === "Fee" || t.type == "Buyer Fee")
      .reduce((sum, t) => sum + t.net, 0);
    const taxes = txns
      .filter((t) => t.type === "Tax")
      .reduce((sum, t) => sum + t.fees, 0);

    // Extract item title from the FIRST non-"Shipping" transaction fee
    let itemTitle = "Unknown Item";
    const productFeeTxn = txns.find(
      (t) =>
        t.type === "Fee" &&
        t.title.includes("Transaction fee:") &&
        !t.title.includes("Transaction fee: Shipping"),
    );

    if (productFeeTxn) {
      itemTitle = productFeeTxn.title.replace("Transaction fee:", "").trim();
    }

    const inReserve = saleTxn.status === "Reserve Applied";
    const refundTxn = txns.find((t) => t.type === "Refund");

    let reserveAmount = undefined;
    if (inReserve) {
      // "$50.99 placed in reserve until Mar 23, 2026"
      const reserveMatch = saleTxn.info.match(/(.+) placed in reserve until /);
      if (reserveMatch) {
        reserveAmount = parseAmount(reserveMatch[0]);
      }
    }

    orders.push({
      orderNumber: orderNumber,
      date: saleTxn.date,
      itemTitle: itemTitle,
      saleAmount: saleTxn.amount,
      totalFees: fees,
      totalTaxes: taxes,
      netAmount: saleTxn.net + fees + taxes + (refundTxn?.net ?? 0),
      availabilityDate: saleTxn.availabilityDate,
      isPaidOut: false,
      transactions: txns,
      reserveAmount: reserveAmount,
      status: inReserve ? "reserve" : refundTxn ? "refunded" : undefined,
    });
  });

  return orders.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getDeposits(transactions: ParsedTransaction[]): Deposit[] {
  return transactions
    .filter((t) => t.type === "Deposit")
    .map((t) => ({
      date: t.date,
      amount: parseAmount(t.title.match(/\$[\d,]+\.\d+/)?.[0] || "0"),
      description: t.title,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function determinePayoutStatus(
  orders: Order[],
  deposits: Deposit[],
): Order[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  // Sort deposits by date
  const sortedDeposits = [...deposits].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  return orders.map((order) => {
    if (order.status !== undefined) return order;

    // If there's an availability date in the future, it's either in reserve or pending
    if (order.availabilityDate) {
      const availDate = new Date(order.availabilityDate);
      availDate.setHours(0, 0, 0, 0);

      // Check if availability date is in the future (reserve)
      if (isAfter(availDate, today)) {
        return {
          ...order,
          isPaidOut: false,
          status: "pending" as const,
        };
      }
      // Availability date has passed - check if there's a deposit after it
      const payout = sortedDeposits.find((d) => {
        const depositDate = new Date(d.date);
        depositDate.setHours(0, 0, 0, 0);
        return !isBefore(depositDate, availDate);
      });

      if (payout) {
        return {
          ...order,
          isPaidOut: true,
          paidOutDate: payout.date,
          status: "paid" as const,
        };
      } else {
        // Available but not yet deposited - in current Etsy balance
        return {
          ...order,
          isPaidOut: false,
          status: "current_balance" as const,
        };
      }
    } else {
      // No availability date - check if there's any deposit after the order date
      const payout = sortedDeposits.find((d) => {
        const depositDate = new Date(d.date);
        const orderDate = new Date(order.date);
        depositDate.setHours(0, 0, 0, 0);
        orderDate.setHours(0, 0, 0, 0);
        return !isBefore(depositDate, orderDate);
      });

      if (payout) {
        return {
          ...order,
          isPaidOut: true,
          paidOutDate: payout.date,
          status: "paid" as const,
        };
      } else {
        // No deposit found and no availability date - in current Etsy balance
        return {
          ...order,
          isPaidOut: false,
          status: "current_balance" as const,
        };
      }
    }
  });
}

export function calculateSummary(
  orders: Order[],
  deposits: Deposit[],
  miscTransactions: ParsedTransaction[],
): Summary {
  const totalSales = orders
    .filter((o) => o.status !== "refunded")
    .reduce((sum, o) => sum + (o.saleAmount - o.totalTaxes), 0);

  const miscFees = miscTransactions
    .filter((tx) => tx.type === "Fee")
    .reduce((sum, o) => sum + o.fees, 0);

  const totalFees = orders.reduce((sum, o) => sum + o.totalFees, 0) + miscFees;

  const miscTaxes = miscTransactions
    .filter((tx) => tx.type === "Tax")
    .reduce((sum, o) => sum + o.fees, 0);
  const totalTaxes =
    orders.reduce((sum, o) => sum + o.totalTaxes, 0) + miscTaxes;
  const netRevenue =
    orders.reduce((sum, o) => sum + o.netAmount, 0) + (miscFees + miscTaxes);
  const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);

  const paidOutOrders = orders.filter((o) => o.status === "paid");
  const currentBalanceOrders = orders.filter(
    (o) => o.status === "current_balance" || o.status === "reserve",
  );
  const reserveOrders = orders.filter((o) => o.status === "reserve");

  const currentBalance =
    currentBalanceOrders.reduce((sum, o) => sum + o.netAmount, 0) +
    (miscFees + miscTaxes);

  const reserveAmount = reserveOrders.reduce(
    (sum, o) => sum + (o.reserveAmount ?? 0),
    0,
  );

  const availableForDeposit = currentBalance - reserveAmount;

  return {
    totalSales,
    totalFees,
    totalTaxes,
    netRevenue,
    totalDeposits,
    currentBalance,
    reserveAmount,
    availableForDeposit: availableForDeposit,
    ordersCount: orders.length,
    paidOutOrdersCount: paidOutOrders.length,
    currentBalanceOrdersCount: currentBalanceOrders.length,
    reserveOrdersCount: reserveOrders.length,
  };
}

export function processEtsyStatements(csvFiles: string[]): {
  orders: Order[];
  deposits: Deposit[];
  summary: Summary;
  allTransactions: ParsedTransaction[];
  miscTransactions: ParsedTransaction[];
} {
  const allTransactions: ParsedTransaction[] = [];

  csvFiles.forEach((csvText) => {
    const transactions = parseCSV(csvText);
    allTransactions.push(...transactions);
  });

  const orders = groupTransactionsByOrder(allTransactions);
  const deposits = getDeposits(allTransactions);

  // This is a list of all of the transactions *without* a given order associated to it
  // For example: Listing fees
  const miscTransactions = allTransactions.filter((transaction) => {
    for (const order of orders) {
      if (order.transactions.findIndex((tx) => tx == transaction) != -1)
        return false;
    }

    return transaction.type !== "Deposit";
  });

  const ordersWithPayoutStatus = determinePayoutStatus(orders, deposits);
  const summary = calculateSummary(
    ordersWithPayoutStatus,
    deposits,
    miscTransactions,
  );

  return {
    orders: ordersWithPayoutStatus,
    deposits: deposits,
    summary: summary,
    allTransactions: allTransactions,
    miscTransactions: miscTransactions,
  };
}
