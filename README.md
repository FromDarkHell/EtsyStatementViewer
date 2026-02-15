# Etsy Statement Viewer

A Next.js powered web application that parses Etsy financial statements to track order payouts and give insights for your Etsy shop.

![](/docs/Screenshot%202026-02-15%20122918.png)

## Features

- **Comprehensive Dashboard**: View all your Etsy orders, fees, taxes, and deposits in one place
- **Payout Status Tracking**: Automatically determines whether orders have been paid out to your bank account
- **Financial Summary**: Get instant insights into total sales, fees, net revenue, and pending payouts
- **Filtering & Sorting**: Filter orders by payout status and sort by date or amount
- **Multi-File Support**: Upload multiple CSV files at once for complete analysis

## How It Works

The application parses Etsy CSV statements and:

1. **Groups transactions by order number** - Combines sales, fees, and taxes for each order
2. **Extracts deposit information** - Identifies bank deposits from your statements
3. **Determines payout status** - Matches orders with deposits based on availability dates
4. **Calculates financials** - Provides detailed breakdowns of revenue, fees, and net amounts

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

To create a production build:

```bash
npm run build
npm start
```

## How to Use

### Step 1: Export Your Etsy Statements

1. Log into your Etsy seller account
2. Go to **Shop Manager** -> **Finances** -> **Payment Account**
3. Click on **Download CSV** for the desired month(s)
4. Save the CSV file(s) to your computer

### Step 2: Upload to the Tracker

1. Open the Etsy Payout Tracker in your browser
2. Upload your CSV file(s) onto the payout tracker
3. The application will automatically parse and analyze your data

### Step 3: Explore Your Data

- **Summary Cards**: View high-level statistics at the top
- **Orders Table**: See all orders with their payout status
- **Deposits List**: View all bank deposits on the right sidebar

## Understanding Payout Status

The application determines if an order has been paid out by:

1. Checking if the order has an "availability date" in the CSV
2. Looking for bank deposits on or after that availability date
3. Marking orders as "Paid Out" if a matching deposit is found
4. Orders without matches or with future availability dates are marked "Pending"

## Data Privacy

- All data processing happens **locally in your browser**
- No data is uploaded to any server
- Your CSV files are only read temporarily and are not stored
- Refresh the page to clear all data from memory

## Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **PapaParse** - CSV parsing library
- **date-fns** - Date manipulation