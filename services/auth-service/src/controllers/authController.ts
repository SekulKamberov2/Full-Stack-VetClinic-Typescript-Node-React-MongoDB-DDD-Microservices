import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { ValidationError, NotFoundError, AuthorizationError, ErrorHandler, RequestValidator } from '@vetclinic/shared-kernel';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, firstName, lastName } = req.body;
 
    RequestValidator.validateRequiredParam(email, 'email', 'AuthController');
    RequestValidator.validateRequiredParam(password, 'password', 'AuthController');
    RequestValidator.validateRequiredParam(role, 'role', 'AuthController');
    RequestValidator.validateRequiredParam(firstName, 'firstName', 'AuthController');
    RequestValidator.validateRequiredParam(lastName, 'lastName', 'AuthController');
 
    if (!RequestValidator.isValidEmail(email)) {
      throw new ValidationError('Invalid email format', undefined, 'AuthController');
    }
 
    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long', undefined, 'AuthController');
    }
 
    const validRoles = ['admin', 'vet', 'staff', 'client'];
    if (!validRoles.includes(role)) {
      throw new ValidationError(
        `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        undefined,
        'AuthController'
      );
    }
 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError(
        'User already exists with this email',
        undefined,
        'AuthController'
      );
    }
 
    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      role,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    await user.save();
 
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.code || 'VALIDATION_ERROR',
      });
      return;
    }
    
    if (error instanceof AuthorizationError) {
      res.status(401).json({
        success: false,
        message: error.message,
        error: error.code || 'AUTHENTICATION_ERROR',
      });
      return;
    }
    
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: error.message,
        error: error.code || 'NOT_FOUND',
      });
      return;
    }
    
    try {
      ErrorHandler.handleAppError(error, 'User registration');
    } catch (appError) {
      const errorMessage = appError instanceof Error ? appError.message : 'Internal server error';
      
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error',
      });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
 
    RequestValidator.validateRequiredParam(email, 'email', 'AuthController');
    RequestValidator.validateRequiredParam(password, 'password', 'AuthController');
 
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!user) {
      throw new AuthorizationError(
        'Invalid credentials',
        undefined,
        'AuthController'
      );
    }
 
    if (!user.isActive) {
      throw new AuthorizationError(
        'Account is deactivated. Please contact administrator.',
        undefined,
        'AuthController'
      );
    }
 
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthorizationError(
        'Invalid credentials',
        undefined,
        'AuthController'
      );
    }
 
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      res.status(401).json({
        success: false,
        message: error.message,
        error: error.code || 'AUTHENTICATION_ERROR',
      });
      return;
    }
    
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.code || 'VALIDATION_ERROR',
      });
      return;
    }
    
    try {
      ErrorHandler.handleAppError(error, 'User login');
    } catch (appError) {
      const errorMessage = appError instanceof Error ? appError.message : 'Internal server error';
      
      res.status(500).json({
        success: false,
        message: 'Error logging in',
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error',
      });
    }
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError(
        'User not authenticated',
        undefined,
        'AuthController'
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: req.user._id.toString(),
          email: req.user.email,
          role: req.user.role,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          isActive: req.user.isActive,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt,
        },
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      res.status(401).json({
        success: false,
        message: error.message,
        error: error.code || 'AUTHENTICATION_ERROR',
      });
      return;
    }
    
    try {
      ErrorHandler.handleAppError(error, 'Get user profile');
    } catch (appError) {
      const errorMessage = appError instanceof Error ? appError.message : 'Internal server error';
      
      res.status(500).json({
        success: false,
        message: 'Error fetching profile',
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error',
      });
    }
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError(
        'User not authenticated',
        undefined,
        'AuthController'
      );
    }

    const { firstName, lastName } = req.body;
 
    if (firstName !== undefined) {
      RequestValidator.validateRequiredParam(firstName, 'firstName', 'AuthController');
    }
    
    if (lastName !== undefined) {
      RequestValidator.validateRequiredParam(lastName, 'lastName', 'AuthController');
    }
 
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        ...(firstName && { firstName: firstName.trim() }),
        ...(lastName && { lastName: lastName.trim() }) 
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    if (!user) {
      throw new NotFoundError(
        'User not found',
        undefined,
        'AuthController'
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      res.status(401).json({
        success: false,
        message: error.message,
        error: error.code || 'AUTHENTICATION_ERROR',
      });
      return;
    }
    
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.code || 'VALIDATION_ERROR',
      });
      return;
    }
    
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: error.message,
        error: error.code || 'NOT_FOUND',
      });
      return;
    }
    
    try {
      ErrorHandler.handleAppError(error, 'Update user profile');
    } catch (appError) {
      const errorMessage = appError instanceof Error ? appError.message : 'Internal server error';
      
      res.status(500).json({
        success: false,
        message: 'Error updating profile',
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error',
      });
    }
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError(
        'User not authenticated',
        undefined,
        'AuthController'
      );
    }

    const { currentPassword, newPassword } = req.body;

    RequestValidator.validateRequiredParam(currentPassword, 'currentPassword', 'AuthController');
    RequestValidator.validateRequiredParam(newPassword, 'newPassword', 'AuthController');

    if (newPassword.length < 6) {
      throw new ValidationError(
        'New password must be at least 6 characters long',
        undefined,
        'AuthController'
      );
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      throw new NotFoundError(
        'User not found',
        undefined,
        'AuthController'
      );
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new ValidationError(
        'Current password is incorrect',
        undefined,
        'AuthController'
      );
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      res.status(401).json({
        success: false,
        message: error.message,
        error: error.code || 'AUTHENTICATION_ERROR',
      });
      return;
    }
    
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.code || 'VALIDATION_ERROR',
      });
      return;
    }
    
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: error.message,
        error: error.code || 'NOT_FOUND',
      });
      return;
    }
    
    try {
      ErrorHandler.handleAppError(error, 'Change password');
    } catch (appError) {
      const errorMessage = appError instanceof Error ? appError.message : 'Internal server error';
      
      res.status(500).json({
        success: false,
        message: 'Error changing password',
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error',
      });
    }
  }
};

export const deactivateAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError(
        'User not authenticated',
        undefined,
        'AuthController'
      );
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundError(
        'User not found',
        undefined,
        'AuthController'
      );
    }

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      res.status(401).json({
        success: false,
        message: error.message,
        error: error.code || 'AUTHENTICATION_ERROR',
      });
      return;
    }
    
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: error.message,
        error: error.code || 'NOT_FOUND',
      });
      return;
    }
    
    try {
      ErrorHandler.handleAppError(error, 'Deactivate account');
    } catch (appError) {
      const errorMessage = appError instanceof Error ? appError.message : 'Internal server error';
      
      res.status(500).json({
        success: false,
        message: 'Error deactivating account',
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error',
      });
    }
  }
};
