import { createClient } from "redis";

const key = `restaurantList`;
const nameKey = "restaurantNames";


export async function getRestaurantCount(query) {
    const client = await createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

    try {
        const restaurants = await client.lRange(nameKey, 0, -1);
        const filtered = restaurants.filter((item) => item.toLowerCase().indexOf(query.toLowerCase())>=0);

        return filtered ? filtered.length : 0
    } finally {
        await client.disconnect();
    }
}
  
export async function getRestaurantsPaging(query, page, size){
    const client = await createClient()
        .on("error", (err) => console.log("Redis Client Error", err))
        .connect();

    try {
        let restaurants = [];

        const restaurantKeys = await client.lRange(key, 0, -1);
        const restaurant_name = await client.lRange(nameKey, 0, -1)

        const start = (page - 1) * size
        const end = page * size
        let count = 0
        for (let i in restaurantKeys) {
            if(restaurant_name[i].toLowerCase().indexOf(query.toLowerCase())>=0){
                count++;
            }else{
                continue
            }
            if(count >=start && count <= end){
                restaurants.push(await client.hGetAll(restaurantKeys[i]));
            }
        }
        return restaurants;
    } finally {
        await client.disconnect();
    }
}

export async function getRestaurantByID(restaurant_id) {
    const client = await createClient()
        .on("error", (err) => console.log("Redis Client Error", err))
        .connect();
    try {
        return await client.hGetAll(`restaurant:${restaurant_id}`)
    } finally {
        await client.disconnect();
    }
  }
  
  
  export async function updateRestaurantByID(restaurant_id, rest) {
  
    const client = await createClient()
        .on("error", (err) => console.log("Redis Client Error", err))
        .connect();
  
    try {
        const restaurantKey = `restaurant:${restaurant_id}`
      /* name changes */
      if(rest.prev_name != rest.restaurant_name){
        const restaurantKeys = await client.lRange(key, 0, -1);
        const ind =  restaurantKeys.indexOf(restaurantKey)
        await client.lSet(nameKey, ind, rest.restaurant_name)
      }
      
      await client.hSet(
        restaurantKey,
        Object.entries(rest) // Transforms the object into an array of key-value pairs
            .flat() // Goes from  [ [k1, v1], [k2, v2] ] to [k1, v1, k2, v2]
            .map((d) => d.toString()) // Converts the id to string
        );
    } catch (err) {
      console.log(err);
      return err
    } finally {
        await client.disconnect();
    }
  }
  
  export async function insertRestaurant(rest) {
    const client = await createClient()
        .on("error", (err) => console.log("Redis Client Error", err))
        .connect();
    try {
        const restaurantKeys = await client.lRange(key, 0, -1);
        const maxNumber = Math.max(...restaurantKeys.map(item => parseInt(item.split(":")[1]))) + 1;
        const restaurantKey = `restaurant:${maxNumber}`
        rest.restaurant_id = maxNumber
        await client.hSet(
            restaurantKey,
          // Generates something like ["_id", "1", "first_name", "John Doe", ...]
          Object.entries(rest) // Transforms the object into an array of key-value pairs
            .flat() // Goes from  [ [k1, v1], [k2, v2] ] to [k1, v1, k2, v2]
            .map((d) => d.toString()) // Converts the id to string
        );
        await client.lPush(key, restaurantKey)
        await client.lPush(nameKey, rest.restaurant_name)
    } finally {
        await client.disconnect();
    }
  }
  
  
  export async function deleteRestaurantByID(restaurant_id) {
    const client = await createClient()
        .on("error", (err) => console.log("Redis Client Error", err))
        .connect();
    try {
        const restaurantKey = `restaurant:${restaurant_id}`
        await client.lRem(key, 1, restaurantKey)
        const name = await client.hGet(restaurantKey, "restaurant_name")
        await client.lRem(nameKey, 1, name)
        await client.del(restaurantKey)
        return true
    } catch(err) {
        console.log(err)
        return false
    } finally {
        await client.disconnect();
    }
  }