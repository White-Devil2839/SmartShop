const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const products = [
  // Electronics
  {
    name: 'Gaming Laptop Pro',
    description: 'High-performance 15.6" gaming laptop with RTX 4070, 16GB RAM, 512GB SSD. Perfect for gaming and heavy workloads.',
    price: 1299.99,
    stock: 8,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80',
    isActive: true,
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Compact TKL mechanical keyboard with Cherry MX Red switches, per-key RGB backlight, and aluminium top plate.',
    price: 89.99,
    stock: 35,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
    isActive: true,
  },
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Over-ear Bluetooth 5.3 headphones with 40-hour battery life, active noise cancellation, and foldable design.',
    price: 199.99,
    stock: 20,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    isActive: true,
  },
  {
    name: '4K Webcam',
    description: 'Ultra HD 4K webcam with autofocus, built-in stereo microphone, and wide-angle lens. Plug-and-play.',
    price: 99.99,
    stock: 15,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1596566893367-1f7e2bf7a43e?w=600&q=80',
    isActive: true,
  },
  {
    name: 'Smartwatch Series X',
    description: 'Feature-packed smartwatch with AMOLED display, GPS, heart rate monitor, 7-day battery, and water resistance.',
    price: 249.00,
    stock: 12,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
    isActive: true,
  },
  // Home & Kitchen
  {
    name: 'Minimalist Desk Lamp',
    description: 'LED desk lamp with 5 colour temperatures, touch dimmer, USB-A charging port, and flexible gooseneck arm.',
    price: 39.99,
    stock: 50,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
    isActive: true,
  },
  {
    name: 'Pour-Over Coffee Set',
    description: 'Premium pour-over coffee dripper set with gooseneck kettle, glass carafe, and reusable stainless steel filter.',
    price: 54.99,
    stock: 25,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    isActive: true,
  },
  {
    name: 'Bamboo Cutting Board Set',
    description: 'Set of 3 eco-friendly bamboo cutting boards in different sizes with juice grooves and non-slip feet.',
    price: 29.99,
    stock: 40,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80',
    isActive: true,
  },
  // Books
  {
    name: 'Clean Code',
    description: 'A Handbook of Agile Software Craftsmanship by Robert C. Martin. The essential guide to writing readable, maintainable code.',
    price: 34.99,
    stock: 60,
    category: 'Books',
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80',
    isActive: true,
  },
  {
    name: 'The Pragmatic Programmer',
    description: '20th Anniversary Edition. Your journey to mastery — practical advice from Andrew Hunt and David Thomas.',
    price: 39.99,
    stock: 45,
    category: 'Books',
    imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&q=80',
    isActive: true,
  },
  // Sports
  {
    name: 'Adjustable Dumbbell Set',
    description: 'Space-saving adjustable dumbbells from 2.5 kg to 25 kg per hand. Quick-lock dial mechanism. Includes storage tray.',
    price: 149.00,
    stock: 10,
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
    isActive: true,
  },
  {
    name: 'Yoga Mat Pro',
    description: 'Extra-thick 6mm non-slip yoga mat with alignment lines, carry strap, and moisture-resistant surface. 183 × 61 cm.',
    price: 44.99,
    stock: 30,
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80',
    isActive: true,
  },
  // Clothing
  {
    name: 'Classic Hooded Sweatshirt',
    description: 'Heavyweight 400gsm cotton-blend hoodie with kangaroo pocket, adjustable drawstring, and ribbed cuffs. Unisex fit.',
    price: 59.99,
    stock: 100,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
    isActive: true,
  },
  {
    name: 'Running Sneakers',
    description: 'Lightweight breathable mesh running shoes with responsive foam midsole and rubber outsole. Available in multiple sizes.',
    price: 79.99,
    stock: 3,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    isActive: true,
  },
  // Hidden (admin only)
  {
    name: 'Discontinued Wireless Mouse',
    description: 'Old model being phased out. Not visible to customers.',
    price: 19.99,
    stock: 0,
    category: 'Electronics',
    imageUrl: null,
    isActive: false,
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Seed products
  const created = await prisma.product.createMany({ data: products });
  console.log(`✅ Created ${created.count} products`);

  // Seed admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.create({
    data: { username: 'admin', password: hashedPassword, role: 'admin' },
  });
  console.log('✅ Created admin user  →  username: admin  |  password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
