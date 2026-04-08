import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Search, ShoppingCart, User, Menu, X, ChevronRight, Star, 
  ShieldCheck, Zap, Package, MapPin, CreditCard, TrendingUp, 
  AlertTriangle, Settings, Upload, Award, Gift, LogOut, CheckCircle
} from 'lucide-react';
import { create } from 'zustand';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// --- CONFIG & CONSTANTS ---
const API_BASE = 'http://localhost:3001/api/v1';

// --- STATE MANAGEMENT (Zustand) ---
type ViewState = 'home' | 'checkout' | 'dashboard' | 'b2b' | 'loyalty' | 'tracking';

interface AppState {
  view: ViewState;
  cart: any[];
  user: any;
  searchQuery: string;
  isCartOpen: boolean;
  setView: (view: ViewState) => void;
  addToCart: (product: any, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setSearchQuery: (q: string) => void;
  toggleCart: () => void;
  clearCart: () => void;
}

const useStore = create<AppState>((set) => ({
  view: 'home',
  cart: [],
  user: { name: 'Alex Mercer', role: 'admin', points: 8450, tier: 'Platinum' },
  searchQuery: '',
  isCartOpen: false,
  setView: (view) => set({ view, isCartOpen: false }),
  addToCart: (product, qty = 1) => set((state) => {
    const existing = state.cart.find(item => item.id === product.id);
    if (existing) {
      return { cart: state.cart.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item) };
    }
    return { cart: [...state.cart, { ...product, qty }] };
  }),
  removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(item => item.id !== id) })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  clearCart: () => set({ cart: [] })
}));

// --- UTILS ---
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

// --- COMPONENTS ---

