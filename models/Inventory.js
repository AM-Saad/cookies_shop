
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const inventorySchema = new Schema({
    info: { name: String, address: String, phone: String },
    items: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    active: Boolean,
    categories: [
        {
            active: Boolean,
            name: String,
            attributes: [{
                name: String,
                options: [
                    {
                        name: String,
                        data: String
                    }
                ]
            }]
        }
    ],
    units: [{ name: String, percentage: Number, price: Number }],
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    refunds: [{ refundId: { type: Schema.Types.ObjectId } }],
    company: { type: Schema.Types.ObjectId, ref: 'company' },
    createdAt: String,
    locked: Boolean,
    pin: String,
})


module.exports = mongoose.model("Inventory", inventorySchema);
