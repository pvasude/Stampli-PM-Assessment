import { useState, useMemo } from "react";
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
import { CreditCard, FileText, Zap, Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type Card = {
  id: string;
  cardholderName: string;
  last4?: string;
  status: string;
};

type GLAccount = {
  id: string;
  code: string;
  name: string;
  category: string;
};

type CostCenter = {
  id: string;
  code: string;
  name: string;
  department: string;
};

type PaymentInstallment = {
  id: string;
  amount: string;
  dueDate: string;
};

export default function Simulate() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("transactions");

  // Fetch active cards for transaction simulation
  const { data: cardsData } = useQuery<Card[]>({
    queryKey: ['/api/cards'],
  });

  // Fetch GL Accounts
  const { data: glAccounts } = useQuery<GLAccount[]>({
    queryKey: ['/api/gl-accounts'],
  });

  // Fetch Cost Centers
  const { data: costCenters } = useQuery<CostCenter[]>({
    queryKey: ['/api/cost-centers'],
  });

  const activeCards = cardsData?.filter(c => c.status === "Active") ?? [];

  // Transaction simulation state
  const [selectedCard, setSelectedCard] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");

  // Invoice simulation state
  const [vendorName, setVendorName] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [description, setDescription] = useState("");
  
  // Payment installments state
  const [payments, setPayments] = useState<PaymentInstallment[]>([
    { id: crypto.randomUUID(), amount: "", dueDate: "" }
  ]);

  // Coding template state
  const [glAccount, setGlAccount] = useState("");
  const [department, setDepartment] = useState("");
  const [costCenter, setCostCenter] = useState("");

  // Approval status state
  const [approvalStatus, setApprovalStatus] = useState("Pending");
  const [approverName, setApproverName] = useState("");

  // Calculate payment totals
  const paymentTotal = useMemo(() => {
    return payments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount) || 0;
      return sum + amount;
    }, 0);
  }, [payments]);

  const isPaymentTotalValid = useMemo(() => {
    if (!invoiceAmount) return true;
    const invoiceAmt = parseFloat(invoiceAmount) || 0;
    return Math.abs(paymentTotal - invoiceAmt) < 0.01;
  }, [paymentTotal, invoiceAmount]);

  // Add payment installment
  const addPayment = () => {
    setPayments([...payments, { id: crypto.randomUUID(), amount: "", dueDate: "" }]);
  };

  // Remove payment installment
  const removePayment = (id: string) => {
    if (payments.length > 1) {
      setPayments(payments.filter(p => p.id !== id));
    }
  };

  // Update payment installment
  const updatePayment = (id: string, field: 'amount' | 'dueDate', value: string) => {
    setPayments(payments.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

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
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      toast({
        title: "Invoice created",
        description: "Invoice has been created with payment installments",
      });
      // Reset form
      setVendorName("");
      setInvoiceAmount("");
      setDescription("");
      setPayments([{ id: crypto.randomUUID(), amount: "", dueDate: "" }]);
      setGlAccount("");
      setDepartment("");
      setCostCenter("");
      setApprovalStatus("Pending");
      setApproverName("");
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
    // Validation
    if (!vendorName || !invoiceAmount) {
      toast({
        title: "Missing information",
        description: "Please fill in vendor name and invoice amount",
        variant: "destructive",
      });
      return;
    }

    // Validate payment installments
    const hasEmptyPayments = payments.some(p => !p.amount || !p.dueDate);
    if (hasEmptyPayments) {
      toast({
        title: "Incomplete payments",
        description: "Please fill in all payment amounts and due dates",
        variant: "destructive",
      });
      return;
    }

    // Validate payment total equals invoice amount
    if (!isPaymentTotalValid) {
      toast({
        title: "Payment total mismatch",
        description: `Payment total ($${paymentTotal.toFixed(2)}) must equal invoice amount ($${parseFloat(invoiceAmount).toFixed(2)})`,
        variant: "destructive",
      });
      return;
    }

    // Validate approval status
    if (approvalStatus === "Approved" && !approverName) {
      toast({
        title: "Missing approver name",
        description: "Please enter the approver name for approved invoices",
        variant: "destructive",
      });
      return;
    }

    simulateInvoiceMutation.mutate({
      vendorName,
      amount: parseFloat(invoiceAmount),
      description: description || `Simulated invoice for ${vendorName}`,
      status: approvalStatus,
      approverName: approvalStatus === "Approved" ? approverName : undefined,
      payments: payments.map(p => ({
        amount: parseFloat(p.amount),
        dueDate: p.dueDate,
        glAccount: glAccount || undefined,
        department: department || undefined,
        costCenter: costCenter || undefined,
      })),
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
                Create a test invoice with payment installments, coding details, and approval status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Invoice Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Invoice Details</h3>
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

                <div className="space-y-2">
                  <Label htmlFor="invoice-amount">Total Invoice Amount *</Label>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter invoice description..."
                    data-testid="input-description"
                  />
                </div>
              </div>

              <Separator />

              {/* Payment Schedule */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Payment Schedule</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Define payment installments for this invoice
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addPayment}
                    data-testid="button-add-payment"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Payment
                  </Button>
                </div>

                <div className="space-y-3">
                  {payments.map((payment, index) => (
                    <div key={payment.id} className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`payment-amount-${payment.id}`}>
                            Amount {index + 1} *
                          </Label>
                          <Input
                            id={`payment-amount-${payment.id}`}
                            type="number"
                            step="0.01"
                            value={payment.amount}
                            onChange={(e) => updatePayment(payment.id, 'amount', e.target.value)}
                            placeholder="0.00"
                            data-testid={`input-payment-amount-${index}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`payment-date-${payment.id}`}>
                            Due Date {index + 1} *
                          </Label>
                          <Input
                            id={`payment-date-${payment.id}`}
                            type="date"
                            value={payment.dueDate}
                            onChange={(e) => updatePayment(payment.id, 'dueDate', e.target.value)}
                            data-testid={`input-payment-date-${index}`}
                          />
                        </div>
                      </div>
                      {payments.length > 1 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removePayment(payment.id)}
                          className="mt-8"
                          data-testid={`button-remove-payment-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Payment Total */}
                <div className={`p-3 rounded-md ${isPaymentTotalValid ? 'bg-muted' : 'bg-destructive/10 border border-destructive'}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Payment Total:</span>
                    <span className={`font-medium ${!isPaymentTotalValid ? 'text-destructive' : ''}`} data-testid="text-payment-total">
                      ${paymentTotal.toFixed(2)}
                    </span>
                  </div>
                  {!isPaymentTotalValid && invoiceAmount && (
                    <p className="text-xs text-destructive mt-1">
                      Must equal invoice amount (${parseFloat(invoiceAmount).toFixed(2)})
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Coding Template */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Coding Template</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied to all payment installments
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gl-account">GL Account</Label>
                    <Select value={glAccount} onValueChange={setGlAccount}>
                      <SelectTrigger id="gl-account" data-testid="select-gl-account">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {glAccounts?.map((account) => (
                          <SelectItem key={account.id} value={account.code}>
                            {account.code} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g., Operations"
                      data-testid="input-department"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost-center">Cost Center</Label>
                    <Select value={costCenter} onValueChange={setCostCenter}>
                      <SelectTrigger id="cost-center" data-testid="select-cost-center">
                        <SelectValue placeholder="Select center" />
                      </SelectTrigger>
                      <SelectContent>
                        {costCenters?.map((center) => (
                          <SelectItem key={center.id} value={center.code}>
                            {center.code} - {center.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Approval Status */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Approval Status</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set the initial approval status for this invoice
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="approval-status">Status *</Label>
                    <Select value={approvalStatus} onValueChange={setApprovalStatus}>
                      <SelectTrigger id="approval-status" data-testid="select-approval-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {approvalStatus === "Approved" && (
                    <div className="space-y-2">
                      <Label htmlFor="approver-name">Approver Name *</Label>
                      <Input
                        id="approver-name"
                        value={approverName}
                        onChange={(e) => setApproverName(e.target.value)}
                        placeholder="e.g., John Smith"
                        data-testid="input-approver-name"
                      />
                    </div>
                  )}
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
