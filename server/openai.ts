import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development" 
});

// Generate financial insights based on transaction data
export async function generateFinancialInsights(
  transactionData: any[], 
  period: string = "month"
): Promise<{
  summary: string;
  trends: string[];
  recommendations: string[];
  score: number;
  confidence: number;
}> {
  try {
    const prompt = `
      Analyze the following financial transaction data for the last ${period}:
      ${JSON.stringify(transactionData)}
      
      Generate a comprehensive financial insight report with:
      1. A short executive summary
      2. Key spending/earning trends (3-5 bullet points)
      3. Actionable recommendations (3 maximum)
      4. A financial health score from 1-100
      5. Confidence level of this analysis (0-1)
      
      Return the response as a JSON object with these keys:
      "summary", "trends" (array), "recommendations" (array), "score" (number), "confidence" (number)
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      summary: result.summary || "No summary available",
      trends: result.trends || [],
      recommendations: result.recommendations || [],
      score: Math.min(100, Math.max(1, result.score || 50)),
      confidence: Math.min(1, Math.max(0, result.confidence || 0.5)),
    };
  } catch (error) {
    console.error("Error generating financial insights:", error);
    return {
      summary: "Unable to generate insights at this time.",
      trends: ["Data insufficient for trend analysis"],
      recommendations: ["Try again later with more transaction data"],
      score: 50,
      confidence: 0.3,
    };
  }
}

// Detect anomalies in transaction data for fraud detection
export async function detectAnomalies(
  transactionData: any[],
  historicalData: any[]
): Promise<{
  hasAnomalies: boolean;
  anomalies: Array<{
    transactionId: number;
    reason: string;
    severity: "low" | "medium" | "high";
  }>;
  confidence: number;
}> {
  try {
    const prompt = `
      Analyze these recent transactions: ${JSON.stringify(transactionData)}
      Against historical transaction patterns: ${JSON.stringify(historicalData)}
      
      Identify any anomalies that might indicate fraud, unusual spending patterns, or errors.
      
      Return a JSON object with:
      1. "hasAnomalies": boolean - are there any anomalies
      2. "anomalies": array of objects with keys:
         - "transactionId": number
         - "reason": string explanation
         - "severity": string (must be "low", "medium", or "high")
      3. "confidence": number between 0-1 indicating confidence in this analysis
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error detecting anomalies:", error);
    return {
      hasAnomalies: false,
      anomalies: [],
      confidence: 0.5,
    };
  }
}

// Process natural language commands for AI assistant
export async function processNaturalLanguageCommand(
  command: string,
  userId: number
): Promise<{
  action: string;
  parameters: Record<string, any>;
  response: string;
  success: boolean;
}> {
  try {
    const prompt = `
      Process this user command for our ERP system: "${command}"
      
      Example commands:
      - "Generate an invoice for ABC Ltd for $5000"
      - "Show me revenue for Q2"
      - "Create a new expense of $75 for office supplies"
      
      Parse the intention and extract parameters. Return a JSON object with:
      1. "action": string - the intended action (generate_invoice, view_report, create_transaction, etc.)
      2. "parameters": object - all parameters needed for this action
      3. "response": string - a natural language response to the user
      4. "success": boolean - whether the command was successfully parsed
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error processing natural language command:", error);
    return {
      action: "error",
      parameters: {},
      response: "I'm sorry, I couldn't process that command. Please try again with different wording.",
      success: false,
    };
  }
}

// Generate future financial forecasts
export async function generateFinancialForecast(
  historicalData: any[],
  forecastPeriod: string = "6 months"
): Promise<{
  forecast: Array<{
    period: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  summary: string;
  confidence: number;
}> {
  try {
    const prompt = `
      Based on this historical financial data: ${JSON.stringify(historicalData)}
      
      Generate a financial forecast for the next ${forecastPeriod}.
      
      Return a JSON object with:
      1. "forecast": array of objects with:
         - "period": string (e.g., "Jul 2023")
         - "revenue": projected revenue (number)
         - "expenses": projected expenses (number)
         - "profit": projected profit (number)
      2. "summary": string explaining key forecast insights
      3. "confidence": number between 0-1 indicating confidence in the forecast
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating financial forecast:", error);
    return {
      forecast: [],
      summary: "Unable to generate forecast at this time.",
      confidence: 0.3,
    };
  }
}

// Analyze customer communications for sentiment
export async function analyzeSentiment(
  text: string
): Promise<{
  sentiment: "positive" | "neutral" | "negative";
  score: number; // 1-5 rating
  confidence: number; // 0-1
  keyPoints: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars, a confidence score, and key points from the text. Respond with JSON in this format: { 'sentiment': 'positive'|'neutral'|'negative', 'score': number, 'confidence': number, 'keyPoints': string[] }",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      sentiment: result.sentiment || "neutral",
      score: Math.max(1, Math.min(5, Math.round(result.score || 3))),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      keyPoints: result.keyPoints || []
    };
  } catch (error) {
    console.error("Failed to analyze sentiment:", error);
    return {
      sentiment: "neutral",
      score: 3,
      confidence: 0.5,
      keyPoints: ["Unable to analyze sentiment"]
    };
  }
}
