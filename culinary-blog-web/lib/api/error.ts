/**
 * Lớp lỗi API tùy chỉnh, bao gồm mã trạng thái HTTP và chi tiết lỗi validation.
 * Dùng để chuẩn hóa cách xử lý lỗi từ axios response interceptor.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'ApiError';
  }
}

/**
 * Type guard để kiểm tra xem lỗi có phải là ApiError không.
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Trích xuất thông báo lỗi thân thiện từ axios error response.
 * Hỗ trợ các định dạng lỗi của ASP.NET Core (ProblemDetails, ValidationProblem, v.v.)
 */
export function extractAxiosErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  // Axios error có cấu trúc { response: { data, status } }
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: {
        data?: any;
        status?: number;
      };
    };
    const { response } = axiosError;

    if (response?.data) {
      const data = response.data;

      // Chuỗi lỗi đơn giản
      if (typeof data === 'string') return data;

      // ASP.NET Core ProblemDetails / ValidationProblemDetails
      if (data.title) return data.title;
      if (data.message) return data.message;
      if (data.detail) return data.detail;

      // Lỗi validation từ ASP.NET Core (errors: { field: [...] })
      if (data.errors && typeof data.errors === 'object') {
        const messages = Object.entries(data.errors).map(([key, values]) => {
          const arr = Array.isArray(values) ? values : [String(values)];
          return `${key}: ${arr.join(', ')}`;
        });
        if (messages.length > 0) return messages.join('; ');
      }
    }

    if (response?.status) {
      return `Lỗi API (${response.status})`;
    }
  }

  // Lỗi(Error) thông thường của JS/TS
  if (error instanceof Error) {
    return error.message;
  }

  return 'Đã có lỗi xảy ra khi gọi API';
}

/**
 * Trích xuất mã trạng thái HTTP từ axios error.
 */
export function extractAxiosStatusCode(error: unknown): number {
  if (isApiError(error)) {
    return error.statusCode;
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: {
        status?: number;
      };
    };
    if (axiosError.response?.status) {
      return axiosError.response.status;
    }
  }

  return 500;
}
