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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Building, FileCheck } from "lucide-react";

interface PayInvoiceDialogProps {
  trigger?: React.ReactNode;
  invoice: {
    id: string;
    invoiceNumber: string;
    vendorName: string;
    amount: string;
  };
  onPay?: (method: string, details: any) => void;
}

export function PayInvoiceDialog({ trigger, invoice, onPay }: PayInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  
  // Card generation fields
  const [cardholderName, setCardholderName] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [channelRestriction, setChannelRestriction] = useState("both");

  const handlePayWithCard = () => {
    const cardDetails = {
      invoiceId: invoice.id,
      cardholderName,
      spendLimit: invoice.amount,
      validUntil,
      channelRestriction,
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
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                A virtual card will be generated and automatically assigned to this invoice
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardholder">Cardholder Name</Label>
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
                  value={invoice.amount}
                  disabled
                  className="bg-muted"
                  data-testid="input-card-limit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid-until">Valid Until</Label>
                <Input
                  id="valid-until"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  data-testid="input-valid-until"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Channel Restriction</Label>
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

            <Button onClick={handlePayWithCard} className="w-full" data-testid="button-generate-card">
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
