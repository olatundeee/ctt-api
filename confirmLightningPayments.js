const pendingPayments = require('./models/pendingPayments')
const donations = require('./models/donations')
const axios = require('axios')

const runLightningConfirm = async () => {
    console.log('starting')
    const pendingPaymentsList = await pendingPayments.find();
    pendingPaymentsList.forEach(async (ment) => {
        const hash = ment.transactionId
        try {
            const checkStatus = await axios.get(`https://api.v4v.app/v1/check_invoice/${hash}`)
            
            if (checkStatus.data && checkStatus.data.settled) {
                const payment = ment.toObject();
                delete payment['transactionId']
                const donationObj = new donations(payment);
                const savePayment = await donationObj.save();
                console.log(savePayment)
            }
        } catch (error) {
            //console.log(error)
        }    
    })
} 

module.exports = runLightningConfirm;