import { createClient } from "redis";
import { getRestaurants as getRestaurantsFromMongo } from "./api.js"

async function getRestaurantsFromCache() {
  const client = await createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

  let key = "restaurantList";

  const exists = await client.get(key + ":cached");


  console.log("🔍 Checking if the cache is valid", key, exists);

  try {
    if (exists) {
      let restaurants = [];

      const restaurantKeys = await client.lRange(key, 0, -1);
      for (let restaurantKey of restaurantKeys) {
        restaurants.push(await client.hGetAll(restaurantKey));
      }

      return restaurants;
    } else {
      return null;
    }
  } finally {
    await client.disconnect();
  }
}

async function saveRestaurantsToCache(restaurants) {
  async function saveRestaurant(restaurant) {
    const restaurantKey = `restaurant:${restaurant.restaurant_id}`;

    await client.hSet(
        restaurantKey,
      // Generates something like ["_id", "1", "first_name", "John Doe", ...]
      Object.entries(restaurant) // Transforms the object into an array of key-value pairs
        .flat() // Goes from  [ [k1, v1], [k2, v2] ] to [k1, v1, k2, v2]
        .map((d) => d.toString()) // Converts the id to string
    );

    return restaurantKey;
  }

  const client = await createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

  let key = `restaurantList`;

  let before = performance.now();
  client.del(key); // Deletes the list of students
  try {
    for (let restaurant of restaurants) {
      const restaurantKey = await saveRestaurant(restaurant);
      await client.rPush(key, restaurantKey);
    }
    
    await client.set(key + ":cached", 1); // 60 seconds cache
    console.log("Setting the cache for", key + ":cached");
    console.log(
      "🧸 Restaurants saved to cache total",
      restaurants.length,
      " Took: ",
      performance.now() - before
    );
  } finally {
    await client.disconnect();
  }
}

// Returns the list of students for a classname, checking first in the cache
async function getRestaurants() {
  let students = [];
  console.log("Checking if the resource is in the cache");

  let before = performance.now();
  // Returns false if the students are not in the cache
  let restaurants = await getRestaurantsFromCache();
  if (!restaurants) {
    console.log(
      "🚫 Resource not found in the cache, checking mongo");
    before = performance.now();
    restaurants = await getRestaurantsFromMongo("");
    console.log(
      "🏋🏼‍♀️ Resource found in Mongo",
      restaurants.length,
      " took: ",
      performance.now() - before
    );

    await saveRestaurantsToCache(restaurants);
  } else {
    console.log(
      "👍 Resource found in the cache",
      restaurants.length,
      " took:",
      performance.now() - before
    );
  }
  return students;
}

// Cleanup the cache
async function cleanupCache() {
  const client = await createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

  const exists = await client.flushAll();
  console.log("☠️ Cache cleaned", exists);

  await client.disconnect();
}

let before = performance.now();
await cleanupCache();
console.log("🧹 Cache cleaned in", performance.now() - before);

before = performance.now();
// Get the studnets for the first time (not in cache)
await getRestaurants();
console.log("Restaurant fetched in ", performance.now() - before);

before = performance.now();
// Get the students for the second time, it should be in the cache
await getRestaurants();
console.log("⚽️ Restaurant fetched in", performance.now() - before);
