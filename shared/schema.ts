import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull(),
  vendorName: text("vendor_name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export const cards = pgTable("cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardType: text("card_type").notNull(),
  cardholderName: text("cardholder_name").notNull(),
  spendLimit: decimal("spend_limit", { precision: 10, scale: 2 }).notNull(),
  currentSpend: decimal("current_spend", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull(),
  purpose: text("purpose"),
  invoiceId: varchar("invoice_id"),
  requestedBy: text("requested_by").notNull(),
  approvedBy: text("approved_by"),
  cardNumber: text("card_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCardSchema = createInsertSchema(cards).omit({
  id: true,
  createdAt: true,
  currentSpend: true,
  cardNumber: true,
});

export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: varchar("card_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  vendorName: text("vendor_name").notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  status: text("status").notNull(),
  glAccount: text("gl_account"),
  costCenter: text("cost_center"),
  memo: text("memo"),
  receiptUrl: text("receipt_url"),
  invoiceId: varchar("invoice_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export const glAccounts = pgTable("gl_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
});

export type GLAccount = typeof glAccounts.$inferSelect;

export const costCenters = pgTable("cost_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  department: text("department").notNull(),
});

export type CostCenter = typeof costCenters.$inferSelect;
