const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors')
const mongodb = require('./model/db');

mongodb.connect();

const routes = require("./routes/index")

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors({
    origin: "*",
    credentials: true
}))

app.listen(8000,() => {
    console.log('listening on 8000');
})

app.use("/api",routes)
