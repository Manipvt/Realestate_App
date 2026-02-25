const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { validateEmail, validatePhone, validatePassword, validateRequired } = require('../utils/validator');

const register = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;

  const missingFields = validateRequired({ name, email, phone, password });
  if (missingFields.length > 0) {
    return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
  }

  if (!validateEmail(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  if (!validatePhone(phone)) {
    return next(new AppError('Please provide a valid Indian phone number', 400));
  }

  if (!validatePassword(password)) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    return next(new AppError('User with this email or phone already exists', 400));
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: role || 'buyer'
  });

  const token = generateToken(user._id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      },
      token
    }
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const missingFields = validateRequired({ email, password });
  if (missingFields.length > 0) {
    return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
  }

  if (!validateEmail(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = generateToken(user._id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      },
      token
    }
  });
});

const logout = catchAsync(async (req, res, next) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0)
  });

  res.status(200).json({
    status: 'success',
    message: 'Logout successful'
  });
});

const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    }
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe
};