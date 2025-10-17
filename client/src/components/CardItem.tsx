import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface CardItemProps {
  id: string;
  cardType: "Invoice Card" | "Expense Card";
  cardholderName: string;
  spendLimit: string;
  currentSpend: string;
  status: "Active" | "Locked" | "Suspended" | "Pending Approval";
  purpose?: string;
  cardNumber?: string;
  limitType: "one-time" | "recurring";
  transactionCount?: "1" | "unlimited";
  renewalFrequency?: "month" | "quarter" | "year";
  onViewDetails?: () => void;
}

export function CardItem({
  id,
  cardType,
  cardholderName,
  spendLimit,
  currentSpend,
  status,
  purpose,
  cardNumber,
  limitType,
  transactionCount,
  renewalFrequency,
  onViewDetails,
}: CardItemProps) {
  const statusColors = {
    Active: "bg-chart-1 text-white",
    Locked: "bg-chart-2 text-white",
    Suspended: "bg-destructive text-destructive-foreground",
    "Pending Approval": "bg-chart-3 text-white",
  };

  const spendPercentage = (parseFloat(currentSpend.replace(/[$,]/g, '')) / parseFloat(spendLimit.replace(/[$,]/g, ''))) * 100;

  const getFrequencyLabel = () => {
    if (limitType === "one-time") {
      return transactionCount === "1" ? "Single Transaction" : "Unlimited Transactions";
    } else {
      const frequencyMap = {
        month: "Monthly Reset",
        quarter: "Quarterly Reset",
        year: "Yearly Reset",
      };
      return frequencyMap[renewalFrequency || "month"];
    }
  };

  return (
    <Card className="hover-elevate" data-testid={`card-item-${id}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold" data-testid={`text-cardholder-${id}`}>{cardholderName}</h3>
              <Badge className={statusColors[status]} data-testid={`badge-status-${id}`}>
                {status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={limitType === "one-time" ? "secondary" : "outline"} data-testid={`badge-card-type-${id}`}>
                {limitType === "one-time" ? "One-Time" : "Recurring"}
              </Badge>
              <span className="text-xs text-muted-foreground" data-testid={`text-frequency-${id}`}>
                {getFrequencyLabel()}
              </span>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onViewDetails}
          data-testid={`button-view-details-${id}`}
        >
          View Details
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {purpose && (
          <p className="text-sm text-muted-foreground">{purpose}</p>
        )}
        {cardNumber && (
          <p className="text-sm font-mono" data-testid={`text-card-number-${id}`}>•••• {cardNumber.slice(-4)}</p>
        )}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Spend</span>
            <span className="font-mono font-medium" data-testid={`text-spend-${id}`}>
              {currentSpend} / {spendLimit}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min(spendPercentage, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
