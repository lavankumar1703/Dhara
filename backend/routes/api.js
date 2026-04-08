const express = require('express');
const router = express.Router();

// Mock Data
const MOCK_PRODUCTS = [
  { id: 'sku-001', name: 'Quantum VR Headset', price: 499.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=800', stock: 45, rating: 4.8 },
  { id: 'sku-002', name: 'Aero Dynamic Smartwatch', price: 299.50, category: 'Wearables', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800', stock: 120, rating: 4.5 },
  { id: 'sku-003', name: 'Obsidian Mechanical Keyboard', price: 159.00, category: 'Accessories', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800', stock: 12, rating: 4.9 },
  { id: 'sku-004', name: 'Neural Noise-Cancelling Earbuds', price: 199.99, category: 'Audio', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800', stock: 85, rating: 4.7 },
  { id: 'sku-005', name: 'Titanium EDC Pen', price: 89.00, category: 'Accessories', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=800', stock: 200, rating: 4.2 },
  { id: 'sku-006', name: 'Holographic Display Monitor', price: 899.00, category: 'Electronics', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800', stock: 5, rating: 4.6 }
];

// US-002: Recommendations
router.get('/recommendations', (req, res) => {
  setTimeout(() => {
    res.json({ items: MOCK_PRODUCTS });
  }, 150);
});

// US-006: Semantic Search
router.get('/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const results = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
  res.json({
    results,
    facets: [{ name: 'Category', options: ['Electronics', 'Wearables', 'Accessories', 'Audio'] }],
    suggestions: results.map(r => r.name).slice(0, 3)
  });
});

// US-003: Checkout Intent
router.post('/checkout/intent', (req, res) => {
  const { cartId, shippingAddress } = req.body;
  res.json({
    clientSecret: 'pi_mock_secret_12345',
    taxAmount: 24.50,
    shippingCost: 15.00,
    status: 'requires_payment_method'
  });
});

// US-004: Predictive Inventory
router.get('/inventory/predictive', (req, res) => {
  res.json({
    alerts: [
      { sku: 'sku-003', message: 'Obsidian Keyboard stock critical (12 left). Depletion in 3 days.', severity: 'high' },
      { sku: 'sku-006', message: 'Holographic Monitor stock low (5 left).', severity: 'medium' }
    ],
    timeline: [
      { date: '2023-10-01', stock: 150, predicted: 150 },
      { date: '2023-10-05', stock: 120, predicted: 115 },
      { date: '2023-10-10', stock: 85, predicted: 80 },
      { date: '2023-10-15', stock: 45, predicted: 40 },
      { date: '2023-10-20', stock: null, predicted: 10 }
    ]
  });
});

// US-005: Pricing Simulation
router.post('/pricing/simulate', (req, res) => {
  res.json({
    projectedRevenue: 1250000,
    marginImpact: '+4.2%',
    confidenceScore: 0.89
  });
});

// US-007: B2B Bulk Upload
router.post('/b2b/bulk-upload', (req, res) => {
  res.status(207).json({
    successful: ['sku-001', 'sku-002', 'sku-004'],
    errors: [{ sku: 'sku-999', reason: 'Invalid SKU format' }]
  });
});

// US-009: Shipping Tracking
router.get('/shipping/track/:orderId', (req, res) => {
  res.json({
    status: 'In Transit',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    timeline: [
      { status: 'Order Placed', time: '2023-10-24T10:00:00Z', completed: true },
      { status: 'Processing', time: '2023-10-24T14:30:00Z', completed: true },
      { status: 'Shipped', time: '2023-10-25T08:15:00Z', completed: true },
      { status: 'Out for Delivery', time: 'Pending', completed: false },
      { status: 'Delivered', time: 'Pending', completed: false }
    ]
  });
});

module.exports = router;