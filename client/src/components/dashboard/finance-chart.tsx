import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  currency: string;
  description?: string;
  category?: string;
  date: string;
  status: string;
}

interface ChartData {
  name: string;
  income: number;
  expenses: number;
  profit: number;
}

interface FinanceChartProps {
  transactions: Transaction[];
  title?: string;
  description?: string;
  type?: "area" | "bar" | "pie";
  height?: number;
  showControls?: boolean;
}

const COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];

export function FinanceChart({
  transactions,
  title = "Financial Overview",
  description = "Track your income and expenses over time",
  type = "area",
  height = 350,
  showControls = true
}: FinanceChartProps) {
  const [timeRange, setTimeRange] = useState("month");

  const chartData: ChartData[] = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Group transactions by date
    const groupedData: Record<string, ChartData> = {};
    
    // Define date format based on time range
    const getDateKey = (date: string) => {
      const d = new Date(date);
      if (timeRange === 'year') {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else if (timeRange === 'week') {
        // Get ISO week number
        const dayOfWeek = d.getDay() || 7; // Make Sunday 7
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - dayOfWeek + 1);
        return startOfWeek.toISOString().slice(0, 10);
      } else {
        // Default to day view for month
        return d.toISOString().slice(0, 10);
      }
    };

    // Calculate name format based on time range
    const formatName = (dateKey: string) => {
      if (timeRange === 'year') {
        const [year, month] = dateKey.split('-');
        return `${new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('default', { month: 'short' })} ${year}`;
      } else if (timeRange === 'week') {
        const date = new Date(dateKey);
        return `Week ${Math.ceil((date.getDate() + (date.getDay() || 7) - 1) / 7)} - ${date.toLocaleString('default', { month: 'short' })}`;
      } else {
        const date = new Date(dateKey);
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
      }
    };

    // Process transactions
    transactions.forEach(transaction => {
      const dateKey = getDateKey(transaction.date);
      
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          name: formatName(dateKey),
          income: 0,
          expenses: 0,
          profit: 0
        };
      }

      if (transaction.type === 'income') {
        groupedData[dateKey].income += transaction.amount;
        groupedData[dateKey].profit += transaction.amount;
      } else if (transaction.type === 'expense') {
        groupedData[dateKey].expenses += transaction.amount;
        groupedData[dateKey].profit -= transaction.amount;
      }
    });

    // Convert to array and sort by date
    return Object.keys(groupedData)
      .sort()
      .map(key => groupedData[key]);
  }, [transactions, timeRange]);

  // Calculate category data for pie chart
  const categoryData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const expensesByCategory: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense' && transaction.category) {
        const category = transaction.category || 'Uncategorized';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + transaction.amount;
      }
    });

    return Object.keys(expensesByCategory).map(category => ({
      name: category,
      value: expensesByCategory[category]
    }));
  }, [transactions]);

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#3B82F6" name="Income" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              <Bar dataKey="profit" fill="#10B981" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="2"
                stroke="#EF4444"
                fill="#EF4444"
                name="Expenses"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stackId="3"
                stroke="#10B981"
                fill="#10B981"
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {showControls && (
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No data available for the selected period
          </div>
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  );
}
