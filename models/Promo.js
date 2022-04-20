const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const promosSchema = new Schema({
    name: String,
    count: { type: Number, default: 0 },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    discount: { type: Number, required: true },
    limit: { type: Number, required: true }
});


module.exports = mongoose.model('Promo', promosSchema);
