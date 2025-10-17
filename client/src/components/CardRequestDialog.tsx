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
import { CreditCard } from "lucide-react";

interface CardRequestDialogProps {
  trigger?: React.ReactNode;
  invoices?: Array<{ id: string; invoiceNumber: string; vendorName: string; amount: string }>;
}

export function CardRequestDialog({ trigger, invoices = [] }: CardRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [cardType, setCardType] = useState<"invoice" | "expense">("invoice");
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [spendLimit, setSpendLimit] = useState("");
  const [purpose, setPurpose] = useState("");

  const handleSubmit = () => {
    console.log("Card request submitted:", {
      cardType,
      selectedInvoice,
      cardholderName,
      spendLimit,
      purpose,
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
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-card-request">
        <DialogHeader>
          <DialogTitle>Request Virtual Card</DialogTitle>
          <DialogDescription>
            Create a new virtual card for invoice payment or general expenses.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Card Type</Label>
            <RadioGroup value={cardType} onValueChange={(value: "invoice" | "expense") => setCardType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="invoice" id="invoice" data-testid="radio-invoice-card" />
                <Label htmlFor="invoice" className="font-normal cursor-pointer">
                  Invoice Card - Pay specific invoice
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" data-testid="radio-expense-card" />
                <Label htmlFor="expense" className="font-normal cursor-pointer">
                  Expense Card - General purchases
                </Label>
              </div>
            </RadioGroup>
          </div>

          {cardType === "invoice" && (
            <div className="space-y-2">
              <Label htmlFor="invoice">Select Invoice</Label>
              <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
                <SelectTrigger id="invoice" data-testid="select-invoice">
                  <SelectValue placeholder="Choose an invoice" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.vendorName} ({inv.amount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cardholder">Cardholder Name</Label>
            <Input
              id="cardholder"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="Enter cardholder name"
              data-testid="input-cardholder-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Spend Limit</Label>
            <Input
              id="limit"
              type="number"
              value={spendLimit}
              onChange={(e) => setSpendLimit(e.target.value)}
              placeholder="Enter amount"
              data-testid="input-spend-limit"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Describe the purpose of this card"
              data-testid="textarea-purpose"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSubmit} data-testid="button-submit-request">
            Submit Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
