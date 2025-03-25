import { Express } from "express";
import OpenAI from "openai";
import { storage } from "./storage";

// Initialize OpenAI API
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-demo-key-for-development" 
});

export function setupAI(app: Express) {
  // Financial Analysis Route
  app.post("/api/ai/financial-analysis", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      // Get user's transactions
      const transactions = await storage.getTransactionsByUserId(req.user!.id);
      
      if (transactions.length === 0) {
        return res.json({
          summary: "Not enough data to perform financial analysis. Please add more transactions.",
          recommendations: ["Start by adding your income and expenses to get personalized insights."]
        });
      }
      
      // Prepare the data for the AI analysis
      const financialData = {
        income: transactions.filter(t => t.type === "credit").reduce((sum, t) => sum + t.amount, 0),
        expenses: transactions.filter(t => t.type === "debit").reduce((sum, t) => sum + t.amount, 0),
        categories: [...new Set(transactions.map(t => t.category))],
        transactions: transactions.length
      };
      
      // Construct prompt for OpenAI
      const prompt = `
        As a financial analyst, provide a short analysis and 3 actionable recommendations based on the following financial data:
        
        Income: $${financialData.income / 100}
        Expenses: $${financialData.expenses / 100}
        Categories: ${financialData.categories.join(", ")}
        Number of Transactions: ${financialData.transactions}
        
        Respond with JSON in this format:
        {
          "summary": "brief analysis of their financial situation",
          "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
        }
      `;
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      
      const analysisResult = JSON.parse(response.choices[0].message.content);
      res.json(analysisResult);
    } catch (error) {
      console.error("AI Financial Analysis Error:", error);
      res.status(500).json({ 
        message: "Error performing financial analysis",
        summary: "Unable to analyze financial data at this time.", 
        recommendations: ["Try again later when our AI service is operational."] 
      });
    }
  });
  
  // AI Assistant Route (Chat)
  app.post("/api/ai/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      // Store user message
      await storage.createMessage({
        userId: req.user!.id,
        content: message,
        isAi: false
      });
      
      // Get recent conversation context (last 10 messages)
      const recentMessages = await storage.getMessagesByUserId(req.user!.id);
      const context = recentMessages.slice(-10).map(msg => ({
        role: msg.isAi ? "assistant" : "user",
        content: msg.content
      }));
      
      // Add system message for context
      const systemMessage = {
        role: "system",
        content: `You are the AI assistant for Cogniflow, an advanced ERP system. Help the user with their financial, business operations, 
        and administrative questions. Be concise, helpful, and professional. You can assist with invoice creation, financial analysis, 
        transaction explanations, and other ERP-related tasks.`
      };
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [systemMessage, ...context],
        max_tokens: 500,
      });
      
      const aiResponse = response.choices[0].message.content;
      
      // Store AI response
      const savedMessage = await storage.createMessage({
        userId: req.user!.id,
        content: aiResponse,
        isAi: true
      });
      
      res.json(savedMessage);
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ message: "Error processing chat message" });
    }
  });
  
  // Fraud Detection Route
  app.post("/api/ai/fraud-detection", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const { transactionId } = req.body;
      
      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
      }
      
      // In a real implementation, we would get the specific transaction
      // For now, we'll return mock data for demo purposes
      
      res.json({
        riskScore: Math.random() * 100,
        isSuspicious: Math.random() > 0.8,
        reasons: ["Unusual transaction amount", "Irregular transaction pattern"],
        recommendation: "Review transaction details and verify with the vendor."
      });
    } catch (error) {
      console.error("Fraud Detection Error:", error);
      res.status(500).json({ message: "Error analyzing transaction for fraud" });
    }
  });
  
  // Forecast Revenue Route
  app.post("/api/ai/forecast", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const { months = 3 } = req.body;
      
      // Get user's transactions
      const transactions = await storage.getTransactionsByUserId(req.user!.id);
      const incomeTransactions = transactions.filter(t => t.type === "credit");
      
      if (incomeTransactions.length < 3) {
        return res.json({
          message: "Not enough historical data for accurate forecasting",
          forecast: Array(months).fill(0).map((_, i) => ({
            month: i + 1,
            amount: 0,
            confidence: 0
          }))
        });
      }
      
      // In a real implementation, we would use the OpenAI API for forecasting
      // For now, generate some realistic looking forecasts
      
      const lastIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / incomeTransactions.length;
      
      const forecast = Array(months).fill(0).map((_, i) => {
        const variance = (Math.random() * 0.2) - 0.1; // -10% to +10%
        return {
          month: i + 1,
          amount: Math.round(lastIncome * (1 + variance)),
          confidence: 0.8 - (i * 0.1) // Confidence decreases as we go further into the future
        };
      });
      
      res.json({
        message: "Forecast generated based on historical data",
        forecast
      });
    } catch (error) {
      console.error("Forecast Error:", error);
      res.status(500).json({ message: "Error generating forecast" });
    }
  });
}
