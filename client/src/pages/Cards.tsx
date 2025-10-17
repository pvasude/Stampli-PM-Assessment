import { useState } from "react";
import { CardItem } from "@/components/CardItem";
import { CardRequestDialog } from "@/components/CardRequestDialog";
import { CardDetailSheet } from "@/components/CardDetailSheet";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CardStatus = "Active" | "Locked" | "Suspended" | "Pending Approval";

// TODO: remove mock functionality
const mockCards = [
  {
    id: "1",
    cardType: "Invoice Card" as const,
    cardholderName: "Sarah Johnson",
    spendLimit: "$5,000",
    currentSpend: "$3,250",
    status: "Active" as CardStatus,
    purpose: "Office Supplies - Q1 2024",
    cardNumber: "4532123456789012",
    currency: "USD",
    validUntil: "2024-12-31",
    allowedCountries: ["US", "CA"],
    channelRestriction: "both",
    limitType: "recurring" as const,
    renewalFrequency: "month" as const,
  },
  {
    id: "2",
    cardType: "Expense Card" as const,
    cardholderName: "Michael Chen",
    spendLimit: "$3,000",
    currentSpend: "$1,800",
    status: "Active" as CardStatus,
    purpose: "Marketing Conference Travel",
    cardNumber: "5412345678901234",
    currency: "USD",
    validUntil: "2024-11-30",
    allowedMerchants: ["Uber", "Airbnb", "Airlines"],
    limitType: "one-time" as const,
    transactionCount: "unlimited" as const,
  },
  {
    id: "3",
    cardType: "Invoice Card" as const,
    cardholderName: "Emily Rodriguez",
    spendLimit: "$8,000",
    currentSpend: "$8,000",
    status: "Locked" as CardStatus,
    purpose: "IT Equipment Purchase",
    cardNumber: "4916123456789012",
    currency: "USD",
    validUntil: "2024-10-31",
    limitType: "one-time" as const,
    transactionCount: "1" as const,
  },
  {
    id: "4",
    cardType: "Expense Card" as const,
    cardholderName: "David Park",
    spendLimit: "$2,500",
    currentSpend: "$0",
    status: "Pending Approval" as CardStatus,
    purpose: "Client Entertainment",
    limitType: "recurring" as const,
    renewalFrequency: "quarter" as const,
  },
  {
    id: "5",
    cardType: "Expense Card" as const,
    cardholderName: "Jessica Liu",
    spendLimit: "$1,500",
    currentSpend: "$1,200",
    status: "Suspended" as CardStatus,
    purpose: "Vendor Payments",
    cardNumber: "4539876543210987",
    currency: "USD",
    limitType: "recurring" as const,
    renewalFrequency: "year" as const,
  },
];

const mockInvoices = [
  { id: '1', invoiceNumber: 'INV-2024-001', vendorName: 'Acme Office Supplies', amount: '$2,450' },
  { id: '2', invoiceNumber: 'INV-2024-002', vendorName: 'TechCorp Software', amount: '$5,200' },
];

export default function Cards() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCard, setSelectedCard] = useState<typeof mockCards[0] | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  const filteredCards = mockCards.filter((card) => {
    const matchesSearch =
      card.cardholderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.purpose?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || card.status.toLowerCase().replace(" ", "-") === statusFilter.toLowerCase();
    const matchesType =
      typeFilter === "all" || card.limitType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const handleViewDetails = (card: typeof mockCards[0]) => {
    setSelectedCard(card);
    setDetailSheetOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Virtual Cards</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your virtual cards in one place
          </p>
        </div>
        <CardRequestDialog />
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="one-time">One-Time Cards</SelectItem>
            <SelectItem value="recurring">Recurring Cards</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="locked">Locked</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending-approval">Pending Approval</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card) => (
          <CardItem
            key={card.id}
            {...card}
            onViewDetails={() => handleViewDetails(card)}
          />
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No cards found matching your criteria</p>
        </div>
      )}

      {selectedCard && (
        <CardDetailSheet
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
          card={selectedCard}
        />
      )}
    </div>
  );
}
