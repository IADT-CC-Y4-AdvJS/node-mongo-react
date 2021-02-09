const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const faker = require('./faker.min.js');

// Connection URL
const email = encodeURIComponent("admin@example.com");
const password = encodeURIComponent("secret");
const host = encodeURIComponent("localhost");
const port = encodeURIComponent("27017");
const database = encodeURIComponent("articles_db");
const url = 'mongodb://'+email+':'+password+'@'+host+':'+port+'/'+database+'?authSource='+database;
const numUsers = 25;
const numArticles = 100;
const maxNumComments = 5;

async function seed () {
  // Create a new MongoClient
  const client = new MongoClient(url);
  try {
    // Use connect method to connect to the Server
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db("articles_db");

    const collections = await db.listCollections({}, {nameOnly: true}).toArray();

    console.log(collections);
    collections.map(async function(collection) {
      await db.dropCollection(collection.name);
    });

    const categoriesCollection = await db.createCollection("categories", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: [ "title" ],
          properties: {
            title: {
              bsonType: "string",
              description: "'title' must be a string and is required"
            }
          }
        }
      }
    });

    const usersCollection = await db.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: [ "email", "password", "name", "role" ],
          properties: {
            email: {
              bsonType: "string",
              description: "'email' must be a string and is required"
            },
            password: {
              bsonType: "string",
              description: "'password' must be a string and is required"
            },
            name: {
              bsonType: "string",
              description: "'name' must be a string and is required"
            },
            role: {
              enum: [ "admin", "user" ],
              description: "'role' can only be one of the enum values and is required"
            }
          }
        }
      }
    });

    const articlesCollection = await db.createCollection("articles", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: [ "title", "body"],
          properties: {
            title: {
              bsonType: "string",
              description: "'title' must be a string and is required"
            },
            body: {
              bsonType: "string",
              description: "'body' must be a string and is required"
            },
            user_id: {
              bsonType: "objectId",
              description: "'user_id' must be an object id and is required"
            },
            category_id: {
              bsonType: "objectId",
              description: "'category_id' must be an object id and is required"
            },
            comments: {
              bsonType: "array",
              minItems: 0,
              uniqueItems: false,
              additionalProperties: false,
              description: "'comments' must be an array and is required",
              items: {
                bsonType: "object",
                required: ["user_id", "body"],
                additionalProperties: false,
                description: "'comments' must contain the stated fields",
                properties: {
                  user_id: {
                    bsonType: "objectId",
                    description: "'user_id' must be an object id and is required"
                  },
                  body: {
                    bsonType: "string",
                    description: "'body' must be a string and is required"
                  }
                }
              }
            }
          }
        }
      }
    });

    const categories = [
      { title: "Soccer" },
      { title: "Basketball" },
      { title: "Sailing" },
      { title: "Rugby" },
      { title: "Badminton" },
      { title: "Tennis" },
      { title: "Running" },
      { title: "Hockey" },
      { title: "Canoeing" },
      { title: "Rowing" }
    ];

    var result = await categoriesCollection.insertMany(categories);
    console.log(result);
    const newCategories = result.ops;

    result = await usersCollection.insertOne({ 
      email: "francis@bloggs.com", 
      password: "secret", 
      name: "Francis Bloggs", 
      role: "admin" 
    });

    const users = [];
    for (var i = 0; i != numUsers; i++) {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      users.push({
        name: firstName + " " + lastName,
        password: "secret",
        email: firstName + "." + lastName + "@"  + faker.internet.domainName(),
        role: "user"
      });
    }

    result = await usersCollection.insertMany(users);
    console.log(result);
    const newUsers = result.ops;

    const articles = [];
    for (var i = 0; i != numArticles; i++) {
      const comments = [];
      const numComments = Math.floor(Math.random() * maxNumComments);
      for (var j = 0; j != numComments; j++) {
        const user = newUsers[Math.floor(Math.random() * newUsers.length)];
        comments.push({
          user_id: user._id,
          body: faker.lorem.paragraph()
        });
      }
      const author = newUsers[Math.floor(Math.random() * newUsers.length)];
      const category = newCategories[Math.floor(Math.random() * newCategories.length)];
      articles.push({
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraphs(5),
        comments: comments,
        user_id: author._id,
        category_id: category._id
      });
    }

    result = await articlesCollection.insertMany(articles);

    console.log(result);

    client.close();
  }
  catch (error) {
    console.log(error);
  }
}

seed();