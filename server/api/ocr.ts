import { Express } from 'express';
import * as OCR from '../ocr';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|tiff|pdf)$/i)) {
      return cb(new Error('Only image and PDF files are allowed!'));
    }
    cb(null, true);
  }
});

export async function setupOCRAPI(app: Express) {
  // Initialize the OCR system
  await OCR.initializeOCR();
  
  // Process document from uploaded file
  app.post('/api/ocr/process-file', upload.single('document'), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const documentType = req.body.documentType || 'general';
      
      if (!['invoice', 'receipt', 'id', 'contract', 'general'].includes(documentType)) {
        return res.status(400).json({ message: 'Invalid document type' });
      }
      
      const result = await OCR.processDocumentFile(
        req.file.path,
        documentType as any
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error processing OCR:', error);
      res.status(500).json({ message: 'Failed to process document' });
    }
  });
  
  // Process document from base64 image
  app.post('/api/ocr/process-base64', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { imageBase64, fileName, documentType } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ message: 'Image data is required' });
      }
      
      if (!fileName) {
        return res.status(400).json({ message: 'File name is required' });
      }
      
      if (!documentType || !['invoice', 'receipt', 'id', 'contract', 'general'].includes(documentType)) {
        return res.status(400).json({ message: 'Valid document type is required' });
      }
      
      const result = await OCR.processDocumentBase64(
        imageBase64,
        fileName,
        documentType
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error processing OCR from base64:', error);
      res.status(500).json({ message: 'Failed to process document' });
    }
  });
  
  // Convert extracted invoice to system invoice
  app.post('/api/ocr/convert-invoice', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { extractedData } = req.body;
      
      if (!extractedData || !extractedData.invoice) {
        return res.status(400).json({ message: 'Valid extracted invoice data is required' });
      }
      
      const systemInvoice = await OCR.convertToSystemInvoice(
        extractedData,
        req.user!.id
      );
      
      res.json(systemInvoice);
    } catch (error) {
      console.error('Error converting to system invoice:', error);
      res.status(500).json({ message: 'Failed to convert to system invoice' });
    }
  });
}