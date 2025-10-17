import { TransactionRow } from '../TransactionRow';

export default function TransactionRowExample() {
  return (
    <div className="p-6 bg-background">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-3 text-left text-sm font-medium">Date</th>
            <th className="p-3 text-left text-sm font-medium">Vendor</th>
            <th className="p-3 text-left text-sm font-medium">Amount</th>
            <th className="p-3 text-left text-sm font-medium">Cardholder</th>
            <th className="p-3 text-left text-sm font-medium">Status</th>
            <th className="p-3 text-left text-sm font-medium">GL Account</th>
            <th className="p-3 text-left text-sm font-medium">Cost Center</th>
            <th className="p-3 text-left text-sm font-medium">Receipt</th>
          </tr>
        </thead>
        <tbody>
          <TransactionRow
            id="txn-001"
            date="Mar 10, 2024"
            vendor="Amazon Web Services"
            amount="$850.00"
            cardholder="Sarah Johnson"
            status="Pending Receipt"
            glAccount="6200"
            costCenter="CC-002"
            hasReceipt={false}
            onUploadReceipt={() => console.log('Upload receipt clicked')}
            onUpdateGL={(value) => console.log('GL updated:', value)}
            onUpdateCostCenter={(value) => console.log('Cost center updated:', value)}
          />
        </tbody>
      </table>
    </div>
  );
}
