const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const mongoose = require("mongoose");
const cors = require("cors")
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const runLightningConfirm = require('./confirmLightningPayments');
const axios = require('axios');

// db models
const donations = require('./models/donations')
const pendingPayments = require('./models/pendingPayments')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => res.type('html').send('CTT API'));
app.post('/save-payment', async (req, res) => {
  const donationObj = new donations(req.body);
  
  try {
    await donationObj.save();
    res.send({donationObj, success: true});
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
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
app.post('/save-pending-payment', async (req, res) => {
  const pendingPaymentsObj = new pendingPayments(req.body);
  
  try {
    await pendingPaymentsObj.save();
    res.send({pendingPaymentsObj, success: true});
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
})
app.post('/run-hivepay', async (req, res) => {
  try {
    console.log(req.body)
    const verifyTransaction = await axios.post('https://api.hivepay.io', {
      version: 2,
      ipn_verification: true,
      txid: req.body.payment_details.txid,
      merchant: req.body.payment_details.merchant,
      buyer: req.body.payment_details.buyer,
      token: req.body.payment_details.token,
      token_amount: req.body.payment_details.token_amount,
      fee: req.body.payment_details.fee,
      amount_received: req.body.payment_details.amount_received
    })
    if (verifyTransaction.data.verify_hivepay) {
      let paymentObj = {};
        paymentObj.name = req.body.payment_details.buyer;
        paymentObj.hiveUsername = req.body.payment_details.buyer;
        paymentObj.email = req.body.merchant_email;
        paymentObj.donationAmountInDollars = req.body.amount;
        paymentObj.donationAmountInCrypto = req.body.payment_details.token_amount;
        paymentObj.paymentOption = 'hivepay';

        const savePayment = await axios.post(`https://ctt-api.onrender.com/save-payment`, paymentObj)

        if (savePayment.data.success) {
          console.log('hivepay payment saved')
          return;
        }
    }
  } catch (error) {
    console.log(error)
  }
})

app.post('/hivepay-cancel', async (req, res) => {
  console.log(req.body)
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

// confirm ligthning payments
setInterval(function() {
  runLightningConfirm()
}, 300000)


