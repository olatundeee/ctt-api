const generateTemplateBody = (paymentDetails) => {
    const tempBody = `
        <!DOCTYPE html>
        <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CTTPodcast Donation Receipt</title>
            </head>
            
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600"
                style="border-collapse: collapse; background-color: #ffffff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px; margin: 20px auto;">
            
                    <!-- Header -->
                    <tr>
                        <td bgcolor="#008080" style="padding: 10px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h2 style="color: #ffffff;">Thank you for your generous donation! Tune in to the next show to hear your message read out on the show and your jingle played</h2>
                        </td>
                    </tr>
                
                    <!-- Content -->
                    <tr>
                        <td style="padding: 20px; color: #333333; font-size: 16px;">
                        <!-- Thank You Note -->
                        <p style="font-size: 18px; margin-bottom: 20px;">Dear ${paymentDetails.name},</p>
                        <p>Thank you for your generous donation to our podcast. Your support means a lot to us!</p>
                
                        <!-- Donation Receipt -->
                        <table cellpadding="5" width="100%" style="border: 1px solid #ddd; border-collapse: collapse;">
                            <tr style="background-color: #f2f2f2;">
                            <td><strong>Donor:</strong></td>
                            <td>${paymentDetails.name}</td>
                            </tr>
                            <tr>
                            <td><strong>Amount In Dollars:</strong></td>
                            <td>$${paymentDetails.donationAmountInDollars}</td>
                            </tr>
                            <tr style="background-color: #f2f2f2;">
                            <td><strong>Amount In Crypto:</strong></td>
                            <td>${paymentDetails.donationAmountInCrypto}</td>
                            </tr>
                            <tr>
                            <td><strong>Payment Option:</strong></td>
                            <td>${paymentDetails.paymentOption}</td>
                            </tr>
                            <tr style="background-color: #f2f2f2;">
                            <td><strong>Donation Date:</strong></td>
                            <td>${paymentDetails._id.getTimestamp().toString()}</td>
                            </tr>
                            <tr>
                            <td><strong>Subscription Plan:</strong></td>
                            <td>${paymentDetails.subscriptionPlan}</td>
                            </tr>
                            <tr style="background-color: #f2f2f2;">
                            <td><strong>Donation Jingle:</strong></td>
                            <td>${paymentDetails.donationJingle}</td>
                            </tr>
                            <tr>
                            <td><strong>Your Current Status:</strong></td>
                            <td>${paymentDetails.status}</td>
                            </tr>
                            <tr style="background-color: #f2f2f2;">
                            <td><strong>Custom Message:</strong></td>
                            <td>${paymentDetails.message}</td>
                            </tr>
                        </table>
                        </td>
                    </tr>
                
                    <!-- Footer -->
                    <tr>
                        <td style="text-align: center; padding-top: 20px; color: #555555;">
                        <p>Thank you for supporting our podcast!</p>
                        </td>
                    </tr>
            
                </table>
            
            </body>
            
        </html>
      
    `;
  
    return tempBody;
}

module.exports = generateTemplateBody;