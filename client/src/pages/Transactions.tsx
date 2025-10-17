import { useState } from "react";
import { TransactionRow } from "@/components/TransactionRow";
import { ReceiptUploadDialog } from "@/components/ReceiptUploadDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, CreditCard, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// TODO: remove mock functionality
const mockTransactions = [
  {
    id: "txn-001",
    type: "card" as const,
    date: "Mar 10, 2024",
    vendor: "Amazon Web Services",
    amount: "$850.00",
    cashback: "$8.50",
    cardholder: "Sarah Johnson",
    status: "Pending Receipt" as const,
    glAccount: undefined,
    department: undefined,
    costCenter: undefined,
    hasReceipt: false,
  },
  {
    id: "txn-002",
    type: "card" as const,
    date: "Mar 11, 2024",
    vendor: "Acme Office Supplies",
    amount: "$1,245.50",
    cashback: "$12.46",
    cardholder: "Michael Chen",
    status: "Pending Coding" as const,
    glAccount: undefined,
    department: undefined,
    costCenter: undefined,
    hasReceipt: true,
  },
  {
    id: "pay-001",
    type: "ap" as const,
    date: "Mar 11, 2024",
    vendor: "Office Depot",
    amount: "$3,450.00",
    paymentMethod: "ACH" as const,
    invoiceNumber: "INV-2024-001",
    status: "Ready to Sync" as const,
    glAccount: "5100",
    department: "Operations",
    costCenter: "CC-003",
    hasReceipt: true,
  },
  {
    id: "txn-003",
    type: "card" as const,
    date: "Mar 12, 2024",
    vendor: "LinkedIn Ads",
    amount: "$2,500.00",
    cashback: "$25.00",
    cardholder: "Emily Rodriguez",
    status: "Ready to Sync" as const,
    glAccount: "7000",
    department: "Sales",
    costCenter: "CC-001",
    hasReceipt: true,
  },
  {
    id: "pay-002",
    type: "ap" as const,
    date: "Mar 12, 2024",
    vendor: "Verizon Business",
    amount: "$1,890.00",
    paymentMethod: "Check" as const,
    invoiceNumber: "INV-2024-008",
    status: "Pending Coding" as const,
    glAccount: undefined,
    department: undefined,
    costCenter: undefined,
    hasReceipt: true,
  },
  {
    id: "txn-004",
    type: "card" as const,
    date: "Mar 13, 2024",
    vendor: "Delta Airlines",
    amount: "$680.00",
    cashback: "$6.80",
    cardholder: "David Park",
    status: "Pending Receipt" as const,
    glAccount: undefined,
    department: undefined,
    costCenter: undefined,
    hasReceipt: false,
  },
  {
    id: "txn-005",
    type: "card" as const,
    date: "Mar 14, 2024",
    vendor: "Zoom Video",
    amount: "$199.00",
    cashback: "$1.99",
    cardholder: "Sarah Johnson",
    status: "Ready to Sync" as const,
    glAccount: "6200",
    department: "Engineering",
    costCenter: "CC-002",
    hasReceipt: true,
  },
  {
    id: "pay-003",
    type: "ap" as const,
    date: "Mar 14, 2024",
    vendor: "Acme Consulting",
    amount: "$12,500.00",
    paymentMethod: "Card" as const,
    invoiceNumber: "INV-2024-015",
    cashback: "$125.00",
    status: "Ready to Sync" as const,
    glAccount: "8500",
    department: "Professional Services",
    costCenter: "CC-004",
    hasReceipt: true,
  },
];

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [syncedTransactionIds, setSyncedTransactionIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Update transaction status based on whether it's been synced
  const transactionsWithStatus = mockTransactions.map((txn) => ({
    ...txn,
    status: syncedTransactionIds.has(txn.id) ? ("Synced" as const) : txn.status,
  }));

  const filteredTransactions = transactionsWithStatus.filter((txn) => {
    const matchesSearch =
      txn.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (txn.type === "card" && txn.cardholder?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (txn.type === "ap" && txn.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || txn.status.toLowerCase().replace(/\s+/g, '-') === statusFilter;
    const matchesType =
      typeFilter === "all" || txn.type === typeFilter;
    const matchesTab =
      activeTab === "all" || 
      (activeTab === "synced" && txn.status === "Synced") ||
      (activeTab === "all" && txn.status !== "Synced");
    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  const readyToSyncCount = transactionsWithStatus.filter(txn => txn.status === "Ready to Sync").length;
  const syncedCount = syncedTransactionIds.size;

  const handleSyncAll = () => {
    const readyTransactions = transactionsWithStatus.filter(txn => txn.status === "Ready to Sync");
    const newSyncedIds = new Set(syncedTransactionIds);
    readyTransactions.forEach(txn => newSyncedIds.add(txn.id));
    setSyncedTransactionIds(newSyncedIds);
    toast({
      title: "Synced to ERP",
      description: `${readyTransactions.length} transaction(s) successfully synced to ERP`,
    });
  };

  const handleSyncSingle = (txnId: string) => {
    const newSyncedIds = new Set(syncedTransactionIds);
    newSyncedIds.add(txnId);
    setSyncedTransactionIds(newSyncedIds);
    toast({
      title: "Synced to ERP",
      description: `Transaction ${txnId} successfully synced to ERP`,
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track card transactions and invoice payments - code and sync to ERP
          </p>
        </div>
        <Button
          onClick={handleSyncAll}
          disabled={readyToSyncCount === 0}
          data-testid="button-sync-all-erp"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync to ERP ({readyToSyncCount})
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="all" data-testid="tab-all-transactions">
            All Transactions
          </TabsTrigger>
          <TabsTrigger value="synced" data-testid="tab-synced-transactions">
            Synced Transactions ({syncedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6 mt-0">
          <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by vendor, cardholder, or invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-transactions"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-transaction-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="card">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Card Transactions
              </div>
            </SelectItem>
            <SelectItem value="ap">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                AP Payments
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-transaction-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending-receipt">Pending Receipt</SelectItem>
            <SelectItem value="pending-coding">Pending Coding</SelectItem>
            <SelectItem value="ready-to-sync">Ready to Sync</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Vendor</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Cashback</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Info</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">GL Account</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Department</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Cost Center</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Receipt</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => (
                <TransactionRow
                  key={txn.id}
                  {...txn}
                  onUploadReceipt={() => setSelectedTransaction(txn.id)}
                  onUpdateGL={(value) => console.log(`GL updated for ${txn.id}:`, value)}
                  onUpdateDepartment={(value) => console.log(`Department updated for ${txn.id}:`, value)}
                  onUpdateCostCenter={(value) => console.log(`Cost center updated for ${txn.id}:`, value)}
                  onSyncToERP={() => handleSyncSingle(txn.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">No transactions found matching your criteria</p>
        </div>
      )}
        </TabsContent>

        <TabsContent value="synced" className="space-y-6 mt-0">
          <div className="rounded-lg overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Vendor</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Cashback</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Info</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">GL Account</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Department</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Cost Center</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn) => (
                    <TransactionRow
                      key={txn.id}
                      {...txn}
                      onUploadReceipt={() => setSelectedTransaction(txn.id)}
                      onUpdateGL={(value) => console.log(`GL updated for ${txn.id}:`, value)}
                      onUpdateDepartment={(value) => console.log(`Department updated for ${txn.id}:`, value)}
                      onUpdateCostCenter={(value) => console.log(`Cost center updated for ${txn.id}:`, value)}
                      onSyncToERP={() => handleSyncSingle(txn.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-muted-foreground">No synced transactions found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedTransaction && (
        <ReceiptUploadDialog
          transactionId={selectedTransaction}
          trigger={<div />}
          onUpload={(file, amount, date) => {
            console.log('Receipt uploaded:', { transactionId: selectedTransaction, file, amount, date });
            setSelectedTransaction(null);
          }}
        />
      )}
    </div>
  );
}
