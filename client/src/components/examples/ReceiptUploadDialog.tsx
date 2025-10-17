import { ReceiptUploadDialog } from '../ReceiptUploadDialog';

export default function ReceiptUploadDialogExample() {
  return (
    <div className="p-6 bg-background">
      <ReceiptUploadDialog
        transactionId="txn-001"
        onUpload={(file, amount, date) => {
          console.log('Receipt uploaded:', { file, amount, date });
        }}
      />
    </div>
  );
}
