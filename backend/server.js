const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const JWT_SECRET = 'orymart_super_secret_key_2024';

// --- MOCK DATABASE ---
const db = {
  users: [],
  orders: [],
  products: [
    {
      id: 'p1',
      name: 'Obsidian Quantum Keyboard',
      slug: 'obsidian-quantum-keyboard',
      description: 'Experience unparalleled typing speed and precision with our custom-engineered opto-mechanical switches. Encased in a solid aerospace-grade aluminum chassis with per-key RGB illumination.',
      basePrice: 199.99,
      categoryId: 'c1',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600439614353-174ad0ee3b25?auto=format&fit=crop&q=80&w=800'
      ],
      variants: [{ id: 'v1', name: 'Linear Red' }, { id: 'v2', name: 'Tactile Brown' }],
      stock: 45
    },
    {
      id: 'p2',
      name: 'Neon Pulse ANC Headphones',
      slug: 'neon-pulse-headphones',
      description: 'Immerse yourself in pure audio bliss. Active Noise Cancellation blocks out the world, while 50mm graphene drivers deliver deep bass and crystal-clear highs. 40-hour battery life.',
      basePrice: 249.99,
      categoryId: 'c2',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
      ],
      variants: [{ id: 'v3', name: 'Matte Black' }, { id: 'v4', name: 'Cyber White' }],
      stock: 120
    },
    {
      id: 'p3',
      name: 'Void Ergonomic Mesh Chair',
      slug: 'void-ergonomic-chair',
      description: 'Designed for marathon sessions. The Void chair features adaptive lumbar support, 4D armrests, and a breathable mesh back that keeps you cool under pressure.',
      basePrice: 499.99,
      categoryId: 'c3',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800'
      ],
      variants: [{ id: 'v5', name: 'Standard' }],
      stock: 15
    },
    {
      id: 'p4',
      name: 'Cyber Deck Ultrawide Monitor',
      slug: 'cyber-deck-monitor',
      description: 'See more, do more. 34 inches of curved OLED perfection. 175Hz refresh rate, 0.1ms response time, and true HDR 400 for breathtaking visuals.',
      basePrice: 899.99,
      categoryId: 'c1',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800'
      ],
      variants: [{ id: 'v6', name: '34 Inch' }],
      stock: 8
    },
    {
      id: 'p5',
      name: 'Lumina Smart Watch Pro',
      slug: 'lumina-smart-watch',
      description: 'Your life, on your wrist. Track health metrics, receive notifications, and pay with a tap. Features a sapphire crystal display and titanium body.',
      basePrice: 299.99,
      categoryId: 'c4',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'
      ],
      variants: [{ id: 'v7', name: 'Titanium' }, { id: 'v8', name: 'Carbon' }],
      stock: 200
    },
    {
      id: 'p6',
      name: 'Aero Stealth Backpack',
      slug: 'aero-stealth-backpack',
      description: 'Minimalist design, maximum utility. Water-resistant shell, hidden anti-theft pockets, and a dedicated padded compartment for up to 16-inch laptops.',
      basePrice: 89.99,
      categoryId: 'c5',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800'
      ],
      variants: [{ id: 'v9', name: 'Obsidian Black' }],
      stock: 85
    }
  ]
};

// --- MIDDLEWARE ---
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- ROUTES ---

// Products
app.get('/api/v1/products', (req, res) => {
  const { limit = 20, sort } = req.query;
  let results = [...db.products];
  if (sort === 'price_desc') results.sort((a, b) => b.basePrice - a.basePrice);
  if (sort === 'price_asc') results.sort((a, b) => a.basePrice - b.basePrice);
  
  setTimeout(() => {
    res.json({ data: results.slice(0, parseInt(limit)), meta: { total: results.length } });
  }, 500); // Simulate network delay
});

app.get('/api/v1/products/:slug', (req, res) => {
  const product = db.products.find(p => p.slug === req.params.slug);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  setTimeout(() => res.json({ data: product }), 300);
});

// Auth
app.post('/api/v1/auth/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email exists' });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: `u${Date.now()}`, email, password: hashedPassword, firstName, lastName, role: 'user' };
  db.users.push(user);
  
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email, firstName, lastName, role: user.role } });
});

app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
  
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
});

// Orders
app.post('/api/v1/orders/intent', authenticate, (req, res) => {
  const { items, totalAmount } = req.body;
  const orderId = `ORD-${Date.now()}`;
  const clientSecret = `pi_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;
  
  db.orders.push({
    id: orderId,
    userId: req.user.id,
    items,
    totalAmount,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  });
  
  setTimeout(() => res.json({ orderId, clientSecret, amount: totalAmount }), 800);
});

app.post('/api/v1/orders/confirm', authenticate, (req, res) => {
  const { orderId } = req.body;
  const order = db.orders.find(o => o.id === orderId);
  if (order) order.status = 'PAID';
  setTimeout(() => res.json({ success: true, orderStatus: 'PAID' }), 500);
});

app.get('/api/v1/users/me/orders', authenticate, (req, res) => {
  const userOrders = db.orders.filter(o => o.userId === req.user.id);
  res.json({ data: userOrders });
});

// Admin
app.get('/api/v1/admin/analytics/sales', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  // Mock time series data
  const data = Array.from({ length: 7 }).map((_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 5000) + 1000,
    orders: Math.floor(Math.random() * 50) + 10
  })).reverse();
  res.json({ data });
});

// Seed an admin user
bcrypt.hash('admin123', 10).then(hash => {
  db.users.push({ id: 'admin1', email: 'admin@orymart.com', password: hash, firstName: 'Admin', lastName: 'User', role: 'admin' });
});

app.listen(PORT, () => console.log(`OryMart Backend running on port ${PORT}`));