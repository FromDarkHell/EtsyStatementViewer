export interface EtsyCSVRow {
  Date: string;
  Type: string;
  Title: string;
  Info: string;
  Currency: string;
  Amount: string;
  "Fees & Taxes": string;
  Net: string;
  "Tax Details": string;
  Status?: string;
  "Availability Date"?: string;
}

export interface ParsedTransaction {
  date: Date;
  type: "Sale" | "Fee" | "Tax" | "Deposit" | "Buyer Fee" | "Refund" | "Other";
  title: string;
  info: string;
  currency: string;
  amount: number;
  fees: number;
  net: number;
  taxDetails?: string;
  status?: "Reserve Applied";
  availabilityDate?: Date;
  orderNumber?: string;
  listingNumber?: string;
}

export interface Order {
  orderNumber: string;
  date: Date;
  itemTitle: string;
  saleAmount: number;
  totalFees: number;
  totalTaxes: number;
  netAmount: number;
  availabilityDate?: Date;
  isPaidOut: boolean;
  paidOutDate?: Date;
  status?: "current_balance" | "pending" | "reserve" | "paid" | "refunded";
  reserveAmount?: number;
  transactions: ParsedTransaction[];
}

export interface Deposit {
  date: Date;
  amount: number;
  description: string;
}

export interface Summary {
  totalSales: number;
  totalFees: number;
  totalTaxes: number;
  netRevenue: number;
  totalDeposits: number;
  currentBalance: number;
  reserveAmount: number;
  ordersCount: number;
  availableForDeposit: number;
  paidOutOrdersCount: number;
  currentBalanceOrdersCount: number;
  reserveOrdersCount: number;
}
