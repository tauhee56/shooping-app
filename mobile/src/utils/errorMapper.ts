import axios from 'axios';

type ErrorKind =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'network'
  | 'timeout'
  | 'server'
  | 'unknown';

type MappedError = {
  title: string;
  message: string;
  status?: number;
  kind: ErrorKind;
};

function toStringSafe(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  try {
    return String(value);
  } catch {
    return '';
  }
}

function extractServerMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const maybeMessage = (data as any)?.message;
  if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage;
  return '';
}

export function mapApiError(error: unknown, fallbackMessage: string): MappedError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const serverMessage = extractServerMessage(error.response?.data);

    if (!status) {
      const code = toStringSafe((error as any)?.code);
      const msg = toStringSafe(error.message);

      if (code === 'ECONNABORTED' || /timeout/i.test(msg)) {
        return {
          title: 'Request timed out',
          message: 'Please try again. If the issue continues, check your internet connection.',
          kind: 'timeout',
        };
      }

      return {
        title: 'Network error',
        message: 'Unable to connect to the server. Please check your internet and try again.',
        kind: 'network',
      };
    }

    if (status === 401) {
      return {
        title: 'Session expired',
        message: 'Please log in again to continue.',
        status,
        kind: 'unauthorized',
      };
    }

    if (status === 403) {
      return {
        title: 'Access denied',
        message: serverMessage || 'You do not have permission to perform this action.',
        status,
        kind: 'forbidden',
      };
    }

    if (status === 404) {
      return {
        title: 'Not found',
        message: serverMessage || 'Requested resource was not found.',
        status,
        kind: 'not_found',
      };
    }

    if (status === 400 || status === 422) {
      return {
        title: 'Invalid input',
        message: serverMessage || fallbackMessage,
        status,
        kind: 'validation',
      };
    }

    if (status >= 500) {
      return {
        title: 'Server error',
        message: 'Something went wrong on the server. Please try again later.',
        status,
        kind: 'server',
      };
    }

    return {
      title: 'Error',
      message: serverMessage || fallbackMessage,
      status,
      kind: 'unknown',
    };
  }

  if (error instanceof Error) {
    const message = error.message?.trim();
    return {
      title: 'Error',
      message: message || fallbackMessage,
      kind: 'unknown',
    };
  }

  return {
    title: 'Error',
    message: fallbackMessage,
    kind: 'unknown',
  };
}

export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  return mapApiError(error, fallbackMessage).message;
}

export function getErrorTitle(error: unknown, fallbackMessage: string): string {
  return mapApiError(error, fallbackMessage).title;
}
