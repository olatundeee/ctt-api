const mongoose = require("mongoose");

const PendingPaymentsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  hiveUsername: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  donationAmountInDollars: {
    type: Number,
    required: true
  },
  donationAmountInCrypto: {
    type: String,
    required: true
  },
  paymentOption: {
    type: String,
    required: true
  },
  subscribed: {
    type: Boolean,
    required: true,
    default: false
  },
  subscriptionPlan: {
    type: String,
    required: true,
    default: 'once'
  },
  subscriptionPeriod: {
    type: Number,
    required: true,
    default: 0
  },
  subscriptionTimeline: {
    type: String,
    required: true,
    default: 'days'
  },
  transactionId: {
    type: String,
    required: true
  },
  message: { type: String },
  donorCity: { type: String },
  donorState: { type: String }
});

const PendingPayments = mongoose.model("PendingPayments", PendingPaymentsSchema);

module.exports = PendingPayments;