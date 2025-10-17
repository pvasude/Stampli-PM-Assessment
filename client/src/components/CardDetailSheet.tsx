import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Lock, 
  Unlock, 
  Ban, 
  Share2, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Calendar,
  MapPin,
  CreditCard,
  DollarSign
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  amount: string;
  vendorName: string;
  transactionDate: string;
  status: "Completed" | "Pending" | "Declined";
  memo?: string;
}

interface CardDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: {
    id: string;
    cardType: "Invoice Card" | "Expense Card";
    cardholderName: string;
    spendLimit: string;
    currentSpend: string;
    status: "Active" | "Locked" | "Suspended" | "Pending Approval";
    purpose?: string;
    cardNumber?: string;
    currency?: string;
    validFrom?: string;
    validUntil?: string;
    allowedMerchants?: string[];
    allowedMccCodes?: string[];
    allowedCountries?: string[];
    channelRestriction?: string;
    limitType?: "one-time" | "recurring";
    transactionCount?: "1" | "unlimited";
    renewalFrequency?: "month" | "quarter" | "year";
    glAccountTemplate?: string;
    departmentTemplate?: string;
    costCenterTemplate?: string;
  };
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    amount: "$250.00",
    vendorName: "Amazon Business",
    transactionDate: "2024-10-15",
    status: "Completed",
    memo: "Office supplies"
  },
  {
    id: "2",
    amount: "$1,200.00",
    vendorName: "Dell Technologies",
    transactionDate: "2024-10-14",
    status: "Completed",
    memo: "Laptop purchase"
  },
  {
    id: "3",
    amount: "$450.00",
    vendorName: "Adobe",
    transactionDate: "2024-10-13",
    status: "Pending",
    memo: "Software subscription"
  },
  {
    id: "4",
    amount: "$800.00",
    vendorName: "Unauthorized Merchant",
    transactionDate: "2024-10-12",
    status: "Declined",
    memo: "Outside allowed merchant list"
  },
  {
    id: "5",
    amount: "$350.00",
    vendorName: "Staples",
    transactionDate: "2024-10-10",
    status: "Completed",
    memo: "Office furniture"
  },
];

