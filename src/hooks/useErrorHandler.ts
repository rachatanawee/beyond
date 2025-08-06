import { useCallback } from 'react';
import { useError } from '@/contexts/ErrorContext';
import { parseError, retryOperation } from '@/lib/error-handler';
import { useTranslations } from 'next-intl';

export function useErrorHandler() {
    const { showError } = useError();
    const t = useTranslations('Errors');

    const handleError = useCallback((error: unknown, context?: string) => {
        const parsedError = parseError(error);

        let title: string;
        let message: string;

        switch (parsedError.type) {
            case 'network':
                title = t('networkError');
                message = t('networkErrorMessage');
                break;
            case 'supabase':
                if (parsedError.code === 'PGRST301' || parsedError.code === 'PGRST302') {
                    title = t('sessionExpired');
                    message = t('sessionExpiredMessage');
                } else if (parsedError.code === '42501') {
                    title = t('accessDenied');
                    message = t('accessDeniedMessage');
                } else {
                    title = t('databaseError');
                    message = parsedError.message;
                }
                break;
            case 'auth':
                title = t('sessionExpired');
                message = parsedError.message;
                break;
            case 'validation':
                title = t('validationError');
                message = parsedError.message;
                break;
            default:
                title = t('unknownError');
                message = parsedError.message || t('unknownErrorMessage');
        }

        // Add context to the message if provided
        if (context) {
            message = `${context}: ${message}`;
        }

        showError({
            type: parsedError.type,
            title,
            message,
        });

        // Log error for debugging
        console.error('Error handled:', {
            context,
            type: parsedError.type,
            code: parsedError.code,
            message: parsedError.message,
            details: parsedError.details,
        });
    }, [showError, t]);

    const handleAsyncOperation = useCallback(async <T>(
        operation: () => Promise<T>,
        options?: {
            context?: string;
            retry?: boolean;
            maxRetries?: number;
            onSuccess?: (result: T) => void;
            onError?: (error: unknown) => void;
        }
    ): Promise<T | null> => {
        try {
            const result = options?.retry
                ? await retryOperation(operation, options.maxRetries)
                : await operation();

            options?.onSuccess?.(result);
            return result;
        } catch (error) {
            handleError(error, options?.context);
            options?.onError?.(error);
            return null;
        }
    }, [handleError]);

    return {
        handleError,
        handleAsyncOperation,
    };
}