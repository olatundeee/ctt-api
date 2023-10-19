const pendingPayments = require('./models/pendingPayments')
const donations = require('./models/donations')
const axios = require('axios');

const mailer = require('./mailer');
const emailBody = require('./templateBody');
const emailSubject = 'CTTPodcast Payment Confirmation and Receipt';

var coinbase = require('coinbase-commerce-node');
var Client = coinbase.Client;

Client.init('a9cff71d-7993-4ba5-80f6-71eb90a8a554');

var Charge = coinbase.resources.Charge;

const runCoinbaseConfirm = async () => {
    console.log('starting')
    const pendingPaymentsList = await pendingPayments.find();
            
    console.log('await pendingPayments.find()', pendingPaymentsList.length);

    pendingPaymentsList.forEach(async (ment) => {
        //await pendingPayments.findOneAndDelete(ment);
        const hash = ment.transactionId
        try {
            const checkStatus = await Charge.retrieve(hash);
            //console.log(checkStatus.timeline[0].status)
            if (checkStatus.timeline[0].status === 'COMPLETED') {
                const payment = ment.toObject();
                delete payment.transactionId;
                const donationObj = new donations(payment);
                const savePayment = await donationObj.save();
                const sendMail = await mailer(savePayment.email, emailSubject, emailBody(savePayment))
                console.log(sendMail);
                console.log("savePayment")
                await pendingPayments.findOneAndDelete(ment);
                console.log('ment deleted', pendingPaymentsList.length)
            }
        } catch (error) {
            //console.log(error)
        }    
    })
} 

module.exports = runCoinbaseConfirm;