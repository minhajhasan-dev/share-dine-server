const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
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
      let options = {};
      if (sort) {
        options.sort = { expiredDate: sort === "expiring" ? 1 : -1 };
      }
      const result = await allFood.find({}, options).toArray();
      res.send(result);
     
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
