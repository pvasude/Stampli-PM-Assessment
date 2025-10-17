import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CompanyWallet } from "@shared/schema";

export function WalletCard() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const { data: wallet, isLoading } = useQuery<CompanyWallet>({
    queryKey: ['/api/wallet'],
  });

  const addFundsMutation = useMutation({
    mutationFn: async (fundAmount: string) => {
      const response = await apiRequest('POST', '/api/wallet/add-funds', { amount: fundAmount });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      toast({
        title: "Funds added successfully",
        description: `$${parseFloat(amount).toLocaleString()} has been added to your wallet`,
      });
      setAmount("");
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add funds. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddFunds = () => {
    const parsedAmount = parseFloat(amount);
    
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a positive amount",
        variant: "destructive",
      });
      return;
    }

    addFundsMutation.mutate(parsedAmount.toFixed(2));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Company Wallet</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading balance...</p>
        </CardContent>
      </Card>
    );
  }

  const balance = wallet ? parseFloat(wallet.balance) : 0;

  return (
    <Card data-testid="card-wallet">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Company Wallet</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-medium" data-testid="text-wallet-balance">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available balance
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-add-funds">
                Add Funds
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-add-funds">
              <DialogHeader>
                <DialogTitle>Add Funds to Wallet</DialogTitle>
                <DialogDescription>
                  Enter the amount you want to add to your company wallet
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddFunds();
                      }
                    }}
                    data-testid="input-fund-amount"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setAmount("");
                    }}
                    data-testid="button-cancel-funds"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddFunds}
                    disabled={addFundsMutation.isPending}
                    data-testid="button-submit-funds"
                  >
                    {addFundsMutation.isPending ? "Adding..." : "Add Funds"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
