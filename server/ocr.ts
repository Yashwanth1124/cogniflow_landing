import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { storage } from './storage';
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Promisify file system operations
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Interface for document processing results
interface DocumentProcessingResult {
  documentId: string;
  text: string;
  metadata: {
    documentType: string;
    extractedData: Record<string, any>;
    confidence: number;
    processingTime: number;
  };
}

// Interface for invoice extraction result
interface InvoiceExtractionResult {
  invoice: {
    invoiceNumber?: string;
    date?: string;
    dueDate?: string;
    vendor?: {
      name?: string;
      address?: string;
      phone?: string;
      email?: string;
      taxId?: string;
    };
    client?: {
      name?: string;
      address?: string;
      phone?: string;
      email?: string;
      taxId?: string;
    };
    items?: Array<{
      description?: string;
      quantity?: number;
      unitPrice?: number;
      amount?: number;
    }>;
    subtotal?: number;
    tax?: number;
    total?: number;
    currency?: string;
    paymentTerms?: string;
    notes?: string;
  };
  confidence: number;
}

// Interface for receipt extraction result
interface ReceiptExtractionResult {
  receipt: {
    merchantName?: string;
    date?: string;
    time?: string;
    items?: Array<{
      description?: string;
      quantity?: number;
      unitPrice?: number;
      amount?: number;
    }>;
    subtotal?: number;
    tax?: number;
    tip?: number;
    total?: number;
    paymentMethod?: string;
    cardLastFour?: string;
    currency?: string;
  };
  confidence: number;
}

// Base directory for storing uploaded documents
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
export async function initializeOCR() {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
    console.log('OCR system initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize OCR system:', error);
    return false;
  }
}

// Process image from base64 data
export async function processDocumentBase64(
  imageBase64: string,
  fileName: string,
  documentType: 'invoice' | 'receipt' | 'id' | 'contract' | 'general'
): Promise<DocumentProcessingResult> {
  try {
    // Generate a unique document ID
    const documentId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    
    // Remove the base64 prefix if it exists
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    // Create file path for storing the image
    const uploadPath = path.join(UPLOAD_DIR, `${documentId}_${fileName}`);
    
    // Save the image to disk
    const buffer = Buffer.from(base64Data, 'base64');
    await writeFile(uploadPath, buffer);
    
    // Start timing the processing
    const startTime = Date.now();
    
    // Use OpenAI Vision to extract text from the image
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in OCR and document analysis. Extract all text and relevant information from the provided document. Focus on accuracy and structure."
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Extract all text from this ${documentType} image.` },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });
    
    // Get extracted text from response
    const extractedText = response.choices[0].message.content || '';
    
    // Now analyze the extracted text based on document type
    const result = await analyzeDocument(documentId, extractedText, documentType);
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Update metadata with processing time
    result.metadata.processingTime = processingTime;
    
    // Create a record of this document processing in our system
    try {
      await storage.createReport({
        userId: 1, // Would be the actual user ID in production
        title: `OCR Processed: ${documentType.toUpperCase()}`,
        type: 'document',
        data: {
          documentId,
          documentType,
          fileName,
          extractedData: result.metadata.extractedData,
          confidence: result.metadata.confidence,
          processingTime
        }
      });
    } catch (error) {
      console.error('Failed to save OCR report:', error);
    }
    
    return result;
  } catch (error) {
    console.error('Error processing document:', error);
    throw new Error('Failed to process document');
  }
}

// Process image from file path
export async function processDocumentFile(
  filePath: string,
  documentType: 'invoice' | 'receipt' | 'id' | 'contract' | 'general'
): Promise<DocumentProcessingResult> {
  try {
    // Read the file
    const imageBuffer = await readFile(filePath);
    
    // Convert to base64
    const base64Data = imageBuffer.toString('base64');
    
    // Get filename from path
    const fileName = path.basename(filePath);
    
    // Process using the base64 function
    return await processDocumentBase64(base64Data, fileName, documentType);
  } catch (error) {
    console.error('Error processing document file:', error);
    throw new Error('Failed to process document file');
  }
}

// Analyze the document based on type
async function analyzeDocument(
  documentId: string,
  text: string,
  documentType: 'invoice' | 'receipt' | 'id' | 'contract' | 'general'
): Promise<DocumentProcessingResult> {
  let extractedData: Record<string, any> = {};
  let confidence = 0;
  
  switch (documentType) {
    case 'invoice':
      extractedData = await extractInvoiceData(text);
      confidence = (extractedData as InvoiceExtractionResult).confidence || 0;
      break;
    
    case 'receipt':
      extractedData = await extractReceiptData(text);
      confidence = (extractedData as ReceiptExtractionResult).confidence || 0;
      break;
    
    case 'id':
      extractedData = await extractIdData(text);
      confidence = extractedData.confidence || 0;
      break;
    
    case 'contract':
      extractedData = await extractContractData(text);
      confidence = extractedData.confidence || 0;
      break;
    
    case 'general':
    default:
      // For general documents, just provide the text
      extractedData = { text };
      confidence = 0.9; // Assume high confidence for general text extraction
      break;
  }
  
  return {
    documentId,
    text,
    metadata: {
      documentType,
      extractedData,
      confidence,
      processingTime: 0 // Will be updated by the caller
    }
  };
}

// Extract data from invoice text
async function extractInvoiceData(text: string): Promise<InvoiceExtractionResult> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in financial document analysis. Extract structured data from the provided invoice text."
        },
        {
          role: "user",
          content: `Extract structured data from this invoice text. Provide output in JSON format with invoice number, date, due date, vendor details, client details, line items, subtotal, tax, total amount, currency, and payment terms:\n\n${text}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the JSON response
    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Assess confidence based on how complete the extraction is
    let confidenceScore = 0;
    const keyFields = ['invoiceNumber', 'date', 'vendor', 'client', 'total'];
    let fieldsFound = 0;
    
    for (const field of keyFields) {
      if (result.invoice && result.invoice[field]) {
        fieldsFound++;
      }
    }
    
    confidenceScore = fieldsFound / keyFields.length;
    
    return {
      invoice: result.invoice || {},
      confidence: confidenceScore
    };
  } catch (error) {
    console.error('Error extracting invoice data:', error);
    return {
      invoice: {},
      confidence: 0
    };
  }
}

