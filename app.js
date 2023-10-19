const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const mongoose = require("mongoose");
const cors = require("cors")
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const runLightningConfirm = require('./confirmLightningPayments');
const runCoinbaseConfirm = require('./confirmCoinbasePayments');
const axios = require('axios');
var coinbase = require('coinbase-commerce-node');
var Client = coinbase.Client;
const mailer = require('./mailer');
const emailBody = require('./templateBody');
const emailSubject = 'CTTPodcast Payment Confirmation and Receipt';

Client.init('a9cff71d-7993-4ba5-80f6-71eb90a8a554');

var Charge = coinbase.resources.Charge;

// db models
const donations = require('./models/donations');
const pendingPayments = require('./models/pendingPayments');
const sendEmail = require("./mailer");

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())

app.use(express.static(path.join(__dirname, 'build')));

app.post('/save-payment', async (req, res) => {
  const donationObj = new donations(req.body);
  console.log(req.body)
  try {
    const theDonation = await donationObj.save();
    const sendMail = await mailer(theDonation.email, emailSubject, emailBody(theDonation))
    console.log(sendMail);
    return res.json({donationObj: theDonation, success: true});
  } catch (error) {
    console.log(error)
    return res.status(500).send(error);
  }
});

app.get('/all-donations', async (req, res) => {
  console.log('tryna')
  let donationsRes = []

  try {
    const donationObj = await donations.find();
    donationObj.forEach(async o => {
      let don = o.toObject() 
      don.created = o._id.getTimestamp().toString()
      donationsRes.push(don)

      if (o === donationObj[donationObj.length - 1]) {
        return res.json(donationsRes.reverse())
      }
    })
    
    /*donationObj.forEach(async o => {
      oObj = o.toObject()
      await donations.findOneAndDelete(o);
      
      console.log('bitch gone', donationObj.indexOf(o));
    })*/

    
  } catch (error) {
    console.log(error)
    res.send(error);
  }
});

app.post('/one-donation', async (req, res) => {

  try {
    let donationObj = await donations.findOne({_id: req.body.donationId});
    let don = donationObj.toObject() 
    don.created = donationObj._id.getTimestamp().toString()
      
    return res.json(don)

    
  } catch (error) {
    console.log(error)
    res.send(error);
  }
});

app.get('/all-cum-donations', async (req, res) => {
    const donationsRes = await donations.aggregate([
      { $group: { _id: "$name", totalDonationAmount: { $sum: "$donationAmountInDollars" } } },
      { $sort: { totalDonationAmount: -1 } }
    ]);
    
    return res.json(donationsRes);
})

app.post('/handle_btc_eth', async (req, res) => {
  try {
    const orderData = {
      name: req.body.name,
      description: 'Donation to CTTPodcast',
      pricing_type: 'fixed_price',
      local_price: {
        amount: req.body.donationAmountInDollars,
        currency: 'USD'
      }
    };
    
    const order = await Charge.create(orderData);
    const pendingPaymentsObj = new pendingPayments(req.body);
    pendingPaymentsObj.transactionId = order.id
    await pendingPaymentsObj.save();
    return res.json({pendingPaymentsObj, success: true, url: order.hosted_url});
  } catch (error) {
    console.log(error)
  }
})




app.post('/save-pending-payment', async (req, res) => {
  const pendingPaymentsObj = new pendingPayments(req.body);
  
  try {
    const thePending = await pendingPaymentsObj.save();
    res.send({pendingPaymentsObj: thePending, success: true});
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
})



app.post('/one-pending-donation', async (req, res) => {

  try {
    let donationObj = await pendingPayments.findOne({_id: req.body.donationId});
    let don = donationObj.toObject() 
    don.created = donationObj._id.getTimestamp().toString()
      
    return res.json(don)

    
  } catch (error) {
    console.log(error)
    res.send(error);
  }
});

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
      paymentObj.message = req.body.description;

      const findDonation = await donations.findOne(paymentObj);

      if (!findDonation) { 
        const donationObj = new donations(paymentObj);
        const savePayment = await donationObj.save();
        const sendMail = await mailer(savePayment.email, emailSubject, emailBody(savePayment))
        console.log(sendMail);
        console.log(savePayment)
        return;
      }

      else if (paymentObj) return;
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// confirm ligthning payments
setInterval(function() {
  runLightningConfirm();
  runCoinbaseConfirm();
}, 300000)





