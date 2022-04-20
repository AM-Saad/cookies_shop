const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.createConnection(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@edu-apps.3vj9u.mongodb.net/${process.env.DATABASE_URL}?retryWrites=true&w=majority`);

autoIncrement.initialize(connection);

const productSchema = new Schema({
    sku: {
        type: String,
    },
    saleable: Boolean,
    instore: Boolean,
    name: {
        type: String,
        required: true
    },
    type: String,
    attributes: [{
        attrNo: String,
        name: String,
        options: [{
            name: String,
            price: String,
            data: String,
            quantity: Number,
        }]
    }],
    units: [{ name: String, percentage: Number, level: String, price: Number }],
    category: {
        name: String,
        subCategory: String,
        attributes: [{
            name: String,
            option: String
        }],
    },
    info: {
        sellingPrice: Number,
        purchasingPrice: Number,
        initialQuanitity: Number,
        quantity: Number,
        refunded: Number,
        returnedtosupplier: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number,
        },
        weight: String,
        heightestSellingNo: Number,
    },
    discount: String,
    images: [],
    description: String,

    forCompany: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    barcode: String,
    flag: String,
    ratings: [{
        id: { type: Schema.Types.ObjectId, ref: 'User' },
        name: String,
        stars: Number
    }],
    reviews: [{
        id: { type: Schema.Types.ObjectId, ref: 'User' },
        name: String,
        comment: String,
    }],
    featured: Boolean,
    popular: Boolean,
    supplier: { name: String, id: { type: Schema.Types.ObjectId, ref: 'Supplier' } },
    refunded: Boolean,
    inventory: { id: { type: Schema.Types.ObjectId, ref: 'Inventory' }, name: String }
}, { timestamps: true });

productSchema.plugin(autoIncrement.plugin, {
    model: 'products',
    field: 'serial',
    startAt: 10000,
    incrementBy: 1
});
module.exports = mongoose.model("Product", productSchema);
