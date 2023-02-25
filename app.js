const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const mongoose = require("mongoose");
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// db models
const donations = require('./models/donations')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => res.type('html').send('CTT API'));
app.post('/save-payment', async (req, res) => {
  const donationObj = new donations(req.body);
  
  try {
    await donationObj.save();
    res.send(donationObj);
  } catch (error) {
    response.status(500).send(error);
  }
})
app.get('/all-donations', async (req, res) => {
  
  try {
    const donationObj = await donations.find();
    res.send(donationObj);
  } catch (error) {
    response.status(500).send(error);
  }
})

mongoose.connect('mongodb+srv://olaolatick:alagbakoku2mo@cluster0.mihf9.mongodb.net/?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

