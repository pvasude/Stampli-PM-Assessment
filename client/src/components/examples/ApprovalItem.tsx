import { ApprovalItem } from '../ApprovalItem';

export default function ApprovalItemExample() {
  return (
    <div className="p-6 bg-background max-w-md">
      <ApprovalItem
        id="req-001"
        cardholderName="Michael Chen"
        purpose="Marketing Conference Travel & Expenses"
        spendLimit="$3,000"
        requestedBy="Sarah Johnson"
        requestDate="Mar 10, 2024"
        approvalLevel={1}
        status="Pending"
        currentApprover="Finance Manager"
        onApprove={() => console.log('Approved')}
        onReject={() => console.log('Rejected')}
        onViewDetails={() => console.log('View details')}
      />
    </div>
  );
}
