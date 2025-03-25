import { users, type User, type InsertUser, transactions, type Transaction, type InsertTransaction, invoices, type Invoice, type InsertInvoice, messages, type Message, type InsertMessage, reports, type Report, type InsertReport, notifications, type Notification, type InsertNotification } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction operations
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Invoice operations
  getInvoicesByUserId(userId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  
  // Message operations
  getMessagesByUserId(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Report operations
  getReportsByUserId(userId: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  
  // Notification operations
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationsAsRead(userId: number, ids: number[]): Promise<void>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private invoices: Map<number, Invoice>;
  private messages: Map<number, Message>;
  private reports: Map<number, Report>;
  private notifications: Map<number, Notification>;
  
  sessionStore: session.SessionStore;
  currentId: {
    users: number;
    transactions: number;
    invoices: number;
    messages: number;
    reports: number;
    notifications: number;
  };

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.invoices = new Map();
    this.messages = new Map();
    this.reports = new Map();
    this.notifications = new Map();
    
    this.currentId = {
      users: 1,
      transactions: 1,
      invoices: 1,
      messages: 1,
      reports: 1,
      notifications: 1
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create demo user
    this.createUser({
      username: "demo",
      password: "$2b$10$jvZjwNxYs5PrBQQN9xj5aO8zLPGjhC4OdaYI3z6wnEkQwydBwVOSq", // "password"
      fullName: "Demo User",
      email: "demo@cogniflow.com",
      company: "Cogniflow Inc",
      role: "admin"
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "user",
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  // Transaction Methods
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId,
    );
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentId.transactions++;
    const now = new Date();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      date: now
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  // Invoice Methods
  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (invoice) => invoice.userId === userId,
    );
  }
  
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentId.invoices++;
    const now = new Date();
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      createdAt: now,
      items: insertInvoice.items || []
    };
    this.invoices.set(id, invoice);
    return invoice;
  }
  
  // Message Methods
  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.userId === userId,
    );
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentId.messages++;
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: now
    };
    this.messages.set(id, message);
    return message;
  }
  
  // Report Methods
  async getReportsByUserId(userId: number): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(
      (report) => report.userId === userId,
    );
  }
  
  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = this.currentId.reports++;
    const now = new Date();
    const report: Report = {
      ...insertReport,
      id,
      createdAt: now
    };
    this.reports.set(id, report);
    return report;
  }
  
  // Notification Methods
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId,
    );
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentId.notifications++;
    const now = new Date();
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: now
    };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationsAsRead(userId: number, ids: number[]): Promise<void> {
    for (const id of ids) {
      const notification = this.notifications.get(id);
      if (notification && notification.userId === userId) {
        notification.read = true;
        this.notifications.set(id, notification);
      }
    }
  }
}

export const storage = new MemStorage();

// Initialize with sample data for demo purposes
(async () => {
  const demoUser = await storage.getUserByUsername("demo");
  if (demoUser) {
    const userId = demoUser.id;
    
    // Create sample transactions
    await storage.createTransaction({
      userId,
      amount: 5000,
      description: "Client payment - ABC Corp",
      type: "credit",
      category: "income",
      status: "completed"
    });
    
    await storage.createTransaction({
      userId,
      amount: 1200,
      description: "Office rent",
      type: "debit",
      category: "expense",
      status: "completed"
    });
    
    await storage.createTransaction({
      userId,
      amount: 750,
      description: "Software subscription",
      type: "debit",
      category: "expense",
      status: "completed"
    });
    
    // Create sample invoices
    await storage.createInvoice({
      userId,
      clientName: "TechCorp Inc.",
      amount: 3500,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: "pending",
      items: [
        { description: "Web Development", quantity: 20, price: 100 },
        { description: "UI/UX Design", quantity: 15, price: 100 }
      ]
    });
    
    await storage.createInvoice({
      userId,
      clientName: "Global Solutions Ltd.",
      amount: 2800,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: "pending",
      items: [
        { description: "Server Maintenance", quantity: 1, price: 800 },
        { description: "Security Audit", quantity: 2, price: 1000 }
      ]
    });
    
    // Create sample notifications
    await storage.createNotification({
      userId,
      message: "Invoice #1001 is due in 3 days",
      type: "warning",
      read: false
    });
    
    await storage.createNotification({
      userId,
      message: "New payment received from TechCorp Inc.",
      type: "info",
      read: false
    });
    
    await storage.createNotification({
      userId,
      message: "AI analysis detected potential fraud in transaction #1002",
      type: "error",
      read: false
    });
    
    // Create sample messages
    await storage.createMessage({
      userId,
      content: "Hello! How can I help you with Cogniflow today?",
      isAi: true
    });
    
    await storage.createMessage({
      userId,
      content: "I need help with generating a financial report",
      isAi: false
    });
    
    await storage.createMessage({
      userId,
      content: "Sure, I can help with that. What timeframe would you like to analyze?",
      isAi: true
    });
    
    // Create sample reports
    await storage.createReport({
      userId,
      title: "Monthly Financial Summary",
      type: "financial",
      data: {
        revenue: 12500,
        expenses: 7800,
        profit: 4700,
        transactions: 24,
        topExpenseCategories: ["Software", "Rent", "Marketing"]
      }
    });
    
    await storage.createReport({
      userId,
      title: "Cash Flow Forecast",
      type: "financial",
      data: {
        currentBalance: 25600,
        projectedIncome: [
          { month: "July", amount: 15000 },
          { month: "August", amount: 16500 },
          { month: "September", amount: 14800 }
        ],
        projectedExpenses: [
          { month: "July", amount: 8200 },
          { month: "August", amount: 8500 },
          { month: "September", amount: 9100 }
        ]
      }
    });
  }
})();
