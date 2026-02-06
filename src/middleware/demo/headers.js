const addDemoHeaders = (req, res, next) => {
  // Add custom headers for demo purposes
  res.setHeader("X-Demo-Page", "true");
  res.setHeader("X-Middleware-Demo", "Ready to Serve");

  next();
};

export { addDemoHeaders };