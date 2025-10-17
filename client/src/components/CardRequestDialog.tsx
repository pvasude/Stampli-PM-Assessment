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

interface CardRequestDialogProps {
  trigger?: React.ReactNode;
}

export function CardRequestDialog({ trigger }: CardRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [isOneTimeUse, setIsOneTimeUse] = useState(false);
  
  // Basic fields
  const [cardholderName, setCardholderName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [currency, setCurrency] = useState("USD");
  
  // Limits
  const [spendLimit, setSpendLimit] = useState("");
  const [transactionLimit, setTransactionLimit] = useState("");
  const [dailyLimit, setDailyLimit] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  
  // Duration
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  
  // Restrictions
  const [allowedMerchants, setAllowedMerchants] = useState("");
  const [allowedMccCodes, setAllowedMccCodes] = useState("");
  const [allowedCountries, setAllowedCountries] = useState("");
  const [channelRestriction, setChannelRestriction] = useState("both");
  
  // Coding Template
  const [glAccount, setGlAccount] = useState("");
  const [department, setDepartment] = useState("");
  const [costCenter, setCostCenter] = useState("");

  const isFormValid = () => {
    // Basic section - required fields
    if (!cardholderName.trim() || !purpose.trim() || !spendLimit.trim()) {
      return false;
    }
    
    // Limits section - required fields
    if (isOneTimeUse && !transactionLimit.trim()) {
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
      transactionLimit: isOneTimeUse ? transactionLimit : null,
      dailyLimit: !isOneTimeUse ? dailyLimit : null,
      monthlyLimit: !isOneTimeUse ? monthlyLimit : null,
      validFrom,
      validUntil,
      allowedMerchants: allowedMerchants.split(',').map(m => m.trim()).filter(Boolean),
      allowedMccCodes: allowedMccCodes.split(',').map(m => m.trim()).filter(Boolean),
      allowedCountries: allowedCountries.split(',').map(c => c.trim()).filter(Boolean),
      channelRestriction,
      glAccountTemplate: glAccount,
      departmentTemplate: department,
      costCenterTemplate: costCenter,
      isOneTimeUse,
      cardType: "Expense Card",
      status: "Pending Approval",
    };
    
    console.log("Card request submitted (will go to approval):", requestData);
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
            Configure card controls and restrictions. Request will be sent for approval.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
            <TabsTrigger value="limits" data-testid="tab-limits">Limits</TabsTrigger>
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

            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="space-y-0.5">
                <Label htmlFor="one-time">One-Time Card</Label>
                <p className="text-xs text-muted-foreground">
                  Card deactivates after reaching transaction limit
                </p>
              </div>
              <Switch
                id="one-time"
                checked={isOneTimeUse}
                onCheckedChange={setIsOneTimeUse}
                data-testid="switch-one-time"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="limits" className="space-y-4 mt-4">
            {isOneTimeUse ? (
              <div className="space-y-2">
                <Label htmlFor="transaction-limit">Transaction Limit *</Label>
                <Input
                  id="transaction-limit"
                  type="number"
                  value={transactionLimit}
                  onChange={(e) => setTransactionLimit(e.target.value)}
                  placeholder="Maximum amount for single transaction"
                  data-testid="input-transaction-limit"
                />
                <p className="text-xs text-muted-foreground">
                  Card will deactivate after this amount is reached
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="daily-limit">Daily Limit</Label>
                  <Input
                    id="daily-limit"
                    type="number"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    placeholder="Maximum spend per day"
                    data-testid="input-daily-limit"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly-limit">Monthly Limit</Label>
                  <Input
                    id="monthly-limit"
                    type="number"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(e.target.value)}
                    placeholder="Maximum spend per month"
                    data-testid="input-monthly-limit"
                  />
                </div>
              </>
            )}

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
                value={allowedMerchants}
                onChange={(e) => setAllowedMerchants(e.target.value)}
                placeholder="e.g., Amazon, Office Depot (comma-separated)"
                data-testid="input-allowed-merchants"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mcc-codes">Allowed MCC Codes</Label>
              <Input
                id="mcc-codes"
                value={allowedMccCodes}
                onChange={(e) => setAllowedMccCodes(e.target.value)}
                placeholder="e.g., 5734, 5411 (comma-separated)"
                data-testid="input-mcc-codes"
              />
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
