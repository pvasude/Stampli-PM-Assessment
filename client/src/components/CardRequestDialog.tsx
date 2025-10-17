import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { CreditCard, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

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

const MCC_OPTIONS = [
  { code: "5411", name: "Grocery Stores, Supermarkets" },
  { code: "5734", name: "Computer Software Stores" },
  { code: "5814", name: "Fast Food Restaurants" },
  { code: "5812", name: "Eating Places, Restaurants" },
  { code: "5999", name: "Miscellaneous Retail" },
  { code: "7011", name: "Hotels, Motels, Resorts" },
  { code: "7372", name: "Computer Programming, Data Processing" },
  { code: "4511", name: "Airlines, Air Carriers" },
  { code: "5943", name: "Stationery, Office Supplies" },
  { code: "7311", name: "Advertising Services" },
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

interface CardRequestDialogProps {
  trigger?: React.ReactNode;
}

export function CardRequestDialog({ trigger }: CardRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [cardType, setCardType] = useState<"one-time" | "recurring">("one-time");
  const { toast } = useToast();
  
  // Mutation to create card request
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
  const [allowedCountries, setAllowedCountries] = useState<string[]>([]);
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
    // Coding template is mandatory
    if (!glAccount || !department || !costCenter) {
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      return;
    }
    
    try {
      // Create card with "Pending Approval" status
      const cardData = {
        cardType: "Expense Card", // Will be stored in database
        cardholderName,
        spendLimit: parseFloat(spendLimit).toFixed(2),
        status: "Pending Approval",
        purpose,
        requestedBy: "Current User", // In a real app, this would be the logged-in user
        currency,
        validFrom: validFrom || null,
        validUntil: validUntil || null,
        allowedMerchants: allowedMerchants.length > 0 ? allowedMerchants : null,
        allowedMccCodes: allowedMccCodes.length > 0 ? allowedMccCodes : null,
        allowedCountries: allowedCountries.length > 0 ? allowedCountries : null,
        channelRestriction: channelRestriction !== "both" ? channelRestriction : null,
        glAccountTemplate: glAccount,
        departmentTemplate: department,
        costCenterTemplate: costCenter,
        isOneTimeUse: cardType === "one-time",
      };

      const createdCard = await createCardMutation.mutateAsync(cardData) as any;
      
      // Create approval record for Lisa Chen
      const approvalData = {
        cardRequestId: createdCard.id,
        approverName: "Lisa Chen",
        approverRole: "Finance Manager",
        status: "Pending",
        approvalLevel: 1,
      };

      await createApprovalMutation.mutateAsync(approvalData);
      
      toast({
        title: "Card request submitted",
        description: `Request for ${cardholderName} sent to Lisa Chen for approval`,
      });
      
      // Reset form
      setCardholderName("");
      setPurpose("");
      setSpendLimit("");
      setValidFrom("");
      setValidUntil("");
      setAllowedMerchants([]);
      setAllowedMccCodes([]);
      setAllowedCountries([]);
      setGlAccount("");
      setDepartment("");
      setCostCenter("");
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit card request. Please try again.",
        variant: "destructive",
      });
    }
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
                Select one or more merchants where this card can be used
              </p>
            </div>

            <div className="space-y-2">
              <Label>Allowed MCC Codes</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto min-h-9"
                    data-testid="button-select-mcc"
                  >
                    {allowedMccCodes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {allowedMccCodes.map((code) => {
                          const mcc = MCC_OPTIONS.find((m) => m.code === code);
                          return (
                            <Badge key={code} variant="secondary" className="text-xs">
                              {code} - {mcc?.name}
                              <X
                                className="ml-1 h-3 w-3 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAllowedMccCodes(allowedMccCodes.filter((c) => c !== code));
                                }}
                              />
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select MCC codes...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0" align="start">
                  <div className="max-h-[300px] overflow-y-auto p-2">
                    {MCC_OPTIONS.map((mcc) => (
                      <div
                        key={mcc.code}
                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                        onClick={() => {
                          if (allowedMccCodes.includes(mcc.code)) {
                            setAllowedMccCodes(allowedMccCodes.filter((c) => c !== mcc.code));
                          } else {
                            setAllowedMccCodes([...allowedMccCodes, mcc.code]);
                          }
                        }}
                        data-testid={`checkbox-mcc-${mcc.code}`}
                      >
                        <Checkbox checked={allowedMccCodes.includes(mcc.code)} />
                        <span className="text-sm font-mono">{mcc.code}</span>
                        <span className="text-sm text-muted-foreground">- {mcc.name}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Select merchant category codes where this card can be used
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
                <span className="font-semibold">All fields required.</span> Accounting codes will be automatically applied to transactions on this card.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gl-account">GL Account Template *</Label>
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
              <Label htmlFor="department">Department Template *</Label>
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
              <Label htmlFor="cost-center">Cost Center Template *</Label>
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
