
module.exports.createInventory = (warehouse, info) => {
    let newInventory = {
        items: [],
        info: info,
        active: true,
        categories: [
            {
                active: true,
                name: 'default',
                attributes: []
            }
        ],
        units: [{ name: 'default', percentage: 100 }],
        warehouse: warehouse,
        refunds: [],
        company: null,
        locked: false,
        pin: null,
    }
    return newInventory
}