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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Building, FileCheck, CheckCircle2, AlertCircle, Sparkles, DollarSign, X, Zap, Mail, Copy, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    lockedCardId?: string | null;
    firstPaymentMethod?: string | null;
  };
  onPay?: (method: string, details: any) => void;
}

export function PayInvoiceDialog({ trigger, invoice, onPay }: PayInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardPaymentMode, setCardPaymentMode] = useState<"pay-via-stampli" | "share-card">("pay-via-stampli");
  const [createdCard, setCreatedCard] = useState<any>(null);
  const { toast } = useToast();
  
  // Fetch locked card if invoice is locked to a card
  const { data: lockedCard, isLoading: isLoadingLockedCard } = useQuery<{
    id: string;
    last4: string;
    currentSpend: string;
    spendLimit: string;
    cardholderName: string;
    status: string;
  }>({
    queryKey: [`/api/cards/${invoice.lockedCardId}`],
    enabled: !!invoice.lockedCardId,
  });
  
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

  const unlinkPaymentMethodMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PATCH', `/api/invoices/${invoice.id}`, {
        lockedCardId: null,
        paymentMethod: null,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Payment method unlinked",
        description: "You can now choose a different payment method",
      });
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
  
  // Payment processing guard to prevent duplicate submissions
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Card generation fields - pre-populated from invoice
  const [cardholderName, setCardholderName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [achPaymentSource, setAchPaymentSource] = useState<"wallet" | "bank">("wallet");
  const [checkPaymentSource, setCheckPaymentSource] = useState<"wallet" | "bank">("wallet");
  // Default to 30 days from now in yyyy-MM-dd format
  const [validUntil, setValidUntil] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
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

  const handlePayViaStampli = async () => {
    // Skip validation when retrying with a locked card (card details already exist)
    if (!lockedCard && (!cardholderName || !validUntil)) {
      toast({
        title: "Missing information",
        description: "Please provide cardholder name and valid until date",
        variant: "destructive",
      });
      return;
    }

    if (isProcessingPayment) {
      return; // Prevent duplicate submissions
    }

    setIsProcessingPayment(true);
    try {
      // Parse the card limit to a number and convert to string for the API
      const limitAmount = parseFloat(cardLimit.replace(/[$,]/g, ''));
      
      // Check if invoice already has a locked card (from previous declined attempt)
      let cardToUse;
      if (invoice.lockedCardId) {
        // Invoice already has a card - fetch it and retry with same card
        try {
          const cardResponse = await fetch(`/api/cards/${invoice.lockedCardId}`);
          if (cardResponse.ok) {
            const existingCard = await cardResponse.json();
            // Only reuse if card is still Active
            if (existingCard.status === "Active") {
              cardToUse = existingCard;
              toast({
                title: "Retrying with existing card",
                description: `Using existing card ****${existingCard.last4 || "****"}`,
              });
            }
          }
        } catch (e) {
          // Card fetch failed, will create new one
        }
      }
      
      // Step 1: Create the card and link it to the invoice (if we don't already have one)
      if (!cardToUse) {
        const cardData = {
          cardholderName,
          purpose: `Payment for ${invoice.invoiceNumber}`,
          spendLimit: limitAmount.toFixed(2),
          currentSpend: 0,
          validFrom: new Date().toISOString(),
          validUntil: new Date(validUntil + 'T23:59:59').toISOString(),
          status: "Active",
          requestedBy: cardholderName,
          approvedBy: "Auto-Approved",
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
        
        cardToUse = await createCardMutation.mutateAsync(cardData);
        
        // Link invoice to this card (may fail if invoice is already locked)
        try {
          await apiRequest('PATCH', `/api/invoices/${invoice.id}`, {
            lockedCardId: cardToUse.id,
            paymentMethod: `Virtual Card - ${cardToUse.last4 || "****"}`,
          });
          queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
        } catch (patchError) {
          // Invoice might already be locked from a previous attempt - that's okay
          console.log("Invoice already locked, proceeding with payment:", patchError);
        }
      }
      
      // Step 2: Attempt to charge the card (this can be declined if wallet has insufficient funds)
      try {
        const transactionResponse = await apiRequest('POST', '/api/simulate/transaction', {
          cardId: cardToUse.id,
          amount: limitAmount.toFixed(2),
          merchant: invoice.vendorName,
        });
        
        const transaction = await transactionResponse.json();
        
        if (!transaction.approved) {
          // Transaction declined - card remains linked to invoice for retry
          // Show the created card so user knows it exists
          setCreatedCard(cardToUse);
          toast({
            title: "Card created, transaction declined",
            description: transaction.declineReason || "Insufficient wallet funds. Card created and linked to invoice - you can retry once wallet is funded.",
            variant: "destructive",
          });
          setIsProcessingPayment(false);
          return;
        }
        
        // Transaction approved - update invoice status
        await apiRequest('POST', `/api/invoices/${invoice.id}/update-status`, {});
        queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
        queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
        
        onPay?.("card-stampli", { card: cardToUse, transaction });
        toast({
          title: "Payment processed successfully",
          description: `Invoice ${invoice.invoiceNumber} paid via Virtual Card`,
        });
        setIsProcessingPayment(false);
        setOpen(false);
      } catch (transactionError) {
        // Transaction attempt failed but card is still created and linked
        // Show the created card so user knows it exists
        setCreatedCard(cardToUse);
        toast({
          title: "Card created, charge failed",
          description: transactionError instanceof Error ? transactionError.message : "Card created but charge failed. You can retry once wallet is funded.",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
      }
    } catch (error) {
      toast({
        title: "Failed to create card",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

  const handleShareCard = async () => {
    if (!cardholderName || !validUntil) {
      toast({
        title: "Missing information",
        description: "Please provide cardholder name and valid until date",
        variant: "destructive",
      });
      return;
    }

    if (!vendorEmail.trim()) {
      toast({
        title: "Vendor email required",
        description: "Please provide the vendor's email address to share card details",
        variant: "destructive",
      });
      return;
    }

    if (isProcessingPayment) {
      return; // Prevent duplicate submissions
    }

    setIsProcessingPayment(true);
    try{
      // Parse the card limit to a number and convert to string for the API
      const limitAmount = parseFloat(cardLimit.replace(/[$,]/g, ''));
      
      // Create the card with auto-approved status for invoice payments
      const cardData = {
        cardholderName,
        purpose: `Payment for ${invoice.invoiceNumber}`,
        spendLimit: limitAmount.toFixed(2),
        currentSpend: 0,
        validFrom: new Date().toISOString(),
        validUntil: new Date(validUntil + 'T23:59:59').toISOString(), // Convert yyyy-MM-dd to ISO timestamp
        status: "Active",
        requestedBy: cardholderName,
        approvedBy: "Auto-Approved",
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
      
      // Lock invoice to this card and set Card Shared status
      await apiRequest('PATCH', `/api/invoices/${invoice.id}`, {
        status: "Card Shared - Awaiting Payment",
        paymentMethod: `Virtual Card - ${newCard.last4 || "****"} (Shared)`,
        lockedCardId: newCard.id,
      });
      
      // Note: Status remains "Card Shared - Awaiting Payment" until payment is made
      
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      
      // Store created card to show details
      setCreatedCard(newCard);
      
      onPay?.("card-shared", { card: newCard });
      toast({
        title: "Card created successfully",
        description: `Virtual card ready to share with ${invoice.vendorName}`,
      });
      setIsProcessingPayment(false);
    } catch (error) {
      toast({
        title: "Failed to create card",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

  const handlePayWithACH = async () => {
    try {
      const amount = parseFloat(invoice.amount.replace(/[$,]/g, ''));
      
      // If paying from wallet, deduct from wallet balance
      if (achPaymentSource === "wallet") {
        const walletResponse = await fetch('/api/wallet');
        const wallet = await walletResponse.json();
        const currentBalance = parseFloat(wallet.balance.replace(/[$,]/g, ''));
        
        if (currentBalance < amount) {
          toast({
            title: "Insufficient wallet balance",
            description: `Wallet has $${currentBalance.toFixed(2)}, but invoice is $${amount.toFixed(2)}`,
            variant: "destructive",
          });
          return;
        }
        
        // Deduct from wallet
        await apiRequest('POST', '/api/wallet/add-funds', {
          amount: -amount
        });
      }
      
      // Record payment
      const now = new Date();
      const paymentResponse = await apiRequest('POST', '/api/payments', {
        invoiceId: invoice.id,
        amount: amount.toString(),
        paymentMethod: achPaymentSource === "wallet" ? "ach-wallet" : "ach-bank",
        status: "Paid",
        dueDate: now,
        paidDate: now,
      });
      const payment = await paymentResponse.json();
      
      // Create transaction record
      await apiRequest('POST', '/api/transactions', {
        amount: amount.toString(),
        vendorName: invoice.vendorName,
        merchantName: invoice.vendorName,
        transactionDate: new Date().toISOString(),
        status: "Approved",
        invoiceId: invoice.id,
        paymentId: payment.id,
        paymentMethod: achPaymentSource === "wallet" ? "ACH (Wallet)" : "ACH (Bank)",
        description: `ACH payment for invoice ${invoice.invoiceNumber}`,
      });
      
      // Mark invoice as paid
      await apiRequest('PATCH', `/api/invoices/${invoice.id}`, {
        status: "Paid"
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      
      onPay?.("ach", { invoiceId: invoice.id, source: achPaymentSource });
      toast({
        title: "Invoice paid with ACH",
        description: achPaymentSource === "wallet" 
          ? `ACH payment processed for ${invoice.invoiceNumber} from wallet`
          : `ACH payment processed for ${invoice.invoiceNumber} from bank account`,
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
      const amount = parseFloat(invoice.amount.replace(/[$,]/g, ''));
      
      // If paying from wallet, deduct from wallet balance
      if (checkPaymentSource === "wallet") {
        const walletResponse = await fetch('/api/wallet');
        const wallet = await walletResponse.json();
        const currentBalance = parseFloat(wallet.balance.replace(/[$,]/g, ''));
        
        if (currentBalance < amount) {
          toast({
            title: "Insufficient wallet balance",
            description: `Wallet has $${currentBalance.toFixed(2)}, but invoice is $${amount.toFixed(2)}`,
            variant: "destructive",
          });
          return;
        }
        
        // Deduct from wallet
        await apiRequest('POST', '/api/wallet/add-funds', {
          amount: -amount
        });
      }
      
      // Record payment
      const now = new Date();
      const paymentResponse = await apiRequest('POST', '/api/payments', {
        invoiceId: invoice.id,
        amount: amount.toString(),
        paymentMethod: checkPaymentSource === "wallet" ? "check-wallet" : "check-bank",
        status: "Paid",
        dueDate: now,
        paidDate: now,
      });
      const payment = await paymentResponse.json();
      
      // Create transaction record
      await apiRequest('POST', '/api/transactions', {
        amount: amount.toString(),
        vendorName: invoice.vendorName,
        merchantName: invoice.vendorName,
        transactionDate: new Date().toISOString(),
        status: "Approved",
        invoiceId: invoice.id,
        paymentId: payment.id,
        paymentMethod: checkPaymentSource === "wallet" ? "Check (Wallet)" : "Check (Bank)",
        description: `Check payment for invoice ${invoice.invoiceNumber}`,
      });
      
      // Mark invoice as paid
      await apiRequest('PATCH', `/api/invoices/${invoice.id}`, {
        status: "Paid"
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      
      onPay?.("check", { invoiceId: invoice.id, source: checkPaymentSource });
      toast({
        title: "Invoice paid with Check",
        description: checkPaymentSource === "wallet" 
          ? `Check issued for ${invoice.invoiceNumber} from wallet`
          : `Check issued for ${invoice.invoiceNumber} from bank account`,
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
    });
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setCreatedCard(null);
    setCardPaymentMode("pay-via-stampli");
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleCloseDialog();
      } else {
        setOpen(newOpen);
      }
    }}>
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
        
        {/* Show card details if card was created via Share Card */}
        {createdCard ? (
          <div className="space-y-4">
            <Alert className="border-primary/20 bg-primary/5">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Virtual Card Created Successfully</p>
                  <p className="text-sm text-muted-foreground">
                    Share these card details with {invoice.vendorName} to complete payment
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-3 p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Card Number</Label>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(createdCard.cardNumber || "****", "Card number")}
                  data-testid="button-copy-card-number"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="font-mono text-sm" data-testid="text-card-number">
                {createdCard.cardNumber || "****"}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Expiry Date</Label>
                  <p className="font-mono text-sm" data-testid="text-expiry-date">
                    {createdCard.expiryDate || "**/**"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">CVV</Label>
                  <p className="font-mono text-sm" data-testid="text-cvv">
                    {createdCard.cvv || "***"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Cardholder Name</Label>
                <p className="text-sm" data-testid="text-cardholder-name-display">
                  {createdCard.cardholderName}
                </p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Card Limit</Label>
                <p className="text-sm font-medium" data-testid="text-card-limit-display">
                  {currency} ${createdCard.spendLimit}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1"
                data-testid="button-close-card-details"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  const cardDetails = `Card Number: ${createdCard.cardNumber}\nExpiry: ${createdCard.expiryDate}\nCVV: ${createdCard.cvv}\nCardholder: ${createdCard.cardholderName}\nLimit: ${currency} $${createdCard.spendLimit}`;
                  copyToClipboard(cardDetails, "All card details");
                }}
                className="flex-1"
                data-testid="button-copy-all-details"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All Details
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Show locked card alert if invoice is locked to a card */}
            {lockedCard && (
              <Alert className="border-amber-500/20 bg-amber-500/5">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Card Linked to Invoice</p>
                    <p className="text-sm text-muted-foreground">
                      Virtual Card •••• {lockedCard.last4 || "****"} is linked to this invoice.
                      {!invoice.firstPaymentMethod ? (
                        <span className="block mt-1">
                          No successful payment yet - you can unlink this card to choose a different method.
                        </span>
                      ) : (
                        <span className="block mt-1">
                          {invoice.firstPaymentMethod === "card" 
                            ? "All payments must use this card."
                            : "Payment method is locked."
                          }
                        </span>
                      )}
                    </p>
                    {!invoice.firstPaymentMethod && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unlinkPaymentMethodMutation.mutate()}
                        disabled={unlinkPaymentMethodMutation.isPending}
                        data-testid="button-unlink-payment-method"
                      >
                        {unlinkPaymentMethodMutation.isPending ? "Unlinking..." : "Unlink Payment Method"}
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Show payment method lock alert if firstPaymentMethod is set */}
            {invoice.firstPaymentMethod && !lockedCard && (
              <Alert className="border-amber-500/20 bg-amber-500/5">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Payment Method Locked</p>
                    <p className="text-sm text-muted-foreground">
                      First payment was made via {invoice.firstPaymentMethod.toUpperCase()}. All subsequent payments must use the same method.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="card" data-testid="tab-card" disabled={invoice.firstPaymentMethod === "ach" || invoice.firstPaymentMethod === "check"}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="ach" data-testid="tab-ach" disabled={invoice.firstPaymentMethod === "card" || invoice.firstPaymentMethod === "check"}>
                  <Building className="h-4 w-4 mr-2" />
                  ACH
                </TabsTrigger>
                <TabsTrigger value="check" data-testid="tab-check" disabled={invoice.firstPaymentMethod === "card" || invoice.firstPaymentMethod === "ach"}>
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

              {/* Card Payment Mode Selection - Only show if no card is linked */}
              {!lockedCard && (
                <div className="space-y-3 p-4 border rounded-lg bg-card">
                  <Label className="text-sm font-medium">How would you like to pay?</Label>
                  <RadioGroup 
                    value={cardPaymentMode} 
                    onValueChange={(value: any) => setCardPaymentMode(value)}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover-elevate cursor-pointer" onClick={() => setCardPaymentMode("pay-via-stampli")}>
                      <RadioGroupItem value="pay-via-stampli" id="pay-via-stampli" data-testid="radio-pay-via-stampli" />
                      <div className="flex-1">
                        <Label htmlFor="pay-via-stampli" className="cursor-pointer flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          <span className="font-medium">Pay via Stampli</span>
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Immediate charge - Card will be created and charged instantly
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover-elevate cursor-pointer" onClick={() => setCardPaymentMode("share-card")}>
                      <RadioGroupItem value="share-card" id="share-card" data-testid="radio-share-card" />
                      <div className="flex-1">
                        <Label htmlFor="share-card" className="cursor-pointer flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="font-medium">Share card with vendor</span>
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Create card and share details - No immediate charge
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}
              
              {/* Show retry payment info if card is linked */}
              {lockedCard && (
                <Alert className="border-primary/20 bg-primary/5">
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <p className="text-sm font-medium">Retry Payment with Linked Card</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The linked card •••• {lockedCard.last4} will be charged. Make sure your wallet has sufficient funds.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

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

              {mcpAutomation === "available" && cardPaymentMode === "pay-via-stampli" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span><strong>MCP/Visa Automation:</strong> Payment will be automatically processed</span>
                </div>
              )}
              {mcpAutomation === "manual" && cardPaymentMode === "share-card" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span><strong>Manual Sharing Required:</strong> You'll need to share card details</span>
                </div>
              )}
              
              {/* Only show card configuration fields when creating a new card (not in retry mode) */}
              {!lockedCard && (
                <>
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

                  {cardPaymentMode === "share-card" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="vendor-email">Vendor Email *</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Demo purposes only - no email will actually be sent</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="vendor-email"
                        type="email"
                        value={vendorEmail}
                        onChange={(e) => setVendorEmail(e.target.value)}
                        placeholder={`${invoice.vendorName.toLowerCase().replace(/\s+/g, '')}@example.com`}
                        data-testid="input-vendor-email"
                      />
                    </div>
                  )}

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
                </>
              )}

              {lockedCard ? (
                <Button 
                  onClick={handlePayViaStampli} 
                  className="w-full" 
                  disabled={isProcessingPayment}
                  data-testid="button-retry-payment"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {isProcessingPayment ? "Processing..." : "Retry Payment"}
                </Button>
              ) : cardPaymentMode === "pay-via-stampli" ? (
                <Button 
                  onClick={handlePayViaStampli} 
                  className="w-full" 
                  disabled={!cardholderName.trim() || isProcessingPayment}
                  data-testid="button-pay-via-stampli"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {isProcessingPayment ? "Processing..." : "Pay via Stampli"}
                </Button>
              ) : (
                <Button 
                  onClick={handleShareCard} 
                  className="w-full" 
                  disabled={!cardholderName.trim() || !vendorEmail.trim() || isProcessingPayment}
                  data-testid="button-share-card"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isProcessingPayment ? "Creating Card..." : "Create & Share Card"}
                </Button>
              )}
            </TabsContent>
            
            <TabsContent value="ach" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label>Payment Source</Label>
                <RadioGroup value={achPaymentSource} onValueChange={(value: "wallet" | "bank") => setAchPaymentSource(value)}>
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover-elevate cursor-pointer" onClick={() => setAchPaymentSource("wallet")}>
                    <RadioGroupItem value="wallet" id="ach-wallet" data-testid="radio-ach-wallet" />
                    <div className="flex-1">
                      <Label htmlFor="ach-wallet" className="cursor-pointer flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-medium">Company Wallet</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Deduct from wallet balance - Instant processing
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover-elevate cursor-pointer" onClick={() => setAchPaymentSource("bank")}>
                    <RadioGroupItem value="bank" id="ach-bank" data-testid="radio-ach-bank" />
                    <div className="flex-1">
                      <Label htmlFor="ach-bank" className="cursor-pointer flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        <span className="font-medium">Bank Account</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Direct transfer from bank - 2-3 business days
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              <Button onClick={handlePayWithACH} className="w-full" data-testid="button-pay-ach">
                Process ACH Payment
              </Button>
            </TabsContent>
            
            <TabsContent value="check" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label>Payment Source</Label>
                <RadioGroup value={checkPaymentSource} onValueChange={(value: "wallet" | "bank") => setCheckPaymentSource(value)}>
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover-elevate cursor-pointer" onClick={() => setCheckPaymentSource("wallet")}>
                    <RadioGroupItem value="wallet" id="check-wallet" data-testid="radio-check-wallet" />
                    <div className="flex-1">
                      <Label htmlFor="check-wallet" className="cursor-pointer flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-medium">Company Wallet</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Deduct from wallet balance - Check issued immediately
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover-elevate cursor-pointer" onClick={() => setCheckPaymentSource("bank")}>
                    <RadioGroupItem value="bank" id="check-bank" data-testid="radio-check-bank" />
                    <div className="flex-1">
                      <Label htmlFor="check-bank" className="cursor-pointer flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        <span className="font-medium">Bank Account</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Direct check from bank account - Standard processing
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              <Button onClick={handlePayWithCheck} className="w-full" data-testid="button-pay-check">
                Issue Check
              </Button>
            </TabsContent>
          </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
