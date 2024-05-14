const express = require("express");
const redis = require("redis");
const bluebird = require("bluebird");

// Create Redis client
const redisClient = redis.createClient({
  host: "localhost",
  port: 6379, // Default Redis port
});

// Promisify Redis client methods
const getAsync = bluebird.promisifyAll(redisClient.get).bind(redisClient);
const setAsync = bluebird.promisifyAll(redisClient.set).bind(redisClient);

const app = express();

// Middleware to check Redis cache
const checkCache = async (req, res, next) => {
  const cacheKey = req.originalUrl;

  try {
    const cachedData = await getAsync(cacheKey);
    if (cachedData) {
      console.log("Data found in cache");
      return res.send(JSON.parse(cachedData));
    }
    next();
  } catch (error) {
    console.error("Error checking cache:", error);
    next();
  }
};

// Route handler to fetch and cache data
app.get("/api/data", checkCache, async (req, res) => {
  try {
    // Simulate fetching data from a database or external API
    const data = { message: "This is the data fetched from the server" };

    // Store data in Redis cache with expiration time (e.g., 1 hour)
    await setAsync(req.originalUrl, JSON.stringify(data), "EX", 3600);

    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
