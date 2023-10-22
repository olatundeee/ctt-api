const pendingPayments = require('./models/pendingPayments')
const donations = require('./models/donations')
const axios = require('axios')

const mailer = require('./mailer');
const emailBody = require('./templateBody');
const emailSubject = 'CTTPodcast Payment Confirmation and Receipt';


const getCumu = async (name) => {
  
    const donationsRes = await donations.aggregate([
      { $group: { _id: "$name", totalDonationAmount: { $sum: "$donationAmountInDollars" } } },
      { $sort: { totalDonationAmount: -1 } }
    ]);
  
    return donationsRes.find(s => {
      return s._id === name
    })
}

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
                const donorCumu = await getCumu(payment.name)
                let statusText = '' 
                if (donorCumu.totalDonationAmount > 32.9) statusText = 'Licensed'
                if (donorCumu.totalDonationAmount > 199.9) statusText = 'Producer'
                if (donorCumu.totalDonationAmount > 999.9) statusText = 'Knight'
            
                let don = savePayment.toObject();
                don.status = statusText;
            
                const sendMail = await mailer(theDonation.email, emailSubject, emailBody(don))
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