// Extract data from receipt text
async function extractReceiptData(text: string): Promise<ReceiptExtractionResult> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in financial document analysis. Extract structured data from the provided receipt text."
        },
        {
          role: "user",
          content: `Extract structured data from this receipt text. Provide output in JSON format with merchant name, date, time, items purchased with prices, subtotal, tax, tip, total amount, payment method, and card information if available:\n\n${text}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the JSON response
    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Assess confidence based on how complete the extraction is
    let confidenceScore = 0;
    const keyFields = ['merchantName', 'date', 'items', 'total'];
    let fieldsFound = 0;
    
    for (const field of keyFields) {
      if (result.receipt && result.receipt[field]) {
        fieldsFound++;
      }
    }
    
    confidenceScore = fieldsFound / keyFields.length;
    
    return {
      receipt: result.receipt || {},
      confidence: confidenceScore
    };
  } catch (error) {
    console.error('Error extracting receipt data:', error);
    return {
      receipt: {},
      confidence: 0
    };
  }
}

// Extract data from ID document text
async function extractIdData(text: string): Promise<any> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in identity document analysis. Extract structured data from the provided ID document text while being mindful of privacy and security."
        },
        {
          role: "user",
          content: `Extract structured data from this ID document text. Provide output in JSON format with name, ID type, ID number (masked), issue date, expiry date, and other visible fields:\n\n${text}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the JSON response
    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Assess confidence
    let confidenceScore = 0;
    const keyFields = ['name', 'idType', 'idNumber', 'expiryDate'];
    let fieldsFound = 0;
    
    for (const field of keyFields) {
      if (result[field]) {
        fieldsFound++;
      }
    }
    
    confidenceScore = fieldsFound / keyFields.length;
    result.confidence = confidenceScore;
    
    return result;
  } catch (error) {
    console.error('Error extracting ID data:', error);
    return {
      confidence: 0
    };
  }
}

// Extract data from contract text
async function extractContractData(text: string): Promise<any> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in legal document analysis. Extract structured data from the provided contract text."
        },
        {
          role: "user",
          content: `Extract structured data from this contract text. Provide output in JSON format with parties involved, contract type, effective date, termination date, key clauses, obligations, and any financial terms:\n\n${text}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the JSON response
    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Assess confidence
    let confidenceScore = 0;
    const keyFields = ['parties', 'contractType', 'effectiveDate', 'keyTerms'];
    let fieldsFound = 0;
    
    for (const field of keyFields) {
      if (result[field]) {
        fieldsFound++;
      }
    }
    
    confidenceScore = fieldsFound / keyFields.length;
    result.confidence = confidenceScore;
    
    return result;
  } catch (error) {
    console.error('Error extracting contract data:', error);
    return {
      confidence: 0
    };
  }
}

// Convert extracted invoice data to our system's invoice format
export async function convertToSystemInvoice(
  extractedData: InvoiceExtractionResult,
  userId: number
): Promise<any> {
  try {
    if (!extractedData.invoice) {
      throw new Error('Invalid invoice data');
    }
    
    const { invoice } = extractedData;
    
    // Calculate the total from items if not available
    let total = invoice.total;
    if (!total && invoice.items && invoice.items.length > 0) {
      total = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    }
    
    // Create invoice in our system
    const systemInvoice = await storage.createInvoice({
      userId,
      clientName: invoice.client?.name || 'Unknown Client',
      amount: Math.round(total * 100) || 0, // Convert to cents
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'pending',
      items: invoice.items?.map(item => ({
        description: item.description || 'Unknown Item',
        quantity: item.quantity || 1,
        price: Math.round((item.unitPrice || 0) * 100) // Convert to cents
      })) || []
    });
    
    return systemInvoice;
  } catch (error) {
    console.error('Error converting to system invoice:', error);
    throw new Error('Failed to convert to system invoice');
  }
}