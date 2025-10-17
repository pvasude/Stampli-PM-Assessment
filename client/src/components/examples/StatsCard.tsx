import { StatsCard } from '../StatsCard';
import { CreditCard } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="p-6 bg-background">
      <StatsCard
        title="Total Card Spend"
        value="$24,350"
        subtitle="Across 12 active cards"
        icon={CreditCard}
        trend={{ value: "12% from last month", isPositive: true }}
      />
    </div>
  );
}
