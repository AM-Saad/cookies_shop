const Product = require('../models/Product');
const Category = require("../models/Category");

const Order = require('../models/Order');
const User = require("../models/User");
const Cart = require("../models/Cart");
const Subscriber = require("../models/Subscriber");
const mongoose = require("mongoose");
const fs = require('fs')
// const Subscribe = require('../models/subscriber');
const bcrypt = require("bcryptjs");
const path = require('path');
const Zone = require("../models/Zone");

const msg = require("../util/message");
const { formatDate } = require("../models/helpers/formatDate");
const { createOrder, validateOrder } = require("../models/helpers/order");
const moment = require('moment')

const fetch = require('node-fetch');

const carryItUrl = 'http://localhost:4000/api/v1/shipments';

exports.getIndex = async (req, res, next) => {
  try {
    const featured = await Product.find({ featured: true })
    const popular = await Product.find({ popular: true })
    const categories = await Category.find({ active: true })
    let categoryProducts = []
    for (let c of categories) {
      let items = await Product.find({ 'category.name': c.name })
      let item = {
        name: c.name,
        order: c.order,
        items: items
      }
      categoryProducts.push(item)
    }
    return res.render('shop/home', {
      // prods: products,
      pageTitle: 'Cookielicious | Home',
      path: '/',
      featured: featured,
      popular: popular,
      categories: categories,
      categoryProducts: categoryProducts,
      isAuthenticated: req.session.isLoggedIn,
      isAdmin: req.session.isAdmin
    });
  } catch (err) {

    const error = new Error(err);

    error.httpStatusCode = 500;
    return next(error);
  }

};


