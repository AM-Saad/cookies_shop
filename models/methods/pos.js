module.exports.createPos = (type, user) => {
    const newpos = {
        type: type,
        productsInventory: null,
        require_auth: false,
        access_user: null,
        restaurant: type === 'restaurant' ? true : false,
        floors: [],
        sessions: [],
        createdby: user,
    }
    return newpos
}

module.exports.createSales = (Order, sales, company, isEmp, user, date, time, totalSalesPrice, session, shippingInfo) => {

    const newSales = new Order({
        pos_session: session,
        items: sales.items,
        description: sales.description,
        externalItem: sales.externalItem,
        totalPrice: totalSalesPrice,
        forCompany: company._id,
        barcode: '',
        salesDate: date,
        salesTime: time,
        isShipped: sales.isShipped,
        customer: sales.customer,
        shippingInfo: shippingInfo,
        leadSource: sales.leadSource,
        creator: {
            name: user.name,
            id: user._id,
        },


    });

    return newSales

};

