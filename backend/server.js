const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock Data Generators
const generateSparkline = (base, volatility, points = 30) => {
  let current = base;
  return Array.from({ length: points }, (_, i) => {
    current = current + (Math.random() - 0.4) * volatility;
    return { day: i, value: Math.max(0, current) };
  });
};

const generateNetWorthHistory = () => {
  let current = 1150000;
  return Array.from({ length: 30 }, (_, i) => {
    current = current + (Math.random() - 0.3) * 15000;
    return { date: `Day ${i + 1}`, value: current };
  });
};

// Endpoints
app.get('/api/v1/accounts', (req, res) => {
  setTimeout(() => {
    res.json({
      data: [
        {
          id: 'acc-1',
          type: 'Checking',
          name: 'Nexus Premier Checking',
          masked_number: '••4092',
          current_balance: 24580.50,
          available_balance: 24000.00,
          currency: 'USD',
          trend: 'positive',
          trend_data: generateSparkline(20000, 1000)
        },
        {
          id: 'acc-2',
          type: 'Savings',
          name: 'High-Yield Vault',
          masked_number: '••8819',
          current_balance: 145000.00,
          available_balance: 145000.00,
          currency: 'USD',
          trend: 'positive',
          trend_data: generateSparkline(140000, 500)
        },
        {
          id: 'acc-3',
          type: 'Investment',
          name: 'Quantum Portfolio',
          masked_number: '••1102',
          current_balance: 1076309.00,
          available_balance: 1076309.00,
          currency: 'USD',
          trend: 'negative',
          trend_data: generateSparkline(1100000, 5000)
        }
      ]
    });
  }, 600);
});

app.get('/api/v1/analytics/net-worth', (req, res) => {
  setTimeout(() => {
    res.json({
      total_net_worth: 1245889.50,
      currency: 'USD',
      historical_data: generateNetWorthHistory()
    });
  }, 400);
});

app.get('/api/v1/transactions', (req, res) => {
  setTimeout(() => {
    res.json({
      data: [
        { id: 'tx-1', amount: -120.50, type: 'debit', category: 'Dining', merchant: 'Stellar Steakhouse', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 'tx-2', amount: 4500.00, type: 'credit', category: 'Income', merchant: 'Nexus Corp Payroll', timestamp: new Date(Date.now() - 86400000).toISOString() },
        { id: 'tx-3', amount: -45.00, type: 'debit', category: 'Transport', merchant: 'Uber', timestamp: new Date(Date.now() - 172800000).toISOString() },
        { id: 'tx-4', amount: -899.00, type: 'debit', category: 'Tech', merchant: 'Apple Store', timestamp: new Date(Date.now() - 259200000).toISOString() },
        { id: 'tx-5', amount: -15.99, type: 'debit', category: 'Entertainment', merchant: 'Netflix', timestamp: new Date(Date.now() - 345600000).toISOString() },
        { id: 'tx-6', amount: 150.00, type: 'credit', category: 'Transfer', merchant: 'Transfer from Savings', timestamp: new Date(Date.now() - 432000000).toISOString() }
      ]
    });
  }, 500);
});

app.get('/api/v1/analytics/spending', (req, res) => {
  setTimeout(() => {
    res.json({
      total_spent: 3450.80,
      categories: [
        { name: 'Housing', value: 2000, color: '#00E5FF' },
        { name: 'Dining', value: 600, color: '#D500F9' },
        { name: 'Tech', value: 500, color: '#00E676' },
        { name: 'Transport', value: 350.80, color: '#FF1744' }
      ]
    });
  }, 700);
});

app.post('/api/v1/transfers/internal', (req, res) => {
  setTimeout(() => {
    res.json({ status: 'COMPLETED', transaction_id: `TRX-${Math.floor(Math.random() * 1000000)}`, timestamp: new Date().toISOString() });
  }, 1200);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Nexus API running on port ${PORT}`));