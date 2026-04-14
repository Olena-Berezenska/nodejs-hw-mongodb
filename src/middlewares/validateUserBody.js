export const validateUserBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: 400,
      message: 'Validation Error',
      details: error.details.map((e) => e.message),
    });
  }
  next();
};
