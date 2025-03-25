import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BellIcon,
  CreditCardIcon,
  DollarSignIcon,
  LineChartIcon,
  ShoppingCartIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";

// Sample data for charts
const revenueData = [
  { name: "Jan", revenue: 12000 },
  { name: "Feb", revenue: 18000 },
  { name: "Mar", revenue: 15000 },
  { name: "Apr", revenue: 22000 },
  { name: "May", revenue: 21000 },
  { name: "Jun", revenue: 25000 },
  { name: "Jul", revenue: 32000 },
];

const expensesByCategory = [
  { name: "Software", value: 3500 },
  { name: "Rent", value: 7200 },
  { name: "Marketing", value: 2800 },
  { name: "Salaries", value: 15000 },
  { name: "Equipment", value: 1500 },
];

const invoiceData = [
  { name: "Pending", value: 8 },
  { name: "Paid", value: 12 },
  { name: "Overdue", value: 3 },
];

const COLORS = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6"];
const INVOICE_COLORS = ["#f59e0b", "#10b981", "#ef4444"];

export default function Overview() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState("month");

  // Fetch finances
  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  // Fetch invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ["/api/invoices"],
    enabled: !!user,
  });

  // Calculate financial metrics
  const income = transactions.filter((t: any) => t.type === "credit").reduce((sum: number, t: any) => sum + t.amount, 0) / 100;
  const expenses = transactions.filter((t: any) => t.type === "debit").reduce((sum: number, t: any) => sum + t.amount, 0) / 100;
  const totalInvoices = invoices.length;
  const pendingInvoiceAmount = invoices.filter((i: any) => i.status === "pending").reduce((sum: number, i: any) => sum + i.amount, 0) / 100;

  const getPercentageChange = (value: number) => {
    // Mock percentage change
    const change = (Math.random() * 20 - 10).toFixed(1);
    return parseFloat(change);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeframe === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe("week")}
          >
            Week
          </Button>
          <Button
            variant={timeframe === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe("month")}
          >
            Month
          </Button>
          <Button
            variant={timeframe === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe("year")}
          >
            Year
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(income)}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <div
                className={`mr-1 ${
                  getPercentageChange(income) > 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {getPercentageChange(income) > 0 ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
              </div>
              <span
                className={
                  getPercentageChange(income) > 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {Math.abs(getPercentageChange(income))}%
              </span>
              <span className="ml-1">from last {timeframe}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(expenses)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <div
                className={`mr-1 ${
                  getPercentageChange(expenses) < 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {getPercentageChange(expenses) < 0 ? (
                  <ArrowDownIcon className="h-4 w-4" />
                ) : (
                  <ArrowUpIcon className="h-4 w-4" />
                )}
              </div>
              <span
                className={
                  getPercentageChange(expenses) < 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {Math.abs(getPercentageChange(expenses))}%
              </span>
              <span className="ml-1">from last {timeframe}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <ShoppingCartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="mr-1 text-green-500">
                <ArrowUpIcon className="h-4 w-4" />
              </div>
              <span className="text-green-500">12.5%</span>
              <span className="ml-1">from last {timeframe}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <BellIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(pendingInvoiceAmount)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="mr-1 text-red-500">
                <ArrowUpIcon className="h-4 w-4" />
              </div>
              <span className="text-red-500">5.2%</span>
              <span className="ml-1">from last {timeframe}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Trend */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${value / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, "Revenue"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Amount"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Invoices */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === "credit"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {transaction.type === "credit" ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div
                    className={
                      transaction.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {transaction.type === "credit" ? "+" : "-"}$
                    {(transaction.amount / 100).toFixed(2)}
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full mt-2">
                View All Transactions
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={invoiceData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Invoices">
                    {invoiceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={INVOICE_COLORS[index % INVOICE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Manage Invoices
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
