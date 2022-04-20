const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.createConnection(`mongodb+srv://amsdb:bodakaka@edu-apps.3vj9u.mongodb.net/cookies?retryWrites=true&w=majority`);

autoIncrement.initialize(connection);

const orderSchema = new Schema({
    sessionId: String,
    paymentTerms: {
        type: String
    },
    channel: {
        type: String
    },
    items: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            name: {
                type: String,
            },
            type: {
                type: String,
            },
            unit: { name: String, price: String },
            attributes: [
                {
                    name: String,
                    option: String,
                    price: String,
                }
            ],
            category: String,
            quantity: {
                type: Number,
            },
            price: {
                type: Number,
            },
            discount:Number,
            total:Number,
            refunded: { status: Boolean, quantity: Number },
        }
    ],

    totalPrice: {
        type: Number,
    },
    date: { type: String },
    customer: {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        name: String
    },
    status: {
        no: Number,
        text: String,
        en: String,
        note: String,
        reason: String,
    },
    leadSource: String,
    order_info: {
        note: String,
        shipping_details: { street: String, area: { name: String, zoneId: Number }, floor: String, apartment: String,price:Number },
        billing_details: { first_name: String, last_name: String, phone: String, email: String },
        delivery_date: String
    },

}, { timestamps: true });

orderSchema.plugin(autoIncrement.plugin, {
    model: 'orders',
    field: 'serialNo',
    startAt: 10000,
    incrementBy: 1
});
module.exports = mongoose.model("Order", orderSchema);