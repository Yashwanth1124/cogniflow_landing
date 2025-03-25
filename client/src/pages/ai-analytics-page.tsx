import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { AnalyticsChart } from "@/components/ui/analytics-chart";
import { DataCard } from "@/components/ui/data-card";
import { AiInsight } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  TrendingUp,
  AlertTriangle,
  Brain,
  Lightbulb,
  RefreshCw,
  Zap,
  ChevronRight,
  MessagesSquare,
  Clock,
  DollarSign,
  Shield,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function AiAnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState("insights");
  const [aiQuery, setAiQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState<{
    insights: boolean;
    fraud: boolean;
    forecast: boolean;
  }>({
    insights: false,
    fraud: false,
    forecast: false,
  });
  
  const { toast } = useToast();

  // Fetch AI insights
  const { 
    data: insights, 
    isLoading: isLoadingInsights,
    refetch: refetchInsights,
  } = useQuery<AiInsight[]>({
    queryKey: ["/api/ai-insights"],
  });

  // Fetch transactions (required for forecasting and financial insights)
  const { 
    data: transactions, 
    isLoading: isLoadingTransactions,
  } = useQuery<any[]>({
    queryKey: ["/api/transactions"],
  });

  // Financial Insights Mutation
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(prev => ({ ...prev, insights: true }));
      const response = await apiRequest("POST", "/api/ai/financial-insights", {});
      return response.json();
    },
    onSuccess: (data) => {
      refetchInsights();
      toast({
        title: "Financial insights generated",
        description: "AI has analyzed your financial data and generated new insights.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate insights",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(prev => ({ ...prev, insights: false }));
    },
  });

  // Fraud Detection Mutation
  const detectFraudMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(prev => ({ ...prev, fraud: true }));
      const response = await apiRequest("POST", "/api/ai/detect-fraud", {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Fraud detection completed",
        description: `Fraud probability: ${(data.fraudProbability * 100).toFixed(1)}%`,
        variant: data.fraudProbability > 0.5 ? "destructive" : "default",
      });
      refetchInsights();
    },
    onError: (error) => {
      toast({
        title: "Failed to detect fraud",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(prev => ({ ...prev, fraud: false }));
    },
  });

  // Forecast Mutation
  const generateForecastMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(prev => ({ ...prev, forecast: true }));
      const response = await apiRequest("POST", "/api/ai/forecast", {});
      return response.json();
    },
    onSuccess: (data) => {
      refetchInsights();
      toast({
        title: "Financial forecast generated",
        description: "6-month forecast has been created based on your data.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate forecast",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(prev => ({ ...prev, forecast: false }));
    },
  });

  // AI Query Mutation
  const queryAiMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/ai/query", { query });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI Assistant Response",
        description: data.answer.length > 100 ? `${data.answer.substring(0, 100)}...` : data.answer,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to get AI response",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitQuery = () => {
    if (!aiQuery.trim()) return;
    
    queryAiMutation.mutate(aiQuery);
    setAiQuery("");
  };

  // Prepare forecast chart data
  const forecastData = insights?.find(insight => 
    insight.title === "6-Month Financial Forecast"
  )?.data;
  
  const prepareChartData = () => {
    if (!forecastData) return [];
    
    const months = ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"];
    
    return months.map((month, index) => ({
      name: month,
      revenue: forecastData.revenueForecast[index],
      expenses: forecastData.expenseForecast[index],
      cashFlow: forecastData.cashFlowForecast[index],
    }));
  };
  
  const chartData = prepareChartData();

  const getInsightIcon = (category: string) => {
    switch (category) {
      case "fraud-detection":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "financial":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
    }
  };

  const getInsightColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "low":
      default:
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar className="sidebar" />
      <Header className="ml-0 md:ml-[var(--sidebar-width,0px)]" />
      
      <main 
        className="pt-16 pb-8 transition-all duration-300"
        style={{ marginLeft: "var(--sidebar-width, 0px)" }}
      >
        <div className="container px-4 py-6 md:px-6 max-w-7xl">
          <div className="flex flex-col gap-1.5 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">AI Analytics</h1>
            <p className="text-muted-foreground">
              AI-powered insights and predictions for your business
            </p>
          </div>

          {/* AI Capabilities Overview */}
          <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <DataCard
              title="Financial Insights"
              value={insights?.filter(i => i.category === "financial").length.toString() || "0"}
              icon={BarChart}
              description="AI-generated financial analysis"
              className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 cursor-pointer transition-colors"
              onClick={() => setSelectedTab("insights")}
            />
            <DataCard
              title="Fraud Detection"
              value="Real-time"
              icon={Shield}
              description="AI monitoring for suspicious activities"
              className="bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 cursor-pointer transition-colors"
              onClick={() => setSelectedTab("fraud")}
            />
            <DataCard
              title="Future Predictions"
              value="6-month"
              icon={Clock}
              description="AI forecasting of financial trends"
              className="bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 cursor-pointer transition-colors"
              onClick={() => setSelectedTab("forecast")}
            />
            <DataCard
              title="AI Assistant"
              value="Ask now"
              icon={MessagesSquare}
              description="Get answers to your financial questions"
              className="bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/40 cursor-pointer transition-colors"
              onClick={() => setSelectedTab("assistant")}
            />
          </div>

          {/* Main Content Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
            </TabsList>

            {/* AI Insights Tab */}
            <TabsContent value="insights">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl">Financial Insights</CardTitle>
                    <CardDescription>
                      AI-generated analysis of your financial data
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => generateInsightsMutation.mutate()}
                    disabled={isGenerating.insights || !transactions?.length}
                    className="gap-2"
                  >
                    {isGenerating.insights ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Generate New Insights
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingInsights ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !insights?.filter(i => i.category === "financial").length ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No financial insights yet</h3>
                      <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                        Generate AI-powered insights to get analysis of your financial data, recommendations, and potential risk areas.
                      </p>
                      <Button 
                        onClick={() => generateInsightsMutation.mutate()}
                        disabled={isGenerating.insights || !transactions?.length}
                        className="gap-2"
                      >
                        {isGenerating.insights ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            Generate Insights
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {insights
                        .filter(insight => insight.category === "financial")
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((insight) => (
                          <Card key={insight.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/50 pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getInsightIcon(insight.category)}
                                  <CardTitle className="text-lg">
                                    {insight.title}
                                  </CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-xs",
                                      getInsightColor(insight.importance)
                                    )}
                                  >
                                    {insight.importance}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(insight.createdAt), "MMM d, yyyy")}
                                  </span>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <p className="text-sm mb-4">{insight.description}</p>
                              
                              {insight.data && (
                                <div className="space-y-4">
                                  {insight.data.recommendations && (
                                    <div>
                                      <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                                      <ul className="list-disc list-inside space-y-1">
                                        {insight.data.recommendations.map((rec: string, i: number) => (
                                          <li key={i} className="text-sm text-muted-foreground">{rec}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {insight.data.riskAreas && (
                                    <div>
                                      <h4 className="font-medium text-sm mb-2">Risk Areas:</h4>
                                      <ul className="list-disc list-inside space-y-1">
                                        {insight.data.riskAreas.map((risk: string, i: number) => (
                                          <li key={i} className="text-sm text-muted-foreground">{risk}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fraud Detection Tab */}
            <TabsContent value="fraud">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl">Fraud Detection</CardTitle>
                    <CardDescription>
                      AI-powered analysis to detect potential fraud or unusual activity
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => detectFraudMutation.mutate()}
                    disabled={isGenerating.fraud || !transactions?.length}
                    className="gap-2"
                  >
                    {isGenerating.fraud ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Scan for Fraud
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingInsights ? (
                    <div className="space-y-4">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Fraud Detection Explanation Card */}
                      <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="rounded-full bg-primary/10 p-2">
                              <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium text-lg mb-2">How Fraud Detection Works</h3>
                              <p className="text-muted-foreground">
                                Our AI system scans your financial transactions for unusual patterns,
                                duplicate transactions, and other potential signs of fraud.
                                Regular scans can help protect your business from financial risks.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Latest Fraud Analysis */}
                      {insights
                        ?.filter(insight => insight.category === "fraud-detection")
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 1)
                        .map((insight) => (
                          <Card key={insight.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/50 pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                  <CardTitle className="text-lg">
                                    Fraud Analysis Results
                                  </CardTitle>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(insight.createdAt), "MMM d, yyyy")}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <p className="text-sm mb-4">{insight.description}</p>
                              
                              {insight.data && (
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                                    <div>
                                      <h4 className="font-medium">Fraud Probability</h4>
                                      <p className="text-sm text-muted-foreground">
                                        Based on current transaction patterns
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <span className={cn(
                                        "text-2xl font-bold",
                                        insight.data.fraudProbability > 0.5 
                                          ? "text-red-500" 
                                          : insight.data.fraudProbability > 0.3
                                          ? "text-amber-500"
                                          : "text-green-500"
                                      )}>
                                        {(insight.data.fraudProbability * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {insight.data.suspiciousTransactions && 
                                   insight.data.suspiciousTransactions.length > 0 && (
                                    <div>
                                      <h4 className="font-medium text-sm mb-2">Suspicious Transactions:</h4>
                                      <ul className="list-disc list-inside space-y-1">
                                        {insight.data.suspiciousTransactions.map((txId: number, i: number) => (
                                          <li key={i} className="text-sm text-muted-foreground">
                                            Transaction ID: {txId}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <h4 className="font-medium text-sm mb-2">Explanation:</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {insight.data.explanation}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}

                      {!insights?.some(insight => insight.category === "fraud-detection") && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium">No fraud analysis yet</h3>
                          <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                            Scan your transactions for potential fraud or unusual patterns to protect your business.
                          </p>
                          <Button 
                            onClick={() => detectFraudMutation.mutate()}
                            disabled={isGenerating.fraud || !transactions?.length}
                            className="gap-2"
                          >
                            {isGenerating.fraud ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Scanning...
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4" />
                                Scan for Fraud
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Forecast Tab */}
            <TabsContent value="forecast">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl">Financial Forecast</CardTitle>
                    <CardDescription>
                      AI-generated 6-month forecast for your business
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => generateForecastMutation.mutate()}
                    disabled={isGenerating.forecast || !transactions?.length}
                    className="gap-2"
                  >
                    {isGenerating.forecast ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4" />
                        Generate New Forecast
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingInsights ? (
                    <div className="space-y-4">
                      <Skeleton className="h-[300px] w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : !forecastData ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No forecast available</h3>
                      <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                        Generate a 6-month forecast to get AI predictions about your future revenue, expenses, and cash flow.
                      </p>
                      <Button 
                        onClick={() => generateForecastMutation.mutate()}
                        disabled={isGenerating.forecast || !transactions?.length}
                        className="gap-2"
                      >
                        {isGenerating.forecast ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-4 w-4" />
                            Generate Forecast
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <AnalyticsChart
                        title="6-Month Financial Forecast"
                        description="Predicted revenue, expenses, and cash flow for the next 6 months"
                        data={chartData}
                        type="line"
                        dataKeys={["revenue", "expenses", "cashFlow"]}
                        colors={["#10B981", "#EF4444", "#3B82F6"]}
                        xAxisLabel="Month"
                        yAxisLabel="Amount ($)"
                      />
                      
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Forecast Explanation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {forecastData.explanation}
                          </p>
                        </CardContent>
                      </Card>
                      
                      {/* Financial Metrics Cards */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <DataCard
                          title="Avg. Monthly Revenue"
                          value={`$${(forecastData.revenueForecast.reduce((a: number, b: number) => a + b, 0) / 6).toFixed(2)}`}
                          icon={TrendingUp}
                          trend={{
                            value: 10,
                            isPositive: true,
                          }}
                        />
                        <DataCard
                          title="Avg. Monthly Expenses"
                          value={`$${(forecastData.expenseForecast.reduce((a: number, b: number) => a + b, 0) / 6).toFixed(2)}`}
                          icon={DollarSign}
                          trend={{
                            value: 5,
                            isPositive: false,
                          }}
                        />
                        <DataCard
                          title="Predicted Cash Flow"
                          value={`$${(forecastData.cashFlowForecast.reduce((a: number, b: number) => a + b, 0)).toFixed(2)}`}
                          icon={BarChart}
                          trend={{
                            value: 15,
                            isPositive: true,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Assistant Tab */}
            <TabsContent value="assistant">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl">AI Assistant</CardTitle>
                    <CardDescription>
                      Ask questions about your finances, get insights, or any ERP-related help
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-6">
                    {/* Chat Area */}
                    <Card className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* AI Welcome Message */}
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Brain className="h-5 w-5" />
                            </div>
                            <div className="rounded-lg bg-muted p-3 text-sm">
                              <p>
                                Hello! I'm your AI financial assistant. You can ask me questions about:
                              </p>
                              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                                <li>Your financial data and trends</li>
                                <li>Generating reports or summaries</li>
                                <li>Explaining financial concepts</li>
                                <li>Getting recommendations</li>
                              </ul>
                            </div>
                          </div>

                          {/* Example Questions */}
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Brain className="h-5 w-5" />
                            </div>
                            <div className="rounded-lg bg-muted p-3 text-sm">
                              <p className="font-medium">Try asking questions like:</p>
                              <div className="mt-2 grid gap-2">
                                {[
                                  "What were my top expense categories last month?",
                                  "How can I improve my cash flow?",
                                  "Summarize my financial activity for this quarter",
                                  "Show me potential ways to reduce expenses"
                                ].map((question, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    className="justify-start text-left h-auto py-2"
                                    onClick={() => {
                                      setAiQuery(question);
                                    }}
                                  >
                                    {question}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Recent Query Result */}
                          {queryAiMutation.data && (
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Brain className="h-5 w-5" />
                              </div>
                              <div className="rounded-lg bg-muted p-3 text-sm">
                                <p className="whitespace-pre-line">{queryAiMutation.data.answer}</p>
                                {queryAiMutation.data.relatedActions && 
                                queryAiMutation.data.relatedActions.length > 0 && (
                                  <div className="mt-4">
                                    <p className="font-medium text-sm mb-2">Related actions:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                      {queryAiMutation.data.relatedActions.map((action: string, i: number) => (
                                        <li key={i} className="text-muted-foreground">{action}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Query Input */}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Ask a question about your finances..."
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <Button
                        className="mt-auto"
                        onClick={handleSubmitQuery}
                        disabled={queryAiMutation.isPending || !aiQuery.trim()}
                      >
                        {queryAiMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
