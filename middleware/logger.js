const logger = (req, res, next) => {
  const now = new Date();

  // Convert to GMT+3
  const gmtPlus3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  const formattedTime = gmtPlus3
    .toISOString()
    .replace('T', ' ')
    .split('.')[0] // remove milliseconds
    .replace('Z', ' GMT+3');

  console.log(
    `[${formattedTime}] ${req.method} ${req.originalUrl}`
  );

  next();
};

module.exports = logger;
