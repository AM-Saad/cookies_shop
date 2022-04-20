

module.exports.createitem = (discount, sku, name, type, attributes, category, quantity, purchasingPrice, sellingPrice, description, inventory, images, companyId, supplier, barcode, popular, featured) => {

    let newitem = {
        sku: sku,
        name: name.trim() || null,
        type: type,
        attributes: attributes,
        category: category,
        info: {
            purchasingPrice: parseInt(purchasingPrice, 10) || 0,
            sellingPrice: parseInt(sellingPrice, 10) || 0,
            quantity: parseInt(quantity, 10) || 0,
            initialQuanitity: parseInt(quantity, 10) || 0,
            refunded: 0,
            returnedtosupplier: 0,
        },
        discount: discount,
        description: description,
        images: images,
        barcode: '',
        popular: popular,
        featured: featured,
        ratings: [],
        reviews: [],
        forCompany: companyId,
        inventory: inventory,
        supplier: supplier || null,
        barcode: barcode || null,
    }



    return newitem
}


module.exports.validateItem = (i) => {
    let validated = true
    let message = ''
    if (!i.name.replace(/\s/g, '').length || i.name === null || i.name == undefined) {
        validated = false
        message = 'Items Name/Code Must Be Added'
    }


    if (i.info.sellingPrice === '' || i.info.sellingPrice === null || i.info.sellingPrice === undefined) {
        validated = false
        message = 'Add Selling Price'
    }

    // if (i.units.length == 0 || i.units == null) {
    //     validated = false
    //     message = 'Add atleast 1 UNIT'
    // }

    if (i.info.quantity === '' || i.info.quantity === null || i.info.quantity === undefined) {
        validated = false
        message = 'Add Stock Quantity'
    }


    return { validated, message }

}

module.exports.updateItem = (item, items) => {
    const itemIndex = items.findIndex(i => i._id.toString() === item._id.toString())
    items[itemIndex] = item
    return items
}


module.exports.deleteitem = (prodcutId, olditems) => {
    const newitems = olditems.filter(p => p._id.toString() != prodcutId.toString())
    return newitems

}
