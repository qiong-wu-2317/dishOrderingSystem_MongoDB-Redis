import { MongoClient } from "mongodb";

const db_uri = process.env.MONGO_URL || "mongodb://localhost:27017";

const connect = () => {
    const client = new MongoClient(db_uri);
    const db = client.db("dishOrderSystem");

    return { client, db };
};

export async function getRestaurants(query, page, pageSize) {
  const { client, db } = connect();
  try{
      const restColl = db.collection("restaurant");
      return await restColl.find({ "restaurant_name": { $regex: query, $options: 'i' } }).sort({"restaurant_name": 1}).limit(pageSize || 10000).skip(((page||1) - 1) * pageSize).toArray();
      
  } catch (err) {
      console.log(err);
  } finally {
      await client.close();
  }
}


export async function getRestaurantCount(query) {

  const { client, db } = connect();
  try{
      const restColl = db.collection("restaurant");
      return await restColl.countDocuments({ "restaurant_name": { $regex: query, $options: 'i' } });
      
  } catch (err) {
      console.log(err);
  } finally {
      await client.close();
  }
}


export async function getRestaurantByID(restaurant_id) {
  const { client, db } = connect();
  try {
    const restColl = db.collection("restaurant");
    return await restColl.findOne({"restaurant_id":parseInt(restaurant_id)});
  } finally {
    await client.close();
  }
}

export async function getDishesByRestaurantID(restaurant_id) {
  const { client, db } = connect();
  try {
    const dishColl = db.collection("dish");
    return await dishColl.find({"restaurant.restaurant_id": parseInt(restaurant_id)}).toArray();
  } finally {
    await client.close();
  }
}


export async function updateRestaurantByID(restaurant_id, rest) {

  const { client, db } = connect();

  try {
    const restColl = db.collection("restaurant");
    const dishColl = db.collection("dish");
    await restColl.updateOne({"restaurant_id":parseInt(restaurant_id)},{
      $set:{
        "restaurant_name": rest.restaurant_name,
        "restaurant_address": rest.restaurant_address,
        "opening_time": rest.opening_time,
        "contact": rest.contact
      }
    });
    await dishColl.updateMany({"restaurant.restaurant_id":parseInt(restaurant_id)},{
      $set:{
        "restaurant.restaurant_name": rest.restaurant_name,
        "restaurant.restaurant_address": rest.restaurant_address,
        "restaurant.opening_time": rest.opening_time,
        "restaurant.contact": rest.contact
      }
    });
  } catch (err) {
    console.log(err);
    return err
  } finally {
    await client.close();
  }
}

export async function insertRestaurant(rest) {
  const { client, db } = connect();
  try {
    const restColl = db.collection("restaurant");
    const maxRest = await restColl.find().sort({ "restaurant_id": -1 }).limit(1).toArray()
    await restColl.insertOne({
      "restaurant_id": parseInt(maxRest[0].restaurant_id + 1),
      "restaurant_name": rest.restaurant_name,
      "restaurant_address": rest.restaurant_address,
      "opening_time": rest.opening_time,
      "contact": rest.contact
    });
  } finally {
    await client.close();
  }
}


export async function deleteRestaurantByID(restaurant_id) {
  const { client, db } = connect();
  try {
    const restColl = db.collection("restaurant");
    return await restColl.deleteOne({"restaurant_id":parseInt(restaurant_id)});
  } finally {
    await client.close();
  }
}

export async function deleteDishesByRestaurantID(restaurant_id) {
  const { client, db } = connect();
  try {
    const dishColl = db.collection("dish");
    return await dishColl.deleteMany({"restaurant.restaurant_id":parseInt(restaurant_id)});
  } finally {
    await client.close();
  }
}

export async function getDishes(query, page, pageSize) {
  const { client, db } = connect();
  try{
      const dishColl = db.collection("dish");
      return await dishColl.find({ "dish_name": { $regex: query, $options: 'i' } }).sort({"price": 1}).limit(pageSize || 10000).skip(((page||1) - 1) * pageSize).toArray();
  } catch (err) {
      console.log(err);
  } finally {
      await client.close();
  }
}
  
  export async function getDishCount(query) {
    const { client, db } = connect();
    try{
        const dishColl = db.collection("dish");
        return await dishColl.countDocuments({ "dish_name": { $regex: query, $options: 'i' } });
    } catch (err) {
        console.log(err);
    } finally {
        await client.close();
    }
  }


export async function insertDish(res) {
  const { client, db } = connect();
  try {
    const dishColl = db.collection("dish");
    const maxDish = await dishColl.find().sort({ "dish_id": -1 }).limit(1).toArray()
    const restaurant = await getRestaurantByID(res.restaurant_id)
    delete restaurant._id;
    await dishColl.insertOne({
      "dish_id": parseInt(maxDish[0].dish_id + 1),
      "dish_name": res.dish_name,
      "price": Number(res.price),
      "introduction": res.introduction,
      "restaurant": restaurant
    });
  } catch (err) {
        console.log(err);
  } finally {
    await client.close();
  }
}


export async function deleteDishByID(dish_id) {
    const { client, db } = connect();
  try {
    const dishColl = db.collection("dish");
    return await dishColl.deleteOne({"dish_id":parseInt(dish_id)});
  } finally {
    await client.close();
  }
}



export async function getDishByID(dish_id) {
  const { client, db } = connect();
  try {
    const dishColl = db.collection("dish");
    return await dishColl.findOne({"dish_id": parseInt(dish_id)});
  } finally {
    await client.close();
  }
}
  

export async function updateDishByID(dish_id, dish) {
  const { client, db } = connect();
  try {
    const dishColl = db.collection("dish");
    const restaurant = await getRestaurantByID(dish.restaurant_id)
    delete restaurant._id;
    await dishColl.updateOne(
      {"dish_id": parseInt(dish_id)},
      {
        $set:{
          "dish_name": "123",
          "price": Number(dish.price),
          "introduction": dish.introduction,
          "restaurant": restaurant
        }
      }
    );
  } catch (err) {
        console.log(err);
  } finally {
    await client.close();
  }
}