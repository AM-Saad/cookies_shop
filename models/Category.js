const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: { type: String },
    image: { type: String },
    description: { type: String },
    subCategory: [],
    active: Boolean,
    forsite: Boolean,
    attributes: [{
        name: String,
        options: [
            {
                name: String,
                data: String
            }
        ]
    }],
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company'
    },
    tag: {
        en: String,
        ar: String
    }


})

module.exports = mongoose.model('Category', categorySchema);
