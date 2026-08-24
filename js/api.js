/**
 * ============================================================================
 * UPI WEB PORTAL - CENTRALIZED API DATA LAYER
 * ============================================================================
 * Single boundary between UI components and backend data.
 * All functions return Promises to maintain a strict async API contract.
 * Swap mock delay logic with real fetch(API_BASE_URL + '/endpoint') when connecting a backend.
 */

// REPLACE WITH REAL BACKEND URL WHEN READY (e.g. Flask, Express, Django, FastAPI)
const API_BASE_URL = "http://localhost:5000/api";

// Network latency simulation helper (300ms - 500ms)
const simulateNetworkDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// LocalStorage key for client-side persistence
const STORAGE_KEY = "upi_portal_data_store_v1";

// Default Mock Seed Data
const INITIAL_MOCK_DATA = {
  user: {
    name: "Samruddhi Patel",
    upiId: "samruddhi@okhdfcbank",
    phone: "+91 98765 43210",
    email: "samruddhi.patel@example.com",
    avatar: "SP",
    primaryBank: {
      bankName: "HDFC Bank",
      accountNo: "•••• 4821",
      accountType: "Savings Account",
      ifsc: "HDFC0001234",
      branch: "Indiranagar, Bengaluru"
    },
    secondaryBank: {
      bankName: "ICICI Bank",
      accountNo: "•••• 9152",
      accountType: "Salary Account",
      ifsc: "ICIC0005678",
      branch: "Koramangala, Bengaluru"
    },
    upiLimit: 100000,
    dailyUsed: 12450
  },
  balance: 24850.00,
  currency: "INR",
  contacts: [
    { name: "Rahul Sharma", upiId: "rahul@okhdfcbank", phone: "9876543211", avatar: "RS" },
    { name: "Priya Singh", upiId: "priya@icici", phone: "9876543212", avatar: "PS" },
    { name: "Aman Verma", upiId: "aman@axisbank", phone: "9876543213", avatar: "AV" },
    { name: "Neha Gupta", upiId: "neha@paytm", phone: "9876543214", avatar: "NG" },
    { name: "Vikram Mehta", upiId: "vikram@okaxis", phone: "9876543215", avatar: "VM" }
  ],
  transactions: [
    {
      id: "TXN9842145",
      utr: "324567891024",
      type: "debit",
      title: "Starbucks Coffee",
      recipientName: "Starbucks Coffee India",
      recipientUpi: "starbucks@paytm",
      amount: 320.00,
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: "success",
      note: "Cold Brew & Croissant",
      category: "Food & Dining",
      debitedFrom: "HDFC Bank •••• 4821"
    },
    {
      id: "TXN9842144",
      utr: "324567891023",
      type: "credit",
      title: "Priya Singh",
      senderName: "Priya Singh",
      senderUpi: "priya@icici",
      amount: 1500.00,
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: "success",
      note: "Weekend trip split",
      category: "Transfer",
      debitedFrom: "ICICI Bank •••• 9152"
    },
    {
      id: "TXN9842143",
      utr: "324567891022",
      type: "debit",
      title: "Zomato",
      recipientName: "Zomato Limited",
      recipientUpi: "zomato@icici",
      amount: 450.00,
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      status: "success",
      note: "Dinner order #5821",
      category: "Food Delivery",
      debitedFrom: "HDFC Bank •••• 4821"
    },
    {
      id: "TXN9842142",
      utr: "324567891021",
      type: "credit",
      title: "Acme Solutions",
      senderName: "Acme Solutions Pvt Ltd",
      senderUpi: "acmecorp@hdfcbank",
      amount: 18500.00,
      timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
      status: "success",
      note: "Consulting Milestone 2",
      category: "Salary/Income",
      debitedFrom: "HDFC Bank •••• 4821"
    },
    {
      id: "TXN9842141",
      utr: "324567891020",
      type: "debit",
      title: "Electricity BESCOM",
      recipientName: "BESCOM Utility Services",
      recipientUpi: "bescom@sbi",
      amount: 1250.00,
      timestamp: new Date(Date.now() - 3600000 * 120).toISOString(),
      status: "success",
      note: "Bill payment Aug 2026",
      category: "Utilities",
      debitedFrom: "HDFC Bank •••• 4821"
    }
  ]
};

