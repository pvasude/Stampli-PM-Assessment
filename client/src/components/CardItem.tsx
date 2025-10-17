import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CardItemProps {
  id: string;
  cardType: "Invoice Card" | "Expense Card";
  cardholderName: string;
  spendLimit: string;
  currentSpend: string;
  status: "Active" | "Pending" | "Approved" | "Inactive";
  purpose?: string;
  cardNumber?: string;
  onViewDetails?: () => void;
  onManageCard?: () => void;
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
  onViewDetails,
  onManageCard,
}: CardItemProps) {
  const statusColors = {
    Active: "bg-chart-1 text-white",
    Pending: "bg-chart-2 text-white",
    Approved: "bg-chart-3 text-white",
    Inactive: "bg-secondary text-secondary-foreground",
  };

  const spendPercentage = (parseFloat(currentSpend.replace(/[$,]/g, '')) / parseFloat(spendLimit.replace(/[$,]/g, ''))) * 100;

  return (
    <Card className="hover-elevate" data-testid={`card-item-${id}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold" data-testid={`text-cardholder-${id}`}>{cardholderName}</h3>
              <Badge className={statusColors[status]} data-testid={`badge-status-${id}`}>
                {status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{cardType}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-menu-${id}`}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewDetails} data-testid={`button-view-details-${id}`}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onManageCard} data-testid={`button-manage-${id}`}>
              Manage Card
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
