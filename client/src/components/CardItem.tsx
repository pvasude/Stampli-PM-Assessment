import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CreditCard, Eye } from "lucide-react";

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
  invoiceId?: string;
  invoiceNumber?: string;
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
  invoiceId,
  invoiceNumber,
  onViewDetails,
}: CardItemProps) {
  const statusColors = {
    Active: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    Locked: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    Suspended: "bg-destructive/10 text-destructive border-destructive/20",
    "Pending Approval": "bg-chart-3/10 text-chart-3 border-chart-3/20",
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
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-medium" data-testid={`text-cardholder-${id}`}>{cardholderName}</h3>
              <Badge variant="outline" className={statusColors[status]} data-testid={`badge-status-${id}`}>
                {status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant={limitType === "one-time" ? "secondary" : "outline"} className="text-xs" data-testid={`badge-card-type-${id}`}>
                {limitType === "one-time" ? "One-Time" : "Recurring"}
              </Badge>
              <span className="text-xs text-muted-foreground" data-testid={`text-frequency-${id}`}>
                {getFrequencyLabel()}
              </span>
              {invoiceId && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs" data-testid={`badge-invoice-payment-${id}`}>
                  Invoice Payment
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onViewDetails}
              data-testid={`button-view-details-${id}`}
              className="flex-shrink-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View Details</p>
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="space-y-4">
        {invoiceNumber && (
          <div className="p-3 bg-primary/5 rounded-md">
            <p className="text-xs text-muted-foreground">Created from Invoice Payment</p>
            <p className="text-sm font-medium text-primary mt-0.5" data-testid={`text-invoice-number-${id}`}>{invoiceNumber}</p>
          </div>
        )}
        {purpose && (
          <p className="text-sm text-muted-foreground leading-relaxed">{purpose}</p>
        )}
        {cardNumber && (
          <p className="text-sm font-mono text-secondary-foreground" data-testid={`text-card-number-${id}`}>•••• {cardNumber.slice(-4)}</p>
        )}
        <div className="space-y-2">
          <div className="flex justify-between text-sm gap-2">
            <span className="text-muted-foreground">Spend</span>
            <span className="font-mono text-sm" data-testid={`text-spend-${id}`}>
              {currentSpend} / {spendLimit}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(spendPercentage, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
