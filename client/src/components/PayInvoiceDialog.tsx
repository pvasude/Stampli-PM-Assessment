import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { CreditCard, Building, FileCheck, CheckCircle2, AlertCircle, Sparkles, DollarSign, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const MERCHANT_OPTIONS = [
  "Amazon",
  "Amazon Web Services (AWS)",
  "Microsoft Azure",
  "Google Cloud Platform",
  "Office Depot",
  "Staples",
  "LinkedIn",
  "Zoom",
  "Slack",
  "Delta Airlines",
  "United Airlines",
  "Hilton Hotels",
  "Marriott Hotels",
];

const COUNTRY_OPTIONS = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
];

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
  
  // Mutation to create card when paying invoice
  const createCardMutation = useMutation({
    mutationFn: async (cardData: any) => {
      const response = await apiRequest('POST', '/api/cards', cardData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/card-approvals'] });
    },
  });

  const createApprovalMutation = useMutation({
    mutationFn: async (approvalData: any) => {
      const response = await apiRequest('POST', '/api/card-approvals', approvalData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/card-approvals'] });
    },
  });
  
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
  const [allowedMerchants, setAllowedMerchants] = useState<string[]>([invoice.vendorName]);
  const [allowedCountries, setAllowedCountries] = useState<string[]>(["US"]);
  const [currency, setCurrency] = useState("USD");
  const [cardType, setCardType] = useState<"one-time" | "recurring">(defaults.cardType);
  const [transactionCount, setTransactionCount] = useState<"1" | "unlimited">(defaults.transactionCount);
  const [renewalFrequency, setRenewalFrequency] = useState<"month" | "quarter" | "year">(defaults.renewalFrequency);
  
  // Calculate values
  const cardLimit = invoice.totalAmount || invoice.amount;
  const cashback = (parseFloat(cardLimit.replace(/[$,]/g, '')) * 0.01).toFixed(2);
  const acceptsCards = invoice.acceptsCards !== false;
  const mcpAutomation = invoice.mcpAutomation || "available";

  const handlePayWithCard = async () => {
    if (!cardholderName || !validUntil) {
      toast({
        title: "Missing information",
        description: "Please provide cardholder name and valid until date",
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse the card limit to a number and convert to string for the API
      const limitAmount = parseFloat(cardLimit.replace(/[$,]/g, ''));
      
      // Create the card with auto-approved status for invoice payments
      const cardData = {
        cardholderName,
        purpose: `Payment for ${invoice.invoiceNumber}`,
        spendLimit: limitAmount.toFixed(2), // Convert to string with 2 decimals
        currentSpend: 0,
        validFrom: new Date().toISOString(),
        validUntil,
        status: "Active", // Auto-approve invoice payment cards
        requestedBy: cardholderName,
        approvedBy: "Auto-Approved", // Mark as auto-approved
        cardType,
        transactionCount: cardType === "one-time" ? transactionCount : null,
        renewalFrequency: cardType === "recurring" ? renewalFrequency : null,
        currency,
        channelRestriction,
        allowedMerchants,
        allowedCountries,
        invoiceId: invoice.id,
        glAccount: null,
        department: null,
        costCenter: null,
      };
      
      const newCard = await createCardMutation.mutateAsync(cardData);
      
      // Update invoice status to Paid
      await apiRequest('PATCH', `/api/invoices/${invoice.id}`, {
        status: "Paid",
        paymentMethod: `Virtual Card - ${newCard.last4 || "****"}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      
      onPay?.("card", cardData);
      toast({
        title: "Card created and invoice paid",
        description: `Virtual card activated for ${invoice.invoiceNumber}`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Failed to create card",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handlePayWithACH = async () => {
    try {
      // Mark invoice as paid with ACH
      await apiRequest('PATCH', `/api/invoices/${invoice.id}`, {
        status: "Paid",
        paymentMethod: "ACH Transfer",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      
      onPay?.("ach", { invoiceId: invoice.id });
      toast({
        title: "Invoice paid with ACH",
        description: `ACH payment processed for ${invoice.invoiceNumber}`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Failed to process ACH payment",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handlePayWithCheck = async () => {
    try {
      // Mark invoice as paid with Check
      await apiRequest('PATCH', `/api/invoices/${invoice.id}`, {
        status: "Paid",
        paymentMethod: "Check",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      
      onPay?.("check", { invoiceId: invoice.id });
      toast({
        title: "Invoice paid with Check",
        description: `Check issued for ${invoice.invoiceNumber}`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Failed to issue check",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" data-testid="dialog-pay-invoice">
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
              <Label>Allowed Merchants</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto min-h-9"
                    data-testid="button-select-merchants"
                  >
                    {allowedMerchants.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {allowedMerchants.map((merchant) => (
                          <Badge key={merchant} variant="secondary" className="text-xs">
                            {merchant}
                            <X
                              className="ml-1 h-3 w-3 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAllowedMerchants(allowedMerchants.filter((m) => m !== merchant));
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select merchants...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <div className="max-h-[300px] overflow-y-auto p-2">
                    {MERCHANT_OPTIONS.map((merchant) => (
                      <div
                        key={merchant}
                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                        onClick={() => {
                          if (allowedMerchants.includes(merchant)) {
                            setAllowedMerchants(allowedMerchants.filter((m) => m !== merchant));
                          } else {
                            setAllowedMerchants([...allowedMerchants, merchant]);
                          }
                        }}
                        data-testid={`checkbox-merchant-${merchant.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Checkbox checked={allowedMerchants.includes(merchant)} />
                        <span className="text-sm">{merchant}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Invoice vendor ({invoice.vendorName}) pre-selected
              </p>
            </div>

            <div className="space-y-2">
              <Label>Allowed Countries</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto min-h-9"
                    data-testid="button-select-countries"
                  >
                    {allowedCountries.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {allowedCountries.map((code) => {
                          const country = COUNTRY_OPTIONS.find((c) => c.code === code);
                          return (
                            <Badge key={code} variant="secondary" className="text-xs">
                              {code} - {country?.name}
                              <X
                                className="ml-1 h-3 w-3 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAllowedCountries(allowedCountries.filter((c) => c !== code));
                                }}
                              />
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select countries...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <div className="max-h-[300px] overflow-y-auto p-2">
                    {COUNTRY_OPTIONS.map((country) => (
                      <div
                        key={country.code}
                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                        onClick={() => {
                          if (allowedCountries.includes(country.code)) {
                            setAllowedCountries(allowedCountries.filter((c) => c !== country.code));
                          } else {
                            setAllowedCountries([...allowedCountries, country.code]);
                          }
                        }}
                        data-testid={`checkbox-country-${country.code.toLowerCase()}`}
                      >
                        <Checkbox checked={allowedCountries.includes(country.code)} />
                        <span className="text-sm">{country.code} - {country.name}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Select one or more countries where this card can be used
              </p>
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
