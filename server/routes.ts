import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInvoiceSchema, insertCardSchema, insertTransactionSchema, insertCardApprovalSchema, insertPaymentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Invoice routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validated = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validated);
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ error: "Invalid invoice data" });
    }
  });

  app.patch("/api/invoices/:id", async (req, res) => {
    try {
      const currentInvoice = await storage.getInvoice(req.params.id);
      
      // If invoice is locked to a card, enforce locking rules
      if (currentInvoice?.lockedCardId) {
        const lockedCard = await storage.getCard(currentInvoice.lockedCardId);
        
        // If card is still active (not suspended), block most updates
        if (lockedCard && lockedCard.status !== "Suspended") {
          // Allow only status updates (for automatic status derivation)
          // Block all other changes including unlock attempts, payment method changes, etc.
          const allowedFields = ['status'];
          const updatingFields = Object.keys(req.body);
          const blockedFields = updatingFields.filter(field => !allowedFields.includes(field));
          
          if (blockedFields.length > 0) {
            return res.status(400).json({ 
              error: `Cannot update invoice: it is locked to active card ${lockedCard.last4}. Suspend the card first.`,
              blockedFields
            });
          }
        }
      }
      
      const invoice = await storage.updateInvoice(req.params.id, req.body);
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });

  app.post("/api/invoices/:id/update-status", async (req, res) => {
    try {
      const invoice = await storage.updateInvoiceStatus(req.params.id);
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to update invoice status" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      await storage.deleteInvoice(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  });

  // Card routes
  app.get("/api/cards", async (req, res) => {
    try {
      const cards = await storage.getCards();
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cards" });
    }
  });

  app.get("/api/cards/:id", async (req, res) => {
    try {
      const card = await storage.getCard(req.params.id);
      if (!card) {
        return res.status(404).json({ error: "Card not found" });
      }
      res.json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch card" });
    }
  });

  app.post("/api/cards", async (req, res) => {
    try {
      console.log("POST /api/cards request body:", JSON.stringify(req.body, null, 2));
      const validated = insertCardSchema.parse(req.body);
      
      // Convert date strings to Date objects for Drizzle
      const cardData = {
        ...validated,
        validFrom: validated.validFrom ? new Date(validated.validFrom) : null,
        validUntil: validated.validUntil ? new Date(validated.validUntil) : null,
      };
      
      const card = await storage.createCard(cardData);
      res.json(card);
    } catch (error) {
      console.error("POST /api/cards validation error:", error);
      res.status(400).json({ error: "Invalid card data", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.patch("/api/cards/:id", async (req, res) => {
    try {
      const updateData = { ...req.body };
      
      // If trying to suspend a card, check if it's locked to an invoice with non-zero spend
      if (updateData.status === "Suspended") {
        const currentCard = await storage.getCard(req.params.id);
        if (currentCard) {
          const invoices = await storage.getInvoices();
          const lockedInvoice = invoices.find(inv => inv.lockedCardId === req.params.id);
          
          if (lockedInvoice && parseFloat(currentCard.currentSpend) > 0) {
            return res.status(400).json({ 
              error: "Cannot suspend card: it is locked to invoice " + lockedInvoice.invoiceNumber + " with non-zero spend" 
            });
          }
        }
      }
      
      // If card is being approved (status changing to Active), generate dummy card details
      if (updateData.status === "Active") {
        // Generate dummy virtual card number (starts with 4571 for Visa virtual cards)
        const cardNumber = `4571${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`;
        const last4 = cardNumber.slice(-4);
        
        // Generate expiry date (2 years from now)
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 2);
        const expiryMonth = String(expiryDate.getMonth() + 1).padStart(2, '0');
        const expiryYear = String(expiryDate.getFullYear()).slice(-2);
        
        // Generate CVV (3 random digits)
        const cvv = Math.floor(Math.random() * 900 + 100).toString();
        
        updateData.cardNumber = cardNumber;
        updateData.last4 = last4;
        updateData.expiryDate = `${expiryMonth}/${expiryYear}`;
        updateData.cvv = cvv;
      }
      
      const card = await storage.updateCard(req.params.id, updateData);
      res.json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to update card" });
    }
  });

  app.delete("/api/cards/:id", async (req, res) => {
    try {
      // Check if card is locked to any invoice
      const invoices = await storage.getInvoices();
      const lockedInvoice = invoices.find(inv => inv.lockedCardId === req.params.id);
      
      if (lockedInvoice) {
        return res.status(400).json({ 
          error: "Cannot delete card: it is locked to invoice " + lockedInvoice.invoiceNumber 
        });
      }
      
      await storage.deleteCard(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete card" });
    }
  });

  // Card Approval routes
  app.get("/api/card-approvals", async (req, res) => {
    try {
      const approvals = await storage.getCardApprovals();
      res.json(approvals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch card approvals" });
    }
  });

  app.post("/api/card-approvals", async (req, res) => {
    try {
      const validated = insertCardApprovalSchema.parse(req.body);
      const approval = await storage.createCardApproval(validated);
      res.json(approval);
    } catch (error) {
      res.status(400).json({ error: "Invalid approval data" });
    }
  });

  app.patch("/api/card-approvals/:id", async (req, res) => {
    try {
      console.log("PATCH /api/card-approvals/:id request body:", JSON.stringify(req.body, null, 2));
      const validated = insertCardApprovalSchema.partial().parse(req.body);
      
      // Convert date strings to Date objects if present
      const approvalData = {
        ...validated,
        approvedAt: validated.approvedAt ? new Date(validated.approvedAt) : undefined,
      };
      
      const approval = await storage.updateCardApproval(req.params.id, approvalData);
      res.json(approval);
    } catch (error) {
      console.error("PATCH /api/card-approvals/:id error:", error);
      res.status(500).json({ error: "Failed to update approval" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validated = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validated);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.updateTransaction(req.params.id, req.body);
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      await storage.deleteTransaction(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  // GL Account routes
  app.get("/api/gl-accounts", async (req, res) => {
    try {
      const accounts = await storage.getGLAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch GL accounts" });
    }
  });

  app.post("/api/gl-accounts", async (req, res) => {
    try {
      const account = await storage.createGLAccount(req.body);
      res.json(account);
    } catch (error) {
      res.status(400).json({ error: "Invalid GL account data" });
    }
  });

  // Cost Center routes
  app.get("/api/cost-centers", async (req, res) => {
    try {
      const centers = await storage.getCostCenters();
      res.json(centers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cost centers" });
    }
  });

  app.post("/api/cost-centers", async (req, res) => {
    try {
      const center = await storage.createCostCenter(req.body);
      res.json(center);
    } catch (error) {
      res.status(400).json({ error: "Invalid cost center data" });
    }
  });

  // Simulation routes
  app.post("/api/simulate/transaction", async (req, res) => {
    try {
      const { cardId, amount, merchant } = req.body;
      
      // Validate amount
      const transactionAmount = parseFloat(amount);
      if (isNaN(transactionAmount) || transactionAmount <= 0) {
        return res.status(400).json({ error: "Invalid transaction amount" });
      }
      
      // Get the card to validate and get cardholder info
      const card = await storage.getCard(cardId);
      if (!card) {
        return res.status(404).json({ error: "Card not found" });
      }

      // Check if card is locked or suspended - decline transaction
      if (card.status === "Locked" || card.status === "Suspended") {
        return res.status(400).json({
          approved: false,
          declined: true,
          declineReason: card.status === "Locked" 
            ? "Card is temporarily locked" 
            : "Card is suspended",
        });
      }

      // Execute transaction processing atomically with row-level locking
      // All validation and updates happen inside the database transaction
      const result = await storage.processTransaction({
        cardId,
        amount: transactionAmount.toString(),
        merchant: merchant || `Test Merchant ${Math.floor(Math.random() * 1000)}`,
        glAccount: card.glAccountTemplate || "6000",
        costCenter: card.costCenterTemplate || "CC-100",
      });

      // Check if transaction was declined
      if ((result as any).declined) {
        return res.status(400).json({
          ...result.transaction,
          approved: false,
          declined: true,
          declineReason: (result as any).declineReason,
          walletBalanceAfter: result.newWalletBalance,
          cardSpendAfter: result.newCardSpend,
        });
      }

      // Transaction was approved
      res.json({
        ...result.transaction,
        approved: true,
        walletBalanceAfter: result.newWalletBalance,
        cardSpendAfter: result.newCardSpend,
        monthlyReset: result.monthlyReset
      });
    } catch (error) {
      console.error("Simulate transaction error:", error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.post("/api/simulate/invoice", async (req, res) => {
    try {
      const { vendorName, amount, description, status, approverName, payments } = req.body;
      
      // Create the invoice
      const invoice = await storage.createInvoice({
        invoiceNumber: `INV-${Math.floor(Math.random() * 100000)}`,
        vendorName,
        amount: amount.toString(),
        dueDate: payments && payments.length > 0 ? new Date(payments[0].dueDate) : new Date(),
        status: status || "Pending",
        description: description || `Simulated invoice for ${vendorName}`,
        paymentMethod: status === "Approved" ? "Pending Payment" : null,
        approvedBy: status === "Approved" ? approverName : null,
        approvedAt: status === "Approved" ? new Date() : null,
      });

      // Create payment installments if provided
      if (payments && payments.length > 0) {
        for (const payment of payments) {
          await storage.createPayment({
            invoiceId: invoice.id,
            amount: payment.amount.toString(),
            dueDate: new Date(payment.dueDate),
            status: status === "Approved" ? "Pending" : "Draft",
            glAccount: payment.glAccount || null,
            department: payment.department || null,
            costCenter: payment.costCenter || null,
          });
        }
      }

      res.json(invoice);
    } catch (error) {
      console.error("Simulate invoice error:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  app.post("/api/simulate/pay-invoice", async (req, res) => {
    try {
      const { invoiceId, cardholderName, spendLimit } = req.body;
      
      // Get the invoice
      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Generate dummy virtual card details
      const cardNumber = `4571${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`;
      const last4 = cardNumber.slice(-4);
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);
      const expiryMonth = String(expiryDate.getMonth() + 1).padStart(2, '0');
      const expiryYear = String(expiryDate.getFullYear()).slice(-2);
      const cvv = Math.floor(Math.random() * 900 + 100).toString();

      const card = await storage.createCard({
        cardType: "Invoice Payment",
        cardholderName,
        spendLimit: spendLimit.toString(),
        status: "Active",
        purpose: `Payment for ${invoice.invoiceNumber}`,
        invoiceId,
        requestedBy: cardholderName,
        approvedBy: "Auto-Approved",
        isOneTimeUse: true,
        currency: "USD",
        cardNumber,
        last4,
        expiryDate: `${expiryMonth}/${expiryYear}`,
        cvv,
      });

      // Update invoice to Paid
      await storage.updateInvoice(invoiceId, {
        status: "Paid",
        paymentMethod: `Virtual Card - ${last4}`
      });

      res.json({ card, invoice });
    } catch (error) {
      console.error("Pay invoice error:", error);
      res.status(500).json({ error: "Failed to pay invoice" });
    }
  });

  // Company Wallet routes
  app.get("/api/wallet", async (req, res) => {
    try {
      const wallet = await storage.getWallet();
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  });

  app.post("/api/wallet/add-funds", async (req, res) => {
    try {
      const { amount } = req.body;
      const numAmount = parseFloat(amount);
      
      if (!amount || isNaN(numAmount) || numAmount === 0) {
        return res.status(400).json({ error: "Invalid amount. Must be a positive number." });
      }
      
      const wallet = await storage.addFundsToWallet(numAmount.toString());
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: "Failed to add funds" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.get("/api/payments/invoice/:invoiceId", async (req, res) => {
    try {
      const payments = await storage.getPaymentsByInvoice(req.params.invoiceId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments for invoice" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validated = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validated);
      
      // Automatically update invoice status based on payments
      if (payment.invoiceId) {
        await storage.updateInvoiceStatus(payment.invoiceId);
      }
      
      res.json(payment);
    } catch (error) {
      console.error("Payment creation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: "Invalid payment data", details: error.message });
      } else {
        res.status(400).json({ error: "Invalid payment data" });
      }
    }
  });

  app.patch("/api/payments/:id", async (req, res) => {
    try {
      const payment = await storage.updatePayment(req.params.id, req.body);
      
      // Automatically update invoice status based on payments
      if (payment.invoiceId) {
        await storage.updateInvoiceStatus(payment.invoiceId);
      }
      
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
