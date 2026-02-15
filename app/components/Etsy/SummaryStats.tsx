'use client';

import type { Summary } from '@/app/types/etsy';

interface SummaryStatsProps {
    summary: Summary;
}

export default function SummaryStats({ summary }: SummaryStatsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const stats = [
        {
            label: 'Total Sales (after taxes)',
            value: formatCurrency(summary.totalSales),
            subtext: `${summary.ordersCount} orders`,
            color: 'blue',
        },
        {
            label: 'Total Fees',
            value: formatCurrency(summary.totalFees),
            color: 'red',
        },
        {
            label: 'Total Taxes',
            value: formatCurrency(summary.totalTaxes),
            color: 'red',
        },
        {
            label: 'Net Revenue',
            value: formatCurrency(summary.netRevenue),
            subtext: 'After fees & taxes',
            color: 'green',
        },
        {
            label: 'In Reserve',
            value: formatCurrency(summary.reserveAmount),
            subtext: `${summary.reserveOrdersCount} orders waiting`,
            color: 'orange',
        },
        {
            label: 'Total Deposited',
            value: formatCurrency(summary.totalDeposits),
            subtext: `${summary.paidOutOrdersCount} orders paid`,
            color: 'purple',
        },
    ];

    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200',
        red: 'bg-red-50 border-red-200',
        green: 'bg-green-50 border-green-200',
        emerald: 'bg-emerald-50 border-emerald-200',
        purple: 'bg-purple-50 border-purple-200',
        orange: 'bg-orange-50 border-orange-200',
    };

    const textColorClasses = {
        blue: 'text-blue-900',
        red: 'text-red-900',
        green: 'text-green-900',
        emerald: 'text-emerald-900',
        purple: 'text-purple-900',
        orange: 'text-orange-900',
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {stats.map((stat, index) => {
                return (<div
                    key={index}
                    className={`stat-card ${colorClasses[stat.color as keyof typeof colorClasses]}`}
                >
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${textColorClasses[stat.color as keyof typeof textColorClasses]}`}>
                        {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{stat.subtext}</p>
                </div>);
            })}
        </div>
    );
}