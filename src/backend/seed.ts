import { sequelize, User, Category, Product, Order, Cart } from './models';

async function seed() {
  await sequelize.sync();

  // 1. Categories
  const categories = await Category.bulkCreate([
    { Name: 'Electronics', Description: 'Electronic devices' },
    { Name: 'Books', Description: 'Books and literature' },
    { Name: 'Clothing', Description: 'Apparel and accessories' },
  ]);

  // 2. Products
  const products = await Product.bulkCreate([
    { Name: 'Smartphone', Description: 'Latest smartphone', Price: 999, Stock: 50, CategoryID: categories[0].CategoryID },
    { Name: 'Laptop', Description: 'High performance laptop', Price: 1500, Stock: 30, CategoryID: categories[0].CategoryID },
    { Name: 'Novel', Description: 'Bestselling novel', Price: 20, Stock: 100, CategoryID: categories[1].CategoryID },
    { Name: 'T-shirt', Description: '100% cotton', Price: 15, Stock: 200, CategoryID: categories[2].CategoryID },
  ]);

  // 3. Lấy user đầu tiên
  const user = await User.findOne();
  if (!user) throw new Error('No user found in Users table');

  // 4. Orders
  const order = await Order.create({
    UserID: user.UserID,
    Status: 'Pending',
    TotalAmount: 1019, // Smartphone + Novel
    ShippingAddress: '123 Main St',
    ShippingCity: 'Hanoi',
    ShippingState: 'HN',
    ShippingZipCode: '100000',
    ShippingName: user.Name,
    ShippingEmail: user.Email,
    ShippingPhone: '0123456789',
  });

  // 5. OrderItems (bảng trung gian)
  await (order as any).addOrderProducts([
    products[0], // Smartphone
    products[2], // Novel
  ]);

  // 6. Cart
  await Cart.create({
    UserID: user.UserID,
    ProductID: products[1].ProductID, // Laptop
    Quantity: 1,
  });

  console.log('Seed data created successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
