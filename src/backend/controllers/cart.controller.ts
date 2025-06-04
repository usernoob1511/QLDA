import { Request, Response } from 'express';
import { Cart, Product } from '../models';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../middleware/async';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await Cart.findAll({
    where: { UserID: req.user?.id },
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['ProductID', 'Name', 'Price', 'Description', 'ImageURL'],
      },
    ],
  });

  res.json({
    status: 'success',
    data: {
      cart,
    },
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;

  // Check if product exists
  const product = await Product.findByPk(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if quantity is valid
  if (quantity <= 0) {
    throw new AppError('Quantity must be greater than 0', 400);
  }

  // Check if product is in stock
  if (product.Stock < quantity) {
    throw new AppError('Product is out of stock', 400);
  }

  // Check if item already exists in cart
  let cartItem = await Cart.findOne({
    where: {
      UserID: req.user?.id,
      ProductID: productId,
    },
  });

  if (cartItem) {
    // Update quantity
    cartItem.Quantity += quantity;
    await cartItem.save();
  } else {
    // Create new cart item
    if (!req.user?.id) {
      throw new AppError('User not found', 401);
    }
    
    cartItem = await Cart.create({
      UserID: req.user.id,
      ProductID: productId,
      Quantity: quantity,
    });
  }

  // Get updated cart item with product details
  const updatedCartItem = await Cart.findByPk(cartItem.CartID, {
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['ProductID', 'Name', 'Price', 'Description', 'ImageURL'],
      },
    ],
  });

  res.status(201).json({
    status: 'success',
    data: {
      cartItem: updatedCartItem,
    },
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = req.body;

  // Check if quantity is valid
  if (quantity <= 0) {
    throw new AppError('Quantity must be greater than 0', 400);
  }

  const cartItem = await Cart.findOne({
    where: {
      CartID: req.params.id,
      UserID: req.user?.id,
    },
    include: ['product'],
  });

  if (!cartItem) {
    throw new AppError('Cart item not found', 404);
  }

  // Check if product is in stock
  const product = await Product.findByPk(cartItem.ProductID);
  if (!product || product.Stock < quantity) {
    throw new AppError('Product is out of stock', 400);
  }

  cartItem.Quantity = quantity;
  await cartItem.save();

  res.json({
    status: 'success',
    data: {
      cartItem,
    },
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
export const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  const cartItem = await Cart.findOne({
    where: {
      CartID: req.params.id,
      UserID: req.user?.id,
    },
  });

  if (!cartItem) {
    throw new AppError('Cart item not found', 404);
  }

  await cartItem.destroy();

  res.json({
    status: 'success',
    data: null,
  });
}); 