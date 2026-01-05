/**
 * Error Handler Utility
 * Converts technical errors to user-friendly messages
 */

interface ErrorObject {
  body?: { message?: string };
  response?: { data?: { message?: string } };
  message?: string;
  status?: number;
  statusCode?: number;
}

type ErrorType = 'user' | 'system' | 'network' | 'validation';

export interface FriendlyError {
  message: string;
  type: ErrorType;
  isUserError: boolean;
}

/**
 * Parses error and returns user-friendly message
 */
export const getErrorMessage = (
  error: any,
  defaultMessage: string = 'Một lỗi đã xảy ra'
): FriendlyError => {
  let rawMessage = '';
  let statusCode = 0;

  // Extract raw error message from various sources
  if (error?.body?.message) {
    rawMessage = error.body.message;
  } else if (error?.response?.data?.message) {
    rawMessage = error.response.data.message;
  } else if (error?.response?.status) {
    statusCode = error.response.status;
  } else if (error?.message) {
    rawMessage = error.message;
  }

  // Determine error type and create friendly message
  const { message, type, isUserError } = parseErrorMessage(rawMessage, statusCode, defaultMessage);

  return {
    message,
    type,
    isUserError,
  };
};

/**
 * Parses error message and determines if it's user error or system error
 */
function parseErrorMessage(
  rawMessage: string,
  statusCode: number,
  defaultMessage: string
): { message: string; type: ErrorType; isUserError: boolean } {
  const lower = rawMessage.toLowerCase();

  // Network errors
  if (statusCode === 0 || lower.includes('network') || lower.includes('timeout')) {
    return {
      message: 'Kết nối mạng có vấn đề. Vui lòng kiểm tra internet của bạn.',
      type: 'network',
      isUserError: false,
    };
  }

  // Validation/Input errors (4xx except 401, 403, 500)
  if (statusCode >= 400 && statusCode < 500 && statusCode !== 401 && statusCode !== 403) {
    const validationMessage = mapValidationError(rawMessage);
    if (validationMessage) {
      return {
        message: validationMessage,
        type: 'validation',
        isUserError: true,
      };
    }
  }

  // Authentication errors
  if (statusCode === 401 || lower.includes('unauthorized') || lower.includes('không được phép')) {
    return {
      message: 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.',
      type: 'user',
      isUserError: false,
    };
  }

  // Authorization errors
  if (statusCode === 403 || lower.includes('forbidden') || lower.includes('không có quyền')) {
    return {
      message: 'Bạn không có quyền để thực hiện hành động này.',
      type: 'user',
      isUserError: false,
    };
  }

  // Server errors (5xx)
  if (statusCode >= 500) {
    return {
      message: 'Máy chủ gặp lỗi. Vui lòng thử lại sau.',
      type: 'system',
      isUserError: false,
    };
  }

  // Specific known errors
  const specificError = mapSpecificError(rawMessage);
  if (specificError) {
    return specificError;
  }

  // Default to provided message or generic message
  return {
    message: defaultMessage || 'Một lỗi đã xảy ra. Vui lòng thử lại.',
    type: 'system',
    isUserError: false,
  };
}

/**
 * Maps specific validation/user input errors to friendly messages
 */
function mapValidationError(message: string): string | null {
  const lower = message.toLowerCase();

  const errorMap: Record<string, string> = {
    'duplicate': 'Mục này đã tồn tại. Vui lòng sử dụng một cái khác.',
    'already exists': 'Mục này đã tồn tại. Vui lòng sử dụng một cái khác.',
    'not found': 'Mục bạn tìm không tồn tại.',
    'invalid': 'Thông tin bạn cung cấp không hợp lệ.',
    'required': 'Vui lòng điền tất cả các trường bắt buộc.',
    'email': 'Email không hợp lệ.',
    'password': 'Mật khẩu không hợp lệ.',
    'too short': 'Quá ngắn. Vui lòng nhập nhiều hơn.',
    'too long': 'Quá dài. Vui lòng nhập ít hơn.',
    'bad request': 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
    'expired': 'Hết hạn. Vui lòng thử lại.',
    'limited': 'Vượt quá giới hạn. Vui lòng thử lại sau.',
    'quota': 'Đã hết chỗ. Vui lòng thử lại sau.',
    'insufficient': 'Không đủ. Vui lòng kiểm tra lại.',
  };

  for (const [key, friendlyMsg] of Object.entries(errorMap)) {
    if (lower.includes(key)) {
      return friendlyMsg;
    }
  }

  return null;
}

/**
 * Maps specific known errors from the API
 */
function mapSpecificError(message: string): { message: string; type: ErrorType; isUserError: boolean } | null {
  const lower = message.toLowerCase();

  const errorMap: Record<string, { message: string; type: ErrorType; isUserError: boolean }> = {
    'event not found': {
      message: 'Sự kiện không tồn tại hoặc đã bị xóa.',
      type: 'user',
      isUserError: false,
    },
    'ticket not found': {
      message: 'Vé không tồn tại.',
      type: 'user',
      isUserError: false,
    },
    'order not found': {
      message: 'Đơn hàng không tồn tại.',
      type: 'user',
      isUserError: false,
    },
    'user not found': {
      message: 'Người dùng không tồn tại.',
      type: 'user',
      isUserError: false,
    },
    'insufficient quantity': {
      message: 'Không đủ vé còn lại. Vui lòng chọn số lượng ít hơn.',
      type: 'user',
      isUserError: true,
    },
    'payment failed': {
      message: 'Thanh toán không thành công. Vui lòng thử lại.',
      type: 'user',
      isUserError: true,
    },
  };

  for (const [key, errorObj] of Object.entries(errorMap)) {
    if (lower.includes(key)) {
      return errorObj;
    }
  }

  return null;
}

/**
 * Gets the severity level for notification based on error type
 */
export const getNotificationSeverity = (errorType: ErrorType): 'error' | 'warning' | 'info' => {
  switch (errorType) {
    case 'validation':
      return 'warning';
    case 'network':
      return 'error';
    case 'system':
      return 'error';
    case 'user':
      return 'warning';
    default:
      return 'error';
  }
};
