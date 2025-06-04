import { Request, Response } from 'express';
import { Order, Cart, Product } from '../models';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../middleware/async';
import { sequelize } from '../config/database';

interface CartWithProduct extends Cart {
  product: Product;
}

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.findAll({
    where: { UserID: req.user?.id },
    include: [
      {
        model: Product,
        as: 'products',
        through: { attributes: ['Quantity', 'Price'] },
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.json({
    status: 'success',
    data: {
      orders,
    },
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({
    where: {
      OrderID: req.params.id,
      UserID: req.user?.id,
    },
    include: [
      {
        model: Product,
        as: 'products',
        through: { attributes: ['Quantity', 'Price'] },
      },
    ],
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  res.json({
    status: 'success',
    data: {
      order,
    },
  });
});

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { shippingDetails } = req.body;

  // Get cart items
  const cartItems = await Cart.findAll({
    where: { UserID: req.user?.id },
    include: [{
      model: Product,
      as: 'product',
      attributes: ['ProductID', 'Name', 'Price', 'Stock']
    }]
  }) as unknown as CartWithProduct[];

  if (cartItems.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  // Start transaction
  const transaction = await sequelize.transaction();

  try {
    // Create order
    if (!req.user?.id) {
      throw new AppError('User not found', 401);
    }

    const order = await Order.create(
      {
        UserID: req.user.id,
        Status: 'Pending',
        ShippingAddress: shippingDetails.address,
        ShippingCity: shippingDetails.city,
        ShippingState: shippingDetails.state,
        ShippingZipCode: shippingDetails.zipCode,
        ShippingName: shippingDetails.fullName,
        ShippingEmail: shippingDetails.email,
        ShippingPhone: shippingDetails.phone,
        TotalAmount: cartItems.reduce(
          (sum, item) => sum + item.product.Price * item.Quantity,
          0
        ),
      },
      { transaction }
    );

    // Add order items and update stock
    for (const cartItem of cartItems) {
      const product = cartItem.product;

      // Check stock
      if (product.Stock < cartItem.Quantity) {
        throw new AppError(`${product.Name} is out of stock`, 400);
      }

      // Add to order items
      await order.addProduct(product, {
        through: {
          Quantity: cartItem.Quantity,
          Price: product.Price,
        },
        transaction,
      });

      // Update stock
      await product.update(
        {
          Stock: product.Stock - cartItem.Quantity,
        },
        { transaction }
      );
    }

    // Clear cart
    await Cart.destroy({
      where: { UserID: req.user?.id },
      transaction,
    });

    await transaction.commit();

    // Get complete order with products
    const completeOrder = await Order.findByPk(order.OrderID, {
      include: [
        {
          model: Product,
          as: 'products',
          through: { attributes: ['Quantity', 'Price'] },
        },
      ],
    });

    res.status(201).json({
      status: 'success',
      data: {
        order: completeOrder,
      },
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;

  const order = await Order.findByPk(req.params.id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.Status = status;
  await order.save();

  res.json({
    status: 'success',
    data: {
      order,
    },
  });
}); 