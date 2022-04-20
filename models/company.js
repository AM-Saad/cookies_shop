const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const companySchema = new Schema({
    info: {
        ownerName: String,
        service: String,
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
        },
        mobile: {
            type: String,
        },
        address: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        membership: {
            activated: { type: Boolean, default: false },
            duration: {
                from: String,
                to: String
            },
            history: {
                activation_counts: { type: Number, default: 0 },
                dates: [{
                    data: String,
                    status: Boolean
                }]
            }
        },
        database: {
            url: String,
            name: String,
            password: String
        },
        secretKey: Number,
        role: { type: String, default: 'admin' },

    },
    data: {
        warehouses: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Warehouse'
            }
        ],
        inventory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Inventory'
            }
        ],
        customers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'customer'
            }
        ],
        suppliers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'supplier'
            }
        ],
        expenses: [
            {
                type: Schema.Types.ObjectId,
                refPath: 'expenses',
            }
        ],
        employees: [{
            type: Schema.Types.ObjectId,
            ref: "empolyee"
        }],
        roles: [
            {
                name: String,
                permissions: [
                    {
                        name: String,
                        actions: []
                    }
                ]
            },
        ],

        expensesTypes: [
            {
                type: String
            }
        ],
        departments: [
            {
                depName: String,
                manager: {
                    type: Schema.Types.ObjectId,
                    ref: 'employee',
                },
                subDep: {
                    depName: String,
                    manager: {
                        type: Schema.Types.ObjectId,
                        ref: 'employee',
                    }
                },
                positions: [
                    {
                        type: String,
                    }
                ],
                employees: [
                    {
                        id: {
                            type: Schema.Types.ObjectId,
                            ref: 'employee'
                        },
                        name: String,
                    }
                ]
            }
        ],
        notifications: [
            {
                type: Schema.Types.ObjectId,
                ref: 'notification'
            },
        ],
        targets: [
            {
                month: String,
                info: {
                    sales: Number,
                    deals: Number
                },
                description: String

            }
        ],
    },
    app: {
        name: String,
        folder: String,
        slogan: String,
        settings: {
            color: String,
            coverImg: String
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("company", companySchema);
