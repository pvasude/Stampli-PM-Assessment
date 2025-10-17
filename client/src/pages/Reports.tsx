import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, DollarSign, CreditCard, TrendingUp, Download, FileText, Repeat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type Transaction = {
  id: string;
  cardId: string;
  merchantName: string;
  amount: string;
  transactionDate: string;
  status: string;
  glAccount?: string;
  costCenter?: string;
  description?: string;
};

type Card = {
  id: string;
  cardholderName: string;
  spendLimit: string;
  currentSpend: string;
  status: string;
  createdAt: string;
  cardType: string;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  amount: string;
  dueDate: string;
  status: string;
  createdAt: string;
};

type Payment = {
  id: string;
  invoiceId: string;
  amount: string;
  paymentMethod: string;
  transactionDate: string;
};

export default function Reports() {
  const { data: transactions = [], isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: cards = [], isLoading: loadingCards } = useQuery<Card[]>({
    queryKey: ['/api/cards'],
  });

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery<Payment[]>({
    queryKey: ['/api/payments'],
  });

  const isLoading = loadingTransactions || loadingCards || loadingInvoices || loadingPayments;

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Filter transactions for this month
    const thisMonthTransactions = transactions.filter(t => 
      new Date(t.transactionDate) >= monthStart
    );
    
    // Calculate total spend MTD
    const totalSpendMTD = thisMonthTransactions.reduce((sum, t) => 
      sum + parseFloat(t.amount.replace(/[$,]/g, '')), 0
    );
    
    // Calculate total cashback (1% of spend)
    const totalCashback = totalSpendMTD * 0.01;
    
    // Calculate card utilization
    const totalLimit = cards.reduce((sum, c) => 
      sum + parseFloat(c.spendLimit.replace(/[$,]/g, '')), 0
    );
    const totalSpend = cards.reduce((sum, c) => 
      sum + parseFloat(c.currentSpend.replace(/[$,]/g, '')), 0
    );
    const utilization = totalLimit > 0 ? Math.round((totalSpend / totalLimit) * 100) : 0;
    
    // Count cards issued this month
    const cardsIssuedMTD = cards.filter(c => 
      new Date(c.createdAt) >= monthStart
    ).length;

    return {
      mockStats: [
        {
          title: "Total Spend (MTD)",
          value: `$${totalSpendMTD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          subtitle: "Month to Date",
          icon: DollarSign,
        },
        {
          title: "Total Cashback Earned",
          value: `$${totalCashback.toFixed(2)}`,
          subtitle: "This month",
          icon: TrendingUp,
          trend: { value: "1% average rate", isPositive: true },
        },
        {
          title: "Card Utilization",
          value: `${utilization}%`,
          subtitle: `$${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })} of $${totalLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })} limit`,
          icon: CreditCard,
        },
        {
          title: "Cards Issued",
          value: cardsIssuedMTD.toString(),
          subtitle: "This month",
          icon: BarChart3,
        },
      ]
    };
  }, [transactions, cards]);

  const apMetrics = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Filter invoices and payments for this month
    const thisMonthPayments = payments.filter(p => 
      new Date(p.transactionDate) >= monthStart
    );
    
    // Count paid invoices this month
    const paidInvoicesMTD = thisMonthPayments.length;
    
    // Calculate total AP spend
    const totalAPSpend = thisMonthPayments.reduce((sum, p) => 
      sum + parseFloat(p.amount.replace(/[$,]/g, '')), 0
    );
    
    // Calculate card payment percentage
    const cardPayments = thisMonthPayments.filter(p => p.paymentMethod === 'card');
    const cardPaymentTotal = cardPayments.reduce((sum, p) => 
      sum + parseFloat(p.amount.replace(/[$,]/g, '')), 0
    );
    const cardPaymentPct = totalAPSpend > 0 ? Math.round((cardPaymentTotal / totalAPSpend) * 100) : 0;

    return {
      apStats: [
        {
          title: "Invoices Paid",
          value: paidInvoicesMTD.toString(),
          subtitle: "This month",
          icon: FileText,
        },
        {
          title: "AP Spend Total",
          value: `$${totalAPSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          subtitle: "All payment methods",
          icon: DollarSign,
        },
        {
          title: "Card Payment %",
          value: `${cardPaymentPct}%`,
          subtitle: `$${cardPaymentTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} paid via cards`,
          icon: CreditCard,
        },
        {
          title: "Avg. Payment Time",
          value: "N/A",
          subtitle: "From invoice to payment",
          icon: Repeat,
        },
      ]
    };
  }, [payments]);

  const categoryBreakdown = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    transactions.forEach(t => {
      const category = t.glAccount || "Other";
      const amount = parseFloat(t.amount.replace(/[$,]/g, ''));
      categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
    });
    
    const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
    
    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount: `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  }, [transactions]);

  const vendorBreakdown = useMemo(() => {
    const vendorMap = new Map<string, { amount: number; count: number }>();
    
    transactions.forEach(t => {
      const vendor = t.merchantName;
      const amount = parseFloat(t.amount.replace(/[$,]/g, ''));
      const existing = vendorMap.get(vendor) || { amount: 0, count: 0 };
      vendorMap.set(vendor, {
        amount: existing.amount + amount,
        count: existing.count + 1
      });
    });
    
    return Array.from(vendorMap.entries())
      .map(([vendor, data]) => ({
        vendor,
        amount: `$${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        transactions: data.count
      }))
      .sort((a, b) => {
        const aAmount = parseFloat(a.amount.replace(/[$,]/g, ''));
        const bAmount = parseFloat(b.amount.replace(/[$,]/g, ''));
        return bAmount - aAmount;
      })
      .slice(0, 5);
  }, [transactions]);

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months = [];
    
    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const nextMonthStart = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.transactionDate);
        return tDate >= monthStart && tDate < nextMonthStart;
      });
      
      const amount = monthTransactions.reduce((sum, t) => 
        sum + parseFloat(t.amount.replace(/[$,]/g, '')), 0
      );
      
      months.push({
        month: date.toLocaleString('en-US', { month: 'short' }),
        amount: Math.round(amount)
      });
    }
    
    return months;
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track spending patterns, AP metrics, and card utilization
          </p>
        </div>
        <Button variant="outline" data-testid="button-export-report">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Card Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.mockStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">AP Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {apMetrics.apStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transaction data available</p>
            ) : (
              <>
                {categoryBreakdown.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm font-mono font-medium">{item.amount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            {vendorBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transaction data available</p>
            ) : (
              <div className="space-y-4">
                {vendorBreakdown.map((vendor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{vendor.vendor}</p>
                      <p className="text-xs text-muted-foreground">
                        {vendor.transactions} transactions
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {vendor.amount}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-around gap-4 px-4">
            {monthlyTrend.map((data, index) => {
              const maxAmount = Math.max(...monthlyTrend.map(m => m.amount), 1000);
              const heightPercentage = (data.amount / maxAmount) * 100;
              const barHeight = `${heightPercentage}%`;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2" data-testid={`chart-bar-${data.month.toLowerCase()}`}>
                  <div className="text-sm font-mono font-medium" data-testid={`text-amount-${data.month.toLowerCase()}`}>
                    ${(data.amount / 1000).toFixed(1)}k
                  </div>
                  <div
                    className="w-full bg-primary rounded-t-md transition-all hover-elevate min-h-[20px]"
                    style={{ height: barHeight }}
                    data-testid={`bar-${data.month.toLowerCase()}`}
                  />
                  <div className="text-xs text-muted-foreground" data-testid={`label-${data.month.toLowerCase()}`}>{data.month}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
