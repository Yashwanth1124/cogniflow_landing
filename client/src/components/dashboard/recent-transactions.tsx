import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Plus,
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export function RecentTransactions() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Function to render transaction icon based on type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "income":
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        );
      case "expense":
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <ArrowDownRight className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        );
      case "transfer":
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <ArrowLeftRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        );
      default:
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <ArrowLeftRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        );
    }
  };

  // Function to format amount
  const formatAmount = (amount: number, type: string, currency: string) => {
    const prefix = type === "expense" ? "-" : type === "income" ? "+" : "";
    return `${prefix}${currency}${(amount / 100).toFixed(2)}`;
  };

  // Function to get amount color class based on type
  const getAmountColor = (type: string) => {
    switch (type) {
      case "income":
        return "text-green-600 dark:text-green-400";
      case "expense":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-semibold">
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Your latest financial activities
          </CardDescription>
        </div>
        <Button size="sm" className="gap-1" asChild>
          <Link href="/finance">
            <Plus className="h-4 w-4" /> New
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!transactions || transactions.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No transactions yet</h3>
            <p className="text-muted-foreground mt-1">
              When you create transactions, they'll appear here.
            </p>
            <Button className="mt-4" size="sm" asChild>
              <Link href="/finance">Create transaction</Link>
            </Button>
          </div>
        )}

        {!isLoading &&
          transactions &&
          transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                {getTransactionIcon(transaction.type)}
                <div>
                  <div className="font-medium">{transaction.category}</div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.description
                      ? transaction.description
                      : `${transaction.type.charAt(0).toUpperCase()}${transaction.type.slice(1)}`}{" "}
                    • {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div
                  className={`font-medium ${getAmountColor(transaction.type)}`}
                >
                  {formatAmount(
                    transaction.amount,
                    transaction.type,
                    transaction.currency
                  )}
                </div>
                {getStatusBadge(transaction.status)}
              </div>
            </div>
          ))}
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/finance">View all transactions</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