exports.getProducts = async (req, res, next) => {
  const itemPerPage = 10;
  const pageNum = +req.query.page || 1;
  let totalItems;
  const categories = await Category.find({ active: true })
  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((pageNum - 1) * itemPerPage)
        .limit(itemPerPage)
    })
    .then(products => {
      return res.render('shop/products', {
        products: products,
        categories: categories,
        pageTitle: 'All Products',
        path: '/products',
        currentPage: pageNum,
        hasNextPage: itemPerPage * pageNum < totalItems,
        hasPrevPage: pageNum > 1,
        nextPage: pageNum + 1,
        prevPage: pageNum - 1,
        lastPage: Math.ceil(totalItems / itemPerPage),
        type: 'all',
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin,
        sub: null,
        interestedIn: []

      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};



exports.getCategory = async (req, res, next) => {

  let totalItems = 0
  const itemPerPage = 10
  const sub = req.query.sub
  const pageNum = +req.query.page || 1;
  const categoryName = req.params.category;

  let query
  let interestedIn = null
  if (sub) {
    query = { 'category.name': categoryName, 'category.subCategory': sub }
  } else {
    query = { 'category.name': categoryName }
  }
  const numProducts = await Product.find(query).countDocuments()
  totalItems = numProducts;
  const products = await Product.find(query).skip((pageNum - 1) * itemPerPage).limit(itemPerPage)
  const categories = await Category.find({ active: true })

  if (products.length === 0) {

    return res.render('shop/comming-soon', {
      pageTitle: `${categoryName}`,
      path: `/${categoryName}`,
      categories: categories,
      category: categoryName,
      isAuthenticated: req.session.isLoggedIn,
      isAdmin: req.session.isAdmin

    });
  }
  try {
    interestedIn = await Product.find({}).skip((pageNum - 1) * itemPerPage).limit(itemPerPage)

    return res.render('shop/products', {
      pageTitle: `${categoryName}`,
      path: `/${categoryName}`,
      categories: categories,
      category: categoryName,
      sub: sub,
      interestedIn: interestedIn,
      type: categoryName,
      products: products,
      currentPage: pageNum,
      hasNextPage: itemPerPage * pageNum < totalItems,
      hasPrevPage: pageNum > 1,
      nextPage: pageNum + 1,
      prevPage: pageNum - 1,
      lastPage: Math.ceil(totalItems / itemPerPage),
      isAuthenticated: req.session.isLoggedIn,
      isAdmin: req.session.isAdmin

    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}
exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const msgs = msg(req, res)


  try {

    const categories = await Category.find({ active: true })

    const product = await Product.findById(prodId)
    if (!product) return res.redirect('/')
    const similir = await Product.find().skip((1 - 1) * 5).limit(5)

    return res.render('shop/product-details', {
      product: product,
      similir: similir,
      pageTitle: product.name,
      path: '/product',
      categories: categories,
      errmsg: msgs.err,
      succmsg: msgs.success,
      isAuthenticated: req.session.isLoggedIn,
      isAdmin: req.session.isAdmin

    })

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};


exports.searchPost = async (req, res, next) => {
  let searchValue = req.body.search;
  var regxValue = new RegExp(searchValue, "i");
  try {
    const products = await Product.find({ name: { $regex: regxValue } }).skip((1 - 1) * 10).limit(10)
    const interestedIn = await Product.find().skip((1 - 1) * 10).limit(10)

    const categories = await Category.find({ active: true })

    return res.render('shop/products', {
      products: products,
      errmsg: null,
      path: "/search",
      pageTitle: "Search Result",
      type: searchValue,
      categories: categories,
      interestedIn: interestedIn,
      sub: null,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: 1,
      prevPage: 1,
      lastPage: 1,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

};


exports.getCart = async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    req.flash('success', 'You are not allowed to preform this proccess')
    return res.redirect('/admin/dashboard')
  }
  let cartId = req.query.cart

  try {
    if (!cartId || cartId == 'null' || cartId == 'undefined') {
      const newcart = createcart(Cart)
      await newcart.save()
      cartId = newcart.sessionId
    }
    let cart = await Cart.findOne({ sessionId: cartId }).lean()
    const categories = await Category.find({ active: true })


    return res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      cart: cart,
      categories: categories,
      isAdmin: req.session.isAdmin,
      isAuthenticated: req.session.isAuthenticated
    });

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

};


exports.getOrders = async (req, res, next) => {
  try {
    const categories = await Category.find({ active: true })
    const orders = await Order.find({ 'customer.id': req.user._id })
    return res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders,
      categories: categories,
      isAdmin: req.session.isAdmin,
      isAuthenticated: req.session.isAuthenticated
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }


};


exports.getCheckout = async (req, res, next) => {
  let total = 0;
  let cartId = req.query.cart

  const msgs = msg(req, res)

  let cart
  try {

    if (!cartId || cartId == 'null' || cartId == 'undefined') {
      const newcart = createcart(Cart)
      await newcart.save()
      cartId = newcart.sessionId
    }

    cart = await Cart.findOne({ sessionId: cartId }).lean()
    if (cart.items.length === 0) return res.redirect(`/`)

    cart.items.forEach(p => total += p.quantity * p.price)
    const categories = await Category.find({ active: true })
    let existPromo
    if (cart.promo) { existPromo = true } else { existPromo = false }
    const zones = await Zone.find({ active: true })
    return res.render('shop/checkout', {
      path: '/checkout',
      pageTitle: 'Checkout',
      products: cart.items,
      totalSum: total,
      categories: categories,
      cartId: cartId,
      cart: cart,
      existPromo: existPromo,
      errmsg: msgs.err,
      succmsg: msgs.success,
      zones: zones,
      isAdmin: req.session.isAdmin,
      isAuthenticated: req.session.isAuthenticated
    });

  } catch (err) {
    console.log(err);

    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

};




exports.postCreateSales = async (req, res, next) => {

  const { firstname, lastname, phone, email, area, street, apartment, floor, delivery_date, note, newaccount, password } = req.body
  let cartId = req.query.cart
  const date = formatDate(new Date())

  try {
    let session
    const cart = await Cart.findOne({ sessionId: cartId })
    if (cart.items.length === 0) return res.redirect(`/`)

    let totalQty = 0
    for (it of cart.items) { totalQty += it.total }


    session = await mongoose.startSession()
    session.startTransaction()

    let grandTotal = 0;

    for (let i of cart.items) {
      let item = await Product.findOne({ _id: i.id })
      if (i.quantity > item.info.quantity || item.info.quantity === 0) {
        moveOn = false
        req.flash('alert', `${i.name} Quantity is NOT Enough to make this process`)
        return res.redirect(`/checkout?cart=${cart.sessionId}`)
      }
      grandTotal += i.total
      item.info.quantity = item.info.quantity - i.quantity
      await item.save({ session: session })
    }



    let newuser
    if (newaccount == 'on' || req.user) {
      newuser = await User.findOne({ mobile: phone })
      if (!newuser && newaccount == 'on') {
        const hashedPassword = await bcrypt.hash(password, 12)
        newuser = new User({
          name: firstname,
          mobile: phone,
          email: email,
          password: hashedPassword,
          cart: cartId,
          orders: []
        })
        await newuser.save({ session: session })
      } else {
        newuser = await User.findById(req.user._id)
      }
    }


    if (cart.promo.name) grandTotal = grandTotal - (grandTotal * (cart.promo.discount / 100))

    const zone = await Zone.findOne({ zoneId: area })
    if (!zone || !zone.active) {
      await session.abortTransaction()
      session.endSession()
      req.flash('alert', "We're sorry but this zone in not available yet!")
      return res.redirect(`/checkout?cart=${cart.sessionId}`)
    }

    grandTotal += zone.shipping

    const orderinfo = {
      note: note,
      shipping_details: { area: { name: zone.name, zoneId: zone.zoneId }, street: street, apartment: apartment, floor: floor, price: zone.shipping },
      billing_details: { first_name: firstname, last_name: lastname, phone: phone, email: email },
      delivery_date: delivery_date
    }

    const valid = validateOrder(cart.items, grandTotal, date, orderinfo, true)

    if (!valid.state) {
      await session.abortTransaction()
      session.endSession()
      req.flash('alert', `${valid.reason}`)
      return res.redirect(`/checkout?cart=${cart.sessionId}`)

    }
    const newOrder = createOrder(Order, cart.items, grandTotal, date, orderinfo, newuser)
    newOrder.sessionId = cart.sessionId
    cart.items = []
    cart.total = 0
    console.log(newOrder);
    await cart.save({ session: session })
    await newOrder.save({ session: session })

    if (newuser) {
      newuser.orders.push(newOrder._id)
      await newuser.save()
    }

    zone.orders.push({ id: newOrder._id, no: newOrder.serialNo })
    await zone.save({ session: session })

    await session.commitTransaction()
    session.endSession()
    return res.render('shop/checkout_success', {
      pageTitle: 'Order Confirmed',
      order: newOrder,
      path: '/checkoutsuccess',
      isAdmin: req.session.isAdmin,
      isAuthenticated: req.session.isAuthenticated,
      user: req.session.user
    })

  } catch (err) {
    console.log(err);
    await session.abortTransaction()
    session.endSession()
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}



exports.getCheckoutSuccess = (req, res, next) => {
  let totalSum = 0;
  req.user.populate('cart.items.productId').execPopulate()
    .then(user => {
      user.cart.items.forEach(p => { totalSum += p.quantity * p.productId.price; });

      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          name: req.user.name,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {

      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }

      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PdfDocument();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fillColor('brown').fontSize(30).text(`Invoice For: Mr. ${order.user.name}`, {
        width: 410,
        align: 'center'
      }
      );

      pdfDoc.text("_______________________", {
        width: 410,
        align: 'center'
      });

      pdfDoc.moveDown();

      let totalPrice = 0;
      pdfDoc.image('images/like.png', 250, 150, { width: 450, height: 300 })

      order.products.forEach(prod => {
        totalPrice += prod.product.price * prod.quantity;
        pdfDoc.fillColor('black').fontSize(22).text(`--${prod.product.title}--`);
        pdfDoc.fillColor('#333').fontSize(17).text(`Price:  ${prod.product.price}`);
        pdfDoc.fillColor('#333').fontSize(17).text(`Quantity:  ${prod.quantity}`);
        pdfDoc.moveDown(1.5);
      });


      pdfDoc.text("___________________________________________", {
        width: 410
      });

      pdfDoc.moveDown();

      pdfDoc.fillColor('green').fontSize(26).text(`Total Price:  ${totalPrice}$`);

      pdfDoc.moveDown();



      pdfDoc.end();

    })
    .catch(err => next(err));
};





exports.postSubscribe = (req, res, next) => {
  const mobile = req.body.mobile;
  const name = req.body.name;
  const message = req.body.message;
  Subscriber.findOne({ mobile })
    .then(subscriber => {

      if (!subscriber) {
        const newSubscriber = new Subscriber({ mobile: mobile, name: name, message: message })
        return newSubscriber.save();
      }
      if (message) { subscriber.message = message; }

      return subscriber.save()

    }).then(result => {
      // transporter.sendMail({
      //   to: 'cookielicious.eg@gmail.com ',
      //   from: email,
      //   subject: `Message From  ${name}`,
      //   html: `
      //   <p>${message}</p>
      //   `
      // });
      req.flash('success', 'Thank You, We will reply back as soon as possible')
      return res.redirect('/contact')
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}



exports.accountSettings = async (req, res, next) => {
  let msgs = msg(req)
  try {
    const categories = await Category.find({ active: true })

    const user = await User.findOne({ _id: req.user._id })
    return res.render("shop/account-settings", {
      user: user,
      pageTitle: "Settings",
      path: "settings",
      categories: categories,
      errmsg: msgs.err,
      succmsg: msgs.success,
      isAdmin: req.session.isAdmin,
      isAuthenticated: req.session.isAuthenticated
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }


}



exports.updateInfo = async (req, res, next) => {
  const { mobile, name } = req.body
  try {
    const user = await User.findOne({ _id: req.user._id })
    if (!user) {
      req.flash('alert', 'Something went wrong, please try again')
      return res.redirect('/my-account/settings')
    }

    if (!mobile || !name) {
      req.flash('alert', 'Mobile and name are required')
      return res.redirect('/my-account/settings')

    }

    user.mobile = mobile
    user.name = name
    await user.save()
    req.flash('success', 'Information Updated')
    return res.redirect('/my-account/settings')


  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}
exports.changePassword = async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body
  try {
    const user = await User.findOne({ _id: req.user._id })
    if (!user) {
      req.flash('alert', 'Something went wrong, please try again')
      return res.redirect('/my-account/settings')
    }
    const isMatched = await bcrypt.compare(oldPassword, user.password)
    if (!isMatched) {
      req.flash('alert', 'Old password not correct')
      return res.redirect('/my-account/settings')

    }
    if (newPassword != confirmPassword) {
      req.flash('alert', 'Password not matched')
      return res.redirect('/my-account/settings')

    }
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedPassword
    await user.save()
    req.flash('success', ' Password changed successfully')
    return res.redirect('/my-account/settings')


  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}