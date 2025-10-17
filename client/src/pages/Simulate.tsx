import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, FileText, Zap } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Card = {
  id: string;
  cardholderName: string;
  last4?: string;
  status: string;
};

export default function Simulate() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("transactions");

  // Fetch active cards for transaction simulation
  const { data: cardsData } = useQuery<Card[]>({
    queryKey: ['/api/cards'],
  });

  const activeCards = cardsData?.filter(c => c.status === "Active") ?? [];

  // Transaction simulation state
  const [selectedCard, setSelectedCard] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<"success" | "declined">("success");
  const [declineReason, setDeclineReason] = useState("");

  // Invoice simulation state
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "ach" | "check">("card");
  const [paymentCardId, setPaymentCardId] = useState("");

  // Simulate transaction mutation
  const simulateTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/simulate/transaction', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      toast({
        title: "Transaction simulated",
        description: "Transaction has been added to the system",
      });
      // Reset form
      setMerchantName("");
      setTransactionAmount("");
      setTransactionStatus("success");
      setDeclineReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to simulate transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Simulate invoice mutation
  const simulateInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/simulate/invoice', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      toast({
        title: "Invoice simulated",
        description: "Invoice has been created and marked as paid",
      });
      // Reset form
      setInvoiceNumber("");
      setVendorName("");
      setInvoiceAmount("");
      setDueDate("");
      setPaymentCardId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to simulate invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSimulateTransaction = () => {
    if (!selectedCard || !merchantName || !transactionAmount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (transactionStatus === "declined" && !declineReason) {
      toast({
        title: "Missing decline reason",
        description: "Please provide a reason for the declined transaction",
        variant: "destructive",
      });
      return;
    }

    const selectedCardData = activeCards.find(c => c.id === selectedCard);
    
    simulateTransactionMutation.mutate({
      cardId: selectedCard,
      cardholder: selectedCardData?.cardholderName,
      merchantName,
      amount: parseFloat(transactionAmount),
      status: transactionStatus,
      declineReason: transactionStatus === "declined" ? declineReason : null,
      transactionDate: new Date().toISOString(),
    });
  };

  const handleSimulateInvoice = () => {
    if (!invoiceNumber || !vendorName || !invoiceAmount || !dueDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "card" && !paymentCardId) {
      toast({
        title: "Missing card",
        description: "Please select a card for payment",
        variant: "destructive",
      });
      return;
    }

    simulateInvoiceMutation.mutate({
      invoiceNumber,
      vendorName,
      amount: parseFloat(invoiceAmount),
      dueDate,
      paymentTerms,
      paymentMethod,
      cardId: paymentMethod === "card" ? paymentCardId : null,
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">Simulate Data</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create test transactions and invoices to see real-time updates across the system
          </p>
        </div>
        <Zap className="h-6 w-6 text-primary" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="transactions" data-testid="tab-simulate-transactions">
            <CreditCard className="h-4 w-4 mr-2" />
            Card Transactions
          </TabsTrigger>
          <TabsTrigger value="invoices" data-testid="tab-simulate-invoices">
            <FileText className="h-4 w-4 mr-2" />
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Simulate Card Transaction</CardTitle>
              <CardDescription>
                Create a test transaction that will appear in card details, transactions page, and update the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-select">Card *</Label>
                <Select value={selectedCard} onValueChange={setSelectedCard}>
                  <SelectTrigger id="card-select" data-testid="select-card">
                    <SelectValue placeholder="Select a card" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCards.length === 0 ? (
                      <SelectItem value="none" disabled>No active cards available</SelectItem>
                    ) : (
                      activeCards.map(card => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.cardholderName} {card.last4 ? `(****${card.last4})` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="merchant">Merchant Name *</Label>
                <Input
                  id="merchant"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="e.g., Amazon, Starbucks, Office Depot"
                  data-testid="input-merchant-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Transaction Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  placeholder="0.00"
                  data-testid="input-transaction-amount"
                />
              </div>

              <div className="space-y-2">
                <Label>Transaction Status *</Label>
                <RadioGroup value={transactionStatus} onValueChange={(value: any) => setTransactionStatus(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="success" id="success" data-testid="radio-success" />
                    <Label htmlFor="success" className="font-normal">Successful</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="declined" id="declined" data-testid="radio-declined" />
                    <Label htmlFor="declined" className="font-normal">Declined</Label>
                  </div>
                </RadioGroup>
              </div>

              {transactionStatus === "declined" && (
                <div className="space-y-2">
                  <Label htmlFor="decline-reason">Decline Reason *</Label>
                  <Select value={declineReason} onValueChange={setDeclineReason}>
                    <SelectTrigger id="decline-reason" data-testid="select-decline-reason">
                      <SelectValue placeholder="Select decline reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="insufficient_funds">Insufficient Funds</SelectItem>
                      <SelectItem value="card_limit_exceeded">Card Limit Exceeded</SelectItem>
                      <SelectItem value="merchant_blocked">Merchant Blocked</SelectItem>
                      <SelectItem value="expired_card">Card Expired</SelectItem>
                      <SelectItem value="fraud_prevention">Fraud Prevention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                onClick={handleSimulateTransaction}
                disabled={simulateTransactionMutation.isPending}
                className="w-full"
                data-testid="button-simulate-transaction"
              >
                {simulateTransactionMutation.isPending ? "Creating..." : "Simulate Transaction"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Simulate Invoice & Payment</CardTitle>
              <CardDescription>
                Create a test invoice and mark it as paid. It will appear in transactions and update the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-number">Invoice Number *</Label>
                  <Input
                    id="invoice-number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-2024-999"
                    data-testid="input-invoice-number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor Name *</Label>
                  <Input
                    id="vendor"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="Acme Corp"
                    data-testid="input-vendor-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-amount">Invoice Amount *</Label>
                  <Input
                    id="invoice-amount"
                    type="number"
                    step="0.01"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    placeholder="0.00"
                    data-testid="input-invoice-amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date *</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    data-testid="input-due-date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-terms">Payment Terms</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger id="payment-terms" data-testid="select-payment-terms">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Net 90">Net 90</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="payment-card" data-testid="radio-payment-card" />
                    <Label htmlFor="payment-card" className="font-normal">Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ach" id="payment-ach" data-testid="radio-payment-ach" />
                    <Label htmlFor="payment-ach" className="font-normal">ACH</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="check" id="payment-check" data-testid="radio-payment-check" />
                    <Label htmlFor="payment-check" className="font-normal">Check</Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-2">
                  <Label htmlFor="payment-card-select">Select Card for Payment *</Label>
                  <Select value={paymentCardId} onValueChange={setPaymentCardId}>
                    <SelectTrigger id="payment-card-select" data-testid="select-payment-card">
                      <SelectValue placeholder="Select a card" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCards.length === 0 ? (
                        <SelectItem value="none" disabled>No active cards available</SelectItem>
                      ) : (
                        activeCards.map(card => (
                          <SelectItem key={card.id} value={card.id}>
                            {card.cardholderName} {card.last4 ? `(****${card.last4})` : ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                onClick={handleSimulateInvoice}
                disabled={simulateInvoiceMutation.isPending}
                className="w-full"
                data-testid="button-simulate-invoice"
              >
                {simulateInvoiceMutation.isPending ? "Creating..." : "Simulate Invoice & Payment"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
