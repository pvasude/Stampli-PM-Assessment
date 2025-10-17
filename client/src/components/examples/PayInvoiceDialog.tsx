import { PayInvoiceDialog } from '../PayInvoiceDialog';

const mockInvoice = {
  id: 'inv-001',
  invoiceNumber: 'INV-2024-001',
  vendorName: 'Acme Office Supplies',
  amount: '$2,450.00',
};

export default function PayInvoiceDialogExample() {
  return (
    <div className="p-6 bg-background">
      <PayInvoiceDialog
        invoice={mockInvoice}
        onPay={(method, details) => {
          console.log('Payment method:', method, 'Details:', details);
        }}
      />
    </div>
  );
}
