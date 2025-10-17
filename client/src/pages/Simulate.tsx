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

  // Invoice simulation state
  const [vendorName, setVendorName] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

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
        title: "Invoice created",
        description: "Invoice has been created in the system",
      });
      // Reset form
      setVendorName("");
      setInvoiceAmount("");
      setDueDate("");
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
    
    simulateTransactionMutation.mutate({
      cardId: selectedCard,
      merchant: merchantName,
      amount: parseFloat(transactionAmount),
    });
  };

  const handleSimulateInvoice = () => {
    if (!vendorName || !invoiceAmount || !dueDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    simulateInvoiceMutation.mutate({
      vendorName,
      amount: parseFloat(invoiceAmount),
      dueDate,
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
              <CardTitle>Simulate Invoice</CardTitle>
              <CardDescription>
                Create a test invoice that will appear in the invoices page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <Button
                onClick={handleSimulateInvoice}
                disabled={simulateInvoiceMutation.isPending}
                className="w-full"
                data-testid="button-simulate-invoice"
              >
                {simulateInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
