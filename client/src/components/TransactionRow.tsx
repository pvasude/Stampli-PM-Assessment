import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Check, AlertCircle, RefreshCw, CreditCard, FileText } from "lucide-react";
import { useState } from "react";

interface TransactionRowProps {
  id: string;
  type: "card" | "ap";
  date: string;
  vendor: string;
  amount: string;
  cashback?: string;
  cardholder?: string;
  paymentMethod?: "Card" | "ACH" | "Check";
  invoiceNumber?: string;
  status: "Pending Receipt" | "Pending Coding" | "Ready to Sync" | "Synced";
  glAccount?: string;
  department?: string;
  costCenter?: string;
  hasReceipt?: boolean;
  glAccounts?: Array<{ id: string; code: string; name: string }>;
  departments?: Array<{ id: string; code: string; name: string }>;
  costCenters?: Array<{ id: string; code: string; name: string }>;
  onUploadReceipt?: () => void;
  onUpdateGL?: (value: string) => void;
  onUpdateDepartment?: (value: string) => void;
  onUpdateCostCenter?: (value: string) => void;
  onSyncToERP?: () => void;
}

export function TransactionRow({
  id,
  type,
  date,
  vendor,
  amount,
  cashback,
  cardholder,
  paymentMethod,
  invoiceNumber,
  status,
  glAccount,
  department,
  costCenter,
  hasReceipt,
  glAccounts = [],
  departments = [],
  costCenters = [],
  onUploadReceipt,
  onUpdateGL,
  onUpdateDepartment,
  onUpdateCostCenter,
  onSyncToERP,
}: TransactionRowProps) {
  const [localGL, setLocalGL] = useState(glAccount);
  const [localDepartment, setLocalDepartment] = useState(department);
  const [localCostCenter, setLocalCostCenter] = useState(costCenter);
  const [localHasReceipt, setLocalHasReceipt] = useState(hasReceipt);

  // Calculate actual status based on receipt and coding
  const calculateStatus = (): "Pending Receipt" | "Pending Coding" | "Ready to Sync" | "Synced" => {
    // If already synced, keep that status
    if (status === "Synced") {
      return "Synced";
    }
    
    const hasCoding = localGL && localDepartment && localCostCenter;
    
    if (!localHasReceipt && !hasCoding) {
      return "Pending Receipt"; // Primary issue is receipt
    }
    
    if (!localHasReceipt) {
      return "Pending Receipt";
    }
    
    if (!hasCoding) {
      return "Pending Coding";
    }
    
    return "Ready to Sync";
  };

  const actualStatus = calculateStatus();

  const statusVariants = {
    "Pending Receipt": "secondary" as const,
    "Pending Coding": "secondary" as const,
    "Ready to Sync": "default" as const,
    "Synced": "default" as const,
  };

  return (
    <tr className="border-b hover:bg-muted/30" data-testid={`transaction-row-${id}`}>
      <td className="p-4">
        {type === "card" ? (
          <CreditCard className="h-4 w-4 text-primary" data-testid={`icon-type-card-${id}`} />
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground" data-testid={`icon-type-ap-${id}`} />
        )}
      </td>
      <td className="p-4 text-sm text-muted-foreground" data-testid={`text-date-${id}`}>{date}</td>
      <td className="p-4 text-sm" data-testid={`text-vendor-${id}`}>{vendor}</td>
      <td className="p-4 text-sm font-mono" data-testid={`text-amount-${id}`}>{amount}</td>
      <td className="p-4 text-sm font-mono text-muted-foreground" data-testid={`text-cashback-${id}`}>{cashback || "-"}</td>
      <td className="p-4 text-sm text-muted-foreground">
        {type === "card" ? cardholder : 
         type === "ap" ? (
           <div className="flex flex-col gap-0.5">
             <span>{paymentMethod}</span>
             {invoiceNumber && <span className="text-xs">{invoiceNumber}</span>}
           </div>
         ) : "-"}
      </td>
      <td className="p-4">
        <div className="flex flex-col gap-1">
          <Badge variant={statusVariants[actualStatus]} className="text-xs" data-testid={`badge-status-${id}`}>
            {actualStatus}
          </Badge>
          {!localHasReceipt && !localGL && !localDepartment && !localCostCenter && (
            <span className="text-xs text-muted-foreground">Also Pending Coding</span>
          )}
        </div>
      </td>
      <td className="p-4">
        <Select value={localGL} onValueChange={(value) => {
          setLocalGL(value);
          onUpdateGL?.(value);
        }}>
          <SelectTrigger className="w-[140px] h-8" data-testid={`select-gl-${id}`}>
            <SelectValue placeholder="Select GL" />
          </SelectTrigger>
          <SelectContent>
            {glAccounts.length === 0 ? (
              <SelectItem value="none" disabled>No GL accounts</SelectItem>
            ) : (
              glAccounts.map((account) => (
                <SelectItem key={account.id} value={account.code}>
                  {account.code} - {account.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </td>
      <td className="p-4">
        <Select value={localDepartment} onValueChange={(value) => {
          setLocalDepartment(value);
          onUpdateDepartment?.(value);
        }}>
          <SelectTrigger className="w-[140px] h-8" data-testid={`select-department-${id}`}>
            <SelectValue placeholder="Select Dept" />
          </SelectTrigger>
          <SelectContent>
            {departments.length === 0 ? (
              <SelectItem value="none" disabled>No departments</SelectItem>
            ) : (
              departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </td>
      <td className="p-4">
        <Select value={localCostCenter} onValueChange={(value) => {
          setLocalCostCenter(value);
          onUpdateCostCenter?.(value);
        }}>
          <SelectTrigger className="w-[120px] h-8" data-testid={`select-cost-center-${id}`}>
            <SelectValue placeholder="Select CC" />
          </SelectTrigger>
          <SelectContent>
            {costCenters.length === 0 ? (
              <SelectItem value="none" disabled>No cost centers</SelectItem>
            ) : (
              costCenters.map((center) => (
                <SelectItem key={center.id} value={center.code}>
                  {center.code} - {center.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </td>
      <td className="p-4">
        {localHasReceipt ? (
          <Check className="h-4 w-4 text-muted-foreground" data-testid={`icon-receipt-uploaded-${id}`} />
        ) : actualStatus === "Pending Receipt" || !localHasReceipt ? (
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setLocalHasReceipt(true);
              onUploadReceipt?.();
            }}
            data-testid={`button-upload-receipt-${id}`}
          >
            <Upload className="h-4 w-4" />
          </Button>
        ) : (
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        )}
      </td>
      <td className="p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onSyncToERP}
          disabled={actualStatus !== "Ready to Sync"}
          data-testid={`button-sync-erp-${id}`}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Sync
        </Button>
      </td>
    </tr>
  );
}
