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
var BlockBee = require('@blockbee/api')

const BTC_ADDRESS = 'bc1qcv96mfxt7qa0urvqc25u693rs9shx5he9l20sq';
const ETH_ADDRESS = '0x239BFF11B5267e1e6859f44133073A0932Cda555';

const BLOCK_BEE_KEY = 'hyOmHGjSbBt1fCSH0R1CWXzB1HdvK432uzDxW7jiCdgEHPI8Icx0alHXFCTyLMLT';


// db models
const donations = require('./models/donations')
const pendingPayments = require('./models/pendingPayments')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())

app.post('/save-payment', async (req, res) => {
  const donationObj = new donations(req.body);
  console.log(req.body)
  try {
    await donationObj.save();
    return res.json({donationObj, success: true});
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

app.get('/all-cum-donations', async (req, res) => {
    const donationsRes = await donations.aggregate([
      { $group: { _id: "$name", totalDonationAmount: { $sum: "$donationAmountInDollars" } } },
      { $sort: { totalDonationAmount: -1 } }
    ]);
    
    return res.json(donationsRes);
})

app.post('/handle_btc_eth', async (req, res) => {
  try {
    //const host = req.get('host');
    const host = 'ctt-api.onrender.com'
    const cryptApiCallback = `${host}/block_bee/callback?data=${encodeURIComponent(req.body)}`;
    const myAddress = req.body.paymentOption === 'btc' ? BTC_ADDRESS : ETH_ADDRESS;

    const query = new URLSearchParams({
      apikey: BLOCK_BEE_KEY,
      callback: cryptApiCallback,
      address: myAddress,
      pending: '0',
      confirmations: '0',
      post: '0',
      priority: 'string',
      multi_token: '0',
      multi_chain: '0',
      convert: '0'
    }).toString();

    const ticker = req.body.paymentOption;
    const resp = await axios.get(
      `https://api.blockbee.io/${ticker}/create/?${query}`,
      {method: 'GET'}
    );

    const data = await resp.text();
    console.log(data);
  } catch (error) {
    console.log(error)
  }
})

app.get('/block_bee/callback', async (req, res) => {
  console.log(req.query);
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
      paymentObj.message = req.body.description;

      const findDonation = await donations.findOne(paymentObj);

      if (!findDonation) { 
        const donationObj = new donations(paymentObj);
        const savePayment = await donationObj.save();
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

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/build', 'index.html'));
});

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
//setInterval(function() {
  runLightningConfirm()
//}, 300000)


