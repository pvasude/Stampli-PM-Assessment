import { StatsCard } from "@/components/StatsCard";
import { CardItem } from "@/components/CardItem";
import { InvoiceItem } from "@/components/InvoiceItem";
import { CardRequestDialog } from "@/components/CardRequestDialog";
import { CreditCard, FileText, TrendingUp, DollarSign } from "lucide-react";

// TODO: remove mock functionality
const mockStats = [
  {
    title: "Total Card Spend",
    value: "$24,350",
    subtitle: "Across 12 active cards",
    icon: DollarSign,
    trend: { value: "12% from last month", isPositive: true },
  },
  {
    title: "Active Cards",
    value: "12",
    subtitle: "8 invoice, 4 expense",
    icon: CreditCard,
  },
  {
    title: "Pending Approvals",
    value: "3",
    subtitle: "Awaiting review",
    icon: FileText,
  },
  {
    title: "Available Limit",
    value: "$45,650",
    subtitle: "Total approved limit: $70,000",
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
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your virtual cards and invoice payments
          </p>
        </div>
        <CardRequestDialog invoices={mockInvoices} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Cards</h2>
          <div className="space-y-3">
            {mockCards.map((card) => (
              <CardItem
                key={card.id}
                {...card}
                onViewDetails={() => console.log(`View details: ${card.id}`)}
                onManageCard={() => console.log(`Manage card: ${card.id}`)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Invoices</h2>
          <div className="space-y-3">
            {mockInvoices.map((invoice) => (
              <InvoiceItem
                key={invoice.id}
                {...invoice}
                onPayWithCard={() => console.log(`Pay invoice: ${invoice.id}`)}
                onViewDetails={() => console.log(`View invoice: ${invoice.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
