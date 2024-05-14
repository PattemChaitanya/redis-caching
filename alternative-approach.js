const Redis = require("redis");
const crypto = require("crypto");

// Create a Redis instance
const redis = new Redis.Cluster([
  {
    host: "redis-host-1",
    port: 6379,
  },
  {
    host: "redis-host-2",
    port: 6379,
  },
  {
    host: "redis-host-3",
    port: 6379,
  },
]);

// Define a cache manager
const cacheManager = {
  async get(key) {
    const cachedData = await redis.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  },

  async set(key, data, ttl) {
    await redis.set(key, JSON.stringify(data), "EX", ttl);
  },

  async del(key) {
    await redis.del(key);
  },

  generateKey(...args) {
    return crypto.createHash("sha1").update(args.join("")).digest("hex");
  },
};

// Function to get data from cache or external source
async function getData(
  key,
  fetchDataFunction,
  { ttl = 3600, shouldCache = true } = {}
) {
  const cachedData = await cacheManager.get(key);

  if (cachedData) {
    console.log("Data retrieved from cache");
    return cachedData;
  }

  console.log("Data not found in cache, fetching from external source");
  const data = await fetchDataFunction();

  if (shouldCache) {
    await cacheManager.set(key, data, ttl);
  }

  return data;
}

// Example usage: Fetching user data
const fetchUserData = async (userId) => {
  const key = cacheManager.generateKey("user", userId);

  const fetchData = async () => {
    // Simulate fetching user data from an external source
    return {
      id: userId,
      name: "John Doe",
      email: "john@example.com",
    };
  };

  const userData = await getData(key, fetchData, {
    ttl: 3600,
    shouldCache: true,
  });
  console.log("User data:", userData);
};

// Fetch user data and cache it for 1 hour
fetchUserData(1);

// Fetch user data without caching
fetchUserData(2, { shouldCache: false });

// Invalidate cached user data
const invalidateUserCache = async (userId) => {
  const key = cacheManager.generateKey("user", userId);
  await cacheManager.del(key);
};

// Invalidate cached user data for userId 1
invalidateUserCache(1);
