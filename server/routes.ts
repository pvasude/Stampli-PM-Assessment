import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInvoiceSchema, insertCardSchema, insertTransactionSchema, insertCardApprovalSchema } from "@shared/schema";

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
      const invoice = await storage.updateInvoice(req.params.id, req.body);
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to update invoice" });
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
      
      // If card is being approved (status changing to Active), generate card details
      if (updateData.status === "Active") {
        // Generate virtual card number (starts with 4571 for Visa virtual cards)
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

  const httpServer = createServer(app);

  return httpServer;
}
