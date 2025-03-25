import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-mock-key-for-development" 
});

// Generate financial insights based on transactions
export async function generateFinancialInsights(transactions: any[]): Promise<{ 
  insights: string, 
  recommendations: string[], 
  riskAreas: string[] 
}> {
  try {
    const prompt = `
      Analyze these financial transactions and provide insights:
      1. Identify spending patterns and trends
      2. Suggest areas for cost optimization
      3. Highlight potential cash flow issues
      4. Recommend financial strategies

      Transactions: ${JSON.stringify(transactions)}

      Respond with JSON in this format: 
      { 
        "insights": "summary of insights",
        "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
        "riskAreas": ["risk1", "risk2"]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      insights: result.insights || "No insights available based on current data.",
      recommendations: result.recommendations || [],
      riskAreas: result.riskAreas || []
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      insights: "Unable to generate insights at the moment.",
      recommendations: ["Review recent transactions manually", "Check for unusual spending patterns"],
      riskAreas: ["System temporarily unavailable for risk analysis"]
    };
  }
}

// Detect potential fraud in transactions
export async function detectFraud(transactions: any[]): Promise<{
  fraudProbability: number,
  suspiciousTransactions: any[],
  explanation: string
}> {
  try {
    const prompt = `
      Analyze these transactions for potential fraud:
      1. Identify unusual transaction patterns
      2. Flag transactions with high risk indicators
      3. Detect potential duplicate transactions
      4. Highlight suspicious activities

      Transactions: ${JSON.stringify(transactions)}

      Respond with JSON in this format: 
      { 
        "fraudProbability": 0.xx, // number between 0 and 1
        "suspiciousTransactions": [/* array of suspicious transaction IDs */],
        "explanation": "detailed explanation of findings"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      fraudProbability: result.fraudProbability || 0,
      suspiciousTransactions: result.suspiciousTransactions || [],
      explanation: result.explanation || "No suspicious activities detected"
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      fraudProbability: 0,
      suspiciousTransactions: [],
      explanation: "Fraud detection system temporarily unavailable"
    };
  }
}

// Generate revenue and expense forecasts
export async function generateForecast(transactions: any[]): Promise<{
  revenueForecast: number[],
  expenseForecast: number[],
  cashFlowForecast: number[],
  explanation: string
}> {
  try {
    const prompt = `
      Based on these historical transactions, generate a 6-month financial forecast:
      1. Project revenue trends
      2. Estimate expense patterns
      3. Calculate cash flow projections
      4. Provide confidence level for the forecast

      Transactions: ${JSON.stringify(transactions)}

      Respond with JSON in this format: 
      { 
        "revenueForecast": [m1, m2, m3, m4, m5, m6], // monthly revenue forecast for 6 months
        "expenseForecast": [m1, m2, m3, m4, m5, m6], // monthly expense forecast for 6 months
        "cashFlowForecast": [m1, m2, m3, m4, m5, m6], // monthly cash flow forecast for 6 months
        "explanation": "explanation of forecast methodology and key factors"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      revenueForecast: result.revenueForecast || Array(6).fill(0),
      expenseForecast: result.expenseForecast || Array(6).fill(0),
      cashFlowForecast: result.cashFlowForecast || Array(6).fill(0),
      explanation: result.explanation || "Insufficient data for accurate forecasting"
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      revenueForecast: Array(6).fill(0),
      expenseForecast: Array(6).fill(0),
      cashFlowForecast: Array(6).fill(0),
      explanation: "Forecasting system temporarily unavailable"
    };
  }
}

// Answer user queries about finances or ERP
export async function answerQuery(query: string, userContext: any): Promise<{
  answer: string,
  relatedActions: string[],
  confidence: number
}> {
  try {
    const prompt = `
      Answer this user's question about finances, accounting, or the ERP system:
      "${query}"

      User context:
      ${JSON.stringify(userContext)}

      Respond with JSON in this format: 
      { 
        "answer": "detailed answer to the question",
        "relatedActions": ["action1", "action2"], // related actions the user might want to take
        "confidence": 0.xx // confidence level between 0 and 1
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      answer: result.answer || "I don't have enough information to answer that question.",
      relatedActions: result.relatedActions || [],
      confidence: result.confidence || 0.5
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      answer: "I'm sorry, I'm having trouble processing your question right now. Please try again later.",
      relatedActions: ["Try rephrasing your question", "Contact support if the issue persists"],
      confidence: 0
    };
  }
}
