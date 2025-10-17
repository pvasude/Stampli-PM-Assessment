import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ApprovalItemProps {
  id: string;
  cardholderName: string;
  purpose: string;
  spendLimit: string;
  requestedBy: string;
  requestDate: string;
  approvalLevel: number;
  status: "Pending" | "Approved" | "Rejected";
  currentApprover?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
}

export function ApprovalItem({
  id,
  cardholderName,
  purpose,
  spendLimit,
  requestedBy,
  requestDate,
  approvalLevel,
  status,
  currentApprover,
  onApprove,
  onReject,
  onViewDetails,
}: ApprovalItemProps) {
  const statusColors = {
    Pending: "bg-chart-2 text-white",
    Approved: "bg-chart-1 text-white",
    Rejected: "bg-destructive text-destructive-foreground",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="hover-elevate" data-testid={`approval-item-${id}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold" data-testid={`text-cardholder-${id}`}>
                {cardholderName}
              </h3>
              <Badge className={statusColors[status]} data-testid={`badge-status-${id}`}>
                {status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{purpose}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-lg" data-testid={`text-limit-${id}`}>
            {spendLimit}
          </p>
          <p className="text-xs text-muted-foreground">Limit</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-muted">
              {getInitials(requestedBy)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{requestedBy}</p>
            <p className="text-xs text-muted-foreground">Requested {requestDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Approval Level {approvalLevel}
            {currentApprover && ` • ${currentApprover}`}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onViewDetails}
            data-testid={`button-view-details-${id}`}
          >
            View Details
          </Button>
          {status === "Pending" && (
            <>
              <Button
                size="sm"
                variant="default"
                className="flex-1"
                onClick={onApprove}
                data-testid={`button-approve-${id}`}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={onReject}
                data-testid={`button-reject-${id}`}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
