const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const email = encodeURIComponent("admin@example.com");
const password = encodeURIComponent("secret");
const host = encodeURIComponent("localhost");
const port = encodeURIComponent("27017");
const database = encodeURIComponent("articles_db");
const url = 'mongodb://'+email+':'+password+'@'+host+':'+port+'/'+database+'?authSource='+database;

async function connect () {
  // Create a new MongoClient
  const client = new MongoClient(url);

  await client.connect();
  console.log("Connected successfully to server");

  const db = client.db("articles_db");

  const collections = await db.listCollections({}, {nameOnly: true}).toArray();

  console.log(collections);

  client.close();
};

connect();