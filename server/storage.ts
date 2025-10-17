import { 
  users, 
  invoices,
  cards,
  cardApprovals,
  transactions,
  glAccounts,
  costCenters,
  companyWallet,
  payments,
  type User, 
  type InsertUser,
  type Invoice,
  type InsertInvoice,
  type Card,
  type InsertCard,
  type CardApproval,
  type InsertCardApproval,
  type Transaction,
  type InsertTransaction,
  type GLAccount,
  type CostCenter,
  type CompanyWallet,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Invoice operations
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<void>;

  // Card operations
  getCards(): Promise<Card[]>;
  getCard(id: string): Promise<Card | undefined>;
  createCard(card: InsertCard & Partial<Pick<Card, 'cardNumber' | 'cvv' | 'last4' | 'expiryDate' | 'currentSpend'>>): Promise<Card>;
  updateCard(id: string, card: Partial<InsertCard> & Partial<Pick<Card, 'cardNumber' | 'cvv' | 'last4' | 'expiryDate' | 'currentSpend'>>): Promise<Card>;
  deleteCard(id: string): Promise<void>;

  // Card Approval operations
  getCardApprovals(): Promise<CardApproval[]>;
  getCardApproval(id: string): Promise<CardApproval | undefined>;
  createCardApproval(approval: InsertCardApproval): Promise<CardApproval>;
  updateCardApproval(id: string, approval: Partial<InsertCardApproval>): Promise<CardApproval>;

  // Transaction operations
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;

  // GL Account operations
  getGLAccounts(): Promise<GLAccount[]>;
  createGLAccount(account: Omit<GLAccount, 'id'>): Promise<GLAccount>;

  // Cost Center operations
  getCostCenters(): Promise<CostCenter[]>;
  createCostCenter(center: Omit<CostCenter, 'id'>): Promise<CostCenter>;

  // Company Wallet operations
  getWallet(): Promise<CompanyWallet | undefined>;
  updateWalletBalance(amount: string): Promise<CompanyWallet>;
  addFundsToWallet(amount: string): Promise<CompanyWallet>;

  // Payment operations
  getPayments(): Promise<Payment[]>;
  getPaymentsByInvoice(invoiceId: string): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment>;
  
  // Atomic transaction processing with row-level locking
  processTransaction(params: {
    cardId: string;
    amount: string;
    merchant: string;
    glAccount: string;
    costCenter: string;
  }): Promise<{
    transaction: Transaction;
    newWalletBalance: string;
    newCardSpend: string;
    monthlyReset: boolean;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Invoice operations
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db
      .insert(invoices)
      .values(insertInvoice)
      .returning();
    return invoice;
  }

  async updateInvoice(id: string, updateData: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: string): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  // Card operations
  async getCards(): Promise<Card[]> {
    return await db.select().from(cards).orderBy(desc(cards.createdAt));
  }

  async getCard(id: string): Promise<Card | undefined> {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));
    return card || undefined;
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    const [card] = await db
      .insert(cards)
      .values(insertCard)
      .returning();
    return card;
  }

  async updateCard(id: string, updateData: Partial<InsertCard>): Promise<Card> {
    const [card] = await db
      .update(cards)
      .set(updateData)
      .where(eq(cards.id, id))
      .returning();
    return card;
  }

  async deleteCard(id: string): Promise<void> {
    await db.delete(cards).where(eq(cards.id, id));
  }

  // Card Approval operations
  async getCardApprovals(): Promise<CardApproval[]> {
    return await db.select().from(cardApprovals).orderBy(desc(cardApprovals.createdAt));
  }

  async getCardApproval(id: string): Promise<CardApproval | undefined> {
    const [approval] = await db.select().from(cardApprovals).where(eq(cardApprovals.id, id));
    return approval || undefined;
  }

  async createCardApproval(insertApproval: InsertCardApproval): Promise<CardApproval> {
    const [approval] = await db
      .insert(cardApprovals)
      .values(insertApproval)
      .returning();
    return approval;
  }

  async updateCardApproval(id: string, updateData: Partial<InsertCardApproval>): Promise<CardApproval> {
    const [approval] = await db
      .update(cardApprovals)
      .set(updateData)
      .where(eq(cardApprovals.id, id))
      .returning();
    return approval;
  }

  // Transaction operations
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async updateTransaction(id: string, updateData: Partial<InsertTransaction>): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  // GL Account operations
  async getGLAccounts(): Promise<GLAccount[]> {
    return await db.select().from(glAccounts);
  }

  async createGLAccount(insertAccount: Omit<GLAccount, 'id'>): Promise<GLAccount> {
    const [account] = await db
      .insert(glAccounts)
      .values(insertAccount)
      .returning();
    return account;
  }

  // Cost Center operations
  async getCostCenters(): Promise<CostCenter[]> {
    return await db.select().from(costCenters);
  }

  async createCostCenter(insertCenter: Omit<CostCenter, 'id'>): Promise<CostCenter> {
    const [center] = await db
      .insert(costCenters)
      .values(insertCenter)
      .returning();
    return center;
  }

  // Company Wallet operations
  async getWallet(): Promise<CompanyWallet | undefined> {
    const [wallet] = await db.select().from(companyWallet).limit(1);
    if (!wallet) {
      // Initialize wallet if it doesn't exist
      const [newWallet] = await db
        .insert(companyWallet)
        .values({ balance: "0" })
        .returning();
      return newWallet;
    }
    return wallet;
  }

  async updateWalletBalance(amount: string): Promise<CompanyWallet> {
    const wallet = await this.getWallet();
    if (!wallet) throw new Error("Wallet not found");
    
    const [updated] = await db
      .update(companyWallet)
      .set({ balance: amount, updatedAt: new Date() })
      .where(eq(companyWallet.id, wallet.id))
      .returning();
    return updated;
  }

  async addFundsToWallet(amount: string): Promise<CompanyWallet> {
    const wallet = await this.getWallet();
    if (!wallet) throw new Error("Wallet not found");
    
    const currentBalance = parseFloat(wallet.balance);
    const addAmount = parseFloat(amount);
    const newBalance = (currentBalance + addAmount).toFixed(2);
    
    const [updated] = await db
      .update(companyWallet)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(companyWallet.id, wallet.id))
      .returning();
    return updated;
  }

  // Payment operations
  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.invoiceId, invoiceId));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async updatePayment(id: string, updateData: Partial<InsertPayment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // Atomic transaction processing with row-level locking
  async processTransaction(params: {
    cardId: string;
    amount: string;
    merchant: string;
    glAccount: string;
    costCenter: string;
  }): Promise<{
    transaction: Transaction;
    newWalletBalance: string;
    newCardSpend: string;
    monthlyReset: boolean;
  }> {
    return await db.transaction(async (tx) => {
      const transactionAmount = parseFloat(params.amount);
      
      // 1. Lock and read card with FOR UPDATE
      const [card] = await tx
        .select()
        .from(cards)
        .where(eq(cards.id, params.cardId))
        .for('update');
      
      if (!card) throw new Error("Card not found");

      // 2. Lock and read wallet with FOR UPDATE
      const [wallet] = await tx
        .select()
        .from(companyWallet)
        .for('update');
      
      if (!wallet) throw new Error("Wallet not found");

      // 3. Calculate baseSpend with fresh locked data (check for monthly reset)
      let baseSpend = parseFloat(card.currentSpend);
      let needsReset = false;
      
      if (!card.isOneTimeUse && card.lastResetDate) {
        const now = new Date();
        const lastReset = new Date(card.lastResetDate);
        
        if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
          baseSpend = 0;
          needsReset = true;
        }
      }

      // 4. Validate limits with fresh data
      const cardLimit = parseFloat(card.spendLimit);
      const projectedSpend = baseSpend + transactionAmount;
      const walletBalance = parseFloat(wallet.balance);
      
      let declineReason: string | null = null;
      
      if (projectedSpend > cardLimit) {
        declineReason = `Exceeds card limit ($${projectedSpend.toFixed(2)} > $${cardLimit.toFixed(2)})`;
      } else if (transactionAmount > walletBalance) {
        declineReason = `Insufficient wallet balance ($${transactionAmount.toFixed(2)} > $${walletBalance.toFixed(2)})`;
      }

      // 5. Create transaction record (approved or declined)
      const [transaction] = await tx
        .insert(transactions)
        .values({
          cardId: params.cardId,
          amount: params.amount,
          vendorName: params.merchant,
          transactionDate: new Date(),
          status: declineReason ? "Declined" : "Pending Coding",
          glAccount: params.glAccount,
          costCenter: params.costCenter,
        })
        .returning();

      // If declined, return early without updating balances
      if (declineReason) {
        return {
          transaction,
          newWalletBalance: wallet.balance,
          newCardSpend: card.currentSpend,
          monthlyReset: false,
          declined: true,
          declineReason,
        } as any;
      }

      // 6. Update wallet balance from fresh value (only for approved)
      const newWalletBalance = (walletBalance - transactionAmount).toFixed(2);
      await tx
        .update(companyWallet)
        .set({ balance: newWalletBalance, updatedAt: new Date() })
        .where(eq(companyWallet.id, wallet.id));

      // 7. Update card spend and reset date from fresh value (only for approved)
      const newCardSpend = (baseSpend + transactionAmount).toFixed(2);
      const cardUpdate: any = { currentSpend: newCardSpend };
      
      if (needsReset) {
        cardUpdate.lastResetDate = new Date();
      }
      
      await tx
        .update(cards)
        .set(cardUpdate)
        .where(eq(cards.id, params.cardId));

      return {
        transaction,
        newWalletBalance,
        newCardSpend,
        monthlyReset: needsReset,
        declined: false,
      } as any;
    });
  }
}

export const storage = new DatabaseStorage();
