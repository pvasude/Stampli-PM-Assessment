import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CardDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: {
    cardholderName: string;
    cardNumber?: string | null;
    expiryDate?: string | null;
    cvv?: string | null;
    spendLimit: string;
    currentSpend: string;
  };
}

export function CardDetailsDialog({ open, onOpenChange, card }: CardDetailsDialogProps) {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied to clipboard",
        description: `${fieldName} has been copied.`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCardNumber = (number: string, masked: boolean) => {
    if (masked) {
      return `•••• •••• •••• ${number.slice(-4)}`;
    }
    return number.match(/.{1,4}/g)?.join(' ') || number;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-card-details">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Cardholder Name</p>
            <p className="text-base font-medium" data-testid="text-cardholder-name">{card.cardholderName}</p>
          </div>

          {card.cardNumber && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Card Number</p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCardNumber(!showCardNumber)}
                    data-testid="button-toggle-card-number"
                  >
                    {showCardNumber ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  {showCardNumber && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(card.cardNumber!, "Card number")}
                      data-testid="button-copy-card-number"
                    >
                      {copiedField === "Card number" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <Card className="p-4 bg-muted/30">
                <p className="text-lg font-mono tracking-wider" data-testid="text-card-number">
                  {formatCardNumber(card.cardNumber, !showCardNumber)}
                </p>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {card.expiryDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Expiry Date</p>
                <Card className="p-3 bg-muted/30">
                  <p className="text-base font-mono" data-testid="text-expiry-date">{card.expiryDate}</p>
                </Card>
              </div>
            )}

            {card.cvv && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">CVV</p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCVV(!showCVV)}
                      data-testid="button-toggle-cvv"
                    >
                      {showCVV ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    {showCVV && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(card.cvv!, "CVV")}
                        data-testid="button-copy-cvv"
                      >
                        {copiedField === "CVV" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <Card className="p-3 bg-muted/30">
                  <p className="text-base font-mono" data-testid="text-cvv">
                    {showCVV ? card.cvv : "•••"}
                  </p>
                </Card>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Spend</span>
              <span className="font-mono">
                {card.currentSpend} / {card.spendLimit}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
