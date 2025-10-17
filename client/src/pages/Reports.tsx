import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, DollarSign, CreditCard, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// TODO: remove mock functionality
const mockStats = [
  {
    title: "Total Spend (MTD)",
    value: "$24,350",
    subtitle: "Month to Date",
    icon: DollarSign,
    trend: { value: "12% vs last month", isPositive: true },
  },
  {
    title: "Total Cashback Earned",
    value: "$54.75",
    subtitle: "This month",
    icon: TrendingUp,
    trend: { value: "1% average rate", isPositive: true },
  },
  {
    title: "Card Utilization",
    value: "68%",
    subtitle: "$24,350 of $35,800 limit",
    icon: CreditCard,
  },
  {
    title: "Cards Issued",
    value: "12",
    subtitle: "This month",
    icon: BarChart3,
  },
];

const spendByCategory = [
  { category: "Software & SaaS", amount: "$8,450", percentage: 35 },
  { category: "Office Supplies", amount: "$6,200", percentage: 25 },
  { category: "Travel & Entertainment", amount: "$5,100", percentage: 21 },
  { category: "Marketing", amount: "$3,200", percentage: 13 },
  { category: "Other", amount: "$1,400", percentage: 6 },
];

const topVendors = [
  { vendor: "Amazon Web Services", amount: "$3,850", transactions: 8 },
  { vendor: "LinkedIn Ads", amount: "$2,500", transactions: 3 },
  { vendor: "Acme Office Supplies", amount: "$2,245", transactions: 5 },
  { vendor: "Delta Airlines", amount: "$1,680", transactions: 4 },
  { vendor: "Zoom Video", amount: "$1,199", transactions: 2 },
];

export default function Reports() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track spending patterns and card utilization
          </p>
        </div>
        <Button variant="outline" data-testid="button-export-report">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {spendByCategory.map((item, index) => (
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVendors.map((vendor, index) => (
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-around gap-4 px-4">
            {[
              { month: "Jan", amount: 18500 },
              { month: "Feb", amount: 21200 },
              { month: "Mar", amount: 24350 },
            ].map((data, index) => {
              const maxAmount = 25000;
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
