import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import type { Transaction, Card } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Helper to format transaction data for UI
function formatTransaction(txn: Transaction, cards: Card[]) {
  const card = cards.find(c => c.id === txn.cardId);
  
  return {
    id: txn.id,
    type: "card" as const,
    date: format(new Date(txn.transactionDate), 'MMM dd, yyyy'),
    vendor: txn.vendorName,
    amount: `$${parseFloat(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cashback: `$${(parseFloat(txn.amount) * 0.01).toFixed(2)}`, // 1% cashback
    cardholder: card?.cardholderName || "Unknown",
    status: txn.status as "Pending Receipt" | "Pending Coding" | "Ready to Sync" | "Synced",
    glAccount: txn.glAccount || undefined,
    department: txn.costCenter || undefined,
    costCenter: txn.costCenter || undefined,
    hasReceipt: !!txn.receiptUrl,
    invoiceNumber: txn.invoiceId || undefined,
    paymentMethod: undefined,
  };
}

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [syncedTransactionIds, setSyncedTransactionIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: transactionsData, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: cardsData } = useQuery<Card[]>({
    queryKey: ['/api/cards'],
  });

  const cards = cardsData ?? [];
  const transactions = transactionsData?.map(txn => formatTransaction(txn, cards)) ?? [];

  // Update transaction status based on whether it's been synced
  const transactionsWithStatus = transactions.map((txn) => ({
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
      (activeTab === "all" && txn.status !== "Synced") || 
      (activeTab === "synced" && txn.status === "Synced");
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

      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">Loading transactions...</p>
        </div>
      ) : (
        <>
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
        </>
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
