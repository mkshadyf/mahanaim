# Report-Oriented Features Documentation

## Overview

The Mahanaim Money application has been enhanced with report-oriented features to better serve agents who need to efficiently manage financial transactions. These features allow agents to import transactions in bulk and generate comprehensive reports, reducing the need for manual data entry and providing better insights into transaction data.

## Batch Transaction Import

The batch import feature allows agents to import multiple transactions at once, saving time and reducing errors compared to manual entry.

### Features

- **CSV File Upload**: Import transactions from CSV files exported from other banking systems
- **Manual Data Entry**: Paste data directly from spreadsheets or other sources
- **Data Validation**: Automatic validation of transaction data with clear error messages
- **Preview Before Import**: Review transactions before committing them to the system
- **Import Results**: Detailed summary of successful and failed imports

### How to Use

1. Navigate to the Transactions page
2. Click the "Import" button in the top-right corner
3. Choose between CSV upload or manual entry
4. For CSV upload:
   - Select your CSV file
   - Choose the date format if applicable
   - Click "Preview" to validate the data
5. For manual entry:
   - Paste your data in the text area (tab-separated values with headers)
   - Click "Preview" to validate the data
6. Review the transactions in the preview modal
7. Click "Confirm Import" to import the valid transactions

### CSV Format

The CSV file should have the following headers:
- `amount` (required): The transaction amount
- `currency` (optional, defaults to USD): The currency code (USD, EUR, CDF)
- `type` (optional, defaults to deposit): The transaction type (deposit, withdrawal, transfer, payment)
- `description` (required): A description of the transaction
- `fromAccount` (optional): The source account for withdrawals and transfers
- `toAccount` (optional): The destination account for deposits and transfers
- `date` (optional, defaults to current date): The transaction date

## Transaction Reports

The reporting feature allows agents to generate and export transaction reports for various time periods.

### Features

- **Multiple Report Types**: Daily, weekly, monthly, and custom date range reports
- **Summary View**: High-level overview with totals and breakdowns
- **Detailed View**: Complete transaction listing with all details
- **Export to CSV**: Export reports for further analysis in spreadsheet software
- **Print-Friendly Format**: Print reports directly from the browser

### How to Use

1. Navigate to the Reports page
2. Select the report type (daily, weekly, monthly, or custom)
3. For custom reports, select the start and end dates
4. Choose between summary or detailed view
5. Click "Generate Report" to create the report
6. Use the export or print buttons to save or print the report

### Report Types

- **Daily Report**: Transactions for the current day
- **Weekly Report**: Transactions for the current week (Sunday to Saturday)
- **Monthly Report**: Transactions for the current month
- **Custom Report**: Transactions for a user-defined date range

### Report Views

- **Summary View**: Shows transaction counts, total amounts by currency, and breakdowns by type, status, and currency
- **Detailed View**: Shows a complete list of all transactions with their details

## Offline Capabilities

Both the batch import and reporting features work seamlessly with the application's offline capabilities.

- **Offline Import**: Transactions can be imported while offline and will sync when connectivity is restored
- **Offline Reports**: Reports can be generated based on locally available data while offline
- **Sync Status**: The network status indicator shows pending sync operations and allows manual sync when online

## Technical Implementation

These features are implemented using the following components:

- **BatchTransactionImport**: Component for importing multiple transactions at once
- **ReportsPage**: Comprehensive reporting interface with filtering and export options
- **OfflineTransactionManager**: Service for managing transactions with offline support
- **NetworkStatus**: Component for displaying online/offline status and sync information

## Future Enhancements

Planned enhancements for the report-oriented features include:

- **Advanced Filtering**: More options for filtering transactions in reports
- **Visualization**: Charts and graphs for better data visualization
- **Scheduled Reports**: Automatically generate and email reports on a schedule
- **Custom Report Templates**: Save and reuse custom report configurations 