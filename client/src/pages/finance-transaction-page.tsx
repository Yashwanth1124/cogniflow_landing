import { useState, useEffect } from 'react';
import { useOffline } from '@/context/offline-context';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { PlusIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Define the form schema
const formSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  type: z.string().min(1, { message: 'Please select a transaction type' }),
  description: z.string().min(3, { message: 'Description must be at least 3 characters' }),
  category: z.string().min(1, { message: 'Please select a category' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinanceTransactionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { 
    isOnline, 
    isSyncing, 
    pendingChanges, 
    syncNow, 
    createTransaction,
    getTransactions 
  } = useOffline();
  
  const [transactions, setTransactions] = useState<any[]>([]);

  // Load transactions
  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast({
        title: 'Failed to load transactions',
        description: 'There was a problem fetching your transactions.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      type: 'expense',
      description: '',
      category: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create transactions.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const newTransaction = {
        ...values,
        userId: user.id,
        date: new Date(),
        status: 'completed',
      };

      await createTransaction(newTransaction);
      
      toast({
        title: 'Transaction created',
        description: isOnline 
          ? 'Your transaction has been saved.' 
          : 'Your transaction has been saved offline and will sync when you reconnect.',
      });
      
      form.reset({
        amount: 0,
        type: 'expense',
        description: '',
        category: '',
      });
      
      // Reload transactions
      loadTransactions();
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast({
        title: 'Failed to create transaction',
        description: 'There was a problem creating your transaction.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, []);

  // Generate a badge for transaction status
  const getStatusBadge = (transaction: any) => {
    if (transaction.createdOffline) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Pending Sync
        </Badge>
      );
    }
    
    switch (transaction.status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {transaction.status}
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="flex items-center gap-2">
          {pendingChanges > 0 && isOnline && (
            <Button 
              onClick={syncNow} 
              variant="outline" 
              disabled={isSyncing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : `Sync (${pendingChanges})`}
            </Button>
          )}
          <Button onClick={loadTransactions} variant="outline" disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Transaction Form */}
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>New Transaction</CardTitle>
              <CardDescription>
                {isOnline 
                  ? 'Create a new transaction entry' 
                  : 'Create a new transaction (offline mode)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isOnline && (
                <Alert className="mb-4 bg-yellow-50 text-yellow-800 border-yellow-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>You are offline</AlertTitle>
                  <AlertDescription>
                    Transactions created while offline will be synchronized when your internet connection is restored.
                  </AlertDescription>
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="0.00" 
                            type="number" 
                            step="0.01" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Transaction Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-2"
                          >
                            <FormItem className="flex items-center space-x-1 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="expense" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Expense
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-1 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="income" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Income
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-1 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="transfer" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Transfer
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a description" {...field} />
                        </FormControl>
                        <FormDescription>
                          Brief description of the transaction
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="housing">Housing</SelectItem>
                            <SelectItem value="transportation">Transportation</SelectItem>
                            <SelectItem value="food">Food & Dining</SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="entertainment">Entertainment</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="investments">Investments</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full mt-4 gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4" />
                        Create Transaction
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        {/* Transactions List */}
        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                View and manage your recent financial activities
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin mb-2" />
                      <p>Loading transactions...</p>
                    </div>
                  ) : (
                    <p>No transactions found. Create one to get started.</p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {transactions.map((transaction) => (
                        <tr 
                          key={transaction.id} 
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            transaction.createdOffline ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                          }`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">{transaction.description}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="outline">{transaction.category}</Badge>
                          </td>
                          <td className={`px-4 py-3 text-sm font-medium ${
                            transaction.type === 'expense' 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {transaction.type === 'expense' ? '-' : '+'}
                            ${transaction.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {getStatusBadge(transaction)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}