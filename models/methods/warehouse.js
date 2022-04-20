
module.exports.createWarehouse = (info) => {
    const newWarehouse = {
        info: info,
        active: true,
        inventories: [],
        refunds: [],
        company: null,
        locked: false,
        pin: null
    }
    return newWarehouse
}