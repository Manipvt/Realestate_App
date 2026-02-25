const sendResponse = (res, statusCode, data, message = null) => {
  res.status(statusCode).json({
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'success',
    message,
    data
  });
};

const sendSuccess = (res, statusCode, data, message) => {
  sendResponse(res, statusCode, data, message);
};

const sendError = (res, statusCode, message) => {
  sendResponse(res, statusCode, null, message);
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError
};