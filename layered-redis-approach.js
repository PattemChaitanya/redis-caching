const express = require("express");
const { getAsync, setAsync, delAsync } = require("./utils/redisClient");

const app = express();

// Simulated database
const database = {
  data: {},
  getData: async (key) => {
    // Simulate fetching data from the database
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { key, value: `Data for key: ${key}` };
  },
};

// Middleware for cache retrieval
const retrieveFromCache = async (req, res, next) => {
  const cacheKey = req.originalUrl;

  try {
    // Check if data exists in Redis cache
    const cachedData = await getAsync(cacheKey);
    if (cachedData) {
      console.log("Data found in Redis cache");
      return res.send(JSON.parse(cachedData));
    }

    // If not found in Redis cache, check in-memory cache
    const inMemoryData = database.data[cacheKey];
    if (inMemoryData) {
      console.log("Data found in in-memory cache");
      // Cache data in Redis for future requests
      await setAsync(cacheKey, JSON.stringify(inMemoryData), "EX", 3600);
      return res.send(inMemoryData);
    }

    next(); // Continue to the next middleware if data not found in cache
  } catch (error) {
    console.error("Error retrieving from cache:", error);
    next();
  }
};

// Route handler to fetch and cache data
app.get("/api/data/:key", retrieveFromCache, async (req, res) => {
  const cacheKey = req.originalUrl;
  const { key } = req.params;

  try {
    // Fetch data from the database
    const data = await database.getData(key);

    // Cache data in Redis
    await setAsync(cacheKey, JSON.stringify(data), "EX", 3600);

    // Cache data in memory
    database.data[cacheKey] = data;

    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route handler to invalidate cache
app.delete("/api/data/:key", async (req, res) => {
  const cacheKey = req.originalUrl;

  try {
    // Delete data from Redis cache
    await delAsync(cacheKey);

    // Delete data from in-memory cache
    delete database.data[cacheKey];

    res.json({ message: "Cache invalidated successfully" });
  } catch (error) {
    console.error("Error invalidating cache:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
