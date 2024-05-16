const redis = require("redis");
const bluebird = require("bluebird");

// Promisify Redis client methods
const getAsync = bluebird.promisifyAll(redisClient);
const setAsync = bluebird.promisifyAll(redisClient);
const delAsync = bluebird.promisifyAll(redisClient);

// Create Redis client
const redisClient = redis.createClient({
  host: "localhost",
  port: 6379, // Default Redis port
});

module.exports = {
  redisClient,

  // promisify redis
  getAsync,
  setAsync,
  delAsync,
};
