const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cartSchema = new Schema({
    sessionId: String,
    items: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
            },
            name: String,
            image: String,
            category:String,
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            unit: { name: String, price: Number },
            attributes: [
                {
                    name: String,
                    option: String,
                    price: String,
                }
            ],
            total: Number
        }
    ],
    total: Number,
    promo: {
        id: {
            ref: 'Promo', type: mongoose.Types.ObjectId
        },
        name: String,
        discount: Number
    },

});


module.exports = mongoose.model('Cart', cartSchema);
