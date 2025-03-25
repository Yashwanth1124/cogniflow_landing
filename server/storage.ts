import { type User, type InsertUser, type Transaction, type InsertTransaction, type Invoice, type InsertInvoice, type Message, type InsertMessage, type Report, type InsertReport, type Notification, type InsertNotification } from "@shared/schema";
import { UserModel } from './models/user.model';
import { TransactionModel } from './models/transaction.model';
import { InvoiceModel } from './models/invoice.model';
import { MessageModel } from './models/message.model';
import { ReportModel } from './models/report.model';
import { NotificationModel } from './models/notification.model';
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getInvoicesByUserId(userId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getMessagesByUserId(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getReportsByUserId(userId: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationsAsRead(userId: number, ids: number[]): Promise<void>;
  sessionStore: any;
}

export class MongoStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const user = await UserModel.findOne({ id });
    return user ? user.toJSON() : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username });
    return user ? user.toJSON() : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const lastUser = await UserModel.findOne().sort({ id: -1 });
    const id = (lastUser?.id || 0) + 1;
    const user = await UserModel.create({ ...insertUser, id });
    return user.toJSON();
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    const transactions = await TransactionModel.find({ userId });
    return transactions.map(t => t.toJSON());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const transaction = await TransactionModel.create(insertTransaction);
    return transaction.toJSON();
  }

  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    const invoices = await InvoiceModel.find({ userId });
    return invoices.map(i => i.toJSON());
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const invoice = await InvoiceModel.create(insertInvoice);
    return invoice.toJSON();
  }

  async getMessagesByUserId(userId: number): Promise<Message[]> {
    const messages = await MessageModel.find({ userId });
    return messages.map(m => m.toJSON());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message = await MessageModel.create(insertMessage);
    return message.toJSON();
  }

  async getReportsByUserId(userId: number): Promise<Report[]> {
    const reports = await ReportModel.find({ userId });
    return reports.map(r => r.toJSON());
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const report = await ReportModel.create(insertReport);
    return report.toJSON();
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    const notifications = await NotificationModel.find({ userId });
    return notifications.map(n => n.toJSON());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification = await NotificationModel.create(insertNotification);
    return notification.toJSON();
  }

  async markNotificationsAsRead(userId: number, ids: number[]): Promise<void> {
    await NotificationModel.updateMany(
      { userId, _id: { $in: ids } },
      { $set: { read: true } }
    );
  }
}

export const storage = new MongoStorage();