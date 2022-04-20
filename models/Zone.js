const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const zonesSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    zoneId: {
        type: Number,
        required: true
    },
    governorate: {
        type: String,
    },
    pickup: Boolean,
    delivery: Boolean,
    shipping: Number,
    orders: [{
        id: { type: Schema.Types.ObjectId, ref: 'Order' },
        no: Number
    }],
    notes: String,
    duration: String,
    active: { default: true, type: Boolean }
});


module.exports = mongoose.model('Zone', zonesSchema);
