import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CreditCard,
  ArrowRightLeft,
  PieChart,
  Settings,
  Bell,
  Search,
  User,
  Zap,
  Coffee,
  ShoppingBag,
  Plane,
  Home,
  Smartphone,
  ChevronRight,
  X,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

// --- API Service ---
const API_BASE = 'http://localhost:5000/api/v1';

const fetcher = async (endpoint: string, options?: RequestInit) => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
};

// --- Utility Functions ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

// --- Animation Variants ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'accounts', icon: CreditCard, label: 'Accounts' },
    { id: 'transfers', icon: ArrowRightLeft, label: 'Transfers' },
    { id: 'analytics', icon: PieChart, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-20 lg:w-64 h-screen bg-[#0A0A0C]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col items-center lg:items-start py-8 z-20 transition-all duration-300"
    >
      <div className="flex items-center gap-3 px-0 lg:px-8 mb-12">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)]">
          <Zap className="text-white w-6 h-6" />
        </div>
        <span className="hidden lg:block text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          NEXUS
        </span>
      </div>

      <nav className="flex-1 w-full px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent border-l-2 border-cyan-400"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 text-cyan-400' : 'group-hover:scale-110'}`} />
              <span className="hidden lg:block font-medium relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="w-full px-4 mt-auto">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/5 hidden lg:block">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-white">Bank Grade Security</span>
          </div>
          <p className="text-xs text-slate-400">End-to-end encrypted session.</p>
        </div>
      </div>
    </motion.aside>
  );
};

const Topbar = () => (
  <header className="h-20 w-full flex items-center justify-between px-8 bg-[#050507]/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20">
    <div className="flex items-center gap-4">
      <h1 className="text-2xl font-semibold text-white tracking-tight">
        Good evening, <span className="text-slate-400">Alexander</span>
      </h1>
    </div>
    <div className="flex items-center gap-6">
      <div className="relative hidden md:block">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search transactions, accounts... (Cmd+K)"
          className="w-80 bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
        />
      </div>
      <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
        <Bell className="w-5 h-5 text-slate-300" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.8)] animate-pulse" />
      </button>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyan-500/50 transition-colors">
        <User className="w-5 h-5 text-slate-300" />
      </div>
    </div>
  </header>
);

const NetWorthHero = ({ data }: { data: any }) => {
  if (!data) return <div className="h-64 bg-white/5 animate-pulse rounded-[2rem]" />;

  return (
    <motion.div variants={fadeUp} className="relative w-full h-72 bg-[#0A0A0C]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      
      <div className="z-10">
        <h2 className="text-slate-400 font-medium mb-2">Total Net Worth</h2>
        <div className="flex items-baseline gap-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tighter">
            {formatCurrency(data.total_net_worth)}
          </h1>
          <span className="flex items-center text-emerald-400 text-sm font-medium bg-emerald-400/10 px-2 py-1 rounded-lg">
            <TrendingUp className="w-4 h-4 mr-1" /> +2.4% (30d)
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-40 z-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.historical_data}>
            <defs>
              <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
              labelStyle={{ display: 'none' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#00E5FF" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorNetWorth)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

const QuickActions = ({ onTransfer }: { onTransfer: () => void }) => {
  const actions = [
    { icon: ArrowRightLeft, label: 'Transfer', onClick: onTransfer, color: 'from-cyan-500 to-blue-600' },
    { icon: Zap, label: 'Pay Bills', onClick: () => {}, color: 'from-purple-500 to-pink-600' },
    { icon: CreditCard, label: 'Cards', onClick: () => {}, color: 'from-emerald-400 to-teal-500' },
    { icon: ShieldCheck, label: 'Freeze', onClick: () => {}, color: 'from-rose-500 to-red-600' },
  ];

  return (
    <motion.div variants={fadeUp} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={action.onClick}
          className="flex-shrink-0 flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
            <action.icon className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-white">{action.label}</span>
        </button>
      ))}
    </motion.div>
  );
};

