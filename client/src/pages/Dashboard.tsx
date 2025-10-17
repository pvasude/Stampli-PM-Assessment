import { StatsCard } from "@/components/StatsCard";
import { CardItem } from "@/components/CardItem";
import { InvoiceItem } from "@/components/InvoiceItem";
import { CardRequestDialog } from "@/components/CardRequestDialog";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, TrendingUp, DollarSign, FlaskConical } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Card, Invoice, CardApproval } from "@shared/schema";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Helper to format card data for UI
function formatCard(card: Card) {
  return {
    ...card,
    cardType: card.cardType as "Invoice Card" | "Expense Card",
    status: card.status as "Active" | "Locked" | "Suspended" | "Pending Approval",
    purpose: card.purpose ?? undefined,
    invoiceId: card.invoiceId ?? undefined,
    spendLimit: `$${parseFloat(card.spendLimit).toLocaleString()}`,
    currentSpend: `$${parseFloat(card.currentSpend).toLocaleString()}`,
    validUntil: card.validUntil ? new Date(card.validUntil).toISOString().split('T')[0] : undefined,
    limitType: card.isOneTimeUse ? "one-time" as const : "recurring" as const,
    transactionCount: card.isOneTimeUse ? "1" as const : "unlimited" as const,
  };
}

// Helper to format invoice data for UI
function formatInvoice(invoice: Invoice) {
  return {
    ...invoice,
    status: invoice.status as "Pending" | "Paid" | "Overdue" | "Approved",
    description: invoice.description ?? undefined,
    amount: `$${parseFloat(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    dueDate: format(new Date(invoice.dueDate), 'MMM dd, yyyy'),
    paymentType: invoice.paymentMethod || 'card' as const,
    paymentTerms: 'Net 30' as const,
  };
}

export default function Dashboard() {
  const [location, navigate] = useLocation();
  const isOnInvoicesPage = location === "/invoices";

  const { data: cardsData, isLoading: cardsLoading } = useQuery<Card[]>({
    queryKey: ['/api/cards'],
  });

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });

  const { data: approvalsData } = useQuery<CardApproval[]>({
    queryKey: ['/api/card-approvals'],
  });

  const cards = cardsData?.map(formatCard) ?? [];
  const invoices = invoicesData?.map(formatInvoice) ?? [];
  const approvals = approvalsData ?? [];

  // Calculate stats from real data
  const totalCardSpend = cardsData?.reduce((sum, card) => sum + parseFloat(card.currentSpend), 0) ?? 0;
  const totalInvoiceValue = invoicesData?.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) ?? 0;
  const totalAPSpend = totalCardSpend + totalInvoiceValue;
  
  const pendingInvoices = invoicesData?.filter(inv => inv.status === "Pending") ?? [];
  const pendingInvoiceValue = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  
  const activeCards = cardsData?.filter(card => card.status === "Active") ?? [];
  const invoiceCards = activeCards.filter(card => card.cardType === "Invoice Card").length;
  const expenseCards = activeCards.filter(card => card.cardType === "Expense Card").length;
  
  const pendingApprovals = approvals.filter(a => a.status === "Pending").length;

  const stats = [
    {
      title: "Total AP Spend",
      value: `$${totalAPSpend.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      subtitle: `Cards: $${totalCardSpend.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}k | Invoices: $${totalInvoiceValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}k`,
      icon: DollarSign,
    },
    {
      title: "Pending Invoices",
      value: pendingInvoices.length.toString(),
      subtitle: `Total value: $${pendingInvoiceValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: FileText,
    },
    {
      title: "Active Cards",
      value: activeCards.length.toString(),
      subtitle: `${invoiceCards} invoice, ${expenseCards} expense`,
      icon: CreditCard,
    },
    {
      title: "Card Approvals",
      value: pendingApprovals.toString(),
      subtitle: "Awaiting review",
      icon: TrendingUp,
    },
  ];

  const recentCards = cards.slice(0, 2);
  const pendingInvoicesFormatted = invoices.filter(inv => inv.status === "Pending").slice(0, 2);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your virtual cards and invoice payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate("/simulate")}
            data-testid="button-simulate"
            className="gap-2"
          >
            <FlaskConical className="h-4 w-4" />
            Simulate (Testing Only)
          </Button>
          <CardRequestDialog />
        </div>
      </div>

      {cardsLoading || invoicesLoading ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Recent Cards</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/cards")}
                  data-testid="button-view-all-cards"
                >
                  View All Cards
                </Button>
              </div>
              <div className="space-y-4">
                {recentCards.map((card) => (
                  <CardItem
                    key={card.id}
                    {...card}
                    onViewDetails={() => navigate("/cards")}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Pending Invoices</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled
                        data-testid="button-view-invoices"
                        className="opacity-50 cursor-not-allowed"
                      >
                        View Invoices
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Feature not implemented in this demo</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-4">
                {pendingInvoicesFormatted.map((invoice) => (
                  <InvoiceItem
                    key={invoice.id}
                    {...invoice}
                    onViewDetails={() => console.log(`View invoice: ${invoice.id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
