import { Express } from 'express';
import { storage } from '../storage';
import {
  initializeWithDemoData,
  getAccountBalance,
  getTokenBalance,
  sendTransaction,
  sendTokenTransaction,
  getTransactionHistory,
  getTransaction,
  generateNewAddress
} from '../blockchain';

export function setupBlockchainAPI(app: Express) {
  // Initialize blockchain on server start
  initializeWithDemoData();
  
  // Get blockchain wallet balance
  app.get('/api/blockchain/balance', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const balance = await getAccountBalance();
      res.json({ balance });
    } catch (error) {
      console.error('Error getting blockchain balance:', error);
      res.status(500).json({ message: 'Failed to get blockchain balance' });
    }
  });
  
  // Get token balance
  app.get('/api/blockchain/token-balance/:tokenAddress', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { tokenAddress } = req.params;
      
      if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
        return res.status(400).json({ message: 'Invalid token address' });
      }
      
      const balance = await getTokenBalance(tokenAddress);
      res.json({ balance });
    } catch (error) {
      console.error('Error getting token balance:', error);
      res.status(500).json({ message: 'Failed to get token balance' });
    }
  });
  
  // Send blockchain transaction
  app.post('/api/blockchain/send', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { to, amount, description } = req.body;
      
      if (!to || !/^0x[a-fA-F0-9]{40}$/.test(to)) {
        return res.status(400).json({ message: 'Invalid recipient address' });
      }
      
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
      }
      
      const transaction = await sendTransaction(to, amount, description);
      
      // Create a record of this transaction in our system
      await storage.createTransaction({
        userId: req.user!.id,
        type: 'debit',
        amount: parseFloat(amount) * 100, // Convert to cents
        date: new Date(),
        description: description || `Blockchain payment to ${to}`,
        category: 'blockchain',
        status: 'completed'
      });
      
      res.json(transaction);
    } catch (error) {
      console.error('Error sending blockchain transaction:', error);
      res.status(500).json({ message: 'Failed to send blockchain transaction' });
    }
  });
  
  // Send token transaction
  app.post('/api/blockchain/send-token', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { tokenAddress, to, amount } = req.body;
      
      if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
        return res.status(400).json({ message: 'Invalid token address' });
      }
      
      if (!to || !/^0x[a-fA-F0-9]{40}$/.test(to)) {
        return res.status(400).json({ message: 'Invalid recipient address' });
      }
      
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
      }
      
      const transaction = await sendTokenTransaction(tokenAddress, to, amount);
      
      // Create a record of this token transaction in our system
      await storage.createTransaction({
        userId: req.user!.id,
        type: 'debit',
        amount: parseFloat(amount) * 100, // Convert to cents
        date: new Date(),
        description: `Token transfer to ${to}`,
        category: 'tokens',
        status: 'completed'
      });
      
      res.json(transaction);
    } catch (error) {
      console.error('Error sending token transaction:', error);
      res.status(500).json({ message: 'Failed to send token transaction' });
    }
  });
  
  // Get transaction history
  app.get('/api/blockchain/transactions', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const transactions = getTransactionHistory();
      res.json(transactions);
    } catch (error) {
      console.error('Error getting transaction history:', error);
      res.status(500).json({ message: 'Failed to get transaction history' });
    }
  });
  
  // Get transaction by hash
  app.get('/api/blockchain/transactions/:hash', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { hash } = req.params;
      
      if (!hash || !/^0x[a-fA-F0-9]{64}$/.test(hash)) {
        return res.status(400).json({ message: 'Invalid transaction hash' });
      }
      
      const transaction = getTransaction(hash);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error('Error getting transaction:', error);
      res.status(500).json({ message: 'Failed to get transaction' });
    }
  });
  
  // Generate new blockchain address
  app.post('/api/blockchain/generate-address', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { address, privateKey } = generateNewAddress();
      
      // In a production environment, we would store the address but NOT the private key
      // The private key should be provided to the user securely and not stored
      
      res.json({
        address,
        privateKey: privateKey.substring(0, 10) + '...' // Only return partial key for security
      });
    } catch (error) {
      console.error('Error generating address:', error);
      res.status(500).json({ message: 'Failed to generate address' });
    }
  });
  
  // Create a blockchain-based smart contract for invoice
  app.post('/api/blockchain/create-invoice', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { recipient, amount, description } = req.body;
      
      if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
        return res.status(400).json({ message: 'Invalid recipient address' });
      }
      
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
      }
      
      // In a real implementation, this would create a smart contract invoice
      // For demo, we'll just simulate it
      const invoiceId = Math.floor(Math.random() * 1000000);
      
      // Create an invoice record in our system
      const invoice = await storage.createInvoice({
        userId: req.user!.id,
        recipientName: recipient.substring(0, 10),
        amount: parseFloat(amount) * 100, // Convert to cents
        status: 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        items: [{
          description: description || 'Blockchain invoice item',
          quantity: 1,
          price: parseFloat(amount) * 100
        }]
      });
      
      res.json({
        invoice,
        blockchainTxn: {
          invoiceId,
          status: 'created',
          recipient,
          amount,
          description: description || 'Smart contract invoice'
        }
      });
    } catch (error) {
      console.error('Error creating blockchain invoice:', error);
      res.status(500).json({ message: 'Failed to create blockchain invoice' });
    }
  });
}