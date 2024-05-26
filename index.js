const express = require("express");
const { getAsync, setAsync } = require("./utils/redisClient");

const app = express();

// Middleware to verify Redis cache
const verifyCache = async (req, res, next) => {
  const cacheKey = req.originalUrl;

  try {
    const cachedData = await getAsync(cacheKey);
    if (cachedData) {
      console.log("Data retrieved from cache");
      return res.send(JSON.parse(cachedData));
    }
    next();
  } catch (error) {
    console.error("Error verifying cache:", error);
    next();
  }
};

// Route handler to retrieve and cache data
app.get("/api/data", verifyCache, async (req, res) => {
  try {
    // Simulate retrieving data from a database or external API
    const data = { message: "This is the data retrieved from the server" };

    // Cache data in Redis with expiration time (e.g., 1 hour)
    await setAsync(req.originalUrl, JSON.stringify(data), "EX", 3600);

    res.json(data);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Initiate the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is operating on port ${PORT}`);
});