const AccountCard = ({ account }: { account: any }) => {
  const isPositive = account.trend === 'positive';
  const strokeColor = isPositive ? '#00E676' : '#FF1744';

  return (
    <motion.div 
      variants={fadeUp}
      className="bg-[#121216]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between h-56 hover:bg-[#1a1a20]/80 hover:border-white/10 transition-all duration-300 group"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">{account.name}</h3>
          <p className="text-white/60 text-xs font-mono">{account.masked_number}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <CreditCard className="w-4 h-4 text-slate-300" />
        </div>
      </div>

      <div>
        <div className="text-3xl font-bold text-white tracking-tight mb-1">
          {formatCurrency(account.available_balance)}
        </div>
        <div className="text-xs text-slate-500">
          Current: {formatCurrency(account.current_balance)}
        </div>
      </div>

      <div className="h-12 w-full mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={account.trend_data}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={strokeColor} 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

const SpendingAnalytics = ({ data }: { data: any }) => {
  if (!data) return <div className="h-80 bg-white/5 animate-pulse rounded-[2rem] lg:col-span-1" />;

  return (
    <motion.div variants={fadeUp} className="bg-[#0A0A0C]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 lg:col-span-1 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-6">Spending Insights</h3>
      <div className="flex-1 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <RechartsPieChart>
            <Pie
              data={data.categories}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.categories.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#121216', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => formatCurrency(value)}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-slate-400">Total Spent</span>
          <span className="text-xl font-bold text-white">{formatCurrency(data.total_spent)}</span>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {data.categories.map((cat: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-slate-300">{cat.name}</span>
            </div>
            <span className="text-white font-medium">{formatCurrency(cat.value)}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const TransactionPanel = ({ transactions }: { transactions: any[] }) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'Dining': return <Coffee className="w-4 h-4 text-purple-400" />;
      case 'Tech': return <Smartphone className="w-4 h-4 text-cyan-400" />;
      case 'Transport': return <Plane className="w-4 h-4 text-rose-400" />;
      case 'Income': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      default: return <ShoppingBag className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <motion.div variants={fadeUp} className="bg-[#0A0A0C]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 lg:col-span-2 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
        <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">View All</button>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {transactions?.map((tx, idx) => (
          <motion.div 
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                {getIcon(tx.category)}
              </div>
              <div>
                <p className="text-white font-medium">{tx.merchant}</p>
                <p className="text-xs text-slate-500">{formatDate(tx.timestamp)} • {tx.category}</p>
              </div>
            </div>
            <div className={`font-medium ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
              {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
            </div>
          </motion.div>
        ))}
        {!transactions && (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-white/5 animate-pulse rounded" />
                <div className="h-3 w-24 bg-white/5 animate-pulse rounded" />
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

const TransferModal = ({ isOpen, onClose, accounts }: { isOpen: boolean, onClose: () => void, accounts: any[] }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setAmount('');
        setSuccess(false);
      }, 300);
    }
  }, [isOpen]);

  const handleTransfer = async () => {
    setIsProcessing(true);
    // Simulate API call
    await fetcher('/transfers/internal', { method: 'POST' });
    setIsProcessing(false);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-[#121216] border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold text-white">
            {success ? 'Transfer Complete' : 'Transfer Funds'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[300px] flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && !success && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="flex-1 flex flex-col space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">From Account</label>
                  <select className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl p-4 text-white appearance-none focus:outline-none focus:border-cyan-500">
                    {accounts?.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.available_balance)})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <ArrowRightLeft className="w-4 h-4 text-slate-400 rotate-90" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">To Account</label>
                  <select className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl p-4 text-white appearance-none focus:outline-none focus:border-cyan-500">
                    {accounts?.filter(a => a.id !== accounts[0]?.id).map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="w-full py-4 mt-auto bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition-colors"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {step === 2 && !success && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="flex-1 flex flex-col items-center justify-center space-y-8"
              >
                <div className="text-center">
                  <p className="text-slate-400 mb-2">Enter Amount</p>
                  <div className="flex items-center justify-center text-5xl font-bold text-white">
                    <span className="text-slate-500 mr-2">$</span>
                    <input 
                      type="number" 
                      autoFocus
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-transparent w-48 text-center focus:outline-none placeholder:text-slate-700"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex gap-4 w-full mt-auto">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleTransfer}
                    disabled={!amount || isProcessing}
                    className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 text-black font-semibold rounded-xl transition-colors flex items-center justify-center"
                  >
                    {isProcessing ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'Confirm'}
                  </button>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center space-y-4 py-8"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Transfer Successful</h3>
                <p className="text-slate-400">${amount} has been transferred.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Application --- //

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);
  
  // State
  const [accounts, setAccounts] = useState<any[] | null>(null);
  const [netWorth, setNetWorth] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[] | null>(null);
  const [spending, setSpending] = useState<any | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [accRes, nwRes, txRes, spRes] = await Promise.all([
        fetcher('/accounts'),
        fetcher('/analytics/net-worth'),
        fetcher('/transactions'),
        fetcher('/analytics/spending')
      ]);
      
      if (accRes) setAccounts(accRes.data);
      if (nwRes) setNetWorth(nwRes);
      if (txRes) setTransactions(txRes.data);
      if (spRes) setSpending(spRes);
    };
    loadData();
  }, []);

  return (
    <div className="flex h-screen bg-[#050507] text-white font-sans overflow-hidden selection:bg-cyan-500/30">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-7xl mx-auto space-y-8 pb-20"
          >
            {/* Hero Section */}
            <NetWorthHero data={netWorth} />

            {/* Quick Actions */}
            <QuickActions onTransfer={() => setTransferModalOpen(true)} />

            {/* Accounts Grid */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 px-2">Your Accounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts ? (
                  accounts.map(acc => <AccountCard key={acc.id} account={acc} />)
                ) : (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-56 bg-white/5 animate-pulse rounded-[2rem]" />
                  ))
                )}
              </div>
            </div>

            {/* Analytics & Transactions Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SpendingAnalytics data={spending} />
              <TransactionPanel transactions={transactions || []} />
            </div>

          </motion.div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <TransferModal 
            isOpen={isTransferModalOpen} 
            onClose={() => setTransferModalOpen(false)} 
            accounts={accounts || []}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
