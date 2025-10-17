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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface CardRequestDialogProps {
  trigger?: React.ReactNode;
}

export function CardRequestDialog({ trigger }: CardRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [cardType, setCardType] = useState<"one-time" | "recurring">("one-time");
  const { toast} = useToast();
  
  // Basic fields
  const [cardholderName, setCardholderName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [currency, setCurrency] = useState("USD");
  
  // Limits
  const [spendLimit, setSpendLimit] = useState("");
  const [transactionCount, setTransactionCount] = useState<"1" | "unlimited">("1");
  const [renewalFrequency, setRenewalFrequency] = useState<"month" | "quarter" | "year">("month");
  
  // Duration
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  
  // Restrictions
  const [allowedMerchants, setAllowedMerchants] = useState<string[]>([]);
  const [allowedMccCodes, setAllowedMccCodes] = useState<string[]>([]);
  const [allowedCountries, setAllowedCountries] = useState("");
  const [channelRestriction, setChannelRestriction] = useState("both");
  
  // Coding Template
  const [glAccount, setGlAccount] = useState("");
  const [department, setDepartment] = useState("");
  const [costCenter, setCostCenter] = useState("");

  const isFormValid = () => {
    if (!cardholderName.trim() || !purpose.trim() || !spendLimit.trim()) {
      return false;
    }
    if (!validUntil.trim()) {
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      return;
    }
    
    const requestData = {
      cardholderName,
      purpose,
      currency,
      spendLimit,
      cardType,
      transactionCount: cardType === "one-time" ? transactionCount : null,
      renewalFrequency: cardType === "recurring" ? renewalFrequency : null,
      validFrom,
      validUntil,
      allowedMerchants,
      allowedMccCodes,
      allowedCountries: allowedCountries.split(',').map((c: string) => c.trim()).filter(Boolean),
      channelRestriction,
      glAccountTemplate: glAccount,
      departmentTemplate: department,
      costCenterTemplate: costCenter,
      status: "Pending Approval",
    };
    
    console.log("Card request submitted (will go to approval):", requestData);
    toast({
      title: "Card request submitted",
      description: `Request for ${cardholderName} sent for approval`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button data-testid="button-request-card">
            <CreditCard className="h-4 w-4 mr-2" />
            Request Card
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" data-testid="dialog-card-request">
        <DialogHeader>
          <DialogTitle>Request Expense Card</DialogTitle>
          <DialogDescription>
            First, select the card type and frequency. This determines how the spend limit works.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-4 border rounded-lg bg-accent/20">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Card Type & Frequency *</Label>
            <RadioGroup value={cardType} onValueChange={(value: "one-time" | "recurring") => setCardType(value)}>
              <div className="flex items-start space-x-3 p-3 border rounded-md hover-elevate active-elevate-2 bg-background" data-testid="radio-card-type-one-time">
                <RadioGroupItem value="one-time" id="type-one-time" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="type-one-time" className="font-medium cursor-pointer">
                    One-Time Card
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fixed limit that can be used once or multiple times until exhausted
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 border rounded-md hover-elevate active-elevate-2 bg-background" data-testid="radio-card-type-recurring">
                <RadioGroupItem value="recurring" id="type-recurring" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="type-recurring" className="font-medium cursor-pointer">
                    Recurring Card
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Spend limit resets automatically at your chosen frequency
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {cardType === "one-time" && (
            <div className="space-y-2 pl-4 border-l-2 border-primary">
              <Label htmlFor="transaction-count" className="font-medium">Transaction Limit *</Label>
              <RadioGroup value={transactionCount} onValueChange={(value: "1" | "unlimited") => setTransactionCount(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="one-transaction" data-testid="radio-one-transaction" />
                  <Label htmlFor="one-transaction" className="font-normal cursor-pointer">
                    Single transaction only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unlimited" id="unlimited-transactions" data-testid="radio-unlimited-transactions" />
                  <Label htmlFor="unlimited-transactions" className="font-normal cursor-pointer">
                    Unlimited transactions
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                {transactionCount === "1" ? "Card deactivates after first use" : "Card active until spend limit reached"}
              </p>
            </div>
          )}

          {cardType === "recurring" && (
            <div className="space-y-2 pl-4 border-l-2 border-primary">
              <Label htmlFor="renewal-frequency" className="font-medium">Reset Frequency *</Label>
              <Select value={renewalFrequency} onValueChange={(value: "month" | "quarter" | "year") => setRenewalFrequency(value)}>
                <SelectTrigger id="renewal-frequency" data-testid="select-renewal-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly - Limit resets every month</SelectItem>
                  <SelectItem value="quarter">Quarterly - Limit resets every 3 months</SelectItem>
                  <SelectItem value="year">Yearly - Limit resets every year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
            <TabsTrigger value="limits" data-testid="tab-limits">Duration</TabsTrigger>
            <TabsTrigger value="restrictions" data-testid="tab-restrictions">Restrictions</TabsTrigger>
            <TabsTrigger value="coding" data-testid="tab-coding">Coding</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-4">
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

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe the purpose of this card"
                data-testid="textarea-purpose"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="spend-limit">Total Spend Limit *</Label>
                <Input
                  id="spend-limit"
                  type="number"
                  value={spendLimit}
                  onChange={(e) => setSpendLimit(e.target.value)}
                  placeholder="Enter amount"
                  data-testid="input-spend-limit"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="limits" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid-from">Valid From</Label>
                <Input
                  id="valid-from"
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  data-testid="input-valid-from"
                />
              </div>
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
            </div>
          </TabsContent>
          
          <TabsContent value="restrictions" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="merchants">Allowed Merchants</Label>
              <Input
                id="merchants"
                value={allowedMerchants.join(', ')}
                onChange={(e) => setAllowedMerchants(e.target.value.split(',').map((m: string) => m.trim()).filter(Boolean))}
                placeholder="e.g., Amazon, Office Depot (comma-separated)"
                data-testid="input-allowed-merchants"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of merchant names
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mcc-codes">Allowed MCC Codes</Label>
              <Input
                id="mcc-codes"
                value={allowedMccCodes.join(', ')}
                onChange={(e) => setAllowedMccCodes(e.target.value.split(',').map((m: string) => m.trim()).filter(Boolean))}
                placeholder="e.g., 5734, 5411 (comma-separated)"
                data-testid="input-mcc-codes"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated MCC codes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countries">Allowed Countries</Label>
              <Input
                id="countries"
                value={allowedCountries}
                onChange={(e) => setAllowedCountries(e.target.value)}
                placeholder="e.g., US, CA, UK (comma-separated)"
                data-testid="input-allowed-countries"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Channel Restriction</Label>
              <Select value={channelRestriction} onValueChange={setChannelRestriction}>
                <SelectTrigger id="channel" data-testid="select-channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online Only</SelectItem>
                  <SelectItem value="in-store">In-Store Only</SelectItem>
                  <SelectItem value="both">Online & In-Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="coding" className="space-y-4 mt-4">
            <div className="bg-muted/50 p-3 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">
                Pre-define accounting codes for automatic transaction coding
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gl-account">GL Account Template</Label>
              <Select value={glAccount} onValueChange={setGlAccount}>
                <SelectTrigger id="gl-account" data-testid="select-gl-template">
                  <SelectValue placeholder="Select GL account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5000">5000 - Office Expenses</SelectItem>
                  <SelectItem value="6100">6100 - Travel</SelectItem>
                  <SelectItem value="6200">6200 - Software</SelectItem>
                  <SelectItem value="7000">7000 - Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department Template</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department" data-testid="select-department-template">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-center">Cost Center Template</Label>
              <Select value={costCenter} onValueChange={setCostCenter}>
                <SelectTrigger id="cost-center" data-testid="select-cost-center-template">
                  <SelectValue placeholder="Select cost center" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC-001">CC-001 - Sales</SelectItem>
                  <SelectItem value="CC-002">CC-002 - Engineering</SelectItem>
                  <SelectItem value="CC-003">CC-003 - Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid()} data-testid="button-submit-request">
            Submit for Approval
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
