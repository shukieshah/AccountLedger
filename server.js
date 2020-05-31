const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const db = require('./config/db.js')

const app = express();
app.use(bodyParser.urlencoded({ extended: true }))

const client = new MongoClient(db.url, { useNewUrlParser: true });
client.connect(err => {
    if (err) console.log(err)
    require('./app/routes')(app, client.db(db.name).collection(db.collection));

    app.listen('3000', () => {
        console.log('Server started on port 3000');
    });
})
