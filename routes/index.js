var express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

var router = express.Router();

// Connection URL
const email = encodeURIComponent("admin@example.com");
const password = encodeURIComponent("secret");
const host = encodeURIComponent("localhost");
const port = encodeURIComponent("27017");
const database = encodeURIComponent("articles_db");
const url = 'mongodb://'+email+':'+password+'@'+host+':'+port+'/'+database+'?authSource='+database;

/* GET home page. */
router.get('/', function(req, res, next) {
  MongoClient.connect(url, async (err, client) => {
      assert.strictEqual(null, err);

      const db = client.db("articles_db");

      const articles = await db.collection('articles').find({}, { limit: 20 }).toArray();
      const categories = await db.collection('categories').find({}).toArray();
      const authors = await db.collection('users').find({}).toArray();
      articles.forEach(article => {
        const category = categories.find(category => category._id.equals(article.category_id));
        const author = authors.find(user => user._id.equals(article.user_id));
        if (category) {
          article.category = category.title;
        }
        if (author) {
          article.author = author.name;
        }
      });

      res.render('index', {
        title: 'Articles',
        articles: articles,
        error: null,
        helpers: {
          truncate: function (str, numWords) { return str.split(" ").splice(0, numWords).join(" "); }
        }
      });

      client.close();
    });
});

module.exports = router;
