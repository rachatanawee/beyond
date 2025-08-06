import { AuthError } from '@supabase/supabase-js';

export interface AppError {
  type: 'network' | 'supabase' | 'auth' | 'validation' | 'general';
  code?: string;
  message: string;
  details?: unknown;
}

export class NetworkError extends Error {
  type = 'network' as const;
  
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class SupabaseError extends Error {
  type = 'supabase' as const;
  
  constructor(message: string, public code?: string, public details?: unknown) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export class ValidationError extends Error {
  type = 'validation' as const;
  
  constructor(message: string, public field?: string, public details?: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function parseError(error: unknown): AppError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Network connection failed. Please check your internet connection.',
      details: error
    };
  }

  // Supabase Auth errors
  if (error instanceof AuthError) {
    return {
      type: 'auth',
      code: error.message,
      message: getAuthErrorMessage(error.message),
      details: error
    };
  }

  // Supabase database errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string; message: string };
    return {
      type: 'supabase',
      code: dbError.code,
      message: getSupabaseErrorMessage(dbError.code, dbError.message),
      details: error
    };
  }

  // Custom app errors
  if (error instanceof NetworkError || error instanceof SupabaseError || error instanceof ValidationError) {
    return {
      type: error.type,
      message: error.message,
      details: error.details
    };
  }

  // Generic errors
  if (error instanceof Error) {
    return {
      type: 'general',
      message: error.message,
      details: error
    };
  }

  // Unknown errors
  return {
    type: 'general',
    message: 'An unexpected error occurred',
    details: error
  };
}

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'Invalid email or password';
    case 'email_not_confirmed':
      return 'Please check your email and click the confirmation link';
    case 'signup_disabled':
      return 'Sign up is currently disabled';
    case 'email_address_invalid':
      return 'Please enter a valid email address';
    case 'password_too_short':
      return 'Password must be at least 6 characters long';
    case 'weak_password':
      return 'Password is too weak. Please choose a stronger password';
    case 'user_not_found':
      return 'No account found with this email address';
    case 'too_many_requests':
      return 'Too many requests. Please wait a moment and try again';
    default:
      return 'Authentication failed. Please try again';
  }
}

function getSupabaseErrorMessage(code: string, originalMessage: string): string {
  switch (code) {
    case '23505': // unique_violation
      return 'This record already exists';
    case '23503': // foreign_key_violation
      return 'Cannot delete this record as it is referenced by other data';
    case '23502': // not_null_violation
      return 'Required field is missing';
    case '42501': // insufficient_privilege
      return 'You do not have permission to perform this action';
    case '08006': // connection_failure
    case '08001': // sqlclient_unable_to_establish_sqlconnection
      return 'Database connection failed. Please try again later';
    case 'PGRST301': // JWT expired
      return 'Your session has expired. Please log in again';
    case 'PGRST302': // JWT invalid
      return 'Invalid session. Please log in again';
    default:
      return originalMessage || 'Database operation failed';
  }
}

// Utility function to handle API responses
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 0 || !navigator.onLine) {
      throw new NetworkError('No internet connection');
    }
    
    if (response.status >= 500) {
      throw new SupabaseError('Server error. Please try again later');
    }
    
    if (response.status === 401) {
      throw new SupabaseError('Authentication required', 'PGRST301');
    }
    
    if (response.status === 403) {
      throw new SupabaseError('Access denied', '42501');
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new SupabaseError(
      errorData.message || `Request failed with status ${response.status}`,
      errorData.code
    );
  }
  
  return response.json();
}

// Retry utility for failed requests
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      const parsedError = parseError(error);
      
      // Don't retry validation or auth errors
      if (parsedError.type === 'validation' || parsedError.type === 'auth') {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}