export class ApiError extends Error {
  statusCode?: string;
  details?: any;
  constructor(message: string, statusCode?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const handleApiError = (error: any, defaultMessage: string): never => {
  console.error('[API Error]', error);
  if (error.code && error.message) {
    throw new ApiError(error.message, error.code, error.details);
  }
  throw new ApiError(defaultMessage, '500', error);
};
