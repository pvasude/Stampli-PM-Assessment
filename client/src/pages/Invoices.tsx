import { useState } from "react";
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

// TODO: remove mock functionality
const mockInvoices = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2024-001",
    vendorName: "Acme Office Supplies",
    amount: "$2,450.00",
    dueDate: "Mar 15, 2024",
    status: "Pending" as const,
    description: "Office furniture and equipment for Q1",
    paymentTerms: "Net 30" as const,
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2024-002",
    vendorName: "TechCorp Software",
    amount: "$5,200.00",
    dueDate: "Mar 20, 2024",
    status: "Approved" as const,
    description: "Annual software licenses renewal",
    paymentTerms: "Net 60" as const,
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-2024-003",
    vendorName: "CloudHost Services",
    amount: "$1,850.00",
    dueDate: "Mar 25, 2024",
    status: "Pending" as const,
    description: "Cloud infrastructure hosting - March",
    paymentTerms: "Due on Receipt" as const,
  },
  {
    id: "inv-004",
    invoiceNumber: "INV-2024-004",
    vendorName: "Design Studio Pro",
    amount: "$3,500.00",
    dueDate: "Mar 10, 2024",
    status: "Overdue" as const,
    description: "Brand refresh and website redesign",
    paymentTerms: "Net 90" as const,
  },
  {
    id: "inv-005",
    invoiceNumber: "INV-2024-005",
    vendorName: "Legal Associates LLC",
    amount: "$4,200.00",
    dueDate: "Feb 28, 2024",
    status: "Paid" as const,
    description: "Q4 legal consultation services",
    paymentTerms: "Net 30" as const,
  },
];

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Invoices</h1>
        <p className="text-muted-foreground mt-1">
          View and pay invoices with virtual cards
        </p>
      </div>

      <div className="flex gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInvoices.map((invoice) => (
          <InvoiceItem
            key={invoice.id}
            {...invoice}
            onViewDetails={() => console.log(`View invoice: ${invoice.id}`)}
          />
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No invoices found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
