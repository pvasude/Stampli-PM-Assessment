import { StatsCard } from "@/components/StatsCard";
import { CardItem } from "@/components/CardItem";
import { InvoiceItem } from "@/components/InvoiceItem";
import { CardRequestDialog } from "@/components/CardRequestDialog";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, TrendingUp, DollarSign } from "lucide-react";
import { useLocation } from "wouter";

// TODO: remove mock functionality
const mockStats = [
  {
    title: "Total AP Spend",
    value: "$156,850",
    subtitle: "Cards: $24k | Invoices: $132k",
    icon: DollarSign,
    trend: { value: "8% from last month", isPositive: true },
  },
  {
    title: "Pending Invoices",
    value: "24",
    subtitle: "Total value: $45,200",
    icon: FileText,
  },
  {
    title: "Active Cards",
    value: "12",
    subtitle: "8 invoice, 4 expense",
    icon: CreditCard,
  },
  {
    title: "Card Approvals",
    value: "3",
    subtitle: "Awaiting review",
    icon: TrendingUp,
  },
];

const mockCards = [
  {
    id: "1",
    cardType: "Invoice Card" as const,
    cardholderName: "Sarah Johnson",
    spendLimit: "$5,000",
    currentSpend: "$3,250",
    status: "Active" as "Active" | "Locked" | "Suspended" | "Pending Approval",
    purpose: "Office Supplies - Q1 2024",
    cardNumber: "4532123456789012",
    limitType: "one-time" as const,
    transactionCount: "unlimited" as const,
  },
  {
    id: "2",
    cardType: "Expense Card" as const,
    cardholderName: "Michael Chen",
    spendLimit: "$3,000",
    currentSpend: "$1,800",
    status: "Active" as "Active" | "Locked" | "Suspended" | "Pending Approval",
    purpose: "Marketing Conference Travel",
    cardNumber: "5412345678901234",
    limitType: "recurring" as const,
    renewalFrequency: "month" as const,
  },
];

const mockInvoices = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2024-001",
    vendorName: "Acme Office Supplies",
    amount: "$2,450.00",
    dueDate: "Mar 15, 2024",
    status: "Pending" as const,
    description: "Office furniture and equipment for Q1",
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2024-002",
    vendorName: "TechCorp Software",
    amount: "$5,200.00",
    dueDate: "Mar 20, 2024",
    status: "Approved" as const,
    description: "Annual software licenses renewal",
  },
];

export default function Dashboard() {
  const [location, navigate] = useLocation();
  const isOnInvoicesPage = location === "/invoices";

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your virtual cards and invoice payments
          </p>
        </div>
        <CardRequestDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat, index) => (
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
            {mockCards.map((card) => (
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/invoices")}
              disabled={isOnInvoicesPage}
              data-testid="button-view-invoices"
            >
              View Invoices
            </Button>
          </div>
          <div className="space-y-4">
            {mockInvoices.map((invoice) => (
              <InvoiceItem
                key={invoice.id}
                {...invoice}
                onViewDetails={() => console.log(`View invoice: ${invoice.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
