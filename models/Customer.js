const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    // unique: true
  },
  phone: {
    type: Number,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  uniqueCode: {
    type: String,
    required: true
  },
  isAttended:{
    type: Boolean,
    default:false
  },
  count:{
    type: Number,
    default:0
  }
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer