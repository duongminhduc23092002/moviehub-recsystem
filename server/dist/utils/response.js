export const successResponse = (data, message = "Success", meta) => {
    const response = {
        success: true,
        data,
        message,
    };
    if (meta) {
        response.meta = meta;
    }
    return response;
};
export const errorResponse = (message = "Error occurred") => {
    return {
        success: false,
        message,
    };
};
