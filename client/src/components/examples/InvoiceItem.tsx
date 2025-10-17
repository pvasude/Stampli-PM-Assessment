import { InvoiceItem } from '../InvoiceItem';

export default function InvoiceItemExample() {
  return (
    <div className="p-6 bg-background max-w-md">
      <InvoiceItem
        id="inv-001"
        invoiceNumber="INV-2024-001"
        vendorName="Acme Office Supplies"
        amount="$2,450.00"
        dueDate="Mar 15, 2024"
        status="Pending"
        description="Office furniture and equipment for Q1"
        onPayWithCard={() => console.log('Pay with card clicked')}
        onViewDetails={() => console.log('View details clicked')}
      />
    </div>
  );
}
