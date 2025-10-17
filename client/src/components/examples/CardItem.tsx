import { CardItem } from '../CardItem';

export default function CardItemExample() {
  return (
    <div className="p-6 bg-background max-w-md">
      <CardItem
        id="1"
        cardType="Invoice Card"
        cardholderName="Sarah Johnson"
        spendLimit="$5,000"
        currentSpend="$3,250"
        status="Active"
        purpose="Office Supplies - Q1 2024"
        cardNumber="4532123456789012"
        onViewDetails={() => console.log('View details clicked')}
        onManageCard={() => console.log('Manage card clicked')}
      />
    </div>
  );
}
