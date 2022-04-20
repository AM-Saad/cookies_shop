const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const subscriberSchema = new Schema({
    mobile:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    message:{
        type:String
    }
})

module.exports = mongoose.model('Subscriber', subscriberSchema);

