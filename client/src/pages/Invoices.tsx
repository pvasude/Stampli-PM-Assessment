import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InvoiceItem } from "@/components/InvoiceItem";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Invoice } from "@shared/schema";
import { format } from "date-fns";

// Helper to format invoice data for UI
function formatInvoice(invoice: Invoice) {
  return {
    ...invoice,
    amount: `$${parseFloat(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    dueDate: format(new Date(invoice.dueDate), 'MMM dd, yyyy'),
    paymentType: invoice.paymentMethod || 'card' as const,
    paymentTerms: 'Net 30' as const, // Default, would come from invoice if available
    lockedCardId: invoice.lockedCardId,
    firstPaymentMethod: invoice.firstPaymentMethod,
  };
}

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");

  const { data: invoicesData, isLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });

  const invoices = invoicesData?.map(formatInvoice) ?? [];

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPaymentType =
      paymentTypeFilter === "all" || invoice.paymentType === paymentTypeFilter;
    return matchesSearch && matchesStatus && matchesPaymentType;
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-xl font-medium">Invoices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and pay invoices with virtual cards
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices by number or vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-invoices"
          />
        </div>
        <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-payment-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Types</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="ach">ACH</SelectItem>
            <SelectItem value="check">Check</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-invoice-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">Loading invoices...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInvoices.map((invoice) => (
              <InvoiceItem
                key={invoice.id}
                {...invoice}
                onViewDetails={() => console.log(`View invoice: ${invoice.id}`)}
              />
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-muted-foreground">No invoices found matching your criteria</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
