module.exports.createcart = (Cart, user) => {
    let sessionId = makeCartSession('24')

    const newCart = new Cart({ items: [], sessionId: sessionId, promo: {} })
    return newCart
};


module.exports.addtocart = (cart, product, body, res) => {
    let price
    let isSame = true

    let newQuantity = body.quantity;
    const updatedCartItems = [...cart.items];
    const index = cart.items.findIndex(cp => cp.id.toString() === product._id.toString());

    if (index > -1) {
        console.log('here');

        if (updatedCartItems[index].attributes.length > 0) {
            let firstArr = []
            for (a of updatedCartItems[index].attributes) { firstArr.push(a.option) }
            for (attr of body.attributes) {
                if (!firstArr.includes(attr.option.toString())) isSame = false
            }
        }

        if (isSame || updatedCartItems[index].attributes.length === 0) {

            let updateQty = parseInt(newQuantity, 10) + updatedCartItems[index].quantity
            let total = updatedCartItems[index].attributes.reduce((acc, a) => { return acc + parseInt(a.price, 10) }, 0)
            total = total * updateQty
            updatedCartItems[index].total = updatedCartItems[index].price * updateQty + total
            updatedCartItems[index].quantity = updateQty
        } else {
            let total = body.attributes.reduce((acc, i) => { return acc + parseInt(i.price, 10) }, product.info.sellingPrice)
            let itemPrice = total - (total * (product.discount / 100))
            updatedCartItems.push({
                id: product._id,
                quantity: parseInt(newQuantity, 10),
                name: product.name,
                category: product.category.name,
                price: itemPrice,
                image: product.images[0],
                attributes: body.attributes,
                discount:product.discount,
                total: parseInt(newQuantity, 10) * itemPrice

            });
        }
    } else {
        let total = body.attributes.reduce((acc, i) => { return acc + parseInt(i.price, 10) }, product.info.sellingPrice)
        let itemPrice = total - (total * (product.discount / 100))
        updatedCartItems.push({
            id: product._id,
            quantity: parseInt(newQuantity, 10),
            name: product.name,
            price: itemPrice,
            category: product.category.name,
            image: product.images[0],
            attributes: body.attributes,
            total: parseInt(newQuantity, 10) * itemPrice

        });
    }
    console.log(updatedCartItems);
    return updatedCartItems


}
function makeCartSession(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}



module.exports.isEmptyPromo = (obj) => {

    // null and undefined are "empty"
    if (obj == null) return true;
    console.log('1');

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0) return false;
    if (obj.length === 0) return true;
    console.log('2');

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== "object") return true;
    console.log('3');

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;

}


