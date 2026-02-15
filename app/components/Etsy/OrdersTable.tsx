'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import type { Order } from '@/app/types/etsy';
import Expander from '../Expander';
import TransactionsInfo from './Transactions/TransactionInfo';

interface OrdersTableProps {
    orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
    const [filter, setFilter] = useState<'all' | Order["status"]>('all');
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const filteredOrders = orders.filter(order => {
        if (filter === "all") return true;

        return order.status === filter;
    });

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        if (sortBy === 'amount') {
            return b.netAmount - a.netAmount;
        }
        return b.date.getTime() - a.date.getTime();
    });

    const getStatusBadge = (order: Order) => {
        if (order.status === 'paid') {
            return <span className="badge badge-success">Paid Out</span>;
        } else if (order.status === 'current_balance') {
            return <span className="badge badge-info">In Balance</span>;
        } else if (order.status === 'pending') {
            return <span className="badge badge-gray">Pending</span>;
        } else if (order.status === "refunded") {
            return <span className="badge badge-danger">Refunded</span>;
        } else {
            return <span className="badge badge-warning">In Reserve</span>;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        All ({orders.length})
                    </button>

                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending'
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Pending ({orders.filter(o => o.status === 'pending').length})
                    </button>

                    <button
                        onClick={() => setFilter('reserve')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'reserve'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Reserve ({orders.filter(o => o.status === 'reserve').length})
                    </button>

                    <button
                        onClick={() => setFilter('current_balance')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'current_balance'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        In Balance ({orders.filter(o => o.status === 'current_balance').length})
                    </button>


                    <button
                        onClick={() => setFilter('paid')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'paid'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Paid ({orders.filter(o => o.status === 'paid').length})
                    </button>
                </div>

                <div className="flex gap-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="amount">Sort by Amount</option>
                    </select>
                </div>
            </div>

            <div className="space-y-3">
                {sortedOrders.map((order) => (
                    <div key={order.orderNumber} className="order-card">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {order.itemTitle}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-mono">
                                            Order #{order.orderNumber}
                                        </p>
                                    </div>
                                    {getStatusBadge(order)}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-500">Order Date</p>
                                        <p className="font-medium text-gray-900">
                                            {format(order.date, 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Sale Amount</p>
                                        <p className="font-medium text-gray-900">
                                            {formatCurrency(order.saleAmount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Fees & Taxes</p>
                                        <p className="font-medium text-red-600">
                                            {formatCurrency(order.totalFees + order.totalTaxes)}
                                        </p>
                                    </div>


                                    {
                                        order.reserveAmount && (
                                            <div>
                                                <p className="text-gray-500">Reserve Amount</p>
                                                <p className="font-bold text-yellow-500">
                                                    {formatCurrency(order.reserveAmount)}
                                                </p>
                                            </div>)
                                    }

                                    <div>
                                        <p className="text-gray-500">Net Amount</p>
                                        <p className="font-bold text-green-600">
                                            {formatCurrency(order.netAmount)}
                                        </p>
                                    </div>

                                </div>

                                {order.status === 'current_balance' && (
                                    <div className="text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                        <p className="text-emerald-800 font-medium">
                                            💵 Currently in your Etsy payment account balance
                                        </p>
                                    </div>
                                )}

                                {order.availabilityDate && (
                                    <div className="text-sm">
                                        <p className="text-gray-500">
                                            Will be available: {' '}
                                            <span className="font-medium text-gray-900">
                                                {format(order.availabilityDate, 'MMM dd, yyyy')}
                                            </span>

                                            {order.status === 'reserve' && (
                                                <span className="ml-1 text-xs text-gray-600">(or whenever shipped)</span>
                                            )}
                                        </p>
                                    </div>
                                )}

                                {order.paidOutDate && (
                                    <div className="text-sm">
                                        <p className="text-gray-500">
                                            Paid out on: {' '}
                                            <span className="font-medium text-green-700">
                                                {format(order.paidOutDate, 'MMM dd, yyyy')}
                                            </span>
                                        </p>
                                    </div>
                                )}


                                <Expander title="View Transactions">
                                    {order.transactions.map((transaction, index) => (
                                        <div
                                            key={index}
                                            className="px-6 py-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <TransactionsInfo transaction={transaction} />
                                        </div>
                                    ))}
                                </Expander>
                            </div>
                        </div>
                    </div>
                ))}

                {sortedOrders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No orders found for this filter
                    </div>
                )}
            </div>
        </div>
    );
}