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
  };
  onPay?: (method: string, details: any) => void;
}

export function PayInvoiceDialog({ trigger, invoice, onPay }: PayInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  
  // Card generation fields - pre-populated from invoice
  const [cardholderName, setCardholderName] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [channelRestriction, setChannelRestriction] = useState("both");
  const [allowedMerchants, setAllowedMerchants] = useState(invoice.vendorName);
  const [currency, setCurrency] = useState("USD");
  
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
      purpose: `Payment for ${invoice.invoiceNumber}`,
    };
    
    console.log("Generating card for invoice:", cardDetails);
    onPay?.("card", cardDetails);
    setOpen(false);
  };

  const handlePayWithACH = () => {
    console.log("Processing ACH payment for invoice:", invoice.id);
    onPay?.("ach", { invoiceId: invoice.id });
    setOpen(false);
  };

  const handlePayWithCheck = () => {
    console.log("Processing check payment for invoice:", invoice.id);
    onPay?.("check", { invoiceId: invoice.id });
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

            <div className="flex gap-2">
              {acceptsCards ? (
                <Alert className="flex-1 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                  <AlertDescription className="text-sm text-green-700 dark:text-green-400">
                    Vendor accepts cards
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="flex-1 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                  <AlertDescription className="text-sm text-amber-700 dark:text-amber-400">
                    Vendor may not accept cards
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {mcpAutomation === "available" && (
              <Alert className="border-primary/20 bg-primary/5">
                <Sparkles className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>MCP/Visa Automation:</strong> Payment will be automatically processed via Visa Commercial Pay
                </AlertDescription>
              </Alert>
            )}
            {mcpAutomation === "manual" && (
              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                <AlertDescription className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Manual Sharing Required:</strong> You'll need to share card details with the vendor
                </AlertDescription>
              </Alert>
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
              disabled={!cardholderName.trim() || !validUntil.trim()}
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
