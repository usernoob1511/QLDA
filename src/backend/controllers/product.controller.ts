import { Request, Response } from 'express';
import { Product, Category } from '../models';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../middleware/async';
import { Op } from 'sequelize';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const category = req.query.category as string;
  const minPrice = parseFloat(req.query.minPrice as string);
  const maxPrice = parseFloat(req.query.maxPrice as string);

  // Build where clause
  const whereClause: any = {};
  if (search) {
    whereClause.Name = { [Op.like]: `%${search}%` };
  }
  if (category) {
    whereClause.CategoryID = category;
  }
  if (!isNaN(minPrice)) {
    whereClause.Price = { ...whereClause.Price, [Op.gte]: minPrice };
  }
  if (!isNaN(maxPrice)) {
    whereClause.Price = { ...whereClause.Price, [Op.lte]: maxPrice };
  }

  const { count, rows: products } = await Product.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['CategoryID', 'Name'],
      },
    ],
    limit,
    offset: (page - 1) * limit,
  });

  res.json({
    status: 'success',
    data: {
      products,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
      },
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByPk(req.params.id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['CategoryID', 'Name'],
      },
    ],
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.json({
    status: 'success',
    data: {
      product,
    },
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, price, stock, categoryId, imageUrl } = req.body;

  // Check if category exists
  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const product = await Product.create({
    Name: name,
    Description: description,
    Price: price,
    Stock: stock,
    CategoryID: categoryId,
    ImageURL: imageUrl,
  });

  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, price, stock, categoryId, imageUrl } = req.body;

  const product = await Product.findByPk(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (categoryId) {
    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    product.CategoryID = categoryId;
  }

  if (name) product.Name = name;
  if (description) product.Description = description;
  if (price) product.Price = price;
  if (stock !== undefined) product.Stock = stock;
  if (imageUrl) product.ImageURL = imageUrl;

  await product.save();

  res.json({
    status: 'success',
    data: {
      product,
    },
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  await product.destroy();

  res.json({
    status: 'success',
    data: null,
  });
}); 