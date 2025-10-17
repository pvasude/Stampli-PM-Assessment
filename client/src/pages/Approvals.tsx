import { useState } from "react";
import { ApprovalItem } from "@/components/ApprovalItem";
import { ApprovalDetailsDialog } from "@/components/ApprovalDetailsDialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// TODO: remove mock functionality
const mockApprovals = [
  {
    id: "req-001",
    cardholderName: "Michael Chen",
    purpose: "Marketing Conference Travel & Expenses",
    cardType: "one-time" as const,
    transactionCount: "unlimited" as const,
    spendLimit: "$3,000",
    currency: "USD",
    validUntil: "2024-06-30",
    allowedMerchants: ["Delta Airlines", "United Airlines", "Hilton Hotels", "Marriott Hotels"],
    allowedMccCodes: ["4511", "7011"],
    allowedCountries: ["US", "CA"],
    channelRestriction: "both",
    glAccountTemplate: "6100",
    departmentTemplate: "marketing",
    costCenterTemplate: "CC-001",
    requestedBy: "Sarah Johnson",
    requestDate: "Mar 10, 2024",
    approvalLevel: 1,
    status: "Pending" as const,
    currentApprover: "Finance Manager",
  },
  {
    id: "req-002",
    cardholderName: "Emily Rodriguez",
    purpose: "AWS Cloud Infrastructure - Q1 2024",
    cardType: "recurring" as const,
    renewalFrequency: "month" as const,
    spendLimit: "$5,500",
    currency: "USD",
    validFrom: "2024-03-01",
    validUntil: "2024-12-31",
    allowedMerchants: ["Amazon Web Services (AWS)"],
    allowedMccCodes: ["7372"],
    allowedCountries: ["US"],
    channelRestriction: "online",
    glAccountTemplate: "6200",
    departmentTemplate: "engineering",
    costCenterTemplate: "CC-002",
    requestedBy: "David Park",
    requestDate: "Mar 11, 2024",
    approvalLevel: 2,
    status: "Pending" as const,
    currentApprover: "VP Finance",
  },
  {
    id: "req-003",
    cardholderName: "Alex Thompson",
    purpose: "Office Supplies & Equipment",
    cardType: "one-time" as const,
    transactionCount: "1" as const,
    spendLimit: "$1,200",
    currency: "USD",
    validUntil: "2024-04-15",
    allowedMerchants: ["Office Depot", "Staples"],
    allowedMccCodes: ["5943"],
    allowedCountries: ["US"],
    channelRestriction: "both",
    glAccountTemplate: "5000",
    departmentTemplate: "operations",
    costCenterTemplate: "CC-003",
    requestedBy: "Lisa Chen",
    requestDate: "Mar 12, 2024",
    approvalLevel: 1,
    status: "Approved" as const,
  },
  {
    id: "req-004",
    cardholderName: "Jordan Lee",
    purpose: "Client Entertainment Budget",
    cardType: "recurring" as const,
    renewalFrequency: "quarter" as const,
    spendLimit: "$2,000",
    currency: "USD",
    validFrom: "2024-03-01",
    validUntil: "2024-06-30",
    allowedMerchants: [],
    allowedMccCodes: ["5812", "5814"],
    allowedCountries: ["US"],
    channelRestriction: "both",
    glAccountTemplate: "7000",
    departmentTemplate: "sales",
    costCenterTemplate: "CC-001",
    requestedBy: "Mark Wilson",
    requestDate: "Mar 13, 2024",
    approvalLevel: 1,
    status: "Rejected" as const,
  },
];

export default function Approvals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<typeof mockApprovals[0] | null>(null);

  const filteredApprovals = mockApprovals.filter((approval) => {
    const matchesSearch =
      approval.cardholderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || approval.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Card Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve card requests based on company policy
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by cardholder, purpose, or requester..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-approvals"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-approval-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredApprovals.map((approval) => (
          <ApprovalItem
            key={approval.id}
            {...approval}
            onApprove={() => console.log(`Approve request: ${approval.id}`)}
            onReject={() => console.log(`Reject request: ${approval.id}`)}
            onViewDetails={() => setSelectedRequest(approval)}
          />
        ))}
      </div>

      {selectedRequest && (
        <ApprovalDetailsDialog
          open={!!selectedRequest}
          onOpenChange={(open) => !open && setSelectedRequest(null)}
          request={selectedRequest}
        />
      )}

      {filteredApprovals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No approval requests found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
