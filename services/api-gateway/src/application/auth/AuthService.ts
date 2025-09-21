import axios, { AxiosInstance, AxiosError } from 'axios';
import { AppError, AuthorizationError, ValidationError, ErrorHandler } from '@vetclinic/shared-kernel';
import { IUser } from '../../domain/user/User';

export interface IAuthService {
  verifyToken(token: string): Promise<IUser>;
}

export class AuthService implements IAuthService {
  private http: AxiosInstance;

  constructor(baseUrl: string) {
    this.http = axios.create({ 
      baseURL: baseUrl, 
      timeout: 5000, 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  async verifyToken(token: string): Promise<IUser> {
    try {
      console.log(`Verifying token with auth service: ${this.http.defaults.baseURL}/profile`);
      
      const response = await this.http.get('/profile', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'X-Request-Source': 'api-gateway'
        },
        timeout: 3000
      });

      console.log('Auth service response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      const user = response.data?.data?.user;
      
      if (!user) {
        throw new ValidationError(
          'No user data in auth service response', 
          undefined, 
          'AuthService'
        );
      }

      if (!user.id || !user.email || !user.role) {
        throw new ValidationError(
          'Incomplete user data from auth service', 
          undefined, 
          'AuthService'
        );
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      };

    } catch (error: any) {
      console.error('Auth service verification failed:', {
        message: error.message,
        code: error.code,
        url: `${this.http.defaults.baseURL}/profile`,
        stack: error.stack
      });

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          
          if (status === 401 || status === 403) {
            throw new AuthorizationError(
              `Authentication failed: ${axiosError.response.statusText}`,
              error,
              'AuthService'
            );
          } else if (status === 400) {
            throw new ValidationError(
              `Invalid request to auth service: ${axiosError.response.statusText}`,
              error,
              'AuthService'
            );
          } else if (status >= 500) {
            throw new AppError(
              `Auth service internal error: ${status}`,
              'AUTH_SERVICE_ERROR',
              error,
              'AuthService'
            );
          }
        } else if (axiosError.request) {
          throw new AppError(
            'Authentication service unavailable',
            'AUTH_SERVICE_UNAVAILABLE',
            error,
            'AuthService'
          );
        }
      }
      
      throw ErrorHandler.handleAppError(error, 'Token verification');
    }
  }
}
