import React, { useState, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShoppingBag, User, Menu, X, ChevronRight, Star, 
  ShieldCheck, Truck, RefreshCw, CreditCard, LogOut, Settings, 
  Package, TrendingUp, Users, DollarSign, Activity, CheckCircle2, AlertCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE = 'http://localhost:3001/api/v1';

// --- TYPES ---
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  image: string;
  gallery: string[];
  variants: { id: string; name: string }[];
  stock: number;
};

type CartItem = Product & { quantity: number; selectedVariant: string };

type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

// --- ZUSTAND STORES ---
interface AppState {
  route: string;
  params: Record<string, string>;
  navigate: (path: string) => void;
  isCartOpen: boolean;
  toggleCart: () => void;
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const useAppStore = create<AppState>((set) => ({
  route: '/',
  params: {},
  navigate: (path) => {
    // Simple path matching for /product/:slug
    if (path.startsWith('/product/')) {
      const slug = path.split('/')[2];
      set({ route: '/product', params: { slug } });
    } else {
      set({ route: path, params: {} });
    }
    window.scrollTo(0, 0);
  },
  isCartOpen: false,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })), 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));

interface CartState {
  items: CartItem[];
  addItem: (product: Product, variantId: string) => void;
  removeItem: (id: string, variantId: string) => void;
  updateQuantity: (id: string, variantId: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product, variantId) => set((state) => {
    const existing = state.items.find(i => i.id === product.id && i.selectedVariant === variantId);
    if (existing) {
      return { items: state.items.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i) };
    }
    return { items: [...state.items, { ...product, quantity: 1, selectedVariant: variantId }] };
  }),
  removeItem: (id, variantId) => set((state) => ({
    items: state.items.filter(i => !(i.id === id && i.selectedVariant === variantId))
  })),
  updateQuantity: (id, variantId, qty) => set((state) => ({
    items: state.items.map(i => (i.id === id && i.selectedVariant === variantId) ? { ...i, quantity: Math.max(1, qty) } : i)
  })),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((total, item) => total + (item.basePrice * item.quantity), 0),
}));

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));

// --- API HELPERS ---
const fetcher = async (endpoint: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API Error');
  return data;
};

// --- UI COMPONENTS ---
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost', size?: 'sm' | 'md' | 'lg', isLoading?: boolean }>(( 
  { className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref
) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0C10] disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-[#66FCF1] text-[#0B0C10] hover:bg-[#45e8dc] shadow-[0_0_15px_rgba(102,252,241,0.3)] hover:shadow-[0_0_25px_rgba(102,252,241,0.5)] focus:ring-[#66FCF1]",
    secondary: "bg-[#9D4EDD] text-white hover:bg-[#8a3bc7] shadow-[0_0_15px_rgba(157,78,221,0.3)] focus:ring-[#9D4EDD]",
    outline: "border border-[#C5C6C7]/30 text-white hover:bg-[#1F2833] focus:ring-[#C5C6C7]",
    ghost: "text-[#C5C6C7] hover:text-white hover:bg-[#1F2833]/50 focus:ring-[#C5C6C7]"
  };
  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg"
  };

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : null}
      {children}
    </motion.button>
  );
});
Button.displayName = 'Button';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string, error?: string }>(( 
  { className, label, error, ...props }, ref
) => {
  return (
    <div className="relative w-full">
      <input
        ref={ref}
        className={cn(
          "peer w-full h-14 px-4 pt-4 pb-1 bg-[#1F2833]/50 border border-[#C5C6C7]/20 rounded-lg text-white placeholder-transparent focus:outline-none focus:border-[#66FCF1] focus:ring-1 focus:ring-[#66FCF1] transition-all",
          error && "border-[#FF4C4C] focus:border-[#FF4C4C] focus:ring-[#FF4C4C]",
          className
        )}
        placeholder={label}
        {...props}
      />
      <label className={cn(
        "absolute left-4 top-4 text-[#C5C6C7] text-base transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#66FCF1] pointer-events-none",
        props.value || props.defaultValue ? "top-1.5 text-xs" : "",
        error && "peer-focus:text-[#FF4C4C] text-[#FF4C4C]"
      )}>
        {label}
      </label>
      {error && <span className="text-[#FF4C4C] text-xs mt-1 absolute -bottom-5 left-1">{error}</span>}
    </div>
  );
});
Input.displayName = 'Input';

const GlassContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-[#1F2833]/65 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl", className)}>
    {children}
  </div>
);

const Spinner = () => (
  <div className="flex justify-center items-center p-12">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-12 h-12 border-4 border-[#1F2833] border-t-[#66FCF1] rounded-full"
    />
  </div>
);

const ToastContainer = () => {
  const { toasts, removeToast } = useAppStore();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md min-w-[300px]",
              toast.type === 'success' ? "bg-[#00E676]/10 border-[#00E676]/30 text-[#00E676]" :
              toast.type === 'error' ? "bg-[#FF4C4C]/10 border-[#FF4C4C]/30 text-[#FF4C4C]" :
              "bg-[#1F2833]/90 border-white/10 text-white"
            )}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {toast.type === 'info' && <Activity className="w-5 h-5 text-[#66FCF1]" />}
            <span className="flex-1 font-medium">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// --- FEATURE COMPONENTS ---
const PromoBanner = () => (
  <div className="bg-gradient-to-r from-[#9D4EDD] to-[#66FCF1] py-2 px-6 text-center w-full">
    <p className="text-black font-bold text-xs md:text-sm tracking-wide">
      🚀 QUANTUM DROP: Get 20% off all Obsidian Series gear with code VOID20. Limited time only!
    </p>
  </div>
);

