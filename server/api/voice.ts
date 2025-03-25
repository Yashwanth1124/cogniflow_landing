import { Express } from 'express';
import OpenAI from 'openai';
import { storage } from '../storage';
import {
  processNaturalLanguageCommand
} from '../openai';

export function setupVoiceAPI(app: Express) {
  // Process voice commands
  app.post('/api/voice/process', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        response: 'Not authenticated' 
      });
    }
    
    try {
      const { command } = req.body;
      
      if (!command || typeof command !== 'string') {
        return res.status(400).json({ 
          success: false, 
          response: 'Command is required' 
        });
      }
      
      // Log the voice command
      console.log(`Processing voice command from user ${req.user.id}: "${command}"`);
      
      // Use OpenAI to process the natural language command
      const result = await processNaturalLanguageCommand(command, req.user.id);
      
      // Store the voice command and result in the database for auditing
      await storage.createMessage({
        userId: req.user.id,
        content: `Voice Command: "${command}" - ${result.success ? 'Success' : 'Failed'}: ${result.response}`,
        isAi: false
      });
      
      // If the command was successfully parsed, perform the action
      if (result.success) {
        // Execute the action based on the extracted parameters
        switch (result.action) {
          case 'create_invoice':
            if (result.parameters.company && result.parameters.amount) {
              // In a full implementation, we would create the invoice
              // For now, return success response
              return res.json({
                success: true,
                response: `Created invoice for ${result.parameters.company} for ${result.parameters.amount}`,
                data: {
                  action: result.action,
                  parameters: result.parameters
                }
              });
            }
            break;
            
          case 'view_report':
            if (result.parameters.reportType && result.parameters.period) {
              // In a full implementation, we would generate the report
              // For now, return success response
              return res.json({
                success: true,
                response: `Generated ${result.parameters.reportType} report for ${result.parameters.period}`,
                data: {
                  action: result.action,
                  parameters: result.parameters
                }
              });
            }
            break;
            
          case 'create_transaction':
            if (result.parameters.type && result.parameters.amount) {
              // In a full implementation, we would create the transaction
              // For now, return success response
              return res.json({
                success: true,
                response: `Created ${result.parameters.type} transaction for ${result.parameters.amount}`,
                data: {
                  action: result.action,
                  parameters: result.parameters
                }
              });
            }
            break;
            
          default:
            // No specific implementation for this action yet
            return res.json({
              success: true,
              response: result.response,
              data: {
                action: result.action,
                parameters: result.parameters
              }
            });
        }
      }
      
      // Return the result
      return res.json({
        success: result.success,
        response: result.response,
        data: {
          action: result.action,
          parameters: result.parameters
        }
      });
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      res.status(500).json({ 
        success: false, 
        response: 'Error processing voice command' 
      });
    }
  });
}