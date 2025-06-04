import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../middleware/async';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { Email, Password, Name } = req.body;
  console.log('Register payload:', req.body);

  // Check if user exists
  const userExists = await User.findOne({ where: { Email } });
  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  // Create user
  const user = await User.create({
    Email,
    Password,
    Name,
    Role: 'customer',
  });
  console.log('User created:', user.UserID);

  // Generate token
  const token = jwt.sign(
    { id: user.UserID, role: user.Role },
    process.env.JWT_SECRET || 'secret',
    {
      expiresIn: '30d',
    }
  );

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        UserID: user.UserID,
        Email: user.Email,
        Name: user.Name,
        Role: user.Role,
      },
      token,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ where: { Email: email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate token
  const token = jwt.sign(
    { id: user.UserID, role: user.Role },
    process.env.JWT_SECRET || 'secret',
    {
      expiresIn: '30d',
    }
  );

  res.json({
    status: 'success',
    data: {
      user: {
        UserID: user.UserID,
        Email: user.Email,
        Name: user.Name,
        Role: user.Role,
      },
      token,
    },
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByPk(req.user?.id, {
    attributes: { exclude: ['Password'] },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const user = await User.findByPk(req.user?.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update fields
  if (name) user.Name = name;
  if (email) user.Email = email;
  if (password) user.Password = password;

  await user.save();

  res.json({
    status: 'success',
    data: {
      user: {
        UserID: user.UserID,
        Email: user.Email,
        Name: user.Name,
        Role: user.Role,
      },
    },
  });
}); 