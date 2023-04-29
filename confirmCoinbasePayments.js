const pendingPayments = require('./models/pendingPayments')
const donations = require('./models/donations')
const axios = require('axios')

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
            console.log(checkStatus.timeline[0].status)
            if (checkStatus.timeline[0].status === 'COMPLETED') {const payment = ment.toObject();
                const donationObj = new donations(payment);
                const savePayment = await donationObj.save();
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