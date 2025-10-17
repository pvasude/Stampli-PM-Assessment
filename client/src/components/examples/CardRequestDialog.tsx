import { CardRequestDialog } from '../CardRequestDialog';

const mockInvoices = [
  { id: '1', invoiceNumber: 'INV-2024-001', vendorName: 'Acme Office Supplies', amount: '$2,450' },
  { id: '2', invoiceNumber: 'INV-2024-002', vendorName: 'TechCorp Software', amount: '$5,200' },
];

export default function CardRequestDialogExample() {
  return (
    <div className="p-6 bg-background">
      <CardRequestDialog invoices={mockInvoices} />
    </div>
  );
}
