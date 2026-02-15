'use client';

import { format } from 'date-fns';
import type { ParsedTransaction } from '@/app/types/etsy';
import TransactionsInfo from './TransactionInfo';

interface TransactionsListProps {
    transactions: ParsedTransaction[];
}

export default function TransactionsList({ transactions }: TransactionsListProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    if (transactions.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500">No misc transactions found in the uploaded statements</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
                {transactions.map((transaction, index) => (
                    <div
                        key={index}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                        <TransactionsInfo transaction={transaction} />
                    </div>
                ))}
            </div>
        </div>
    );
}