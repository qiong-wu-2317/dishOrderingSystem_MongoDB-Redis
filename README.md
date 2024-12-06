# dish_ordering_system_MongoDB
Project 2 Submission by Qiong Wu

## Business requirements
[Business Requirements.pdf](doc/Requirements.pdf)

## Database
Initial database by running:
```
mongorestore --host localhost --port 27017 --archive=db/database.dump --nsInclude='dishOrderSystem.*'
```
or 

```
mongoimport --host localhost --port 27017 --db dishOrderSystem --collection customer --file db/customer.json --type json --jsonArray
mongoimport --host localhost --port 27017 --db dishOrderSystem --collection dish --file db/dish.json --type json --jsonArray
mongoimport --host localhost --port 27017 --db dishOrderSystem --collection driver --file db/driver.json --type json --jsonArray
mongoimport --host localhost --port 27017 --db dishOrderSystem --collection order --file db/order.json --type json --jsonArray
mongoimport --host localhost --port 27017 --db dishOrderSystem --collection restaurant --file db/restaurant.json --type json --jsonArray
```

### Backup
To backup database
```
mongodump --db=dishOrderSystem --archive=database.dump
```

### Queries
to run 5 queries
```
npm install
node db/query.js
```

## Application
if the MongoDB url is not "mongodb://localhost:27017", set Mongo_URL by:
```
export Mongo_URL="mongodb://<ip>:<port>"
```

at project root folder
```
npm install
npm start
```

visit http://localhost:3000/

### Video Introduction
https://drive.google.com/file/d/12InVHlqpPnvQ-KInJYxgNCmp_LN9S-Mo/view?usp=sharing