export function CardDetailSheet({ open, onOpenChange, card }: CardDetailSheetProps) {
  const [shareEmail, setShareEmail] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const { toast } = useToast();

  const completedTransactions = mockTransactions.filter(t => t.status === "Completed" || t.status === "Pending");
  const declinedTransactions = mockTransactions.filter(t => t.status === "Declined");

  const handleShare = () => {
    if (!shareEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address to share the card details",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Sharing card details to:", shareEmail);
    toast({
      title: "Card details shared",
      description: `Card details sent to ${shareEmail}`,
    });
    setShareEmail("");
    setShowShareDialog(false);
  };

  const handleLock = () => {
    console.log("Locking card:", card.id);
    toast({
      title: "Card locked",
      description: "The card has been temporarily locked and cannot be used for transactions",
    });
    setShowLockDialog(false);
  };

  const handleUnlock = () => {
    console.log("Unlocking card:", card.id);
    toast({
      title: "Card unlocked",
      description: "The card is now active and can be used for transactions",
    });
  };

  const handleSuspend = () => {
    console.log("Suspending card:", card.id);
    toast({
      title: "Card suspended",
      description: "The card has been permanently suspended and cannot be reactivated",
    });
    setShowSuspendDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-foreground";
      case "Locked": return "text-muted-foreground";
      case "Suspended": return "text-destructive";
      case "Pending Approval": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getTransactionStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
      case "Pending": return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "Declined": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto" data-testid="sheet-card-details">
          <SheetHeader>
            <SheetTitle>Card Details</SheetTitle>
            <SheetDescription>
              View and manage card controls, transactions, and sharing
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{card.cardholderName}</h3>
                <p className="text-sm text-muted-foreground">{card.purpose}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant={card.limitType === "one-time" ? "secondary" : "outline"} data-testid="badge-card-type">
                    {card.limitType === "one-time" ? "One-Time Card" : "Recurring Card"}
                  </Badge>
                  <span className="text-xs text-muted-foreground" data-testid="text-card-frequency">
                    {card.limitType === "one-time" 
                      ? (card.transactionCount === "1" ? "Single Transaction" : "Unlimited Transactions")
                      : (card.renewalFrequency === "month" ? "Monthly Reset" : 
                         card.renewalFrequency === "quarter" ? "Quarterly Reset" : "Yearly Reset")}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${getStatusColor(card.status)}`}>
                  {card.status}
                </p>
                <p className="text-2xl font-bold mt-1">{card.currentSpend}</p>
                <p className="text-xs text-muted-foreground">of {card.spendLimit}</p>
              </div>
            </div>

            {card.status !== "Pending Approval" && (
              <div className="flex gap-2 flex-wrap">
                {card.status === "Active" && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowLockDialog(true)}
                      data-testid="button-lock-card"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Lock Card
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowSuspendDialog(true)}
                      data-testid="button-suspend-card"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Suspend
                    </Button>
                  </>
                )}
                {card.status === "Locked" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUnlock}
                    data-testid="button-unlock-card"
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    Unlock Card
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowShareDialog(true)}
                  data-testid="button-share-card"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Card
                </Button>
              </div>
            )}

            <Tabs defaultValue="controls" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="controls" data-testid="tab-controls">Controls</TabsTrigger>
                <TabsTrigger value="transactions" data-testid="tab-transactions">
                  Transactions ({completedTransactions.length})
                </TabsTrigger>
                <TabsTrigger value="declined" data-testid="tab-declined">
                  Declined ({declinedTransactions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="controls" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Spend Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Currency</p>
                        <p className="text-sm text-muted-foreground">{card.currency || "USD"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Limit Type</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {card.limitType || "-"}
                        </p>
                      </div>
                    </div>
                    {card.limitType === "one-time" && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Transaction Count</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {card.transactionCount || "-"}
                          </p>
                        </div>
                      </div>
                    )}
                    {card.limitType === "recurring" && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Renewal Frequency</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {card.renewalFrequency || "-"}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Valid Until</p>
                        <p className="text-sm text-muted-foreground">{card.validUntil || "-"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Restrictions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Allowed Countries</p>
                        <p className="text-sm text-muted-foreground">
                          {card.allowedCountries && card.allowedCountries.length > 0 
                            ? card.allowedCountries.join(", ") 
                            : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Channel</p>
                        <p className="text-sm text-muted-foreground capitalize">{card.channelRestriction || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Allowed Merchants</p>
                        <p className="text-sm text-muted-foreground">
                          {card.allowedMerchants && card.allowedMerchants.length > 0 
                            ? card.allowedMerchants.join(", ") 
                            : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Allowed MCC Codes</p>
                        <p className="text-sm text-muted-foreground">
                          {card.allowedMccCodes && card.allowedMccCodes.length > 0 
                            ? card.allowedMccCodes.join(", ") 
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Coding Template</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">GL Account</p>
                        <p className="text-sm text-muted-foreground">{card.glAccountTemplate || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Department</p>
                        <p className="text-sm text-muted-foreground">{card.departmentTemplate || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Cost Center</p>
                        <p className="text-sm text-muted-foreground">{card.costCenterTemplate || "-"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-3 mt-4">
                {completedTransactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getTransactionStatusIcon(transaction.status)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{transaction.vendorName}</p>
                            <p className="text-xs text-muted-foreground">{transaction.transactionDate}</p>
                            {transaction.memo && (
                              <p className="text-xs text-muted-foreground mt-1">{transaction.memo}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{transaction.amount}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {completedTransactions.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No transactions yet
                  </p>
                )}
              </TabsContent>

              <TabsContent value="declined" className="space-y-3 mt-4">
                {declinedTransactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getTransactionStatusIcon(transaction.status)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{transaction.vendorName}</p>
                            <p className="text-xs text-muted-foreground">{transaction.transactionDate}</p>
                            {transaction.memo && (
                              <p className="text-xs text-destructive mt-1">{transaction.memo}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{transaction.amount}</p>
                          <Badge variant="destructive" className="text-xs mt-1">
                            Declined
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {declinedTransactions.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No declined transactions
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent data-testid="dialog-share-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Share Card Details</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the email address to share the card details securely.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="share-email">Email Address</Label>
            <Input
              id="share-email"
              type="email"
              placeholder="colleague@company.com"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              data-testid="input-share-email"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-share">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleShare} data-testid="button-confirm-share">
              Share Card
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <AlertDialogContent data-testid="dialog-lock-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Lock Card</AlertDialogTitle>
            <AlertDialogDescription>
              This will temporarily lock the card. All transactions will be declined until you unlock it. You can unlock it at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-lock">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLock} data-testid="button-confirm-lock">
              Lock Card
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent data-testid="dialog-suspend-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Card</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently suspend the card. This action cannot be undone and the card cannot be reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-suspend">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspend} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-suspend">
              Suspend Card
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