// Internal Mock Data Store Manager
const DataStore = {
  get() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.set(INITIAL_MOCK_DATA);
        return JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn("LocalStorage unavailable, falling back to in-memory state", e);
      return INITIAL_MOCK_DATA;
    }
  },
  set(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save state in LocalStorage", e);
    }
  },
  reset() {
    this.set(INITIAL_MOCK_DATA);
    return JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
  }
};

/**
 * Global API Object
 */
const API = {
  /**
   * Fetches current user profile and linked accounts.
   * Returns: Promise<{ success: boolean, user: Object }>
   */
  async getUser() {
    await simulateNetworkDelay(300);
    const store = DataStore.get();
    return {
      success: true,
      user: store.user
    };
  },

  /**
   * Fetches current account balance.
   * Returns: Promise<{ success: boolean, balance: number, currency: string, formattedBalance: string, lastUpdated: string }>
   */
  async getBalance() {
    await simulateNetworkDelay(300);
    const store = DataStore.get();
    const balanceNum = Number(store.balance) || 0;
    return {
      success: true,
      balance: balanceNum,
      currency: store.currency || "INR",
      formattedBalance: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(balanceNum),
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  },

  /**
   * Fetches recent transactions.
   * Returns: Promise<{ success: boolean, transactions: Array<Object> }>
   */
  async getRecentTransactions(limit = 5) {
    await simulateNetworkDelay(350);
    const store = DataStore.get();
    const list = store.transactions.slice(0, limit);
    return {
      success: true,
      transactions: list
    };
  },

  /**
   * Fetches all transactions with optional filters.
   * Returns: Promise<{ success: boolean, transactions: Array<Object> }>
   */
  async getAllTransactions(filter = {}) {
    await simulateNetworkDelay(400);
    const store = DataStore.get();
    let list = [...store.transactions];

    if (filter.type && filter.type !== 'all') {
      if (filter.type === 'failed') {
        list = list.filter(t => t.status === 'failed');
      } else {
        list = list.filter(t => t.type === filter.type && t.status === 'success');
      }
    }

    if (filter.query && filter.query.trim()) {
      const q = filter.query.trim().toLowerCase();
      list = list.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.recipientName && t.recipientName.toLowerCase().includes(q)) ||
        (t.senderName && t.senderName.toLowerCase().includes(q)) ||
        (t.recipientUpi && t.recipientUpi.toLowerCase().includes(q)) ||
        (t.senderUpi && t.senderUpi.toLowerCase().includes(q)) ||
        (t.note && t.note.toLowerCase().includes(q)) ||
        (t.utr && t.utr.includes(q))
      );
    }

    return {
      success: true,
      transactions: list
    };
  },

  /**
   * Fetches frequent contacts.
   * Returns: Promise<{ success: boolean, contacts: Array<Object> }>
   */
  async getFrequentContacts() {
    await simulateNetworkDelay(250);
    const store = DataStore.get();
    return {
      success: true,
      contacts: store.contacts || []
    };
  },

  /**
   * Verifies the UPI PIN.
   * Demo valid PINs: '1234' or '123456'
   * Returns: Promise<{ success: boolean, message: string }>
   */
  async verifyPin(pin) {
    await simulateNetworkDelay(450);
    const cleanPin = String(pin).trim();
    if (cleanPin === '1234' || cleanPin === '123456') {
      return {
        success: true,
        message: "PIN verified successfully"
      };
    }
    return {
      success: false,
      message: "Incorrect UPI PIN. Please try again."
    };
  },

  /**
   * Sends money to a UPI ID or Phone number.
   * Expected: { recipient: string, recipientName?: string, amount: number, note?: string }
   * Returns: Promise<{ success: boolean, transactionId: string, utr: string, amount: number, recipient: string, recipientName: string, note: string, newBalance: number, timestamp: string, status: string, debitedFrom: string, error?: string }>
   */
  async sendMoney({ recipient, recipientName, amount, note }) {
    await simulateNetworkDelay(600);
    const store = DataStore.get();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return {
        success: false,
        error: "Invalid transfer amount",
        status: "failed"
      };
    }

    if (numAmount > store.balance) {
      return {
        success: false,
        error: "Insufficient account balance",
        status: "failed"
      };
    }

    const newBalance = store.balance - numAmount;
    const txId = "TXN" + Math.floor(1000000 + Math.random() * 9000000);
    const utr = "3" + Math.floor(10000000000 + Math.random() * 90000000000);
    const resolvedName = recipientName || (recipient.includes('@') ? recipient.split('@')[0] : recipient);

    const newTransaction = {
      id: txId,
      utr: utr,
      type: "debit",
      title: resolvedName,
      recipientName: resolvedName,
      recipientUpi: recipient,
      amount: numAmount,
      timestamp: new Date().toISOString(),
      status: "success",
      note: note || "Payment via UPI",
      category: "Transfer",
      debitedFrom: store.user.primaryBank.bankName + " " + store.user.primaryBank.accountNo
    };

    store.balance = newBalance;
    store.transactions.unshift(newTransaction);
    DataStore.set(store);

    return {
      success: true,
      transactionId: txId,
      utr: utr,
      amount: numAmount,
      recipient: recipient,
      recipientName: resolvedName,
      note: note || "Payment via UPI",
      newBalance: newBalance,
      timestamp: newTransaction.timestamp,
      status: "success",
      debitedFrom: newTransaction.debitedFrom
    };
  },

  /**
   * Performs Scan & Pay to a merchant.
   * Expected: { merchantId: string, merchantName: string, amount: number, note?: string }
   * Returns: Promise<{ success: boolean, transactionId: string, utr: string, amount: number, merchantId: string, merchantName: string, note: string, newBalance: number, timestamp: string, status: string, debitedFrom: string, error?: string }>
   */
  async scanAndPay({ merchantId, merchantName, amount, note }) {
    await simulateNetworkDelay(600);
    const store = DataStore.get();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return {
        success: false,
        error: "Invalid merchant payment amount",
        status: "failed"
      };
    }

    if (numAmount > store.balance) {
      return {
        success: false,
        error: "Insufficient account balance",
        status: "failed"
      };
    }

    const newBalance = store.balance - numAmount;
    const txId = "TXN" + Math.floor(1000000 + Math.random() * 9000000);
    const utr = "3" + Math.floor(10000000000 + Math.random() * 90000000000);
    const name = merchantName || "Merchant Payment";

    const newTransaction = {
      id: txId,
      utr: utr,
      type: "debit",
      title: name,
      recipientName: name,
      recipientUpi: merchantId,
      amount: numAmount,
      timestamp: new Date().toISOString(),
      status: "success",
      note: note || "Merchant QR payment",
      category: "Merchant Pay",
      debitedFrom: store.user.primaryBank.bankName + " " + store.user.primaryBank.accountNo
    };

    store.balance = newBalance;
    store.transactions.unshift(newTransaction);
    DataStore.set(store);

    return {
      success: true,
      transactionId: txId,
      utr: utr,
      amount: numAmount,
      recipient: merchantId,
      recipientName: name,
      merchantId: merchantId,
      merchantName: name,
      note: note || "Merchant QR payment",
      newBalance: newBalance,
      timestamp: newTransaction.timestamp,
      status: "success",
      debitedFrom: newTransaction.debitedFrom
    };
  },

  /**
   * Resets all demo data to factory defaults.
   * Returns: Promise<{ success: boolean }>
   */
  async resetData() {
    await simulateNetworkDelay(300);
    DataStore.reset();
    return { success: true };
  }
};

// Export to global scope
window.API = API;
