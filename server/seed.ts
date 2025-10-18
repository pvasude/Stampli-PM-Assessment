import { db } from "./db";
import { invoices, cards, transactions, glAccounts, departments, costCenters, cardApprovals } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(transactions);
  await db.delete(cardApprovals);
  await db.delete(cards);
  await db.delete(invoices);
  await db.delete(costCenters);
  await db.delete(departments);
  await db.delete(glAccounts);

  // Seed GL Accounts
  const glAccountData = [
    { code: "5000", name: "Office Supplies", category: "Operating Expenses" },
    { code: "5100", name: "Office Equipment", category: "Operating Expenses" },
    { code: "6100", name: "Marketing & Advertising", category: "Marketing" },
    { code: "6200", name: "Software & IT", category: "Technology" },
    { code: "7000", name: "Sales & Entertainment", category: "Sales" },
    { code: "7200", name: "Travel & Expenses", category: "Travel" },
  ];

  await db.insert(glAccounts).values(glAccountData);
  console.log("✓ GL Accounts seeded");

  // Seed Departments
  const departmentData = [
    { code: "DEPT-SALES", name: "Sales" },
    { code: "DEPT-TECH", name: "Technology" },
    { code: "DEPT-OPS", name: "Operations" },
    { code: "DEPT-MKT", name: "Marketing" },
  ];

  const insertedDepartments = await db.insert(departments).values(departmentData).returning();
  console.log("✓ Departments seeded");

  // Create a map of department name to ID
  const deptMap = insertedDepartments.reduce((acc, dept) => {
    acc[dept.name] = dept.id;
    return acc;
  }, {} as Record<string, string>);

  // Seed Cost Centers
  const costCenterData = [
    { code: "CC-001", name: "Sales Team", departmentId: deptMap["Sales"] },
    { code: "CC-002", name: "Engineering", departmentId: deptMap["Technology"] },
    { code: "CC-003", name: "Operations", departmentId: deptMap["Operations"] },
    { code: "CC-004", name: "Marketing", departmentId: deptMap["Marketing"] },
  ];

  await db.insert(costCenters).values(costCenterData);
  console.log("✓ Cost Centers seeded");

  // Seed Invoices
  const invoiceData = [
    {
      invoiceNumber: "INV-2024-001",
      vendorName: "Acme Office Supplies",
      amount: "2450.00",
      dueDate: new Date("2024-03-15"),
      status: "Pending",
      description: "Office furniture and equipment for Q1",
      paymentMethod: null,
    },
    {
      invoiceNumber: "INV-2024-002",
      vendorName: "TechCorp Software",
      amount: "5200.00",
      dueDate: new Date("2024-03-20"),
      status: "Approved",
      description: "Annual software licenses renewal",
      paymentMethod: null,
    },
    {
      invoiceNumber: "INV-2024-003",
      vendorName: "CloudHost Services",
      amount: "1850.00",
      dueDate: new Date("2024-03-25"),
      status: "Pending",
      description: "Cloud infrastructure hosting - March",
      paymentMethod: null,
    },
    {
      invoiceNumber: "INV-2024-004",
      vendorName: "Design Studio Pro",
      amount: "3500.00",
      dueDate: new Date("2024-03-10"),
      status: "Overdue",
      description: "Brand refresh and website redesign",
      paymentMethod: null,
    },
    {
      invoiceNumber: "INV-2024-005",
      vendorName: "Legal Associates LLC",
      amount: "4200.00",
      dueDate: new Date("2024-02-28"),
      status: "Paid",
      description: "Q4 legal consultation services",
      paymentMethod: "check",
    },
  ];

  const createdInvoices = await db.insert(invoices).values(invoiceData).returning();
  console.log("✓ Invoices seeded");

  // Seed Cards
  const cardData = [
    {
      cardType: "Invoice Card",
      cardholderName: "Sarah Johnson",
      spendLimit: "5000.00",
      currentSpend: "3250.00",
      status: "Active",
      purpose: "Office Supplies - Q1 2024",
      invoiceId: createdInvoices[0].id,
      requestedBy: "John Manager",
      approvedBy: "Finance Director",
      cardNumber: "4532123456789012",
      currency: "USD",
      validUntil: new Date("2024-12-31"),
      allowedCountries: ["US", "CA"],
      channelRestriction: "both",
      isOneTimeUse: false,
      glAccountTemplate: "5000",
      departmentTemplate: "Operations",
      costCenterTemplate: "CC-003",
    },
    {
      cardType: "Expense Card",
      cardholderName: "Michael Chen",
      spendLimit: "3000.00",
      currentSpend: "1800.00",
      status: "Active",
      purpose: "Marketing Conference Travel",
      invoiceId: null,
      requestedBy: "Sarah Johnson",
      approvedBy: "VP Finance",
      cardNumber: "5412345678901234",
      currency: "USD",
      validUntil: new Date("2024-11-30"),
      allowedMerchants: ["Uber", "Airbnb", "Airlines"],
      channelRestriction: "both",
      isOneTimeUse: true,
      glAccountTemplate: "7200",
      departmentTemplate: "Marketing",
      costCenterTemplate: "CC-004",
    },
    {
      cardType: "Invoice Card",
      cardholderName: "Emily Rodriguez",
      spendLimit: "8000.00",
      currentSpend: "8000.00",
      status: "Suspended",
      purpose: "IT Equipment Purchase - Spend Limit Exhausted",
      invoiceId: createdInvoices[2].id,
      requestedBy: "David Park",
      approvedBy: "Finance Director",
      cardNumber: "4916123456789012",
      currency: "USD",
      validUntil: new Date("2024-10-31"),
      channelRestriction: "both",
      isOneTimeUse: true,
      glAccountTemplate: "6200",
      departmentTemplate: "Technology",
      costCenterTemplate: "CC-002",
    },
    {
      cardType: "Expense Card",
      cardholderName: "David Park",
      spendLimit: "2500.00",
      currentSpend: "0.00",
      status: "Pending Approval",
      purpose: "Client Entertainment",
      invoiceId: null,
      requestedBy: "Emily Rodriguez",
      approvedBy: null,
      cardNumber: null,
      currency: "USD",
      channelRestriction: "both",
      isOneTimeUse: false,
      glAccountTemplate: "7000",
      departmentTemplate: "Sales",
      costCenterTemplate: "CC-001",
    },
    {
      cardType: "Expense Card",
      cardholderName: "Jessica Liu",
      spendLimit: "1500.00",
      currentSpend: "1500.00",
      status: "Suspended",
      purpose: "Office Furniture - Single Transaction Used",
      invoiceId: null,
      requestedBy: "Operations Manager",
      approvedBy: "Finance Director",
      cardNumber: "4539876543210987",
      currency: "USD",
      channelRestriction: "both",
      isOneTimeUse: true,
      glAccountTemplate: "5100",
      departmentTemplate: "Operations",
      costCenterTemplate: "CC-003",
    },
  ];

  const createdCards = await db.insert(cards).values(cardData).returning();
  console.log("✓ Cards seeded");

  // Seed Transactions
  const transactionData = [
    {
      cardId: createdCards[0].id,
      amount: "850.00",
      vendorName: "Amazon Web Services",
      transactionDate: new Date("2024-03-10"),
      status: "Pending Receipt",
      glAccount: null,
      costCenter: null,
      memo: null,
      receiptUrl: null,
      invoiceId: createdInvoices[0].id,
    },
    {
      cardId: createdCards[1].id,
      amount: "1245.50",
      vendorName: "Acme Office Supplies",
      transactionDate: new Date("2024-03-11"),
      status: "Pending Coding",
      glAccount: null,
      costCenter: null,
      memo: null,
      receiptUrl: "https://example.com/receipt1.pdf",
      invoiceId: null,
    },
    {
      cardId: createdCards[1].id,
      amount: "2500.00",
      vendorName: "LinkedIn Ads",
      transactionDate: new Date("2024-03-12"),
      status: "Ready to Sync",
      glAccount: "7000",
      costCenter: "CC-001",
      memo: "Q1 Marketing Campaign",
      receiptUrl: "https://example.com/receipt2.pdf",
      invoiceId: null,
    },
    {
      cardId: createdCards[0].id,
      amount: "680.00",
      vendorName: "Delta Airlines",
      transactionDate: new Date("2024-03-13"),
      status: "Pending Receipt",
      glAccount: null,
      costCenter: null,
      memo: null,
      receiptUrl: null,
      invoiceId: null,
    },
    {
      cardId: createdCards[0].id,
      amount: "199.00",
      vendorName: "Zoom Video",
      transactionDate: new Date("2024-03-14"),
      status: "Ready to Sync",
      glAccount: "6200",
      costCenter: "CC-002",
      memo: "Monthly subscription",
      receiptUrl: "https://example.com/receipt3.pdf",
      invoiceId: null,
    },
  ];

  await db.insert(transactions).values(transactionData);
  console.log("✓ Transactions seeded");

  // Seed Card Approvals
  const approvalData = [
    {
      cardRequestId: createdCards[3].id,
      approverName: "Finance Manager",
      approverRole: "Finance",
      status: "Pending",
      comments: null,
      approvalLevel: 1,
      approvedAt: null,
    },
  ];

  await db.insert(cardApprovals).values(approvalData);
  console.log("✓ Card Approvals seeded");

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
