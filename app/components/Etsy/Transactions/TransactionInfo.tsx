'use client';

import { format } from 'date-fns';
import type { ParsedTransaction } from '@/app/types/etsy';

interface TransactionInfoProps {
    transaction: ParsedTransaction;
}

export default function TransactionsInfo({ transaction }: TransactionInfoProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="bg-white hover:bg-gray-50 transition-colors">
            <div className="divide-y divide-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="font-medium text-gray-900">
                            {transaction.title}
                        </p>
                        <p className="font-medium text-gray-600 text-sm">
                            {transaction.info}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {format(transaction.date, 'MMMM dd, yyyy')}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className={"text-xl font-bold " + (transaction.net <= 0 ? "text-red-500" : "text-green-500")}>
                            {formatCurrency(transaction.net)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}