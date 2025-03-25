import { ethers } from 'ethers';
import { storage } from './storage';

// Standard ERC20 token ABI for interacting with tokens on Ethereum
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint)',
  'function transfer(address to, uint amount) returns (bool)',
  'function approve(address spender, uint amount) returns (bool)',
  'function transferFrom(address sender, address recipient, uint amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint)',
  'event Transfer(address indexed from, address indexed to, uint amount)',
  'event Approval(address indexed owner, address indexed spender, uint amount)'
];

// Smart contract ABI for a simple payment system
const PAYMENT_CONTRACT_ABI = [
  'function createInvoice(address payable recipient, uint256 amount, string memory description, string memory invoiceId) external returns (uint256)',
  'function payInvoice(uint256 invoiceId) external payable',
  'function cancelInvoice(uint256 invoiceId) external',
  'function getInvoice(uint256 invoiceId) external view returns (address, address, uint256, string memory, string memory, bool)',
  'event InvoiceCreated(uint256 indexed invoiceId, address indexed sender, address indexed recipient, uint256 amount, string description)',
  'event InvoicePaid(uint256 indexed invoiceId, address indexed payer, uint256 amount)',
  'event InvoiceCancelled(uint256 indexed invoiceId, address indexed canceller)'
];

// Simulated provider and wallet for development
// In production, we would connect to a real blockchain node
let provider: ethers.JsonRpcProvider;
let wallet: ethers.Wallet;

// Initialize blockchain connection
export function initializeBlockchain() {
  try {
    // Create a provider connected to a simulated local blockchain
    // In production, we'd connect to a real Ethereum node or service like Infura
    provider = new ethers.JsonRpcProvider('http://localhost:8545');
    
    // Create a wallet with a private key
    // In production, this would be securely stored and managed
    const privateKey = process.env.ETHEREUM_PRIVATE_KEY || ethers.Wallet.createRandom().privateKey;
    wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`Blockchain initialized with wallet address: ${wallet.address}`);
    return true;
  } catch (error) {
    console.error('Failed to initialize blockchain:', error);
    return false;
  }
}

// Transaction history interface
interface TransactionRecord {
  hash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  description?: string; // Add description field to match usage
}

// In-memory storage for transaction records
// In production, these would be stored in a database
const transactionRecords = new Map<string, TransactionRecord>();

// Get account balance - Ethereum balance in ETH
export async function getAccountBalance(address?: string): Promise<string> {
  try {
    const targetAddress = address || wallet.address;
    const balance = await provider.getBalance(targetAddress);
    // Convert from wei to ether
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting account balance:', error);
    throw new Error('Failed to get account balance');
  }
}

// Get token balance - ERC20 token balance
export async function getTokenBalance(
  tokenAddress: string,
  userAddress?: string
): Promise<string> {
  try {
    const targetAddress = userAddress || wallet.address;
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await tokenContract.balanceOf(targetAddress);
    const decimals = await tokenContract.decimals();
    // Format with correct decimals
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw new Error('Failed to get token balance');
  }
}

// Send Ethereum transaction
export async function sendTransaction(
  to: string,
  amount: string,
  description?: string
): Promise<TransactionRecord> {
  try {
    // Convert ether to wei
    const value = ethers.parseEther(amount);
    
    // Create and send the transaction
    const tx = await wallet.sendTransaction({
      to,
      value
    });
    
    console.log(`Transaction sent: ${tx.hash}`);
    
    // Record the transaction
    const record: TransactionRecord = {
      hash: tx.hash,
      from: wallet.address,
      to,
      amount,
      timestamp: Date.now(),
      status: 'pending',
      // Optional description
      description: description || ''
    };
    
    transactionRecords.set(tx.hash, record);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    if (receipt) {
      // Update the record
      record.status = 'confirmed';
      record.blockNumber = receipt.blockNumber;
      record.gasUsed = receipt.gasUsed.toString();
      transactionRecords.set(tx.hash, record);
      
      // Store this transaction in our system DB
      await storage.createTransaction({
        type: 'debit',
        amount: parseFloat(amount) * 100, // Convert to cents for storage
        date: new Date(),
        userId: 1, // This would normally be the user ID
        description: `Blockchain transaction: ${tx.hash}`,
        category: 'blockchain',
        status: 'completed'
      });
    }
    
    return record;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw new Error('Failed to send transaction');
  }
}

// Send ERC20 token transaction
export async function sendTokenTransaction(
  tokenAddress: string,
  to: string,
  amount: string
): Promise<TransactionRecord> {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const decimals = await tokenContract.decimals();
    
    // Convert amount to correct token units
    const tokenAmount = ethers.parseUnits(amount, decimals);
    
    // Send tokens
    const tx = await tokenContract.transfer(to, tokenAmount);
    console.log(`Token transaction sent: ${tx.hash}`);
    
    // Record the transaction
    const record: TransactionRecord = {
      hash: tx.hash,
      from: wallet.address,
      to,
      amount,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    transactionRecords.set(tx.hash, record);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    if (receipt) {
      // Update the record
      record.status = 'confirmed';
      record.blockNumber = receipt.blockNumber;
      record.gasUsed = receipt.gasUsed.toString();
      transactionRecords.set(tx.hash, record);
      
      // Store in our system
      await storage.createTransaction({
        type: 'debit',
        amount: parseFloat(amount) * 100, // Convert to cents for storage
        date: new Date(),
        userId: 1, // This would normally be the user ID
        description: `Token transaction: ${tx.hash}`,
        category: 'tokens',
        status: 'completed'
      });
    }
    
    return record;
  } catch (error) {
    console.error('Error sending token transaction:', error);
    throw new Error('Failed to send token transaction');
  }
}

// Get transaction history
export function getTransactionHistory(): TransactionRecord[] {
  return Array.from(transactionRecords.values());
}

// Get transaction by hash
export function getTransaction(hash: string): TransactionRecord | undefined {
  return transactionRecords.get(hash);
}

// Function to generate a new Ethereum address
export function generateNewAddress(): { address: string, privateKey: string } {
  const newWallet = ethers.Wallet.createRandom();
  return {
    address: newWallet.address,
    privateKey: newWallet.privateKey
  };
}

// For development/demo purposes, populate with some simulated transaction data
export function seedTransactionData() {
  const demoTransactions: TransactionRecord[] = [
    {
      hash: '0x' + '1'.repeat(64),
      from: '0x' + 'a'.repeat(40),
      to: '0x' + 'b'.repeat(40),
      amount: '1.5',
      timestamp: Date.now() - 86400000, // 1 day ago
      status: 'confirmed',
      blockNumber: 123456,
      gasUsed: '21000'
    },
    {
      hash: '0x' + '2'.repeat(64),
      from: '0x' + 'a'.repeat(40),
      to: '0x' + 'c'.repeat(40),
      amount: '0.5',
      timestamp: Date.now() - 43200000, // 12 hours ago
      status: 'confirmed',
      blockNumber: 123457,
      gasUsed: '21000'
    },
    {
      hash: '0x' + '3'.repeat(64),
      from: '0x' + 'd'.repeat(40),
      to: '0x' + 'a'.repeat(40),
      amount: '2.0',
      timestamp: Date.now() - 3600000, // 1 hour ago
      status: 'confirmed',
      blockNumber: 123458,
      gasUsed: '21000'
    }
  ];
  
  for (const tx of demoTransactions) {
    transactionRecords.set(tx.hash, tx);
  }
}

// Initialize with demo data in development
// In production, this would connect to a real blockchain
export function initializeWithDemoData() {
  initializeBlockchain();
  seedTransactionData();
}