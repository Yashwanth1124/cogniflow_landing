import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { FinanceChart } from "@/components/dashboard/finance-chart";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, Tabslist, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Search, Download, Upload, Filter, RefreshCw, DollarSign, ArrowDownCircle, ArrowUpCircle, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FinancePage() {
  const [transactionType, setTransactionType] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: "expense",
    amount: "",
    currency: "USD",
    description: "",
    category: "",
    status: "completed"
  });
  const { toast } = useToast();

  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  // Mutation for adding a new transaction
  const addTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setShowAddDialog(false);
      setNewTransaction({
        type: "expense",
        amount: "",
        currency: "USD",
        description: "",
        category: "",
        status: "completed"
      });
      toast({
        title: "Transaction added",
        description: "Your transaction has been successfully recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleAddTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    addTransactionMutation.mutate({
      ...newTransaction,
      amount: parseFloat(newTransaction.amount),
      date: new Date().toISOString()
    });
  };

  // Filter transactions based on type
  const filteredTransactions = transactions.filter((transaction: any) => {
    if (transactionType === "all") return true;
    return transaction.type === transactionType;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  // Calculate totals
  const totalIncome = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpenses;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-16 md:ml-64">
        <Header />
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Finance Management</h1>
              <p className="text-muted-foreground">Manage your income, expenses, and financial activities</p>
            </div>
            <div className="flex gap-3 mt-3 md:mt-0">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>
                      Enter the details of your transaction below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="transaction-type">Type</Label>
                        <Select 
                          value={newTransaction.type} 
                          onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transaction-category">Category</Label>
                        <Select 
                          value={newTransaction.category} 
                          onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="investment">Investment</SelectItem>
                            <SelectItem value="food">Food & Dining</SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="transportation">Transportation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="transaction-amount">Amount</Label>
                        <Input 
                          id="transaction-amount"
                          placeholder="0.00"
                          type="number"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transaction-currency">Currency</Label>
                        <Select 
                          value={newTransaction.currency} 
                          onValueChange={(value) => setNewTransaction({...newTransaction, currency: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="JPY">JPY</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transaction-description">Description</Label>
                      <Input 
                        id="transaction-description"
                        placeholder="Enter transaction description"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                    <Button 
                      onClick={handleAddTransaction}
                      disabled={addTransactionMutation.isPending}
                    >
                      {addTransactionMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Transaction"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ArrowUpCircle className="mr-2 h-4 w-4 text-emerald-500" />
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ArrowDownCircle className="mr-2 h-4 w-4 text-rose-500" />
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-primary" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatCurrency(balance)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <FinanceChart 
                transactions={transactions}
                title="Financial Summary"
                description="Overview of your financial transactions"
                type="area"
              />
            </div>
            <div>
              <FinanceChart 
                transactions={transactions}
                title="Expense Categories"
                description="Breakdown of expenses by category"
                type="pie"
                showControls={false}
              />
            </div>
          </div>

          <div className="mb-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <CardTitle>Transactions</CardTitle>
                    <CardDescription>A list of your recent transactions</CardDescription>
                  </div>
                  <div className="mt-3 md:mt-0 flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        className="w-full sm:w-64 pl-8"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={transactionType} onValueChange={setTransactionType}>
                  <Tabslist className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="income">Income</TabsTrigger>
                    <TabsTrigger value="expense">Expenses</TabsTrigger>
                  </Tabslist>

                  <TabsContent value={transactionType} className="mt-0">
                    {isLoading ? (
                      <div className="h-72 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredTransactions.length === 0 ? (
                      <div className="h-72 flex flex-col items-center justify-center text-muted-foreground">
                        <p>No transactions found</p>
                        <Button variant="link" onClick={() => setShowAddDialog(true)}>
                          Add your first transaction
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Date</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Description</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Category</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Amount</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {filteredTransactions.slice(0, 10).map((transaction: any) => (
                                <tr key={transaction.id} className="hover:bg-muted/30">
                                  <td className="py-3 px-4 text-sm">{formatDate(transaction.date)}</td>
                                  <td className="py-3 px-4 text-sm">{transaction.description}</td>
                                  <td className="py-3 px-4 text-sm">
                                    <Badge variant="outline" className="capitalize">
                                      {transaction.category || "Uncategorized"}
                                    </Badge>
                                  </td>
                                  <td className={`py-3 px-4 text-sm font-medium ${
                                    transaction.type === 'income' 
                                      ? 'text-emerald-600 dark:text-emerald-400' 
                                      : 'text-rose-600 dark:text-rose-400'
                                  }`}>
                                    {transaction.type === 'income' ? '+' : '-'} 
                                    {formatCurrency(transaction.amount, transaction.currency)}
                                  </td>
                                  <td className="py-3 px-4 text-sm">
                                    <div className="flex items-center">
                                      {transaction.status === 'completed' ? (
                                        <div className="flex items-center">
                                          <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></div>
                                          <span className="capitalize">Completed</span>
                                        </div>
                                      ) : transaction.status === 'pending' ? (
                                        <div className="flex items-center">
                                          <Clock className="h-4 w-4 text-amber-500 mr-2" />
                                          <span className="capitalize">Pending</span>
                                        </div>
                                      ) : (
                                        <span className="capitalize">{transaction.status}</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(filteredTransactions.length, 10)} of {filteredTransactions.length} transactions
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm" disabled={filteredTransactions.length <= 10}>Next</Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function Badge({ variant, className, children }: any) {
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        variant === 'outline' 
          ? 'border border-border bg-transparent' 
          : 'bg-primary/10 text-primary'
      } ${className}`}
    >
      {children}
    </span>
  );
}
