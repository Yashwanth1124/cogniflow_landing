import { useQuery } from "@tanstack/react-query";
import { DataCard } from "@/components/ui/data-card";
import { AnalyticsChart } from "@/components/ui/analytics-chart";
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, FileText } from "lucide-react";
import { Transaction } from "@shared/schema";

export function FinanceWidget() {
  // Fetch transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Calculate financial metrics
  const calculateMetrics = () => {
    if (!transactions) return { income: 0, expenses: 0, balance: 0 };

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((total, t) => total + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((total, t) => total + t.amount, 0);

    const balance = income - expenses;

    return {
      income,
      expenses,
      balance,
    };
  };

  const metrics = calculateMetrics();

  // Prepare chart data
  const prepareChartData = () => {
    if (!transactions) return [];

    // Group transactions by date
    const grouped = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          income: 0,
          expense: 0,
        };
      }
      
      if (transaction.type === "income") {
        acc[dateKey].income += transaction.amount;
      } else if (transaction.type === "expense") {
        acc[dateKey].expense += transaction.amount;
      }
      
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    // Convert to array and sort by date
    return Object.entries(grouped)
      .map(([date, values]) => ({
        name: date,
        income: values.income / 100, // Convert cents to dollars for readability
        expense: values.expense / 100,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-7); // Get last 7 days
  };

  const chartData = prepareChartData();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DataCard
        title="Income"
        value={`$${(metrics.income / 100).toLocaleString()}`}
        icon={ArrowUpRight}
        trend={{ value: 12.5, isPositive: true }}
        loading={isLoadingTransactions}
        className="bg-green-50 dark:bg-green-950/30"
      />
      <DataCard
        title="Expenses"
        value={`$${(metrics.expenses / 100).toLocaleString()}`}
        icon={ArrowDownRight}
        trend={{ value: 8.2, isPositive: false }}
        loading={isLoadingTransactions}
        className="bg-red-50 dark:bg-red-950/30"
      />
      <DataCard
        title="Balance"
        value={`$${(metrics.balance / 100).toLocaleString()}`}
        icon={DollarSign}
        loading={isLoadingTransactions}
        className="bg-blue-50 dark:bg-blue-950/30"
      />
      <DataCard
        title="Pending Invoices"
        value="12"
        icon={FileText}
        description="3 overdue"
        loading={isLoadingTransactions}
        className="bg-orange-50 dark:bg-orange-950/30"
      />

      <div className="col-span-full">
        <AnalyticsChart
          title="Financial Overview"
          description="Income vs expenses for the last 7 days"
          data={chartData}
          type="bar"
          dataKeys={["income", "expense"]}
          colors={["#10B981", "#EF4444"]}
          loading={isLoadingTransactions}
          xAxisLabel="Date"
          yAxisLabel="Amount ($)"
        />
      </div>
    </div>
  );
}
