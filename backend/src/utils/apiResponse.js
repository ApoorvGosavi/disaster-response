// Consistent success/error envelope for every endpoint.
// Frontend can rely on `success` always being present.

function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function error(res, status, code, message) {
  return res.status(status).json({
    success: false,
    error: { code, message },
  });
}

module.exports = { success, error };
