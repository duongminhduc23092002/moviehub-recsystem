export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const successResponse = (data: any, message: string = "Success", meta?: any) => {
  const response: any = {
    success: true,
    data,
    message,
  };

  if (meta) {
    response.meta = meta;
  }

  return response;
};

export const errorResponse = (message: string = "Error occurred") => {
  return {
    success: false,
    message,
  };
};