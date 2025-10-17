import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface ApprovalDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: {
    id: string;
    cardholderName: string;
    purpose: string;
    cardType: "one-time" | "recurring";
    transactionCount?: "1" | "unlimited";
    renewalFrequency?: "month" | "quarter" | "year";
    spendLimit: string;
    currency?: string;
    validFrom?: string;
    validUntil?: string;
    allowedMerchants?: string[];
    allowedMccCodes?: string[];
    allowedCountries?: string[];
    channelRestriction?: string;
    glAccountTemplate?: string;
    departmentTemplate?: string;
    costCenterTemplate?: string;
    requestedBy: string;
    requestDate: string;
    status: "Pending" | "Approved" | "Rejected";
  };
}

export function ApprovalDetailsDialog({
  open,
  onOpenChange,
  request,
}: ApprovalDetailsDialogProps) {
  const statusVariants = {
    Pending: "secondary" as const,
    Approved: "outline" as const,
    Rejected: "destructive" as const,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" data-testid="dialog-approval-details">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Card Request Details</DialogTitle>
            <Badge variant={statusVariants[request.status]}>
              {request.status}
            </Badge>
          </div>
          <DialogDescription>
            Request ID: {request.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Cardholder Name</Label>
              <p className="font-medium" data-testid="text-cardholder-name">{request.cardholderName}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Card Type</Label>
              <p className="font-medium" data-testid="text-card-type">
                {request.cardType === "one-time" ? "One-Time Card" : "Recurring Card"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Purpose</Label>
            <p className="font-medium" data-testid="text-purpose">{request.purpose}</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Limits & Duration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Spend Limit</Label>
                <p className="font-medium font-mono" data-testid="text-spend-limit">{request.spendLimit}</p>
              </div>
              {request.cardType === "one-time" && request.transactionCount && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Transaction Count</Label>
                  <p className="font-medium" data-testid="text-transaction-count">
                    {request.transactionCount === "1" ? "Single Transaction" : "Unlimited"}
                  </p>
                </div>
              )}
              {request.cardType === "recurring" && request.renewalFrequency && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Renewal Frequency</Label>
                  <p className="font-medium capitalize" data-testid="text-renewal-frequency">
                    {request.renewalFrequency}ly
                  </p>
                </div>
              )}
              {request.validFrom && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Valid From</Label>
                  <p className="font-medium" data-testid="text-valid-from">{request.validFrom}</p>
                </div>
              )}
              {request.validUntil && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Valid Until</Label>
                  <p className="font-medium" data-testid="text-valid-until">{request.validUntil}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Restrictions</h3>
            <div className="space-y-4">
              {request.allowedMerchants && request.allowedMerchants.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Allowed Merchants</Label>
                  <div className="flex flex-wrap gap-1" data-testid="container-merchants">
                    {request.allowedMerchants.map((merchant) => (
                      <Badge key={merchant} variant="outline" className="text-xs">
                        {merchant}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {request.allowedMccCodes && request.allowedMccCodes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Allowed MCC Codes</Label>
                  <div className="flex flex-wrap gap-1" data-testid="container-mcc-codes">
                    {request.allowedMccCodes.map((code) => (
                      <Badge key={code} variant="outline" className="text-xs">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {request.allowedCountries && request.allowedCountries.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Allowed Countries</Label>
                  <div className="flex flex-wrap gap-1" data-testid="container-countries">
                    {request.allowedCountries.map((country) => (
                      <Badge key={country} variant="outline" className="text-xs">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {request.channelRestriction && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Channel Restriction</Label>
                  <p className="font-medium capitalize" data-testid="text-channel">
                    {request.channelRestriction === "both" ? "Online & In-Store" : request.channelRestriction}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Coding Template</h3>
            <div className="grid grid-cols-3 gap-4">
              {request.glAccountTemplate && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">GL Account</Label>
                  <p className="font-medium font-mono" data-testid="text-gl-account">{request.glAccountTemplate}</p>
                </div>
              )}
              {request.departmentTemplate && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Department</Label>
                  <p className="font-medium capitalize" data-testid="text-department">{request.departmentTemplate}</p>
                </div>
              )}
              {request.costCenterTemplate && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Cost Center</Label>
                  <p className="font-medium" data-testid="text-cost-center">{request.costCenterTemplate}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Requested By</Label>
              <p className="font-medium" data-testid="text-requested-by">{request.requestedBy}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Request Date</Label>
              <p className="font-medium" data-testid="text-request-date">{request.requestDate}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
