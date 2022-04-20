const Cart = require("../models/Cart");
const Product = require('../models/Product');
const Category = require("../models/Category");
const Promo = require("../models/Promo");
const mongoose = require('mongoose')

const { addtocart, createcart, isEmptyPromo } = require("../models/helpers/cart.js");


exports.search = async (req, res, next) => {
    let searchValue = req.query.q;
    try {
        let products = []
        if (searchValue) {
            var regxValue = new RegExp(searchValue, "i");
            products = await Product.find({ name: regxValue })
            return res.status(200).json({ products: products })
        }
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}


exports.cart = async (req, res, next) => {
    let cartId = req.query.cart

    try {


        if (!cartId || cartId == 'null' || cartId == 'undefined') {
            const newcart = createcart(Cart)
            await newcart.save()
            cartId = newcart.sessionId
        }

        let cart = await Cart.findOne({ sessionId: cartId }).lean()
        return res.status(200).json({ cart: cart })
    } catch (error) {

        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' });

    }

}


exports.postCart = async (req, res, next) => {
    const prodId = req.params.id;
    let cartId = req.query.cart

    try {
        const product = await Product.findById(prodId)

    if (!cartId || cartId == 'null' || cartId == 'undefined') {
            const newcart = createcart(Cart)
            await newcart.save()
            cartId = newcart.sessionId
        }

        const cart = await Cart.findOne({ sessionId: cartId })
        if (cart) {
            const items = addtocart(cart, product, req.body, res)
            let grand
            cart.items = items;
            grand = cart.items.reduce((acc, i) => { return acc + i.total }, 0)

            if (cart.promo.discount) {
                grand = Math.floor(grand - (grand * (cart.promo.discount / 100)))
            }
            cart.total = Math.floor(grand)
            await cart.save();
            return res.status(200).json({ message: 'Item Added To Card', messageType: 'success', cart: cart, items: items });
        }
    } catch (err) {
        console.log(err);

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
};


exports.updateQauntity = async (req, res, next) => {
    const itemId = req.params.id;
    const newQun = req.query.qun;
    let cartId = req.query.cart
    let updateQty = parseInt(newQun, 10)
    try {
        const cart = await Cart.findOne({ sessionId: cartId })

        if (!cart) return res.status(404).json({ message: 'Something went wrong, please try again later', messageType: 'warning' });
        const item = cart.items.find(i => i._id.toString() == itemId.toString())
        const index = cart.items.findIndex(i => i._id.toString() == itemId.toString())
        if (index >= 0) {


            cart.items[index].quantity = updateQty

            cart.items[index].total = cart.items[index].price * updateQty
            console.log(item);

            let grand = cart.items.reduce((acc, i) => { return acc + i.total }, 0)

            if (cart.promo.discount) {
                grand = Math.floor(grand - (grand * (cart.promo.discount / 100)))
            }
            cart.total = grand
            await cart.save()
            return res.status(200).json({ message: 'done', messageType: 'success', cart: cart });
        }
    } catch (err) {
        console.log(err);

        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' });
    }
}
exports.postCartDeleteProduct = async (req, res, next) => {
    const itemId = req.params.id;
    let cartId = req.query.cart

    try {
        const cart = await Cart.findOne({ sessionId: cartId })
        cart.items = cart.items.filter(i => i._id.toString() !== itemId.toString())
        let grand = cart.items.reduce((acc, i) => { return acc + i.total }, 0)
        if (cart.promo.discount) {
            grand = Math.floor(grand - (grand * (cart.promo.discount / 100)))
        }
        cart.total = grand
        await cart.save()
        return res.status(200).json({ message: 'Deleted', messageType: 'success', cart: cart })
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' });

    }
};



exports.product = async (req, res, next) => {
    const id = req.params.id

    try {
        const product = await Product.findById(id)
        if (!product) return res.status(404).json({ message: 'Please try again', messageType: 'info' })
        return res.status(200).json(product)

    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' });

    }
}


exports.applyPromo = async (req, res, next) => {
    const cartId = req.params.id
    const promoCode = req.body.promo

    let session
    try {
        session = await mongoose.startSession()
        session.startTransaction()
        const promo = await Promo.findOne({ name: promoCode })
        // console.log(promo);

        if (!promo) return res.status(404).json({ message: 'This Promo code is invalid', messageType: 'alert' })

        const cart = await Cart.findOne({ sessionId: cartId })
        if (!cart) return res.status(404).json({ message: 'Your Cart Is Not Found. Pleas try again', messageType: 'info' })
        if (!cart.length == 0) return res.status(404).json({ message: 'Cannot apply promos, your cart is empty!!', messageType: 'info' })

        if (promoCode === cart.promo.name) { return res.status(401).json({ message: 'Promo Already Applied', messageType: 'info' }) }


        cart.promo = { id: promo._id, discount: promo.discount, name: promo.name }
        let total = cart.items.reduce((acc, i) => { return acc + i.total }, 0)
        total = Math.floor(total - (total * (cart.promo.discount / 100)))
        if (req.session.isLoggedIn && !req.session.user.isAdmin) {
            promo.users.push(req.session.user._id)
        }
        promo.count += 1

        cart.total = total
        await cart.save({ session: session })

        await promo.save({ session: session })
        await session.commitTransaction()
        session.endSession()
        return res.status(200).json({ message: 'Promo Applied', messageType: 'success', total: total })
    } catch (error) {
        console.log(error);
        await session.abortTransaction()
        session.endSession()
        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' });

    }
}



exports.removePromo = async (req, res, next) => {
    const cartId = req.params.id
    let session
    try {
        session = await mongoose.startSession()
        session.startTransaction()

        const cart = await Cart.findOne({ sessionId: cartId })
        if (!cart) return res.status(404).json({ message: 'Your Cart Is Not Found. Pleas try again', messageType: 'info' })
        if (!cart.promo) return res.status(401).json({ message: 'Something went wrong, please try again later', messageType: 'danger' });

        const promo = await Promo.findOne({ name: cart.promo.name })
        if (!promo) return res.status(404).json({ message: 'This Promo code is invalid', messageType: 'alert' })
        let grand
        let total = cart.items.reduce((acc, i) => { return acc + i.total }, 0)
        cart.total = total
        cart.promo = null
        if (req.session.isLoggedIn && !req.session.user.isAdmin) promo.users.unshift(req.session.user._id)
        promo.count -= 1

        await cart.save({ session: session })
        await promo.save({ session: session })

        await session.commitTransaction()
        session.endSession()

        return res.status(200).json({ message: 'Promo Applied', messageType: 'success', promo: promo, total: total })
    } catch (error) {
        console.log(error);
        await session.abortTransaction()
        session.endSession()
        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' });

    }
}




exports.rate = async (req, res, next) => {
    const id = req.params.id

    try {
        const stars = parseInt(req.query.stars, 10)
        const product = await Product.findById(id)
        if (!product) return res.status(404).json({ message: 'Please try again', messageType: 'info' })
        const rateBefore = product.ratings.findIndex(r => r.id.toString() === req.user._id.toString())
        if (rateBefore == -1) {
            product.ratings.push({ id: req.user._id, name: req.user.name, stars: stars })
        } else {
            product.ratings[rateBefore].stars = stars
        }
        await product.save()
        return res.status(200).json(product)

    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' });

    }
}

exports.review = async (req, res, next) => {
    const id = req.params.id

    try {
        const product = await Product.findById(id)
        if (!product) return res.status(404).json({ message: 'Please try again', messageType: 'info' })
        const reviewBefore = product.reviews.findIndex(r => r.id.toString() === req.user._id.toString())
        if (reviewBefore == -1) {
            product.reviews.push({ id: req.user._id, name: req.user.name, stars: req.body.stars })
        } else {
            product.reviews[reviewBefore].starts = req.body.starts
        }
        await product.save()
        return res.status(200).json(product)

    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' });

    }
}