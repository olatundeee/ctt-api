const pendingPayments = require('./models/pendingPayments')
const donations = require('./models/donations')
const axios = require('axios')

const mailer = require('./mailer');
const emailBody = require('./templateBody');
const emailSubject = 'CTTPodcast Payment Confirmation and Receipt';

const runLightningConfirm = async () => {
    console.log('starting')
    const pendingPaymentsList = await pendingPayments.find();
            
    console.log('await pendingPayments.find()', pendingPaymentsList.length);

    pendingPaymentsList.forEach(async (ment) => {
        //await pendingPayments.findOneAndDelete(ment);
        const hash = ment.transactionId
        try {
            const checkStatus = await axios.get(`https://api.v4v.app/v1/check_invoice/${hash}`)
            if (checkStatus.data && checkStatus.data.settled) {
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
            //console.log('error')
        }    
    })
} 

module.exports = runLightningConfirm;