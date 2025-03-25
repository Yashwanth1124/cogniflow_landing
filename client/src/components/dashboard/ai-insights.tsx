import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  BrainCircuitIcon,
  TrendingUpIcon,
  ShieldAlertIcon,
  RefreshCwIcon,
  SearchIcon,
  BellIcon,
  ArrowRightIcon,
  LineChartIcon,
  PieChartIcon,
  BarChartIcon,
  AlertTriangleIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

export default function AIInsights() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("financial");
  const [transactionIdToAnalyze, setTransactionIdToAnalyze] = useState("");
  const [forecastMonths, setForecastMonths] = useState("3");

  // Get financial analysis
  const { 
    data: financialAnalysis,
    isLoading: isLoadingAnalysis,
    refetch: refetchAnalysis,
  } = useQuery({
    queryKey: ["/api/ai/financial-analysis"],
    enabled: !!user,
  });

  // Get forecast data
  const { 
    data: forecastData,
    isLoading: isLoadingForecast,
    refetch: refetchForecast,
  } = useQuery({
    queryKey: ["/api/ai/forecast", forecastMonths],
    queryFn: async ({ queryKey }) => {
      const [_, months] = queryKey;
      const res = await apiRequest("POST", "/api/ai/forecast", { months: parseInt(months as string) });
      return res.json();
    },
    enabled: !!user,
  });

  // Fraud detection mutation
  const fraudDetectionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const res = await apiRequest("POST", "/api/ai/fraud-detection", { transactionId });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: `Risk Score: ${data.riskScore.toFixed(1)}`,
        description: data.isSuspicious 
          ? "This transaction was flagged as suspicious. Please review."
          : "This transaction appears legitimate.",
        variant: data.isSuspicious ? "destructive" : "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze transaction",
        variant: "destructive",
      });
    },
  });

  // Handle fraud detection analysis
  const handleFraudDetection = () => {
    if (!transactionIdToAnalyze) {
      toast({
        title: "Error",
        description: "Please enter a transaction ID",
        variant: "destructive",
      });
      return;
    }
    fraudDetectionMutation.mutate(transactionIdToAnalyze);
  };

  // Sample forecast chart data
  const forecastChartData = forecastData?.forecast?.map((item: any, index: number) => ({
    month: `Month ${item.month}`,
    amount: item.amount / 100,
    confidence: item.confidence * 100,
  })) || [];

  // Sample cash flow data
  const cashFlowData = [
    { name: "Jan", income: 14500, expenses: 8000 },
    { name: "Feb", income: 16200, expenses: 8300 },
    { name: "Mar", income: 15300, expenses: 9100 },
    { name: "Apr", income: 18600, expenses: 9500 },
    { name: "May", income: 17900, expenses: 9800 },
    { name: "Jun", income: 19800, expenses: 10100 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground">
            AI-powered analytics and insights for your business
          </p>
        </div>
      </div>

      <Tabs defaultValue="financial" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 max-w-md mb-4">
          <TabsTrigger value="financial" className="flex items-center">
            <LineChartIcon className="mr-2 h-4 w-4" /> Financial
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center">
            <TrendingUpIcon className="mr-2 h-4 w-4" /> Forecast
          </TabsTrigger>
          <TabsTrigger value="fraud" className="flex items-center">
            <ShieldAlertIcon className="mr-2 h-4 w-4" /> Fraud Detection
          </TabsTrigger>
        </TabsList>

        {/* Financial Analysis */}
        <TabsContent value="financial">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>AI Financial Analysis</CardTitle>
                  <CardDescription>
                    AI-powered insights based on your financial data
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => refetchAnalysis()}
                  disabled={isLoadingAnalysis}
                >
                  <RefreshCwIcon className={`h-4 w-4 ${isLoadingAnalysis ? 'animate-spin' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingAnalysis ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <h3 className="font-bold flex items-center mb-2">
                        <BrainCircuitIcon className="mr-2 h-5 w-5 text-primary" />
                        Financial Summary
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {financialAnalysis?.summary || "Not enough data to perform analysis. Please add more transactions."}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-bold mb-3 flex items-center">
                        <BellIcon className="mr-2 h-5 w-5 text-primary" />
                        AI Recommendations
                      </h3>
                      <div className="space-y-2">
                        {financialAnalysis?.recommendations?.map((rec: string, index: number) => (
                          <Card key={index} className="p-3">
                            <div className="flex">
                              <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                                <span className="text-xs font-bold text-primary">{index + 1}</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{rec}</p>
                            </div>
                          </Card>
                        )) || (
                          <p className="text-gray-500 italic">No recommendations available yet. Add more transactions for AI analysis.</p>
                        )}
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, ""]} />
                        <Legend />
                        <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Income" />
                        <Area type="monotone" dataKey="expenses" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Expenses" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
                <CardDescription>AI-powered analysis of financial risks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cashflow Risk</h3>
                    <div className="mt-2 flex items-center">
                      <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">M</span>
                      </div>
                      <span className="text-lg font-bold">Medium</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                      Based on your current cash reserves and projected expenses
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fraud Risk</h3>
                    <div className="mt-2 flex items-center">
                      <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">L</span>
                      </div>
                      <span className="text-lg font-bold">Low</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                      Your security measures are effective at preventing fraud
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Credit Risk</h3>
                    <div className="mt-2 flex items-center">
                      <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">L</span>
                      </div>
                      <span className="text-lg font-bold">Low</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                      Your business maintains good financial health and stability
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Forecast */}
        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Revenue Forecast</CardTitle>
                  <CardDescription>
                    AI-powered revenue predictions based on historical data
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                  <Label htmlFor="forecastMonths" className="mr-2">Forecast Months:</Label>
                  <Input
                    id="forecastMonths"
                    type="number"
                    min={1}
                    max={12}
                    value={forecastMonths}
                    onChange={(e) => setForecastMonths(e.target.value)}
                    className="w-20"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => refetchForecast()}
                    disabled={isLoadingForecast}
                  >
                    <RefreshCwIcon className={`h-4 w-4 ${isLoadingForecast ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingForecast ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <h3 className="font-bold flex items-center mb-2">
                      <TrendingUpIcon className="mr-2 h-5 w-5 text-primary" />
                      Forecast Analysis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {forecastData?.message || "Not enough historical data to make accurate predictions."}
                    </p>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={forecastChartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Confidence (%)', angle: 90, position: 'insideRight' }} />
                        <Tooltip formatter={(value, name) => [name === 'amount' ? `$${value}` : `${value}%`, name === 'amount' ? 'Predicted Amount' : 'Confidence']} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="amount" stroke="#3b82f6" name="Predicted Amount" />
                        <Line yAxisId="right" type="monotone" dataKey="confidence" stroke="#10b981" name="Confidence" strokeDasharray="3 3" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Card className="p-4">
                      <div className="flex flex-col">
                        <h4 className="text-sm font-medium text-gray-500">Total Predicted Revenue</h4>
                        <div className="mt-2 text-3xl font-bold">
                          ${forecastChartData.reduce((sum: number, data: any) => sum + data.amount, 0).toFixed(2)}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-green-600">
                          <ArrowRightIcon className="mr-1 h-4 w-4" />
                          <span>For the next {forecastMonths} months</span>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex flex-col">
                        <h4 className="text-sm font-medium text-gray-500">Average Monthly Revenue</h4>
                        <div className="mt-2 text-3xl font-bold">
                          ${(forecastChartData.reduce((sum: number, data: any) => sum + data.amount, 0) / forecastChartData.length || 0).toFixed(2)}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-green-600">
                          <ArrowRightIcon className="mr-1 h-4 w-4" />
                          <span>Expected monthly average</span>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex flex-col">
                        <h4 className="text-sm font-medium text-gray-500">Forecast Confidence</h4>
                        <div className="mt-2 text-3xl font-bold">
                          {(forecastChartData.reduce((sum: number, data: any) => sum + data.confidence, 0) / forecastChartData.length || 0).toFixed(1)}%
                        </div>
                        <div className="mt-2 flex items-center text-sm text-blue-600">
                          <ArrowRightIcon className="mr-1 h-4 w-4" />
                          <span>Overall prediction confidence</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fraud Detection */}
        <TabsContent value="fraud">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Fraud Detection</CardTitle>
                <CardDescription>
                  AI-powered analysis to detect potentially fraudulent transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="transactionId">Transaction ID</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="transactionId"
                        placeholder="Enter transaction ID"
                        value={transactionIdToAnalyze}
                        onChange={(e) => setTransactionIdToAnalyze(e.target.value)}
                      />
                      <Button 
                        onClick={handleFraudDetection}
                        disabled={fraudDetectionMutation.isPending || !transactionIdToAnalyze}
                      >
                        {fraudDetectionMutation.isPending ? (
                          <>
                            <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <SearchIcon className="mr-2 h-4 w-4" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-2">How it works:</h3>
                    <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300 list-decimal list-inside">
                      <li>Enter a transaction ID to analyze.</li>
                      <li>Our AI model will assess the transaction based on multiple factors.</li>
                      <li>You'll receive a risk score and detailed analysis.</li>
                      <li>High-risk transactions will be flagged for review.</li>
                    </ol>
                  </div>

                  {fraudDetectionMutation.data && (
                    <div className={`border rounded-lg p-4 ${
                      fraudDetectionMutation.data.isSuspicious
                        ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900"
                        : "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900"
                    }`}>
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          fraudDetectionMutation.data.isSuspicious
                            ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                            : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                        }`}>
                          {fraudDetectionMutation.data.isSuspicious ? (
                            <AlertTriangleIcon className="h-5 w-5" />
                          ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold">
                            {fraudDetectionMutation.data.isSuspicious
                              ? "Suspicious Transaction Detected"
                              : "Transaction Appears Legitimate"}
                          </h3>
                          <div className="mt-2">
                            <p className="text-sm">
                              <span className="font-medium">Risk Score:</span>{" "}
                              {fraudDetectionMutation.data.riskScore.toFixed(1)}/100
                            </p>
                            <div className="mt-1">
                              <span className="text-sm font-medium">Reasons:</span>
                              <ul className="mt-1 list-disc list-inside text-sm">
                                {fraudDetectionMutation.data.reasons.map((reason: string, index: number) => (
                                  <li key={index}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                            <p className="mt-2 text-sm font-medium">
                              Recommendation: {fraudDetectionMutation.data.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Suspicious Activity</CardTitle>
                <CardDescription>
                  AI-flagged transactions that require attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      3 items require attention
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-sm">
                      View all
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {/* Alert items */}
                    <Card className="p-3 border-l-4 border-l-yellow-500">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium flex items-center">
                            <AlertTriangleIcon className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>Invoice #1057 - Unusual Amount</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Amount is 250% higher than average for this vendor
                          </p>
                        </div>
                        <Badge>Medium Risk</Badge>
                      </div>
                    </Card>

                    <Card className="p-3 border-l-4 border-l-red-500">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium flex items-center">
                            <AlertTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                            <span>Transaction #4938 - Potential Duplicate</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Similar transaction was processed within 24 hours
                          </p>
                        </div>
                        <Badge variant="destructive">High Risk</Badge>
                      </div>
                    </Card>

                    <Card className="p-3 border-l-4 border-l-yellow-500">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium flex items-center">
                            <AlertTriangleIcon className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>Vendor #32 - Location Mismatch</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Transaction origin doesn't match vendor's registered location
                          </p>
                        </div>
                        <Badge>Medium Risk</Badge>
                      </div>
                    </Card>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
                    <h3 className="font-medium mb-2">AI Fraud Prevention Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Fraud attempts prevented</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Money saved</p>
                        <p className="text-2xl font-bold">$14,320</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">False positives</p>
                        <p className="text-2xl font-bold">3.2%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Detection accuracy</p>
                        <p className="text-2xl font-bold">96.8%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
