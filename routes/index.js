import express from 'express';
import * as db from "../db/api.js";


const router = express.Router();


/* GET home page. */
router.get("/", async function (req, res, next) {
    res.redirect("/restaurants");
});

// http://localhost:3000/references?pageSize=24&page=3&q=John
router.get("/restaurants", async (req, res, next) => {
    const query = req.query.query || "";
    const currentPage = +req.query.currentPage || 1;
    const pageSize = +req.query.pageSize || 12;
    const msg = req.query.msg || null;
    try {
      let total = await db.getRestaurantCount(query);
      let restaurants = await db.getRestaurants(query, currentPage, pageSize);
      res.render("./pages/restaurants", {
        restaurants,
        query,
        msg,
        currentPage,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (err) {
      next(err);
    }
});


router.post("/createRestaurant", async (req, res, next) => {
    const rest = req.body
    try {
        const insertRes = await db.insertRestaurant(rest);
    
        console.log("Inserted", insertRes);
        res.redirect("/restaurants/?msg=Inserted");
      } catch (err) {
        console.log("Error inserting", err);
        next(err);
      }
});


router.get("/restaurants/:restaurant_id/delete", async (req, res, next) => {
    const restaurant_id = req.params.restaurant_id;
    try {
      let deleteResult = await db.deleteRestaurantByID(restaurant_id);
      await db.deleteDishesByRestaurantID(restaurant_id);
      console.log(deleteResult)
      if (deleteResult && deleteResult.acknowledged) {
        res.redirect("/restaurants/?msg=Deleted");
      } else {
        res.redirect("/restaurants/?msg=Error Deleting");
      }
    } catch (err) {
      next(err);
    }
  });



router.get("/restaurants/:restaurant_id/edit", async (req, res, next) => {
    const restaurant_id = req.params.restaurant_id;
    const msg = req.query.msg || null;
    try {
      let rest = await db.getRestaurantByID(restaurant_id);
      let dishes = await db.getDishesByRestaurantID(restaurant_id);  
      res.render("./pages/editRestaurant", {
        rest: rest,
        dishes,
        msg,
      });
    } catch (err) {
      next(err);
    }
  });

router.post("/restaurants/:restaurant_id/edit", async (req, res, next) => {
    const restaurant_id = req.params.restaurant_id;
    const ref = req.body;
  
    try {
      let updateResult = await db.updateRestaurantByID(restaurant_id, ref);
  
      if (updateResult) {
        res.redirect("/restaurants/?msg=Error Updating");
      } else {
        res.redirect("/restaurants/?msg=Updated");
        
      }
    } catch (err) {
      next(err);
    }
  });

router.get("/dishes", async (req, res, next) => {
    const query = req.query.query || "";
    const currentPage = +req.query.currentPage || 1;
    const pageSize = +req.query.pageSize || 24;
    const msg = req.query.msg || null;
    try {
      let total = await db.getDishCount(query);
      let dishes = await db.getDishes(query, currentPage, pageSize);
      let restaurants = await db.getRestaurants("", null, null);
      res.render("./pages/dishes", {
        dishes,
        restaurants,
        query,
        msg,
        currentPage,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (err) {
      next(err);
    }
});

router.post("/createDish", async (req, res, next) => {
    try {
        await db.insertDish(req.body);
    
        res.redirect("/dishes/?msg=Inserted");
      } catch (err) {
        console.log("Error inserting", err);
        next(err);
      }
});

router.get("/dishes/:dish_id/delete", async (req, res, next) => {
      const dish_id = req.params.dish_id;
      try {
        let deleteResult = await db.deleteDishByID(dish_id);
    
        if (deleteResult && deleteResult.acknowledged) {
          res.redirect("/dishes/?msg=Deleted");
        } else {
          res.redirect("/dishes/?msg=Error Deleting");
        }
      } catch (err) {
        next(err);
      }
    });

  router.get("/dishes/:dish_id/edit", async (req, res, next) => {
    const dish_id = req.params.dish_id;
    const msg = req.query.msg || null;
    try {
      let dish = await db.getDishByID(dish_id);
      let restaurants = await db.getRestaurants("", null, null);
      res.render("./pages/editDish", {
        dish,
        restaurants,
        msg
      });
    } catch (err) {
      next(err);
    }
  });

router.post("/dishes/:dish_id/edit", async (req, res, next) => {
    const dish_id = req.params.dish_id;
    const dish = req.body;
  
    try {
      let updateResult = await db.updateDishByID(dish_id, dish);
  
      if (updateResult) {
        res.redirect("/dishes/?msg=Error Updating");
      } else {
        res.redirect("/dishes/?msg=Updated");
      }
    } catch (err) {
      next(err);
    }
  });

export default router;
