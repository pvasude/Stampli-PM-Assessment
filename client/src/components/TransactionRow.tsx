import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Check, AlertCircle } from "lucide-react";
import { useState } from "react";

interface TransactionRowProps {
  id: string;
  date: string;
  vendor: string;
  amount: string;
  cardholder: string;
  status: "Coded" | "Pending Receipt" | "Ready to Sync" | "Synced";
  glAccount?: string;
  costCenter?: string;
  hasReceipt?: boolean;
  onUploadReceipt?: () => void;
  onUpdateGL?: (value: string) => void;
  onUpdateCostCenter?: (value: string) => void;
}

export function TransactionRow({
  id,
  date,
  vendor,
  amount,
  cardholder,
  status,
  glAccount,
  costCenter,
  hasReceipt,
  onUploadReceipt,
  onUpdateGL,
  onUpdateCostCenter,
}: TransactionRowProps) {
  const [localGL, setLocalGL] = useState(glAccount);
  const [localCostCenter, setLocalCostCenter] = useState(costCenter);

  const statusVariants = {
    "Coded": "outline" as const,
    "Pending Receipt": "secondary" as const,
    "Ready to Sync": "outline" as const,
    "Synced": "secondary" as const,
  };

  return (
    <tr className="border-b hover:bg-accent/50" data-testid={`transaction-row-${id}`}>
      <td className="p-3 text-sm" data-testid={`text-date-${id}`}>{date}</td>
      <td className="p-3 text-sm" data-testid={`text-vendor-${id}`}>{vendor}</td>
      <td className="p-3 text-sm font-mono font-medium" data-testid={`text-amount-${id}`}>{amount}</td>
      <td className="p-3 text-sm text-muted-foreground">{cardholder}</td>
      <td className="p-3">
        <Badge variant={statusVariants[status]} data-testid={`badge-status-${id}`}>
          {status}
        </Badge>
      </td>
      <td className="p-3">
        <Select value={localGL} onValueChange={(value) => {
          setLocalGL(value);
          onUpdateGL?.(value);
        }}>
          <SelectTrigger className="w-[140px] h-8" data-testid={`select-gl-${id}`}>
            <SelectValue placeholder="Select GL" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5000">5000 - Office Exp</SelectItem>
            <SelectItem value="6100">6100 - Travel</SelectItem>
            <SelectItem value="6200">6200 - Software</SelectItem>
            <SelectItem value="7000">7000 - Marketing</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-3">
        <Select value={localCostCenter} onValueChange={(value) => {
          setLocalCostCenter(value);
          onUpdateCostCenter?.(value);
        }}>
          <SelectTrigger className="w-[120px] h-8" data-testid={`select-cost-center-${id}`}>
            <SelectValue placeholder="Select CC" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CC-001">CC-001 - Sales</SelectItem>
            <SelectItem value="CC-002">CC-002 - Eng</SelectItem>
            <SelectItem value="CC-003">CC-003 - Ops</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-3">
        {hasReceipt ? (
          <Check className="h-4 w-4 text-muted-foreground" data-testid={`icon-receipt-uploaded-${id}`} />
        ) : status === "Pending Receipt" ? (
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={onUploadReceipt}
            data-testid={`button-upload-receipt-${id}`}
          >
            <Upload className="h-4 w-4" />
          </Button>
        ) : (
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        )}
      </td>
    </tr>
  );
}