// 1. Navigation & Semantic Search (US-006)
const Navigation = () => {
  const { view, setView, cart, toggleCart, searchQuery, setSearchQuery } = useStore();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      fetch(`${API_BASE}/search?q=${searchQuery}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.results || []);
          setIsSearching(false);
        }).catch(() => setIsSearching(false));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0B0C10]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setView('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#66FCF1] to-[#FF007F] flex items-center justify-center mr-3 shadow-[0_0_20px_rgba(102,252,241,0.4)]">
              <Zap className="text-[#0B0C10] w-6 h-6" />
            </div>
            <span className="font-['Outfit'] font-bold text-2xl tracking-tight text-white">
              OMNI<span className="text-[#66FCF1]">COMMERCE</span>
            </span>
          </div>

          {/* Semantic Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 relative hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#66FCF1] transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3 bg-[#1F2833]/50 border border-white/10 rounded-2xl leading-5 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#66FCF1]/50 focus:border-[#66FCF1] focus:bg-[#1F2833] transition-all duration-300 font-['Inter']"
                placeholder="Search products, categories, or 'red shoes under $50'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Search Dropdown */}
              <AnimatePresence>
                {searchQuery.length > 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute mt-2 w-full bg-[#1F2833] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-400">Analyzing semantics...</div>
                    ) : searchResults.length > 0 ? (
                      <ul className="max-h-96 overflow-y-auto">
                        {searchResults.map((item) => (
                          <li key={item.id} className="p-4 hover:bg-white/5 cursor-pointer flex items-center gap-4 transition-colors" onClick={() => { setSearchQuery(''); setView('home'); }}>
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <p className="text-white font-medium">{item.name}</p>
                              <p className="text-[#66FCF1] text-sm">{formatCurrency(item.price)}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-gray-400">No exact matches found. Try adjusting your terms.</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <button onClick={() => setView('dashboard')} className="text-gray-300 hover:text-white transition-colors hidden lg:block">
              Admin
            </button>
            <button onClick={() => setView('b2b')} className="text-gray-300 hover:text-white transition-colors hidden lg:block">
              B2B Portal
            </button>
            <button onClick={() => setView('loyalty')} className="text-gray-300 hover:text-[#FF007F] transition-colors">
              <Award className="w-6 h-6" />
            </button>
            <button onClick={() => setView('tracking')} className="text-gray-300 hover:text-[#66FCF1] transition-colors">
              <Package className="w-6 h-6" />
            </button>
            <button onClick={toggleCart} className="relative text-gray-300 hover:text-white transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF007F] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {cart.reduce((acc, item) => acc + item.qty, 0)}
                </span>
              )}
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 border-2 border-[#66FCF1] cursor-pointer overflow-hidden">
               <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" alt="User" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// 2. Immersive Hero Section (US-001 Fallback/Simulation)
const HeroImmersive = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0B0C10] flex items-center justify-center">
      {/* Ambient Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#66FCF1]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF007F]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div style={{ y: y1, opacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[#66FCF1]/30 bg-[#66FCF1]/10 backdrop-blur-md"
        >
          <span className="text-[#66FCF1] text-sm font-semibold tracking-wider uppercase">Next-Gen Commerce Engine</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-['Outfit'] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-6 leading-tight"
        >
          Experience The <br/> Future of Retail.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-['Inter']"
        >
          Interact with our flagship products in stunning 3D. Hyper-personalized, headless, and built for global scale.
        </motion.p>
      </motion.div>

      {/* Simulated 3D Product Interaction (Parallax & Hover) */}
      <motion.div 
        style={{ y: y2 }}
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none mt-40"
      >
        <motion.div 
          animate={{ y: [0, -20, 0], rotateZ: [0, 2, -2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-[600px] h-[600px] pointer-events-auto cursor-grab active:cursor-grabbing"
          whileHover={{ scale: 1.05 }}
          drag dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }} dragElastic={0.1}
        >
          <img 
            src="https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=1200"
            alt="Flagship VR Headset"
            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(102,252,241,0.3)]"
          />
          {/* UI Overlay on Product */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-4">
             <div className="px-4 py-2 bg-[#1F2833]/80 backdrop-blur-md rounded-full border border-white/10 text-white text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#66FCF1] animate-ping" /> WebGL Active
             </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// 3. Personalized Product Grid (US-002)
const ProductGrid = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useStore();

  useEffect(() => {
    fetch(`${API_BASE}/recommendations`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.items || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center text-[#66FCF1]">Loading personalized grid...</div>;

  return (
    <section className="py-24 bg-[#0B0C10] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-['Outfit'] font-bold text-white mb-2">Recommended For You</h2>
            <p className="text-gray-400 font-['Inter']">Based on your recent browsing history and preferences.</p>
          </div>
          <button className="text-[#66FCF1] hover:text-white transition-colors flex items-center gap-2">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products?.map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-[#1F2833]/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-[#66FCF1]/30 transition-all duration-500"
            >
              <div className="aspect-w-4 aspect-h-3 overflow-hidden bg-black/20">
                <img 
                  src={product.image} alt={product.name} 
                  className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                {/* Hover Tooltip */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-[#1F2833]/90 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <p className="text-[#66FCF1] text-sm font-medium flex items-center gap-2">
                      <Star className="w-4 h-4 fill-current" /> Why we recommend this
                    </p>
                    <p className="text-gray-300 text-xs mt-1">Matches your interest in {product.category}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-[#FF007F] font-bold tracking-wider uppercase mb-1">{product.category}</p>
                    <h3 className="text-xl font-['Outfit'] font-semibold text-white">{product.name}</h3>
                  </div>
                  <span className="text-lg font-bold text-[#66FCF1]">{formatCurrency(product.price)}</span>
                </div>
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-[#66FCF1] text-white hover:text-[#0B0C10] font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" /> Quick Add
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 4. Single-Page Checkout (US-003)
const CheckoutSPA = () => {
  const { cart, setView, clearCart } = useStore();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({ email: '', phone: '', zip: '' });
  const [errors, setErrors] = useState({ email: '', phone: '', zip: '' });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 0 ? 15 : 0;
  const total = subtotal + tax + shipping;

  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
    if (name === 'phone' && !/^\d{10}$/.test(value.replace(/\D/g, ''))) error = 'Invalid phone (10 digits)';
    if (name === 'zip' && !/^\d{5}(-\d{4})?$/.test(value)) error = 'Invalid ZIP code';
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      setStep(3); // Success
    }, 2000);
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-[#0B0C10] flex flex-col items-center justify-center">
        <ShoppingCart className="w-24 h-24 text-gray-600 mb-6" />
        <h2 className="text-3xl text-white font-['Outfit'] mb-4">Your cart is empty</h2>
        <button onClick={() => setView('home')} className="px-8 py-3 bg-[#66FCF1] text-[#0B0C10] rounded-xl font-bold">Return to Shop</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#0B0C10]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-['Outfit'] font-bold text-white mb-12">Secure Checkout</h1>
        
        {step === 3 ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1F2833]/50 border border-[#66FCF1]/30 rounded-3xl p-12 text-center">
            <CheckCircle className="w-24 h-24 text-[#66FCF1] mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">Payment Successful!</h2>
            <p className="text-gray-400 mb-8">Your order #ORD-{Math.floor(Math.random()*10000)} has been placed.</p>
            <button onClick={() => setView('tracking')} className="px-8 py-3 bg-[#66FCF1] text-[#0B0C10] rounded-xl font-bold">Track Shipment</button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Express Checkout */}
              <div className="bg-[#1F2833]/40 p-8 rounded-3xl border border-white/5">
                <h3 className="text-xl text-white font-semibold mb-6 flex items-center gap-2"><Zap className="text-[#FF007F]"/> Express Checkout</h3>
                <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition">
                    Apple Pay
                  </button>
                  <button className="flex-1 py-4 bg-[#4285F4] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#3367D6] transition">
                    Google Pay
                  </button>
                </div>
                <div className="relative mt-8">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="px-4 bg-[#1F2833] text-gray-400">Or pay with card</span></div>
                </div>
              </div>

              {/* Contact & Shipping */}
              <div className="bg-[#1F2833]/40 p-8 rounded-3xl border border-white/5">
                <h3 className="text-xl text-white font-semibold mb-6">Contact & Shipping</h3>
                <div className="space-y-4">
                  <div>
                    <input 
                      type="email" placeholder="Email Address" 
                      className={`w-full bg-[#0B0C10] border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-[#66FCF1] outline-none`}
                      onChange={(e) => { setFormData({...formData, email: e.target.value}); validateField('email', e.target.value); }}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="First Name" className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#66FCF1] outline-none" />
                    <input type="text" placeholder="Last Name" className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#66FCF1] outline-none" />
                  </div>
                  <input type="text" placeholder="Address" className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#66FCF1] outline-none" />
                  <div className="grid grid-cols-3 gap-4">
                    <input type="text" placeholder="City" className="col-span-1 w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#66FCF1] outline-none" />
                    <input type="text" placeholder="State" className="col-span-1 w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#66FCF1] outline-none" />
                    <div>
                      <input 
                        type="text" placeholder="ZIP Code" 
                        className={`w-full bg-[#0B0C10] border ${errors.zip ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-[#66FCF1] outline-none`}
                        onChange={(e) => { setFormData({...formData, zip: e.target.value}); validateField('zip', e.target.value); }}
                      />
                      {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment (Mock Stripe Elements) */}
              <div className="bg-[#1F2833]/40 p-8 rounded-3xl border border-white/5">
                <h3 className="text-xl text-white font-semibold mb-6 flex items-center gap-2"><CreditCard className="text-[#66FCF1]"/> Payment Details</h3>
                <div className="p-4 bg-[#0B0C10] border border-white/10 rounded-xl mb-4">
                   {/* Simulated Stripe Element */}
                   <div className="flex justify-between items-center text-gray-400 font-mono">
                      <span>**** **** **** 4242</span>
                      <span>12/25</span>
                      <span>CVC</span>
                   </div>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Payments are secure and encrypted.</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#1F2833]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 sticky top-32">
                <h3 className="text-xl text-white font-semibold mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-black/50" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium line-clamp-2">{item.name}</p>
                        <p className="text-gray-400 text-xs">Qty: {item.qty}</p>
                      </div>
                      <p className="text-[#66FCF1] font-medium">{formatCurrency(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 text-sm border-t border-white/10 pt-6 mb-6">
                  <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Estimated Tax</span><span>{formatCurrency(tax)}</span></div>
                  <div className="flex justify-between text-white text-xl font-bold pt-4 border-t border-white/10">
                    <span>Total</span><span className="text-[#66FCF1]">{formatCurrency(total)}</span>
                  </div>
                </div>
                <button 
                  onClick={handleProcess}
                  disabled={isProcessing || Object.values(errors).some(e => e !== '') || !formData.email}
                  className="w-full py-4 bg-gradient-to-r from-[#66FCF1] to-[#00E5FF] text-[#0B0C10] rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isProcessing ? <div className="w-6 h-6 border-2 border-[#0B0C10] border-t-transparent rounded-full animate-spin" /> : `Pay ${formatCurrency(total)}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Admin Dashboard (US-004, US-005, US-010)
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventoryData, setInventoryData] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/inventory/predictive`)
      .then(res => res.json())
      .then(data => setInventoryData(data));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-24 bg-[#0B0C10] flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#1F2833]/50 border-r border-white/5 p-6 fixed h-full">
        <h2 className="text-white font-['Outfit'] font-bold text-xl mb-8">Enterprise Admin</h2>
        <nav className="space-y-2">
          {[ 
            { id: 'inventory', icon: TrendingUp, label: 'Supply Chain' },
            { id: 'pricing', icon: Zap, label: 'Dynamic Pricing' },
            { id: 'rbac', icon: ShieldCheck, label: 'Access Control' }
          ].map(tab => (
            <button 
              key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-[#66FCF1]/10 text-[#66FCF1]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {activeTab === 'inventory' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-['Outfit'] font-bold text-white">Predictive Inventory</h1>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> Live Sync Active
                </span>
              </div>
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventoryData?.alerts?.map((alert: any, i: number) => (
                <div key={i} className={`p-4 rounded-xl border ${alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'} flex items-start gap-3`}>
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{alert.message}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-[#1F2833]/40 p-6 rounded-3xl border border-white/5 h-[400px]">
              <h3 className="text-white mb-6 font-medium">Global Stock Depletion Forecast (SKU-003)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={inventoryData?.timeline || []}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#66FCF1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#66FCF1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff50" tick={{fill: '#ffffff50'}} />
                  <YAxis stroke="#ffffff50" tick={{fill: '#ffffff50'}} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1F2833', border: '1px solid #ffffff20', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="stock" stroke="#66FCF1" fillOpacity={1} fill="url(#colorStock)" strokeWidth={3} />
                  <Area type="monotone" dataKey="predicted" stroke="#FF007F" strokeDasharray="5 5" fill="none" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeTab === 'pricing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <h1 className="text-3xl font-['Outfit'] font-bold text-white">Dynamic Pricing Engine</h1>
            <div className="bg-[#1F2833]/40 p-8 rounded-3xl border border-white/5">
              <h3 className="text-white mb-6 font-medium">Rule Builder</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[#0B0C10] p-4 rounded-xl border border-white/10">
                  <span className="text-[#FF007F] font-bold">IF</span>
                  <select className="bg-[#1F2833] text-white border border-white/10 rounded-lg px-3 py-2 outline-none">
                    <option>Inventory Level</option>
                    <option>Competitor Price</option>
                  </select>
                  <span className="text-white">is less than</span>
                  <input type="number" defaultValue={50} className="w-20 bg-[#1F2833] text-white border border-white/10 rounded-lg px-3 py-2 outline-none" />
                  <span className="text-[#66FCF1] font-bold ml-4">THEN</span>
                  <select className="bg-[#1F2833] text-white border border-white/10 rounded-lg px-3 py-2 outline-none">
                    <option>Increase Price By</option>
                    <option>Decrease Price By</option>
                  </select>
                  <input type="text" defaultValue="5%" className="w-20 bg-[#1F2833] text-white border border-white/10 rounded-lg px-3 py-2 outline-none" />
                </div>
                <button className="px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition border border-white/10">
                  + Add Condition
                </button>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10 flex justify-end gap-4">
                <button className="px-6 py-3 bg-[#1F2833] text-white rounded-xl hover:bg-white/10 transition">Run Simulation</button>
                <button className="px-6 py-3 bg-[#66FCF1] text-[#0B0C10] rounded-xl font-bold">Deploy Rule</button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'rbac' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <h1 className="text-3xl font-['Outfit'] font-bold text-white">Role-Based Access Control</h1>
            <div className="bg-[#1F2833]/40 rounded-3xl border border-white/5 overflow-hidden">
              <table className="w-full text-left text-gray-300">
                <thead className="bg-[#0B0C10] text-xs uppercase text-gray-500">
                  <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">MFA Status</th><th className="px-6 py-4">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[ 
                    { name: 'Sarah Connor', email: 'sarah@omni.com', role: 'Super Admin', mfa: true },
                    { name: 'John Smith', email: 'john@omni.com', role: 'Merchandiser', mfa: true },
                    { name: 'Alice Vance', email: 'alice@omni.com', role: 'Support', mfa: false }
                  ].map((u, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-[#1F2833] rounded text-xs border border-white/10">{u.role}</span></td>
                      <td className="px-6 py-4">
                        {u.mfa ? <span className="text-green-400 flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Enabled</span> : <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Disabled</span>}
                      </td>
                      <td className="px-6 py-4"><button className="text-[#66FCF1] hover:underline text-sm">Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// 6. B2B Bulk Order Matrix (US-007)
const B2BMatrix = () => {
  const [rows, setRows] = useState([{ sku: 'sku-001', qty: 50 }, { sku: 'sku-004', qty: 200 }, { sku: '', qty: 0 }]);
  
  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#0B0C10]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-['Outfit'] font-bold text-white mb-2">B2B Procurement</h1>
            <p className="text-gray-400">Rapid entry matrix and CSV upload for high-volume orders.</p>
          </div>
          <button className="px-6 py-3 bg-[#1F2833] text-white rounded-xl border border-white/10 flex items-center gap-2 hover:bg-white/5 transition">
            <Upload className="w-5 h-5" /> Upload CSV
          </button>
        </div>

        <div className="bg-[#1F2833]/40 rounded-3xl border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#0B0C10] text-gray-400 text-sm">
              <tr><th className="px-6 py-4">SKU</th><th className="px-6 py-4">Quantity</th><th className="px-6 py-4">Validation</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <input type="text" value={row.sku} onChange={(e) => { const newRows = [...rows]; newRows[i].sku = e.target.value; setRows(newRows); }} className="bg-transparent border-b border-white/20 text-white px-2 py-1 outline-none focus:border-[#66FCF1] w-full font-mono" placeholder="Enter SKU..." />
                  </td>
                  <td className="px-6 py-4">
                    <input type="number" value={row.qty} onChange={(e) => { const newRows = [...rows]; newRows[i].qty = parseInt(e.target.value)||0; setRows(newRows); }} className="bg-transparent border-b border-white/20 text-white px-2 py-1 outline-none focus:border-[#66FCF1] w-32" />
                  </td>
                  <td className="px-6 py-4">
                    {row.sku ? <span className="text-green-400 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4"/> In Stock</span> : <span className="text-gray-600 text-sm">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-6 bg-[#0B0C10]/50 flex justify-between items-center">
            <button onClick={() => setRows([...rows, {sku:'', qty:0}])} className="text-[#66FCF1] text-sm hover:underline">+ Add Row</button>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-gray-400 text-sm">Volume Discount Applied: <span className="text-[#FF007F]">-15%</span></p>
                <p className="text-white font-bold text-xl">Est. Total: $42,500.00</p>
              </div>
              <button className="px-8 py-3 bg-[#66FCF1] text-[#0B0C10] rounded-xl font-bold">Add Batch to Cart</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 7. Loyalty Portal (US-008)
const LoyaltyPortal = () => {
  const { user } = useStore();
  const progress = (user.points / 10000) * 100;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#0B0C10]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-[#1F2833] to-[#0B0C10] p-12 rounded-3xl border border-white/10 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FF007F]/20 rounded-full blur-[80px]" />
          
          <div className="relative z-10 flex items-center gap-8 mb-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF007F] to-purple-600 p-1">
              <div className="w-full h-full bg-[#0B0C10] rounded-full flex items-center justify-center">
                <Award className="w-10 h-10 text-[#FF007F]" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-['Outfit'] font-bold text-white mb-2">{user.tier} Member</h1>
              <p className="text-gray-400 text-lg">{user.points.toLocaleString()} Available Points</p>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Current: {user.tier}</span>
              <span className="text-[#66FCF1]">Next: Diamond (10,000 pts)</span>
            </div>
            <div className="h-4 bg-[#0B0C10] rounded-full overflow-hidden border border-white/10">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#FF007F] to-[#66FCF1] relative"
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
              </motion.div>
            </div>
            <p className="text-right text-xs text-gray-500 mt-2">{(10000 - user.points).toLocaleString()} points to upgrade</p>
          </div>

          <h3 className="text-xl text-white font-semibold mb-6">Available Rewards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[ 
              { title: '$50 Off Next Order', cost: 5000, icon: Gift },
              { title: 'Free Expedited Shipping', cost: 2000, icon: Package }
            ].map((reward, i) => (
              <div key={i} className="p-6 bg-[#0B0C10]/50 border border-white/5 rounded-2xl flex items-center justify-between hover:border-[#66FCF1]/50 transition cursor-pointer">
                <div className="flex items-center gap-4">
                  <reward.icon className="w-8 h-8 text-[#66FCF1]" />
                  <div>
                    <p className="text-white font-medium">{reward.title}</p>
                    <p className="text-sm text-[#FF007F]">{reward.cost} pts</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white/5 text-white rounded-lg text-sm hover:bg-white/10">Redeem</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 8. Live Shipment Tracker (US-009)
const ShipmentTracker = () => {
  const [tracking, setTracking] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/shipping/track/ORD-123`)
      .then(res => res.json())
      .then(data => setTracking(data));
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#0B0C10]">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-['Outfit'] font-bold text-white mb-8">Track Shipment</h1>
        
        <div className="bg-[#1F2833]/40 rounded-3xl border border-white/5 overflow-hidden">
          {/* Mock Map Area */}
          <div className="h-64 bg-[#0B0C10] relative overflow-hidden">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" alt="Map" className="w-full h-full object-cover opacity-30 grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F2833] to-transparent" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-[#66FCF1]/20 rounded-full flex items-center justify-center animate-pulse">
                <MapPin className="w-6 h-6 text-[#66FCF1]" />
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-8 pb-8 border-b border-white/10">
              <div>
                <p className="text-gray-400 text-sm">Tracking Number</p>
                <p className="text-white font-mono text-lg">1Z9999999999999999</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-[#66FCF1] font-bold text-lg">{tracking?.status || 'Loading...'}</p>
              </div>
            </div>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#66FCF1] before:to-white/10">
              {tracking?.timeline?.map((event: any, i: number) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#1F2833] ${event.completed ? 'bg-[#66FCF1]' : 'bg-gray-700'} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_rgba(31,40,51,1)] z-10`}>
                    {event.completed && <CheckCircle className="w-5 h-5 text-[#0B0C10]" />}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-[#0B0C10]/50">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-bold ${event.completed ? 'text-white' : 'text-gray-500'}`}>{event.status}</h4>
                      <time className="text-xs text-gray-500">{event.time !== 'Pending' ? new Date(event.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 9. Global Footer
const Footer = () => (
  <footer className="bg-[#0B0C10] border-t border-white/10 pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <span className="font-['Outfit'] font-bold text-2xl tracking-tight text-white mb-6 block">
            OMNI<span className="text-[#66FCF1]">COMMERCE</span>
          </span>
          <p className="text-gray-400 max-w-sm mb-8 font-['Inter']">
            The next-generation global e-commerce platform. Hyper-personalized, headless, and built for enterprise scale.
          </p>
          <div className="flex gap-4">
            <input type="email" placeholder="Enter email for updates" className="bg-[#1F2833] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#66FCF1] flex-1" />
            <button className="px-6 py-2 bg-[#66FCF1] text-[#0B0C10] rounded-xl font-bold hover:bg-white transition">Subscribe</button>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-6">Platform</h4>
          <ul className="space-y-4 text-gray-400">
            <li><a href="#" className="hover:text-[#66FCF1] transition">3D Storefront</a></li>
            <li><a href="#" className="hover:text-[#66FCF1] transition">B2B Wholesale</a></li>
            <li><a href="#" className="hover:text-[#66FCF1] transition">Dynamic Pricing</a></li>
            <li><a href="#" className="hover:text-[#66FCF1] transition">API Documentation</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-6">Company</h4>
          <ul className="space-y-4 text-gray-400">
            <li><a href="#" className="hover:text-[#66FCF1] transition">About Us</a></li>
            <li><a href="#" className="hover:text-[#66FCF1] transition">Careers</a></li>
            <li><a href="#" className="hover:text-[#66FCF1] transition">Security (PCI-DSS)</a></li>
            <li><a href="#" className="hover:text-[#66FCF1] transition">Contact Support</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <p>&copy; 2023 OmniCommerce Enterprise. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
          <a href="#" className="hover:text-white">WCAG 2.1 AA Compliant</a>
        </div>
      </div>
    </div>
  </footer>
);

// 10. Slide-out Cart Modal
const CartDrawer = () => {
  const { isCartOpen, toggleCart, cart, removeFromCart, setView } = useStore();
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#1F2833] border-l border-white/10 z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-['Outfit'] font-bold text-white">Your Cart</h2>
              <button onClick={toggleCart} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-[#0B0C10]/50 p-4 rounded-2xl border border-white/5">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="text-white font-medium line-clamp-1">{item.name}</h4>
                      <p className="text-[#66FCF1] font-bold mt-1">{formatCurrency(item.price)}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-400">Qty: {item.qty}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 text-sm hover:underline">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#0B0C10]">
                <div className="flex justify-between text-white mb-6">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-xl">{formatCurrency(subtotal)}</span>
                </div>
                <button 
                  onClick={() => { toggleCart(); setView('checkout'); }}
                  className="w-full py-4 bg-[#66FCF1] text-[#0B0C10] rounded-xl font-bold text-lg hover:bg-white transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const { view } = useStore();

  // Scroll to top on view change
  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-200 font-['Inter'] selection:bg-[#66FCF1] selection:text-[#0B0C10]">
      <Navigation />
      <CartDrawer />
      
      <main>
        <AnimatePresence mode="wait">
          <motion.div 
            key={view}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {view === 'home' && (
              <>
                <HeroImmersive />
                <ProductGrid />
              </>
            )}
            {view === 'checkout' && <CheckoutSPA />}
            {view === 'dashboard' && <AdminDashboard />}
            {view === 'b2b' && <B2BMatrix />}
            {view === 'loyalty' && <LoyaltyPortal />}
            {view === 'tracking' && <ShipmentTracker />}
          </motion.div>
        </AnimatePresence>
      </main>

      {view !== 'dashboard' && <Footer />}
    </div>
  );
}
