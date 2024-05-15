const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};
// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// code from MongoDB---------------------------------------------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uqfy7cb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // collections here
    const allFood = client.db("shareDine").collection("allFood");
    // get all data from database
    // post food to database
    app.post("/allFoods", async (req, res) => {
      const food = req.body;
      const result = await allFood.insertOne(food);
      res.send(result);
    });
    // get all data from database
    app.get("/allFoods", async (req, res) => {
      const sort = req.query.sort;
      const search = req.query.search || "";
      let query = {
        foodName: { $regex: search, $options: "i" },
      };

      let options = {};
      if (sort) {
        options.sort = { expiredDate: sort === "expiring" ? 1 : -1 };
      }
      const result = await allFood.find(query, options).toArray();
      res.send(result);
    });
    // get single data from database
    app.get("/allFoods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allFood.findOne(query);
      res.send(result);
    });

    // requested food
    const requestedFood = client.db("shareDine").collection("requestedFood");
    // post food to database
    app.post("/requestedFood", async (req, res) => {
      const food = req.body;
      const result = await requestedFood.insertOne(food);
      res.send(result);
    });
    // delete from database allFood
    app.delete("/allFoods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allFood.deleteOne(query);
      res.send(result);
    });

    // get all data from database
    app.get("/requestedFood", async (req, res) => {
      const result = await requestedFood.find({}).toArray();
      res.send(result);
    });

    // put data on update allFoods
    app.put("/allFoods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: req.body,
      };
      const result = await allFood.updateOne(query, update);
      res.send(result);
    });

    // sort featured foods based on quantity
    app.get("/featuredFoods", async (req, res) => {
      const result = await allFood.find({}).toArray();
      result.sort((a, b) => Number(b.foodQuantity) - Number(a.foodQuantity));
      res.send(result.slice(0, 6));
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to ShareDine Server");
});
// code from MongoDB---------------------------------------------------------

app.listen(port, () => {
  console.log(`ShareDine Server is running on port ${port}`);
});
