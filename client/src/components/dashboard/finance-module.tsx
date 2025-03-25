import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  PlusIcon,
  SearchIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FileTextIcon,
  DollarSignIcon,
  AlertTriangleIcon,
  ArrowUpDownIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FinanceModule() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("transactions");
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    description: "",
    amount: "",
    type: "debit", // debit or credit
    category: "",
  });
  const [invoiceForm, setInvoiceForm] = useState({
    clientName: "",
    amount: "",
    dueDate: "",
    items: [{ description: "", quantity: 1, price: 0 }],
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  // Fetch invoices
  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["/api/invoices"],
    enabled: !!user,
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setShowTransactionDialog(false);
      setTransactionForm({
        description: "",
        amount: "",
        type: "debit",
        category: "",
      });
      toast({
        title: "Transaction Created",
        description: "Your transaction has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create transaction",
        variant: "destructive",
      });
    },
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/invoices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setShowInvoiceDialog(false);
      setInvoiceForm({
        clientName: "",
        amount: "",
        dueDate: "",
        items: [{ description: "", quantity: 1, price: 0 }],
      });
      toast({
        title: "Invoice Created",
        description: "Your invoice has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  // Handle transaction form change
  const handleTransactionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransactionForm({ ...transactionForm, [name]: value });
  };

  // Handle invoice form change
  const handleInvoiceFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceForm({ ...invoiceForm, [name]: value });
  };

  // Handle invoice item change
  const handleInvoiceItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...invoiceForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  // Add invoice item
  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { description: "", quantity: 1, price: 0 }],
    });
  };

  // Remove invoice item
  const removeInvoiceItem = (index: number) => {
    if (invoiceForm.items.length > 1) {
      const newItems = [...invoiceForm.items];
      newItems.splice(index, 1);
      setInvoiceForm({ ...invoiceForm, items: newItems });
    }
  };

  // Submit transaction form
  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTransactionMutation.mutate({
      ...transactionForm,
      amount: parseFloat(transactionForm.amount) * 100, // Convert to cents
    });
  };

  // Calculate total invoice amount
  const calculateInvoiceTotal = () => {
    return invoiceForm.items.reduce(
      (total, item) => total + (item.quantity * item.price),
      0
    );
  };

  // Submit invoice form
  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoiceMutation.mutate({
      ...invoiceForm,
      amount: calculateInvoiceTotal() * 100, // Convert to cents
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
        <div className="flex space-x-2">
          {activeTab === "transactions" && (
            <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                  <DialogDescription>
                    Enter the details of the transaction below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTransactionSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        value={transactionForm.description}
                        onChange={handleTransactionFormChange}
                        placeholder="E.g., Office Supplies"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        value={transactionForm.amount}
                        onChange={handleTransactionFormChange}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Type</Label>
                      <Select 
                        name="type" 
                        value={transactionForm.type}
                        onValueChange={(value) => setTransactionForm({...transactionForm, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debit">Expense (Debit)</SelectItem>
                          <SelectItem value="credit">Income (Credit)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        name="category"
                        value={transactionForm.category}
                        onChange={handleTransactionFormChange}
                        placeholder="E.g., Office, Marketing"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createTransactionMutation.isPending}>
                      {createTransactionMutation.isPending ? "Saving..." : "Save Transaction"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {activeTab === "invoices" && (
            <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" /> Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                  <DialogDescription>
                    Fill in the invoice details below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInvoiceSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="clientName">Client Name</Label>
                        <Input
                          id="clientName"
                          name="clientName"
                          value={invoiceForm.clientName}
                          onChange={handleInvoiceFormChange}
                          placeholder="Client Name"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          name="dueDate"
                          type="date"
                          value={invoiceForm.dueDate}
                          onChange={handleInvoiceFormChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Invoice Items</Label>
                      <div className="border rounded-md p-3 space-y-3">
                        {invoiceForm.items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2">
                            <div className="col-span-6">
                              <Input
                                placeholder="Item description"
                                value={item.description}
                                onChange={(e) =>
                                  handleInvoiceItemChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                min="1"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleInvoiceItemChange(
                                    index,
                                    "quantity",
                                    parseInt(e.target.value)
                                  )
                                }
                                required
                              />
                            </div>
                            <div className="col-span-3">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Price"
                                value={item.price}
                                onChange={(e) =>
                                  handleInvoiceItemChange(
                                    index,
                                    "price",
                                    parseFloat(e.target.value)
                                  )
                                }
                                required
                              />
                            </div>
                            <div className="col-span-1 flex items-center justify-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => removeInvoiceItem(index)}
                                disabled={invoiceForm.items.length <= 1}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addInvoiceItem}
                        >
                          <PlusIcon className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold">
                        ${calculateInvoiceTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createInvoiceMutation.isPending}>
                      {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="transactions" value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b px-6">
                <TabsList className="mx-0 my-3 justify-start rounded-none space-x-6 border-0 bg-transparent p-0">
                  <TabsTrigger
                    value="transactions"
                    className="rounded px-0 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Transactions
                  </TabsTrigger>
                  <TabsTrigger
                    value="invoices"
                    className="rounded px-0 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Invoices
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="relative w-64">
                    <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-8"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="recent">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
                        <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <TabsContent value="transactions" className="mt-0">
                  {isLoadingTransactions ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-10">
                      <FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">No transactions</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new transaction.</p>
                      <div className="mt-6">
                        <Button onClick={() => setShowTransactionDialog(true)}>
                          <PlusIcon className="mr-2 h-4 w-4" /> Add Transaction
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction: any) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <div className={`h-8 w-8 mr-2 rounded-full flex items-center justify-center ${
                                  transaction.type === "credit" 
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}>
                                  {transaction.type === "credit" ? (
                                    <ArrowUpIcon className="h-4 w-4" />
                                  ) : (
                                    <ArrowDownIcon className="h-4 w-4" />
                                  )}
                                </div>
                                <span>{transaction.description}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {transaction.category ? (
                                <Badge variant="outline">{transaction.category}</Badge>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(transaction.date)}</TableCell>
                            <TableCell className={`text-right font-medium ${
                              transaction.type === "credit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}>
                              {transaction.type === "credit" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={transaction.status === "completed" ? "success" : transaction.status === "pending" ? "warning" : "destructive"}>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="invoices" className="mt-0">
                  {isLoadingInvoices ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="text-center py-10">
                      <FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">No invoices</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new invoice.</p>
                      <div className="mt-6">
                        <Button onClick={() => setShowInvoiceDialog(true)}>
                          <PlusIcon className="mr-2 h-4 w-4" /> Create Invoice
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice: any) => (
                          <TableRow key={invoice.id}>
                            <TableCell>INV-{invoice.id.toString().padStart(5, '0')}</TableCell>
                            <TableCell className="font-medium">{invoice.clientName}</TableCell>
                            <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                            <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(invoice.amount)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  invoice.status === "paid"
                                    ? "success"
                                    : invoice.status === "pending"
                                    ? "warning"
                                    : "destructive"
                                }
                              >
                                {invoice.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
