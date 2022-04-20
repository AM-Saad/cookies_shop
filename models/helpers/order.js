const { isEmpty } = require('./general')

exports.createOrder = (Order, items, grandTotal, date, orderinfo, user) => {
    const newOrder = new Order({
        items: items,
        totalPrice: grandTotal,
        date: date,
        customer: user ? { id: user._id, name: user.name || '' } : null,
        order_info: orderinfo,
        leadSource: 'website',
        status: { no: 1, text: 'تحت الطلب', en: 'Pending' }
    });
    return newOrder
}
exports.validateOrder = (items, grandTotal, date, orderinfo, checkItems) => {
    if(checkItems === true){
        if (items.length == 0) return { state: false, reason: 'No items, please try again' }
    }
    if (!orderinfo) return { state: false, reason: 'Order info not completed, please try again' }
    if (grandTotal === '' || grandTotal === null || grandTotal === undefined) return { state: false, reason: 'Grand total not calculated, please try again' }
    if (date === '' || date === null || date === undefined) return { state: false, reason: 'Order date not confirmed, please try again' }

    if (isEmpty(orderinfo.billing_details.first_name) ||
        isEmpty(orderinfo.billing_details.phone)) {
        return { state: false, reason: 'All billing input are required(eg, Name, Phone)' }
    }

    if (isEmpty(orderinfo.shipping_details.street) ||
        isEmpty(orderinfo.shipping_details.apartment) ||
        isEmpty(orderinfo.shipping_details.floor)) {
        return { state: false, reason: 'All shipping info are required (eg, Area, Apartment, Floor, Street)' }
    }
    return { state: true }
}