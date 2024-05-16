const redis = require("redis");
const express = require("express");
const app = express();

// Redis client configuration
const redisClient = redis.createClient({
  host: "localhost",
  port: 6379,
  password: "your-redis-password",
});

// Set up Redis caching middleware
app.use((req, res, next) => {
  const cacheKey = `cache-${req.url}`;
  redisClient.get(cacheKey, (err, cachedResponse) => {
    if (err) {
      console.error(err);
      return next();
    }

    if (cachedResponse) {
      console.log(`Cache hit for ${req.url}`);
      res.send(cachedResponse);
    } else {
      console.log(`Cache miss for ${req.url}`);
      next();
    }
  });
});

// Set up Redis caching for specific routes
app.get("/api/data", (req, res) => {
  const cacheKey = `cache-api-data`;
  redisClient.get(cacheKey, (err, cachedResponse) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error retrieving data");
    }

    if (cachedResponse) {
      console.log(`Cache hit for /api/data`);
      res.send(cachedResponse);
    } else {
      console.log(`Cache miss for /api/data`);
      // Fetch data from database or API
      const data = fetchDataFromDatabase();
      res.send(data);

      // Cache the response for 1 hour
      redisClient.setex(cacheKey, 3600, JSON.stringify(data));
    }
  });
});

// Set up Redis caching for entire application
app.use((req, res, next) => {
  const cacheKey = `cache-${req.url}`;
  redisClient.get(cacheKey, (err, cachedResponse) => {
    if (err) {
      console.error(err);
      return next();
    }

    if (cachedResponse) {
      console.log(`Cache hit for ${req.url}`);
      res.send(cachedResponse);
    } else {
      console.log(`Cache miss for ${req.url}`);
      next();
    }
  });
});

// Set up Redis caching for specific route with TTL
app.get("/api/user", (req, res) => {
  const cacheKey = `cache-api-user`;
  redisClient.get(cacheKey, (err, cachedResponse) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error retrieving user data");
    }

    if (cachedResponse) {
      console.log(`Cache hit for /api/user`);
      res.send(cachedResponse);
    } else {
      console.log(`Cache miss for /api/user`);
      // Fetch user data from database or API
      const userData = fetchUserDataFromDatabase();
      res.send(userData);

      // Cache the response for 30 minutes with TTL
      redisClient.setex(cacheKey, 1800, JSON.stringify(userData));
    }
  });
});

// Set up Redis caching for entire application with TTL
app.use((req, res, next) => {
  const cacheKey = `cache-${req.url}`;
  redisClient.get(cacheKey, (err, cachedResponse) => {
    if (err) {
      console.error(err);
      return next();
    }

    if (cachedResponse) {
      console.log(`Cache hit for ${req.url}`);
      res.send(cachedResponse);
    } else {
      console.log(`Cache miss for ${req.url}`);
      next();
    }
  });
});

// Set up Redis caching for specific route with cache tags
app.get("/api/products", (req, res) => {
  const cacheKey = `cache-api-products`;
  const cacheTags = ["products", "category:electronics"];
  redisClient.get(cacheKey, (err, cachedResponse) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error retrieving products");
    }

    if (cachedResponse) {
      console.log(`Cache hit for /api/products`);
      res.send(cachedResponse);
    } else {
      console.log(`Cache miss for /api/products`);
      // Fetch products data from database or API
      const productsData = fetchProductsDataFromDatabase();
      res.send(productsData);

      // Cache the response for 1 hour with cache tags
      redisClient.setex(cacheKey, 3600, JSON.stringify(productsData));
      redisClient.sadd("cache:tags", cacheTags);
    }
  });
});

// Set up Redis caching for entire application with cache tags
app.use((req, res, next) => {
  const cacheKey = `cache-${req.url}`;
  const cacheTags = ["products", "category:electronics"];
  redisClient.get(cacheKey, (err, cachedResponse) => {
    if (err) {
      console.error(err);
      return next();
    }

    if (cachedResponse) {
      console.log(`Cache hit for ${req.url}`);
      res.send(cachedResponse);
    } else {
      console.log(`Cache miss for ${req.url}`);
      next();
    }
  });
});

// Set up Redis caching for specific route with cache invalidation
app.get("/api/orders", (req, res) => {
  const cacheKey = `cache-api-orders`;
  const cacheInvalidationKey = `cache:invalidation:orders`;
  redisClient.get(cacheKey, (err, cachedResponse) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error retrieving orders");
    }

    if (cachedResponse) {
      console.log(`Cache hit for /api/orders`);
      res.send(cachedResponse);
    } else {
      console.log(`Cache miss for /api/orders`);
      // Fetch orders data from database or API
      const ordersData = fetchOrdersDataFromDatabase();
      res.send(ordersData);

      // Cache the response for 1 hour with cache invalidation
      redisClient.setex(cacheKey, 3600, JSON.stringify(ordersData));
      redisClient.setex(cacheInvalidationKey, 3600, "true");
    }
  });
});

// Set up Redis caching for entire application with cache invalidation
app.use((req, res, next) => {
  const cacheKey = `cache-${req.url}`;
  const cacheInvalidationKey = `cache:invalidation:${req.url}`;
  redisClient.get(cacheKey, (err, cachedResponse) => {
    if (err) {
      console.error(err);
      return next();
    }

    if (cachedResponse) {
      console.log(`Cache hit for ${req.url}`);
      res.send(cachedResponse);
    } else {
      console.log(`Cache miss for ${req.url}`);
      next();
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
