import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Building, FileCheck, CheckCircle2, AlertCircle, Sparkles, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PayInvoiceDialogProps {
  trigger?: React.ReactNode;
  invoice: {
    id: string;
    invoiceNumber: string;
    vendorName: string;
    amount: string;
    status?: string;
    totalAmount?: string;
    acceptsCards?: boolean;
    mcpAutomation?: "available" | "manual" | "unavailable";
    paymentTerms?: "Net 30" | "Net 60" | "Net 90" | "Due on Receipt" | "Monthly Recurring" | "Quarterly Recurring" | "Yearly Recurring" | "2 Installments" | "3 Installments" | "4 Installments";
  };
  onPay?: (method: string, details: any) => void;
}

export function PayInvoiceDialog({ trigger, invoice, onPay }: PayInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { toast } = useToast();
  
  // Determine card type and frequency based on payment terms
  const getCardDefaults = () => {
    const terms = invoice.paymentTerms || "Due on Receipt";
    
    // Standard one-time invoices with payment deadlines (Net 30/60/90 are NOT recurring)
    if (terms === "Due on Receipt" || terms === "Net 30" || terms === "Net 60" || terms === "Net 90") {
      return { cardType: "one-time" as const, transactionCount: "1" as const, renewalFrequency: "month" as const };
    }
    
    // Installment payments (multiple transactions for same invoice)
    if (terms === "2 Installments" || terms === "3 Installments" || terms === "4 Installments") {
      return { cardType: "one-time" as const, transactionCount: "unlimited" as const, renewalFrequency: "month" as const };
    }
    
    // Recurring bills (actual recurring expenses)
    if (terms === "Monthly Recurring") {
      return { cardType: "recurring" as const, transactionCount: "1" as const, renewalFrequency: "month" as const };
    }
    if (terms === "Quarterly Recurring") {
      return { cardType: "recurring" as const, transactionCount: "1" as const, renewalFrequency: "quarter" as const };
    }
    if (terms === "Yearly Recurring") {
      return { cardType: "recurring" as const, transactionCount: "1" as const, renewalFrequency: "year" as const };
    }
    
    return { cardType: "one-time" as const, transactionCount: "1" as const, renewalFrequency: "month" as const };
  };
  
  const defaults = getCardDefaults();
  
  // Card generation fields - pre-populated from invoice
  const [cardholderName, setCardholderName] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [channelRestriction, setChannelRestriction] = useState("both");
  const [allowedMerchants, setAllowedMerchants] = useState(invoice.vendorName);
  const [currency, setCurrency] = useState("USD");
  const [cardType, setCardType] = useState<"one-time" | "recurring">(defaults.cardType);
  const [transactionCount, setTransactionCount] = useState<"1" | "unlimited">(defaults.transactionCount);
  const [renewalFrequency, setRenewalFrequency] = useState<"month" | "quarter" | "year">(defaults.renewalFrequency);
  
  // Calculate values
  const cardLimit = invoice.totalAmount || invoice.amount;
  const cashback = (parseFloat(cardLimit.replace(/[$,]/g, '')) * 0.01).toFixed(2);
  const acceptsCards = invoice.acceptsCards !== false;
  const mcpAutomation = invoice.mcpAutomation || "available";

  const handlePayWithCard = () => {
    const cardDetails = {
      invoiceId: invoice.id,
      cardholderName,
      spendLimit: cardLimit,
      validUntil,
      channelRestriction,
      allowedMerchants: [allowedMerchants],
      currency,
      cardType: "Invoice Card",
      limitType: cardType,
      transactionCount: cardType === "one-time" ? transactionCount : null,
      renewalFrequency: cardType === "recurring" ? renewalFrequency : null,
      purpose: `Payment for ${invoice.invoiceNumber}`,
    };
    
    console.log("Generating card for invoice:", cardDetails);
    onPay?.("card", cardDetails);
    toast({
      title: "Payment processed",
      description: `Virtual card generated for ${invoice.invoiceNumber} - ${cardLimit}`,
    });
    setOpen(false);
  };

  const handlePayWithACH = () => {
    console.log("Processing ACH payment for invoice:", invoice.id);
    onPay?.("ach", { invoiceId: invoice.id });
    toast({
      title: "ACH payment initiated",
      description: `Processing ACH payment for ${invoice.invoiceNumber}`,
    });
    setOpen(false);
  };

  const handlePayWithCheck = () => {
    console.log("Processing check payment for invoice:", invoice.id);
    onPay?.("check", { invoiceId: invoice.id });
    toast({
      title: "Check issued",
      description: `Check will be mailed for ${invoice.invoiceNumber}`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button data-testid={`button-pay-invoice-${invoice.id}`}>
            Pay Invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" data-testid="dialog-pay-invoice">
        <DialogHeader>
          <DialogTitle>Pay Invoice {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>
            Choose a payment method for {invoice.vendorName} - {invoice.amount}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="card" data-testid="tab-card">
              <CreditCard className="h-4 w-4 mr-2" />
              Card
            </TabsTrigger>
            <TabsTrigger value="ach" data-testid="tab-ach">
              <Building className="h-4 w-4 mr-2" />
              ACH
            </TabsTrigger>
            <TabsTrigger value="check" data-testid="tab-check">
              <FileCheck className="h-4 w-4 mr-2" />
              Check
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="card" className="space-y-4 mt-4">
            <Alert className="border-primary/20 bg-primary/5">
              <DollarSign className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm">Earn 1% cashback on this payment</span>
                <Badge variant="outline" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  ${cashback}
                </Badge>
              </AlertDescription>
            </Alert>

            <div className="p-3 border rounded-lg bg-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Card Configuration</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={cardType === "one-time" ? "secondary" : "outline"} data-testid="badge-selected-card-type">
                  {cardType === "one-time" ? "One-Time Card" : "Recurring Card"}
                </Badge>
                <span className="text-xs text-muted-foreground" data-testid="text-selected-frequency">
                  {cardType === "one-time" 
                    ? (transactionCount === "1" ? "Single Transaction" : 
                       (invoice.paymentTerms?.includes("Installments") 
                        ? `Multiple Transactions (${invoice.paymentTerms.split(" ")[0]} installments)`
                        : "Unlimited Transactions"))
                    : (renewalFrequency === "month" ? "Monthly Reset" : 
                       renewalFrequency === "quarter" ? "Quarterly Reset" : "Yearly Reset")}
                </span>
              </div>
              {invoice.paymentTerms && (
                <p className="text-xs text-muted-foreground mt-2">
                  Auto-configured for: {invoice.paymentTerms}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {acceptsCards ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Vendor accepts cards</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span>Vendor may not accept cards</span>
                </>
              )}
            </div>

            {mcpAutomation === "available" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span><strong>MCP/Visa Automation:</strong> Payment will be automatically processed</span>
              </div>
            )}
            {mcpAutomation === "manual" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span><strong>Manual Sharing Required:</strong> You'll need to share card details</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="cardholder">Cardholder Name *</Label>
              <Input
                id="cardholder"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Enter cardholder name"
                data-testid="input-cardholder-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Card Limit</Label>
                <Input
                  id="amount"
                  value={cardLimit}
                  disabled
                  className="bg-muted"
                  data-testid="input-card-limit"
                />
                {invoice.totalAmount && invoice.totalAmount !== invoice.amount && (
                  <p className="text-xs text-muted-foreground">Full invoice value (not current amount due)</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency" data-testid="select-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid-until">Valid Until *</Label>
                <Input
                  id="valid-until"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  data-testid="input-valid-until"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Select value={channelRestriction} onValueChange={setChannelRestriction}>
                  <SelectTrigger id="channel" data-testid="select-channel-restriction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online Only</SelectItem>
                    <SelectItem value="in-store">In-Store Only</SelectItem>
                    <SelectItem value="both">Online & In-Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchants">Allowed Merchant</Label>
              <Input
                id="merchants"
                value={allowedMerchants}
                onChange={(e) => setAllowedMerchants(e.target.value)}
                placeholder="Pre-filled with vendor name"
                data-testid="input-allowed-merchants"
              />
            </div>

            <Button 
              onClick={handlePayWithCard} 
              className="w-full" 
              disabled={!cardholderName.trim()}
              data-testid="button-generate-card"
            >
              Generate Card & Pay
            </Button>
          </TabsContent>
          
          <TabsContent value="ach" className="space-y-4 mt-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                ACH payment will be processed through your bank account
              </p>
            </div>
            <Button onClick={handlePayWithACH} className="w-full" data-testid="button-pay-ach">
              Process ACH Payment
            </Button>
          </TabsContent>
          
          <TabsContent value="check" className="space-y-4 mt-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                A physical check will be issued and mailed to the vendor
              </p>
            </div>
            <Button onClick={handlePayWithCheck} className="w-full" data-testid="button-issue-check">
              Issue Check
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
