import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { PayInvoiceDialog } from "./PayInvoiceDialog";

interface InvoiceItemProps {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  amount: string;
  dueDate: string;
  status: "Pending" | "Paid" | "Overdue" | "Approved";
  description?: string;
  paymentTerms?: "Net 30" | "Net 60" | "Net 90" | "Due on Receipt" | "Monthly Recurring" | "Quarterly Recurring" | "Yearly Recurring" | "2 Installments" | "3 Installments" | "4 Installments";
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
            <div className="flex items-center gap-2">
              <h3 className="font-semibold" data-testid={`text-invoice-number-${id}`}>{invoiceNumber}</h3>
              <Badge variant={statusVariants[status]} data-testid={`badge-status-${id}`}>
                {status}
              </Badge>
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
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onViewDetails}
            data-testid={`button-view-details-${id}`}
          >
            View Details
          </Button>
          {(status === "Approved" || status === "Overdue") && (
            <PayInvoiceDialog
              invoice={{ id, invoiceNumber, vendorName, amount, paymentTerms }}
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
