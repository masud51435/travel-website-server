const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0wmac.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db("travel-world");
    const allPlaces = database.collection("places");
    const orderCollection = database.collection("order");

    //POST places
    app.post('/places', async (req, res) => {
      const place = req.body;
      const result = await allPlaces.insertOne(place)
      res.send(result)
    })

    //GET all places
    app.get('/places', async (req, res) => {
      const cursor = allPlaces.find({});
      const place = await cursor.toArray();
      res.send(place);
    });

    //GET all orders
    app.get('/allorders', async (req, res) => {
      const cursor = orderCollection.find({});
      const place = await cursor.toArray();
      res.send(place);
    });

    //POST single order
    app.post('/addCart', (req, res) => {
      console.log(req.body);
      orderCollection.insertOne(req.body).then((result) => {
        res.send(result)
      })
    })

    //update status
    app.put('/item/:id', async (req, res) => {
      const id = req.params.id;
      const update = req.body;
      const query = { _id: id }
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          status: 'Approved'
        }
      }
      const result = await orderCollection.updateOne(query, updateDoc, options)
      res.send(result);
    })

    //GET my order
    app.get('/myorder/:email', async (req, res) => {
      console.log(req.params.email)
      const result = await orderCollection.find({ email: req.params.email }).toArray();
      res.send(result)
    })

    //Delete order
    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: id }
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    })


  }
  finally {
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log('server running at port', port)
})