const CategoryShowcase = () => {
  const categories = [
    { id: 'c1', name: 'Keyboards', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400' },
    { id: 'c2', name: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400' },
    { id: 'c3', name: 'Ergonomics', image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=400' },
    { id: 'c4', name: 'Displays', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <section className="py-24 bg-[#0B0C10]">
      <div className="max-w-[1440px] mx-auto px-6">
        <h2 className="text-4xl font-bold font-outfit text-white mb-12 text-center">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(cat => (
            <div key={cat.id} className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-[4/5]">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <h3 className="text-2xl font-bold text-white group-hover:text-[#66FCF1] transition-colors">{cat.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const reviews = [
    { id: 1, name: 'Alex Chen', role: 'Pro Gamer', text: 'The Obsidian Quantum Keyboard changed my life. The actuation speed is unreal.', rating: 5 },
    { id: 2, name: 'Sarah Jenkins', role: 'Software Engineer', text: 'I sit for 12 hours a day. The Void Ergonomic Chair is the only reason my back survives.', rating: 5 },
    { id: 3, name: 'Marcus Thorne', role: 'Audio Producer', text: 'Neon Pulse headphones deliver a flat, true response that I can actually mix with. Incredible.', rating: 4 },
  ];

  return (
    <section className="py-24 bg-[#121418] border-y border-white/5">
      <div className="max-w-[1440px] mx-auto px-6">
        <h2 className="text-4xl font-bold font-outfit text-white mb-12 text-center">Wall of Fame</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map(review => (
            <GlassContainer key={review.id} className="p-8">
              <div className="flex gap-1 mb-4 text-[#66FCF1]">
                {[...Array(5)].map((_, i) => <Star key={i} className={cn("w-5 h-5", i < review.rating ? "fill-current" : "opacity-30")} />)}
              </div>
              <p className="text-[#C5C6C7] text-lg italic mb-6">"{review.text}"</p>
              <div>
                <p className="text-white font-bold">{review.name}</p>
                <p className="text-[#9D4EDD] text-sm">{review.role}</p>
              </div>
            </GlassContainer>
          ))}
        </div>
      </div>
    </section>
  );
};

const NewsletterSignup = () => (
  <section className="py-24 bg-[#0B0C10] relative overflow-hidden">
    <div className="absolute inset-0 bg-[#66FCF1]/5 blur-[100px] rounded-full w-1/2 h-1/2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
      <h2 className="text-4xl font-bold font-outfit text-white mb-4">Join the Vanguard</h2>
      <p className="text-[#C5C6C7] mb-8 text-lg">Subscribe for early access to drops, exclusive discounts, and insider news.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <input 
          type="email" 
          placeholder="Enter your email address" 
          className="bg-[#1F2833] border border-white/10 text-white px-6 py-4 rounded-xl focus:outline-none focus:border-[#66FCF1] w-full sm:w-96 transition-colors"
        />
        <Button size="lg" className="whitespace-nowrap">Subscribe Now</Button>
      </div>
    </div>
  </section>
);

const FAQ = () => {
  const faqs = [
    { q: 'Do you ship internationally?', a: 'Yes, we offer quantum-speed shipping to over 150 countries worldwide.' },
    { q: 'What is your return policy?', a: 'We offer a 30-day frictionless return policy. If you don\'t love it, send it back for a full refund.' },
    { q: 'Are the products covered by warranty?', a: 'All OryMart gear comes with a standard 2-year warranty covering manufacturing defects.' },
  ];

  return (
    <section className="py-24 bg-[#121418]">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl font-bold font-outfit text-white mb-12 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-[#1F2833]/50 border border-white/5 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">{faq.q}</h3>
              <p className="text-[#C5C6C7]">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- LAYOUT COMPONENTS ---
const Header = () => {
  const { navigate, toggleCart } = useAppStore();
  const { items } = useCartStore();
  const { user } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className={cn(
      "fixed top-0 w-full z-40 transition-all duration-300 flex flex-col",
      isScrolled ? "bg-[#0B0C10]/90 backdrop-blur-xl border-b border-[#66FCF1]/20" : "bg-transparent"
    )}>
      {!isScrolled && <PromoBanner />}
      <div className={cn("max-w-[1440px] mx-auto w-full px-6 flex items-center justify-between transition-all", isScrolled ? "py-3" : "py-5")}>
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/')} className="text-2xl font-bold font-outfit tracking-wider text-white hover:text-[#66FCF1] transition-colors">
            ORY<span className="text-[#66FCF1]">MART</span>
          </button>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/shop')} className="text-[#C5C6C7] hover:text-white font-medium transition-colors">Shop</button>
            <button className="text-[#C5C6C7] hover:text-white font-medium transition-colors">Categories</button>
            <button className="text-[#C5C6C7] hover:text-white font-medium transition-colors">About</button>
          </nav>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden lg:block">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search products..."
              className="w-full bg-[#1F2833] border border-transparent text-white px-5 py-2.5 rounded-full focus:outline-none focus:border-[#9D4EDD] focus:bg-[#1F2833]/80 transition-all"
            />
            <Search className="absolute right-4 top-2.5 text-[#C5C6C7] group-focus-within:text-[#9D4EDD] w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate(user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login')} className="p-2 text-[#C5C6C7] hover:text-white transition-colors">
            <User className="w-6 h-6" />
          </button>
          <button onClick={toggleCart} className="p-2 text-[#C5C6C7] hover:text-white transition-colors relative">
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#66FCF1] text-[#0B0C10] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-black pt-20 pb-10 border-t border-white/10 mt-20">
    <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
      <div>
        <h3 className="text-2xl font-bold font-outfit text-white mb-6">ORY<span className="text-[#66FCF1]">MART</span></h3>
        <p className="text-[#C5C6C7] leading-relaxed mb-6">
          Redefining digital retail with unparalleled speed, immersive design, and a curated selection of premium products.
        </p>
        <div className="flex gap-4">
          {/* Social Icons Mock */}
          <div className="w-10 h-10 rounded-full bg-[#1F2833] flex items-center justify-center hover:bg-[#66FCF1] hover:text-black transition-colors cursor-pointer"><Star className="w-5 h-5" /></div>
          <div className="w-10 h-10 rounded-full bg-[#1F2833] flex items-center justify-center hover:bg-[#66FCF1] hover:text-black transition-colors cursor-pointer"><Activity className="w-5 h-5" /></div>
        </div>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6">Shop</h4>
        <ul className="space-y-4 text-[#C5C6C7]">
          <li><a href="#" className="hover:text-[#66FCF1] transition-colors">All Products</a></li>
          <li><a href="#" className="hover:text-[#66FCF1] transition-colors">Trending Now</a></li>
          <li><a href="#" className="hover:text-[#66FCF1] transition-colors">New Arrivals</a></li>
          <li><a href="#" className="hover:text-[#66FCF1] transition-colors">Discounts</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6">Customer Care</h4>
        <ul className="space-y-4 text-[#C5C6C7]">
          <li><a href="#" className="hover:text-[#66FCF1] transition-colors">Contact Us</a></li>
          <li><a href="#" className="hover:text-[#66FCF1] transition-colors">Shipping & Returns</a></li>
          <li><a href="#" className="hover:text-[#66FCF1] transition-colors">FAQ</a></li>
          <li><a href="#" className="hover:text-[#66FCF1] transition-colors">Track Order</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6">Stay in the Loop</h4>
        <p className="text-[#C5C6C7] mb-4">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
        <div className="flex">
          <input type="email" placeholder="Enter your email" className="bg-[#1F2833] text-white px-4 py-3 rounded-l-lg focus:outline-none w-full" />
          <button className="bg-[#66FCF1] text-black px-4 py-3 rounded-r-lg font-bold hover:bg-[#45e8dc] transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
    <div className="max-w-[1440px] mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[#C5C6C7] text-sm">
      <p>&copy; 2024 OryMart Enterprise. All rights reserved.</p>
      <div className="flex gap-6 mt-4 md:mt-0">
        <a href="#" className="hover:text-white">Privacy Policy</a>
        <a href="#" className="hover:text-white">Terms of Service</a>
      </div>
    </div>
  </footer>
);

const CartDrawer = () => {
  const { isCartOpen, toggleCart, navigate } = useAppStore();
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#121418] border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-bold font-outfit text-white">Your Cart</h2>
              <button onClick={toggleCart} className="p-2 text-[#C5C6C7] hover:text-white bg-[#1F2833] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#C5C6C7]">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                  <p>Your cart is empty.</p>
                  <Button variant="outline" className="mt-6" onClick={() => { toggleCart(); navigate('/shop'); }}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.selectedVariant}`} className="flex gap-4 bg-[#1F2833]/50 p-4 rounded-xl border border-white/5">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h4 className="text-white font-medium line-clamp-1">{item.name}</h4>
                      <p className="text-sm text-[#C5C6C7] mb-2">Variant: {item.variants?.find(v => v.id === item.selectedVariant)?.name || 'Default'}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 bg-[#0B0C10] rounded-lg px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, item.selectedVariant, item.quantity - 1)} className="text-[#C5C6C7] hover:text-white">-</button>
                          <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.selectedVariant, item.quantity + 1)} className="text-[#C5C6C7] hover:text-white">+</button>
                        </div>
                        <span className="text-[#66FCF1] font-medium">${(item.basePrice * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id, item.selectedVariant)} className="text-[#FF4C4C] hover:bg-[#FF4C4C]/10 p-2 rounded-lg self-start">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#1F2833]/30">
                <div className="flex justify-between text-white mb-6">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-xl">${getTotal().toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={() => { toggleCart(); navigate('/checkout'); }}
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- PAGE COMPONENTS ---
const ProductCard = ({ product }: { product: Product }) => {
  const { navigate } = useAppStore();
  const { addItem } = useCartStore();
  const { addToast } = useAppStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, product.variants?.[0]?.id || 'default');
    addToast(`Added ${product.name} to cart`, 'success');
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      onClick={() => navigate(`/product/${product.slug}`)}
      className="group cursor-pointer bg-[#1F2833] rounded-2xl overflow-hidden border border-white/5 hover:border-[#66FCF1]/30 transition-all shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-[#0B0C10]">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2833] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 left-0 right-0 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button className="w-full" size="sm" onClick={handleQuickAdd}>Quick Add</Button>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-white font-medium text-lg mb-1 truncate">{product.name}</h3>
        <p className="text-[#66FCF1] font-bold">${product.basePrice.toFixed(2)}</p>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const { navigate } = useAppStore();
  const [trending, setTrending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher('/products?limit=4')
      .then(res => setTrending(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2560"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C10]/50 via-[#0B0C10]/80 to-[#0B0C10]" />
        </div>
        
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold font-outfit text-white mb-6 tracking-tight"
          >
            ENTER THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#66FCF1] to-[#9D4EDD]">VOID</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-2xl text-[#C5C6C7] max-w-2xl mx-auto mb-10"
          >
            Discover next-generation gear engineered for peak performance and uncompromising aesthetics.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button size="lg" onClick={() => navigate('/shop')} className="text-lg px-10">
              Explore Collection
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 border-y border-white/5 bg-[#121418]">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24 opacity-50">
          {['NVIDIA', 'RAZER', 'LOGITECH', 'CORSAIR', 'ASUS'].map(brand => (
            <span key={brand} className="text-2xl font-bold font-outfit tracking-widest text-white hover:text-[#66FCF1] transition-colors cursor-default">
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* Category Showcase */}
      <CategoryShowcase />

      {/* Trending Section */}
      <section className="py-24 max-w-[1440px] mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold font-outfit text-white mb-2">Trending Now</h2>
            <p className="text-[#C5C6C7]">The most coveted items in our arsenal.</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/shop')} className="hidden md:flex">
            View All <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {loading ? <Spinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trending?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="py-24 bg-[#121418]">
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[ 
            { icon: Truck, title: 'Hyper-Fast Delivery', desc: 'Sub-orbital shipping speeds. Get your gear before you even realize you need it.' },
            { icon: ShieldCheck, title: 'Quantum Security', desc: 'Military-grade encryption protects your data and transactions at every step.' },
            { icon: RefreshCw, title: 'Frictionless Returns', desc: 'Not satisfied? Return it within 30 days, no questions asked. Seamless process.' }
          ].map((feature, i) => (
            <GlassContainer key={i} className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-[#1F2833] rounded-2xl flex items-center justify-center mb-6 text-[#66FCF1]">
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-[#C5C6C7] leading-relaxed">{feature.desc}</p>
            </GlassContainer>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  );
};

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher('/products?limit=20')
      .then(res => setProducts(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-32 pb-24 max-w-[1440px] mx-auto px-6 min-h-screen">
      <h1 className="text-4xl font-bold font-outfit text-white mb-8">All Products</h1>
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products?.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductDetail = () => {
  const { params, addToast } = useAppStore();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (params.slug) {
      fetcher(`/products/${params.slug}`)
        .then(res => {
          setProduct(res.data);
          if (res.data?.variants?.length > 0) setSelectedVariant(res.data.variants[0].id);
        })
        .catch(() => addToast('Product not found', 'error'))
        .finally(() => setLoading(false));
    }
  }, [params.slug]);

  if (loading) return <div className="min-h-screen pt-32"><Spinner /></div>;
  if (!product) return <div className="min-h-screen pt-32 text-center text-white">Product not found.</div>;

  const handleAddToCart = () => {
    addItem(product, selectedVariant);
    addToast('Added to cart successfully', 'success');
  };

  return (
    <div className="pt-32 pb-24 max-w-[1440px] mx-auto px-6 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Gallery */}
        <div className="space-y-6">
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#1F2833] border border-white/10">
            <img src={product.gallery?.[activeImage] || product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.gallery.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "w-24 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0",
                    activeImage === idx ? "border-[#66FCF1]" : "border-transparent opacity-50 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <h1 className="text-4xl md:text-5xl font-bold font-outfit text-white mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-[#9D4EDD] mb-8">${product.basePrice.toFixed(2)}</p>
          
          <p className="text-[#C5C6C7] text-lg leading-relaxed mb-10">
            {product.description}
          </p>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-10">
              <h3 className="text-white font-medium mb-4">Select Variant</h3>
              <div className="flex flex-wrap gap-4">
                {product.variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={cn(
                      "px-6 py-3 rounded-xl border font-medium transition-all",
                      selectedVariant === variant.id 
                        ? "border-[#66FCF1] bg-[#66FCF1]/10 text-[#66FCF1]" 
                        : "border-white/20 text-[#C5C6C7] hover:border-white/50"
                    )}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-10 border-t border-white/10">
            <Button size="lg" className="w-full text-lg h-16" onClick={handleAddToCart}>
              <ShoppingBag className="w-6 h-6 mr-3" /> Add to Cart
            </Button>
            <div className="mt-6 flex items-center justify-center gap-8 text-[#C5C6C7] text-sm">
              <span className="flex items-center"><Truck className="w-4 h-4 mr-2" /> Free Shipping</span>
              <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-2" /> 2 Year Warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { items, getTotal, clearCart } = useCartStore();
  const { navigate, addToast } = useAppStore();
  const { token } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
        <h2 className="text-2xl text-white mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate('/shop')}>Go Shopping</Button>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!token) {
      addToast('Please login to checkout', 'error');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const intentRes = await fetcher('/orders/intent', {
        method: 'POST',
        body: JSON.stringify({ items, totalAmount: getTotal() })
      });
      // Simulate Stripe payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await fetcher('/orders/confirm', {
        method: 'POST',
        body: JSON.stringify({ orderId: intentRes.orderId })
      });
      
      clearCart();
      setStep(3);
      addToast('Payment successful!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Payment failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-[1000px] mx-auto px-6 min-h-screen">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#1F2833] -z-10 rounded-full">
          <div className="h-full bg-[#66FCF1] transition-all duration-500 rounded-full" style={{ width: `${((step - 1) / 2) * 100}%` }} />
        </div>
        {['Shipping', 'Payment', 'Confirmation'].map((label, i) => (
          <div key={label} className="flex flex-col items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors",
              step > i + 1 ? "bg-[#66FCF1] text-black" : step === i + 1 ? "bg-[#9D4EDD] text-white shadow-[0_0_15px_rgba(157,78,221,0.5)]" : "bg-[#1F2833] text-[#C5C6C7]"
            )}>
              {step > i + 1 ? <CheckCircle2 className="w-6 h-6" /> : i + 1}
            </div>
            <span className={cn("text-sm font-medium", step >= i + 1 ? "text-white" : "text-[#C5C6C7]")}>{label}</span>
          </div>
        ))}
      </div>

      <GlassContainer className="p-8 md:p-12">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold text-white mb-6">Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Input label="First Name" defaultValue="John" />
              <Input label="Last Name" defaultValue="Doe" />
              <Input label="Address" className="md:col-span-2" defaultValue="123 Cyber Street" />
              <Input label="City" defaultValue="Neon City" />
              <Input label="Postal Code" defaultValue="90210" />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Continue to Payment</Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>
            <div className="bg-[#0B0C10] p-6 rounded-xl border border-white/10 mb-8">
              <div className="flex items-center gap-4 mb-6 text-[#C5C6C7]">
                <CreditCard className="w-6 h-6" />
                <span>Mock Credit Card (Stripe Elements Simulation)</span>
              </div>
              <Input label="Card Number" defaultValue="**** **** **** 4242" disabled />
              <div className="grid grid-cols-2 gap-6 mt-6">
                <Input label="Expiry" defaultValue="12/25" disabled />
                <Input label="CVC" defaultValue="***" disabled />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handlePayment} isLoading={loading} className="px-10">
                Pay ${getTotal().toFixed(2)}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
            <div className="w-24 h-24 bg-[#00E676]/20 text-[#00E676] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Order Confirmed!</h2>
            <p className="text-[#C5C6C7] mb-8">Your gear is being prepared for quantum transit. Check your dashboard for tracking.</p>
            <Button onClick={() => navigate('/dashboard')}>View Orders</Button>
          </motion.div>
        )}
      </GlassContainer>
    </div>
  );
};

const Login = () => {
  const { login } = useAuthStore();
  const { navigate, addToast } = useAppStore();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const res = await fetcher(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      login(res.user, res.token);
      addToast('Welcome to OryMart', 'success');
      navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      addToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <GlassContainer className="w-full max-w-md p-8">
        <h2 className="text-3xl font-bold font-outfit text-white mb-8 text-center">
          {isRegister ? 'Create Account' : 'Access Terminal'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" required onChange={e => setFormData({...formData, firstName: e.target.value})} />
              <Input label="Last Name" required onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
          )}
          <Input label="Email Address" type="email" required onChange={e => setFormData({...formData, email: e.target.value})} />
          <Input label="Password" type="password" required onChange={e => setFormData({...formData, password: e.target.value})} />
          <Button type="submit" className="w-full" isLoading={loading}>
            {isRegister ? 'Register' : 'Login'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setIsRegister(!isRegister)} className="text-[#C5C6C7] hover:text-white text-sm">
            {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </div>
        {/* Demo Credentials Hint */}
        {!isRegister && (
          <div className="mt-8 p-4 bg-[#0B0C10] rounded-lg border border-white/10 text-xs text-[#C5C6C7] text-center">
            <p>Demo Admin: admin@orymart.com / admin123</p>
          </div>
        )}
      </GlassContainer>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const { navigate } = useAppStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate('/login');
    fetcher('/users/me/orders')
      .then(res => setOrders(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="pt-32 pb-24 max-w-[1440px] mx-auto px-6 min-h-screen">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold font-outfit text-white mb-2">Welcome, {user.firstName}</h1>
          <p className="text-[#C5C6C7]">Manage your orders and account settings.</p>
        </div>
        <Button variant="outline" onClick={() => { logout(); navigate('/'); }}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Order History</h2>
          {loading ? <Spinner /> : orders.length === 0 ? (
            <GlassContainer className="p-8 text-center text-[#C5C6C7]">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No orders found.</p>
            </GlassContainer>
          ) : (
            orders.map(order => (
              <GlassContainer key={order.id} className="p-6">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-[#C5C6C7]">Order ID</p>
                    <p className="text-white font-medium">{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#C5C6C7]">Status</p>
                    <span className="inline-block px-3 py-1 bg-[#00E676]/20 text-[#00E676] rounded-full text-xs font-bold">
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-[#0B0C10]" />
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-sm text-[#C5C6C7]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-white font-medium">${(item.basePrice * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-[#C5C6C7]">Total Amount</span>
                  <span className="text-xl font-bold text-[#66FCF1]">${order.totalAmount?.toFixed(2)}</span>
                </div>
              </GlassContainer>
            ))
          )}
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Account Settings</h2>
          <GlassContainer className="p-6 space-y-4">
            <div className="flex items-center gap-4 text-white p-4 bg-[#0B0C10] rounded-xl">
              <User className="w-6 h-6 text-[#9D4EDD]" />
              <div>
                <p className="text-sm text-[#C5C6C7]">Email</p>
                <p>{user.email}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full"><Settings className="w-4 h-4 mr-2" /> Edit Profile</Button>
          </GlassContainer>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { navigate } = useAppStore();
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') return navigate('/');
    fetcher('/admin/analytics/sales')
      .then(res => setSalesData(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const totalRevenue = salesData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrders = salesData.reduce((acc, curr) => acc + curr.orders, 0);

  return (
    <div className="pt-32 pb-24 max-w-[1440px] mx-auto px-6 min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl font-bold font-outfit text-white mb-2">Command Center</h1>
        <p className="text-[#C5C6C7]">System overview and analytics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <GlassContainer className="p-6 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-[#66FCF1]/20 flex items-center justify-center text-[#66FCF1]">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[#C5C6C7] text-sm mb-1">Total Revenue (7d)</p>
            <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
          </div>
        </GlassContainer>
        <GlassContainer className="p-6 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-[#9D4EDD]/20 flex items-center justify-center text-[#9D4EDD]">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[#C5C6C7] text-sm mb-1">Orders (7d)</p>
            <p className="text-3xl font-bold text-white">{totalOrders}</p>
          </div>
        </GlassContainer>
        <GlassContainer className="p-6 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-[#00E676]/20 flex items-center justify-center text-[#00E676]">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[#C5C6C7] text-sm mb-1">Active Users</p>
            <p className="text-3xl font-bold text-white">1,204</p>
          </div>
        </GlassContainer>
      </div>

      {/* Chart Mockup */}
      <GlassContainer className="p-8 mb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white">Revenue Overview</h2>
          <TrendingUp className="text-[#66FCF1] w-6 h-6" />
        </div>
        {loading ? <Spinner /> : (
          <div className="h-64 flex items-end gap-4">
            {salesData.map((data, i) => {
              const height = (data.revenue / Math.max(...salesData.map(d => d.revenue))) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-[#1F2833] rounded-t-md relative overflow-hidden" style={{ height: '100%' }}>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="absolute bottom-0 w-full bg-gradient-to-t from-[#9D4EDD] to-[#66FCF1] rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <span className="text-xs text-[#C5C6C7]">{new Date(data.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                </div>
              );
            })}
          </div>
        )}
      </GlassContainer>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const { route } = useAppStore();

  // Inject Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Global styles for body
    document.body.style.backgroundColor = '#0B0C10';
    document.body.style.color = '#FFFFFF';
    document.body.style.fontFamily = '"Inter", sans-serif';
    document.body.style.margin = '0';
    document.body.style.overflowX = 'hidden';
  }, []);

  const renderRoute = () => {
    switch (route) {
      case '/': return <Home />;
      case '/shop': return <Shop />;
      case '/product': return <ProductDetail />;
      case '/checkout': return <Checkout />;
      case '/login': return <Login />;
      case '/dashboard': return <Dashboard />;
      case '/admin': return <AdminDashboard />;
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#66FCF1] selection:text-black">
      <Header />
      <CartDrawer />
      <ToastContainer />
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={route}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderRoute()}
          </motion.div>
        </AnimatePresence>
      </main>

      {route !== '/login' && route !== '/checkout' && <Footer />}
    </div>
  );
}
