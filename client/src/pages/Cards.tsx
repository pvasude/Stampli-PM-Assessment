import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import type { Card } from "@shared/schema";

type CardStatus = "Active" | "Locked" | "Suspended" | "Pending Approval";

// Helper to format card data for UI
function formatCard(card: Card) {
  // Map database cardType to UI cardType
  const uiCardType = card.invoiceId ? "Invoice Card" as const : "Expense Card" as const;
  
  return {
    ...card,
    cardType: uiCardType,
    status: card.status as "Active" | "Locked" | "Suspended" | "Pending Approval",
    purpose: card.purpose || undefined,
    spendLimit: `$${parseFloat(card.spendLimit).toLocaleString()}`,
    currentSpend: `$${parseFloat(card.currentSpend).toLocaleString()}`,
    validUntil: card.validUntil ? new Date(card.validUntil).toISOString().split('T')[0] : undefined,
    limitType: card.isOneTimeUse ? "one-time" as const : "recurring" as const,
    transactionCount: card.isOneTimeUse ? "1" as const : "unlimited" as const,
  };
}

export default function Cards() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCard, setSelectedCard] = useState<ReturnType<typeof formatCard> | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  const { data: cardsData, isLoading } = useQuery<Card[]>({
    queryKey: ['/api/cards'],
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['/api/invoices'],
  });

  const cards = cardsData?.map(formatCard) ?? [];
  const invoices = invoicesData ?? [];

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.cardholderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.purpose?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || card.status.toLowerCase().replace(" ", "-") === statusFilter.toLowerCase();
    const matchesType =
      typeFilter === "all" || card.limitType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const handleViewDetails = (card: ReturnType<typeof formatCard>) => {
    setSelectedCard(card);
    setDetailSheetOpen(true);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">Virtual Cards</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all your virtual cards in one place
          </p>
        </div>
        <CardRequestDialog />
      </div>

      <div className="flex gap-3">
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

      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">Loading cards...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <CardItem
                key={card.id}
                {...card}
                onViewDetails={() => handleViewDetails(card)}
              />
            ))}
          </div>

          {filteredCards.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-muted-foreground">No cards found matching your criteria</p>
            </div>
          )}
        </>
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
