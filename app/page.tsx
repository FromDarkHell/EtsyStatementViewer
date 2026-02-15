'use client';

import { useState } from 'react';
import FileUpload from '@/app/components/FileUpload';
import SummaryStats from '@/app/components/Etsy/SummaryStats';
import OrdersTable from '@/app/components/Etsy/OrdersTable';
import DepositsList from '@/app/components/Etsy/DepositsList';
import { processEtsyStatements } from '@/app/lib/etsy/parser';
import type { Order, Deposit, Summary, ParsedTransaction } from '@/app/types/etsy';
import TransactionsList from './components/Etsy/Transactions/TransactionsList';

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [miscTransactions, setMiscTransactions] = useState<ParsedTransaction[]>([]);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleFilesLoaded = (csvContents: string[]) => {
    try {
      const result = processEtsyStatements(csvContents);
      setOrders(result.orders);
      setDeposits(result.deposits);
      setSummary(result.summary);
      setMiscTransactions(result.miscTransactions);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error processing CSV files:', error);
      alert('Error processing CSV files. Please check the file format.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Etsy Payout Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Track your Etsy orders and bank deposits
              </p>
            </div>
          </div>
        </header>

        {/* File Upload */}
        {!isLoaded && (
          <div className="mb-8">
            <FileUpload onFilesLoaded={handleFilesLoaded} />
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Download your Etsy payment statement CSV files from your Etsy seller account</li>
                <li>Upload one or more CSV files using the area above</li>
                <li>View your orders, payout status, and financial summary</li>
              </ol>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        {isLoaded && summary && (
          <div className="mb-8">
            <SummaryStats summary={summary} />
          </div>
        )}

        {/* Main Content Grid */}
        {isLoaded && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Orders Section - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
                <button
                  onClick={() => {
                    setIsLoaded(false);
                    setOrders([]);
                    setDeposits([]);
                    setSummary(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Upload New Files
                </button>
              </div>
              <OrdersTable orders={orders} />
            </div>

            {/* Deposits Section - 1 column */}
            <div className="space-y-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Deposits <span className='text-gray-600 text-sm'>({deposits.length})</span></h2>
                <DepositsList deposits={deposits} />
              </div>
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Misc. Transactions <span className='text-gray-600 text-sm'>({miscTransactions.length})</span></h2>
                <TransactionsList transactions={miscTransactions} />
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}