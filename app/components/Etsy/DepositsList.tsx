'use client';

import { format } from 'date-fns';
import type { Deposit } from '@/app/types/etsy';

interface DepositsListProps {
    deposits: Deposit[];
}

export default function DepositsList({ deposits }: DepositsListProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    if (deposits.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500">No deposits found in the uploaded statements</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
                {deposits.map((deposit, index) => (
                    <div
                        key={index}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                    {deposit.description}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {format(deposit.date, 'MMMM dd, yyyy')}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-green-600">
                                    {formatCurrency(deposit.amount)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}