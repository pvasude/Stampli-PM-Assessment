import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Lock } from "lucide-react";
import { PayInvoiceDialog } from "./PayInvoiceDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InvoiceItemProps {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  amount: string;
  dueDate: string;
  status: "Pending" | "Paid" | "Overdue" | "Approved";
  description?: string;
  paymentTerms?: "Net 30" | "Net 60" | "Net 90" | "Due on Receipt" | "Monthly Recurring" | "Quarterly Recurring" | "Yearly Recurring" | "2 Installments" | "3 Installments" | "4 Installments";
  lockedCardId?: string | null;
  firstPaymentMethod?: string | null;
  defaultGlAccount?: string | null;
  defaultDepartment?: string | null;
  defaultCostCenter?: string | null;
  onViewDetails?: () => void;
}

export function InvoiceItem({
  id,
  invoiceNumber,
  vendorName,
  amount,
  dueDate,
  status,
  description,
  paymentTerms,
  lockedCardId,
  firstPaymentMethod,
  defaultGlAccount,
  defaultDepartment,
  defaultCostCenter,
  onViewDetails,
}: InvoiceItemProps) {
  const statusVariants = {
    Pending: "secondary" as const,
    Paid: "outline" as const,
    Overdue: "destructive" as const,
    Approved: "outline" as const,
  };

  return (
    <Card className="hover-elevate" data-testid={`invoice-item-${id}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-md bg-accent flex items-center justify-center">
            <FileText className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold" data-testid={`text-invoice-number-${id}`}>{invoiceNumber}</h3>
              <Badge variant={statusVariants[status]} data-testid={`badge-status-${id}`}>
                {status}
              </Badge>
              {firstPaymentMethod && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20" data-testid={`badge-payment-locked-${id}`}>
                  <Lock className="h-3 w-3 mr-1" />
                  {firstPaymentMethod.toUpperCase()} Locked
                </Badge>
              )}
              {lockedCardId && !firstPaymentMethod && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20" data-testid={`badge-card-linked-${id}`}>
                  Card Linked
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{vendorName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-lg" data-testid={`text-amount-${id}`}>{amount}</p>
          <p className="text-xs text-muted-foreground">Due {dueDate}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full opacity-50 cursor-not-allowed"
                  disabled
                  data-testid={`button-view-details-${id}`}
                >
                  View Details
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Feature not implemented in this demo</p>
            </TooltipContent>
          </Tooltip>
          {(status === "Approved" || status === "Overdue") && (
            <PayInvoiceDialog
              invoice={{ id, invoiceNumber, vendorName, amount, paymentTerms, lockedCardId, firstPaymentMethod, defaultGlAccount, defaultDepartment, defaultCostCenter }}
              trigger={
                <Button 
                  size="sm" 
                  className="flex-1"
                  data-testid={`button-pay-invoice-${id}`}
                >
                  Pay Invoice
                </Button>
              }
              onPay={(method, details) => {
                console.log(`Payment for ${id} via ${method}:`, details);
              }}
            />
          )}
          {status === "Pending" && (
            <Button 
              size="sm" 
              className="flex-1"
              disabled
              data-testid={`button-pay-invoice-${id}`}
            >
              Pending Approval
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
