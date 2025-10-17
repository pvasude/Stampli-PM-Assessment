import { useState } from "react";
import { CardItem } from "@/components/CardItem";
import { CardRequestDialog } from "@/components/CardRequestDialog";
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
const mockCards = [
  {
    id: "1",
    cardType: "Invoice Card" as const,
    cardholderName: "Sarah Johnson",
    spendLimit: "$5,000",
    currentSpend: "$3,250",
    status: "Active" as const,
    purpose: "Office Supplies - Q1 2024",
    cardNumber: "4532123456789012",
  },
  {
    id: "2",
    cardType: "Expense Card" as const,
    cardholderName: "Michael Chen",
    spendLimit: "$3,000",
    currentSpend: "$1,800",
    status: "Active" as const,
    purpose: "Marketing Conference Travel",
    cardNumber: "5412345678901234",
  },
  {
    id: "3",
    cardType: "Invoice Card" as const,
    cardholderName: "Emily Rodriguez",
    spendLimit: "$8,000",
    currentSpend: "$8,000",
    status: "Inactive" as const,
    purpose: "IT Equipment Purchase",
    cardNumber: "4916123456789012",
  },
  {
    id: "4",
    cardType: "Expense Card" as const,
    cardholderName: "David Park",
    spendLimit: "$2,500",
    currentSpend: "$0",
    status: "Approved" as const,
    purpose: "Client Entertainment",
  },
];

const mockInvoices = [
  { id: '1', invoiceNumber: 'INV-2024-001', vendorName: 'Acme Office Supplies', amount: '$2,450' },
  { id: '2', invoiceNumber: 'INV-2024-002', vendorName: 'TechCorp Software', amount: '$5,200' },
];

export default function Cards() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCards = mockCards.filter((card) => {
    const matchesSearch =
      card.cardholderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.purpose?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || card.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Virtual Cards</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your virtual cards in one place
          </p>
        </div>
        <CardRequestDialog invoices={mockInvoices} />
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cards by cardholder or purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-cards"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card) => (
          <CardItem
            key={card.id}
            {...card}
            onViewDetails={() => console.log(`View details: ${card.id}`)}
            onManageCard={() => console.log(`Manage card: ${card.id}`)}
          />
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No cards found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
