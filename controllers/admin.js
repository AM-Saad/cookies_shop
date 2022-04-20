const Product = require("../models/Product");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Promo = require("../models/Promo");
const Order = require("../models/Order");
const Zone = require("../models/Zone");
const Category = require("../models/Category");
const fs = require('fs')
const msg = require("../util/message");
const { validationResult } = require("express-validator/check");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const axios = require('axios').default
const moment = require('moment')
const itemMethods = require("../models/methods/itemMethods");
const Subscription = mongoose.model('subscribers');
const webPush = require('web-push');
const { formatDate } = require("../models/helpers/formatDate");
const { createOrder, validateOrder } = require("../models/helpers/order");






exports.getLogin = async (req, res, next) => {
  // console.log('here');
  //   const hashedPassword = await bcrypt.hash('123456789', 12)
  //   const newAdmin = new Admin({
  //     name: 'Omar',
  //     mobile: '01202002094',
  //     password: hashedPassword,
  //     isAdmin: true
  //   })
  //   await newAdmin.save()
  //   console.log(newAdmin);
  if (req.session.isLoggedIn && req.session.user.isAdmin) return res.redirect('/admin/dashboard')
  return res.render(`${res.locals.lang || 'en'}/admin/auth/login`, {
    path: "/admin/login",
    pageTitle: "Admin",
    errmsg: null,
    succmsg: null,
    isAuth: req.session.isLoggedIn,
    user: req.session.user,
    lang: res.locals.lang || 'en'

  });
};

exports.postLogin = async (req, res, next) => {
  const mobile = req.body.mobile;
  const password = req.body.password;
  try {
    const user = await Admin.findOne({})
    if (!user) {
      return res.render(`${res.locals.lang || 'en'}/admin/auth/login`, {
        path: "/admin/login",
        pageTitle: "Admin",
        errmsg: `${res.locals.lang == 'en' ? 'Your information is incorrect' : 'برجاء التأكد من البيانات'}`,
        succmsg: null,
        isAuth: req.session.isLoggedIn,
        user: req.session.user,
        lang: res.locals.lang || 'en'
      });
    }

    const doMatch = await bcrypt.compare(password, user.password)
    if (!doMatch) {
      return res.render(`${res.locals.lang || 'en'}/admin/auth/login`, {
        path: "/admin/login",
        pageTitle: "Admin",
        errmsg: `${res.locals.lang == 'en' ? 'Your information is incorrect' : 'برجاء التأكد من البيانات'}`,
        succmsg: null,
        isAuth: req.session.isLoggedIn,
        user: req.session.user,
        lang: res.locals.lang || 'en'
      });
    }
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.isAdmin = true
    await req.session.save(err => {
      console.log(req.session);

      return res.redirect(`/admin/dashboard?lang=${res.locals.lang || 'en'}`)
    });
  } catch (error) {

  }

};


exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/");
  });
};



exports.dashboard = async (req, res, next) => {
  const to = moment().format('YYYY-MM-DD')
  const from = moment().subtract(1, 'days').format('YYYY-MM-DD')
  const sales = await Order.find({
    date: { $gte: from, $lte: to }
  })
  const salesNumber = await Order.find({}).countDocuments()
  const customers = await User.find()
  const items = await Product.find({})



  let totalSalesPrice = 0
  sales.forEach(s => {
    totalSalesPrice += s.totalPrice
  })
  return res.render(`${res.locals.lang || 'en'}/admin/dashboard`, {
    users: [],
    orders: [],
    pageTitle: "Dashboard",
    path: "/admin/dashboard",
    sales: sales,
    isAuth: req.isLoggedIn,
    user: req.user,
    totalSalesPrice: totalSalesPrice,
    customerslenght: customers.length,
    salesNumber: salesNumber,
    customers: customers,
    lang: res.locals.lang || 'en'
  });
};




exports.inventory = async (req, res, next) => {

  return res.render(`${res.locals.lang || 'en'}/admin/inventory`, {
    path: '/admin/inventory',
    pageTitle: 'Inventory',
    company: req.company,
    isAuth: req.isLoggedIn,
    user: req.user,
    lang: res.locals.lang || 'en'
  })

}

exports.products = async (req, res, next) => {
  const fromDate = req.query.from;
  const toDate = req.query.to;
  let query = {}
  if (req.query) {
    if (req.query.category) {
      query = { 'category.name': req.query.category }
    } else if (req.query.name) {
      query = { name: req.query.name }
    } else if (req.query.id) {
      query = { _id: req.query.id }
    } else {
      query = { [req.query.type]: { $gte: fromDate, $lte: toDate } }
    }
  }
  try {
    const products = await Product.find(query)
    if (!products) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'حدث شئ خطا, برجاء المحاوله مره اخري'} `, messageType: 'info' })

    return res.status(200).json({ message: 'Done', messageType: 'success', items: products })
  } catch (error) {

    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'حدث شئ خطا, برجاء المحاوله مره اخري'}`, messageType: 'danger' })

  }
}

exports.createProduct = async (req, res, next) => {

  const { discount, sku, name, type, attributes, category, quantity, purchasingPrice, sellingPrice, description, inventory, supplier, barcode, popular, featured } = req.body
  const parsedCategory = JSON.parse(category)
  // const parsedSubUnit = JSON.parse(subUnit)
  const parsedAttrs = JSON.parse(attributes)
  let images = []
  let session

  if (req.files.length > 0) {
    if (req.files.length > 5) {
      return res.status(401).json({ message: `${res.locals.lang == 'en' ? 'Maximum images is 5' : '5 صور هو اقص عدد'}`, messageType: 'info' })
    } else {
      for (var i = 0; i < req.files.length; i++) {
        images.push('/' + req.files[i].path.replace("\\", "/"))
      }
    }
  }
  try {
    session = await mongoose.startSession();
    session.startTransaction()

    const newitem = itemMethods.createitem(discount, sku, name, type, parsedAttrs, parsedCategory, quantity, purchasingPrice, sellingPrice, description, { id: null, name: null }, images, null, supplier, barcode, popular, featured)

    const validateItem = itemMethods.validateItem(newitem)


    if (!validateItem.validated) return res.status(401).json({ message: validateItem.message, messageType: 'info' })


    const NEWITEM = new Product(newitem)
    await NEWITEM.save({ session: session })


    await session.commitTransaction()
    session.endSession()

    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Item created successfully' : 'تم الانشاء'}`, messageType: 'success', item: NEWITEM })

  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    return res.status(500).json({ message: `${res.locals.lang == 'ar' ? ' حدث خطأ , برجاء المحاوله مره اخري' : 'Something went worng, please try again'}`, messageType: 'danger' })
  }
}
exports.editProductImage = async (req, res, next) => {
  const itemId = req.params.itemId
  const type = req.query.type
  try {
    const item = await Product.findOne({ _id: itemId })
    if (!item) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'info' })
    if (type == "upload") {
      let images = []
      if (item.images.length >= 5) return res.status(401).json({ message: `${res.locals.lang == 'en' ? 'Already have 5 image' : "المنتج لديه 5 صوره بالفعل"}`, messageType: 'warning' })

      if (req.files.length > 0) {
        if (req.files.length > 5) return res.status(401).json({ message: `${res.locals.lang == 'en' ? 'Maximum images is 5' : '5 صور هو اقص عدد'}`, messageType: 'info' })

        for (var i = 0; i < req.files.length; i++) {
          images.push('/' + req.files[i].path.replace("\\", "/"))
        }
      }

      const rest = 5 - item.images.length
      if (images.length > rest) return res.status(401).json({ message: `${res.locals.lang == 'en' ? 'Maximum images is 5' : '5 صور هو اقص عدد'}`, messageType: 'warning' })

      images.forEach(image => item.images.push(image))
      await item.save()

    }
    if (type == 'delete') {
      let image = req.body.image
      fs.unlink(`.${image}`, function (error) {
        if (error) return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
      });
      item.images = item.images.filter(i => i != image)
      await item.save()
    }
    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Done' : 'تم'}`, messageType: 'success', item: item })
  } catch (error) {
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
  }

}

exports.editProduct = async (req, res, next) => {
  const itemId = req.params.id
  const { discount, sku, name, type, units, category, attributes, quantity, purchasingPrice, sellingPrice, description, inventory, supplier, barcode, featured, popular } = req.body
  const parsedCategory = JSON.parse(category)
  let session
  const parsedAttrs = JSON.parse(attributes)

  try {
    session = await mongoose.startSession();
    session.startTransaction()
    let item = await Product.findById(itemId)

    let newitem = itemMethods.createitem(discount, sku, name, type, parsedAttrs, parsedCategory, quantity, purchasingPrice, sellingPrice, description, { id: null, name: null }, item.images, null, null, barcode)

    const validateItem = itemMethods.validateItem(newitem)


    if (!validateItem.validated) return res.status(401).json({ message: validateItem.message, messageType: 'info' })
    item.name = name
    item.info = {
      purchasingPrice: parseInt(purchasingPrice, 10) || 0,
      sellingPrice: parseInt(sellingPrice, 10) || 0,
      quantity: parseInt(quantity, 10) || 0,
      initialQuanitity: parseInt(quantity, 10) || 0,
      refunded: 0,
      returnedtosupplier: 0,
    }
    item.description = description
    item.discount = discount
    item.attributes = parsedAttrs
    item.category = parsedCategory
    item.featured = featured
    item.popular = popular
    await item.save()

    await session.commitTransaction()
    session.endSession()

    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Done' : 'تم'}`, messageType: 'success', item: item })

  } catch (error) {
    console.log(error);

    await session.abortTransaction()
    session.endSession()
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })

  }
}
exports.deleteProduct = async (req, res, next) => {
  const itemId = req.params.id
  try {
    const item = await Product.findOne({ _id: itemId })
    console.log(item);
    if (!item) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'warning' })


    await item.remove()
    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Deleted' : 'تم الحذف'}`, messageType: 'success' })
  } catch (error) {

    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'error' })
  }
}

exports.editItemImage = async (req, res, next) => {
  const itemId = req.params.id
  const type = req.query.type

  try {

    const item = await Product.findOne({ _id: itemId })
    if (!item) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'info' })
    if (type == "upload") {
      let images = []
      if (item.images.length >= 5) return res.status(401).json({ message: `${res.locals.lang == 'en' ? 'Already have 5 images ' : 'بالفعل لديه 5 صور'}`, messageType: 'warning' })

      if (req.files.length > 0) {
        if (req.files.length > 5) return res.status(401).json({ message: `${res.locals.lang == 'en' ? 'Maximum images is 5' : '5 صور هو اقص عدد'}`, messageType: 'info' })

        for (var i = 0; i < req.files.length; i++) {
          images.push('/' + req.files[i].path.replace("\\", "/"))
        }
      }

      const rest = 5 - item.images.length
      if (images.length > rest) return res.status(401).json({ message: `${res.locals.lang == 'en' ? 'Maximum images is 5' : '5 صور هو اقص عدد'}`, messageType: 'warning' })

      images.forEach(image => item.images.push(image))
      await item.save()

    }
    if (type == 'delete') {
      let image = req.body.image
      fs.unlink(`.${image}`, function (error) {
        if (error) return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
      });
      item.images = item.images.filter(i => i != image)
      await item.save()
    }

    return res.status(200).json({ message: `${res.locals.lang == 'en' ? ' Done' : 'تم'}`, messageType: 'success', item: item })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })

  }

}
exports.orders = async (req, res, next) => {
  try {
    const categories = await Category.find()
    const zones = await Zone.find()

    return res.render(`${res.locals.lang || 'en'}/admin/orders`, {
      path: "/admin/orders",
      pageTitle: "orders",
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
      categories: categories,
      zones: zones,
      lang: res.locals.lang || 'en'

    });
  } catch (error) {
    console.log(error);
  }

}


exports.getOrders = async (req, res, next) => {
  const fromDate = req.query.from;
  const toDate = req.query.to;
  let query = {}
  if (req.query) {
    if (req.query.no) {
      query = { serialNo: req.query.no }
    } else if (req.query.status) {
      query = { 'status.no': req.query.status }
    } else if (req.query.category) {
      query = { items: { $elemMatch: { category: req.query.category } } }
    } else if (req.query.id) {
    } else if (req.query.zone) {
      query = { 'order_info.shipping_details.area.zoneId':  req.query.zone }
    } else if (req.query.id) {
      query = { _id: req.query.id }
    } else {
      query = { [req.query.type]: { $gte: fromDate, $lte: toDate } }
    }
  }
  try {
    const orders = await Order.find(query)
    return res.status(200).json({ orders: orders, message: 'orders Fetched', messageType: 'success' })
  } catch (error) { return res.status(500).json({ message: ' cannot fetched', messageType: 'danger' }) }
}


exports.createOrderPage = async (req, res, next) => {
  try {

    return res.render(`${res.locals.lang || 'en'}/admin/new-order`, {
      path: "/admin/orders",
      pageTitle: "orders",
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
      lang: res.locals.lang || 'en',
      editing: false,
      order: null
    });
  } catch (error) {
    console.log(error);
  }

}

exports.createOrder = async (req, res, next) => {

  const { firstname, lastname, phone, email, area, street, apartment, floor, delivery_date, note, customer, items } = req.body
  const date = formatDate(new Date())
  let session

  try {


    session = await mongoose.startSession()
    session.startTransaction()

    let grandTotal = 0;

    for (let i of items) {
      let item = await Product.findOne({ _id: i.id })
      if (i.quantity > item.info.quantity || item.info.quantity === 0) {
        return res.status(401).json({ message: `${i.name} Quantity is NOT Enough to make this process`, messageType: 'info' })
      }
      grandTotal += i.total
      item.info.quantity = item.info.quantity - i.quantity
      await item.save({ session: session })
    }


    const zone = await Zone.findOne({ zoneId: area })
    if (!zone) {
      await session.abortTransaction()
      await session.endSession()
      return res.status(401).json({ message: "Please add delivery zone", messageType: 'info' })
    }

    grandTotal += zone.shipping || 0

    const orderinfo = {
      note: note,
      billing_details: { first_name: firstname, last_name: '', phone: phone, email: '' },
      shipping_details: { area: { name: zone.name, zoneId: zone.zoneId }, street: street, apartment: apartment, floor: floor, price: zone.shipping },
      delivery_date: delivery_date
    }

    const valid = validateOrder(items, grandTotal, date, orderinfo, true)

    if (!valid.state) {
      await session.abortTransaction()
      await session.endSession()
      return res.status(401).json({ message: `${valid.reason}`, messageType: 'info' })
    }

    const newOrder = new Order({
      items: items,
      totalPrice: grandTotal,
      date: date,
      customer: { name: firstname },
      order_info: orderinfo,
      leadSource: 'Pos',
      status: { no: 1, text: 'تحت الطلب', en: 'Pending' }
    });

    await newOrder.save({ session: session })
    if (customer.id) {
      let existCustomer = await User.findOne({ _id: customer.id })
      if (existCustomer) {
        existCustomer.orders.push(newOrder._id)
        await existCustomer.save({ session: session })
        newOrder.customer = { id: existCustomer._id, name: existCustomer.name }
      }
    }
    zone.orders.push({ id: newOrder._id, no: newOrder.serialNo })
    await zone.save({ session: session })
    await newOrder.save({ session: session })

    await session.commitTransaction()
    await session.endSession()

    return res.status(200).json({ newOrder: newOrder, message: 'Order Created', messageType: 'success' })


  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })

  }

}



exports.editOrderPage = async (req, res, next) => {
  const id = req.params.id
  try {

    return res.render(`${res.locals.lang || 'en'}/admin/new-order`, {
      path: "/admin/orders",
      pageTitle: "orders",
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
      lang: res.locals.lang || 'en',
      editing: true,
      order: id

    });
  } catch (error) {
    console.log(error);
  }

}

exports.getOrder = async (req, res, next) => {
  const id = req.params.id
  try {

    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'warning' })

    return res.status(200).json({ order: order, message: 'orders Fetched', messageType: 'success' })
  } catch (error) {
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })

  }
}
exports.editOrder = async (req, res, next) => {
  const id = req.params.id
  const { firstname, lastname, phone, email, area, street, apartment, floor, delivery_date, note, customer, items } = req.body
  let session
  try {

    const date = formatDate(new Date())

    session = await mongoose.startSession()
    session.startTransaction()

    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'info' })



    const zone = await Zone.findOne({ zoneId: area })
    if (!zone) {
      await session.abortTransaction()
      await session.endSession()
      return res.status(401).json({ message: "Please add delivery zone", messageType: 'info' })
    }

    let grandTotal = order.totalPrice

    grandTotal -= order.order_info.shipping_details.price
    zone.orders = zone.orders.filter(o => o.id.toString() != order._id.toString())


    const orderinfo = {
      note: note,
      billing_details: { first_name: firstname, last_name: '', phone: phone, email: '' },
      shipping_details: { area: { name: zone.name, zoneId: zone.zoneId }, street: street, apartment: apartment, floor: floor, price: zone.shipping },
      delivery_date: delivery_date
    }
    console.log(orderinfo);

    grandTotal += zone.shipping || 0

    const valid = validateOrder(items, grandTotal, date, orderinfo, false)

    if (!valid.state) {
      await session.abortTransaction()
      await session.endSession()
      return res.status(401).json({ message: `${valid.reason}`, messageType: 'info' })
    }



    order.order_info = orderinfo
    order.totalPrice = grandTotal





    await order.save({ session: session })

    if (customer.id && order.customer.id && order.customer.id.toString() != customer.id.toString()) {
      //remove from worng customer
      const oldCustomer = await User.findById(order.customer.id)
      oldCustomer.orders = oldCustomer.orders.filter(o => o.toString() != order._id.toString())
      await oldCustomer.save()

      let existCustomer = await User.findOne({ _id: customer.id })
      if (existCustomer) {
        existCustomer.orders.push(order._id)
        await existCustomer.save({ session: session })

        order.customer = { id: existCustomer._id, name: existCustomer.name }
      }
    } else if (!customer.id && order.customer.id) {
      const oldCustomer = await User.findById(order.customer.id)
      oldCustomer.orders = oldCustomer.orders.filter(o => o.toString() != order._id.toString())
      order.customer = { name: firstname }

      await oldCustomer.save()
    } else if (customer.id && !order.customer.id) {
      console.log(order.customer.id);

      let existCustomer = await User.findOne({ _id: customer.id })
      if (existCustomer) {
        existCustomer.orders.push(order._id)
        await existCustomer.save({ session: session })
        order.customer = { id: existCustomer._id, name: existCustomer.name }
      }
    } else {
      order.customer = { name: firstname }

    }

    zone.orders.push({ id: order._id, no: order.serialNo })

    await zone.save({ session: session })
    await order.save({ session: session })

    await session.commitTransaction()
    await session.endSession()
    return res.status(200).json({ order: order, message: 'Order Updated', messageType: 'success' })


  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })

  }
}

exports.changeStatus = async (req, res, next) => {
  const id = req.params.id
  const status = parseInt(req.body.status, 10)

  try {
    const order = await Order.findOne({ serialNo: id })
    if (!order) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'alert' })
    switch (status) {
      case 2:
        order.status = { no: status, text: 'تم التأكيد', en: 'Confirmed' }
        break
      case 3:
        order.status = { no: status, text: 'في الطريق', en: '' }
        break
      case 4:
        order.status = { no: status, text: 'تم التوصيل', en: 'Delivered' }
        break
      case 5:
        order.status = { no: status, text: 'مرتجع', reason: req.body.reason, en: 'Bounced back' }
        break
      case 6:
        order.status = { no: status, text: 'ملغاه', reason: req.body.reason, en: 'Canceled' }
        break
      default:
        break;
    }
    await order.save()
    return res.status(200).json({ order: order, message: `${res.locals.lang == 'en' ? 'Status Changed' : 'تم تعديل الحاله'}`, messageType: 'success' })


  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })

  }
}


exports.deleteOrder = async (req, res, next) => {
  const id = req.params.id
  try {
    const order = await Order.findOne({ _id: id })
    if (!order) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'info' })


    for (let i of order.items) {
      let item = await Product.findOne({ _id: i.id })
      item.info.quantity = item.info.quantity + i.quantity
      await item.save()
    }
    if (order.customer.id) {
      const customer = await User.findOne({ _id: order.customer.id })
      if (customer) {
        customer.orders = customer.orders.filter(o => o.toString() != order._id.toString())
        console.log(customer);
        await customer.save()
      }
    }
    await order.remove()
    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Deleted' : 'تم الحذف'}`, messageType: 'success' })
  } catch (error) {
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
  }
}







exports.category = async (req, res, next) => {
  return res.render(`${res.locals.lang || 'en'}/admin/category`, {
    users: [],
    orders: [],
    pageTitle: "category",
    path: "/admin/category",
    isAuth: req.session.isLoggedIn,
    user: req.session.user,
    lang: res.locals.lang || 'en'
  });
}



exports.getCategory = async (req, res, next) => {
  try {
    const categoryies = await Category.find()
    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Done' : 'تم'}`, messageType: 'success', categories: categoryies })

  } catch (error) {

    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
  }
}



exports.createCategory = async (req, res, next) => {
  const name = req.body.name.toLowerCase()
  const subCategories = JSON.parse(req.body.subCategories)
  const order = req.body.order
  const active = req.body.active
  const tag = JSON.parse(req.body.tag)
  try {
    if (!name) return res.status(401).json({ message: `${res.locals.lang == 'en' ? 'Add Category Name' : 'اضف اسم للتصنيف'}`, messageType: 'warning' })

    const newCategory = {
      company: null,
      name: name,
      order: order ? order : null,
      active: active ? active : true,
      subCategory: subCategories,
      image: req.files.length > 0 ? req.files[0].path.replace("\\", "/") : '',
      attributes: [],
      tag: tag
    }
    const cat = new Category(newCategory)
    await cat.save()
    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Created' : 'تم الانشاء '}`, messageType: 'success', category: cat })


  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })

  }
}

exports.editCategory = async (req, res, next) => {
  const categoryId = req.params.id;
  try {

    const category = await Category.findOne({ _id: categoryId })
    if (!category) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'warning' })


    await Product.updateMany({ 'category.name': category.name }, { 'category.name': req.body.name.toLowerCase() })
    category.name = req.body.name.toLowerCase()
    category.order = req.body.order || null
    category.active = req.body.active || true
    category.tag = JSON.parse(req.body.tag)
    category.subCategory = JSON.parse(req.body.subCategories)
    category.image = req.files.length > 0 ? req.files[0].path.replace("\\", "/") : category.image,

      await category.save()
    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Edited' : 'تم التعديل '}`, messageType: 'success', category: category })


  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })

  }
}






exports.deleteCategory = async (req, res, next) => {
  const groupId = req.params.id
  const withItems = req.query.itemsState
  try {
    const category = await Category.findOne({ _id: groupId })

    await Product.updateMany({ 'category.name': category.name }, { 'category.name': 'default', 'category.subCategory': null })



    await category.remove()
    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Deleted' : 'تم الحذف '}`, messageType: 'success' })
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
  }
}




exports.customers = async (req, res, next) => {

  return res.render(`${res.locals.lang || 'en'}/admin/customers`, {
    path: "/admin/customers",
    pageTitle: "Customers",
    isAuth: req.session.isLoggedIn,
    user: req.session.user,
    lang: res.locals.lang || 'en'

  });
}

exports.getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find()
    return res.status(200).json({ customers: customers, message: 'Done', messageType: 'success' })
  } catch (error) { return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' }) }
}


exports.createCustomer = async (req, res, next) => {
  const { name, mobile, address, email, notes } = req.body
  console.log(req.body);
  try {
    const customer = await User.findOne({ mobile: mobile })
    if (customer) return res.status(400).json({ message: 'Customer with same number already exist', messageType: 'info' })

    let profileImage;
    if (req.file === undefined) {
      profileImage = 'images/emp.png'
    } else {
      profileImage = req.file.path.replace("\\", "/");
    }
    const hashedPassword = await bcrypt.hash('123456789', 12)

    const newCustomer = new User({ name: name.toLowerCase(), mobile: mobile, password: hashedPassword, address: address, email: email, image: profileImage, shipments: [], notes: notes })
    await newCustomer.save()
    return res.status(200).json({ customer: newCustomer, message: `${res.locals.lang == 'en' ? 'Created' : 'تم الانشاء'}`, messageType: 'success' })
  } catch (error) {
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
  }
}
exports.editCustomer = async (req, res, next) => {
  const id = req.params.id

  try {
    const customer = await User.findOne({ _id: id })
    if (!customer) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'info' })

    if (req.file === undefined) {
      profileImage = customer.image
    } else {
      profileImage = req.file.path.replace("\\", "/");
    }
    customer.name = req.body.name.toLowerCase();
    customer.address = req.body.address
    customer.mobile = req.body.mobile
    customer.email = req.body.email
    customer.note = req.body.note
    customer.image = profileImage
    await customer.save()
    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Edited' : 'تم التعديل'}`, messageType: 'success', customer: customer })
  } catch (error) {
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
  }
}
exports.customerOrders = async (req, res, next) => {
  const id = req.params.id
  const fromDate = req.query.from;
  const toDate = req.query.to;
  try {
    let query = {}
    if (req.query) {
      if (req.query.no) {
        query = { serialNo: req.query.no, 'customer.id': id }
      } else if (req.query.status) {
        query = { 'status.no': req.query.status, 'customer.id': id }
      } else if (req.query.id) {
        query = { _id: req.query.id, 'customer.id': id }
      } else {
        query = { [req.query.type]: { $gte: fromDate, $lte: toDate }, 'customer.id': id }
      }
    }
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'info' })
    const orders = await Order.find(query)
    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Fetched' : 'تم '}`, messageType: 'success', orders: orders })

  } catch (error) {
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })

  }
}
exports.deleteCustomer = async (req, res, next) => {
  const id = req.params.id
  try {
    const customer = await User.findOne({ _id: id })
    if (!customer) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'info' })
    await customer.remove()
    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Deleted' : 'تم الحذف'}`, messageType: 'success' })
  } catch (error) {
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
  }
}







exports.getPromos = async (req, res, next) => {
  return res.render(`${res.locals.lang || 'en'}/admin/promos`, {
    users: [],
    orders: [],
    pageTitle: "promos",
    path: "/admin/promos",
    isAuth: req.isLoggedIn,
    user: req.user,
    lang: res.locals.lang || 'en'
  });
}



exports.promos = async (req, res, next) => {
  try {
    const promos = await Promo.find()
    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Fetched' : 'تم '}`, messageType: 'success', promos: promos })

  } catch (error) {
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
  }
}



exports.createPromo = async (req, res, next) => {
  const { name, discount, limit } = req.body
  try {
    const exist = await Promo.findOne({ name: name })
    if (exist) return
    const newPromo = new Promo({
      name: name,
      limit: limit,
      count: 0,
      discount: discount || 0,
      users: []
    })


    // webPush.setVapidDetails('mailto:amsstudio.e@gmail.com', "BIJupMjgcWmTy5hNscIxPW5o5oqJtl1vTTn8dyFato9J7gP-r0vnuYlsJzIuCMz2lPOa7_7Eed4Gof_onMZwqT4", "JL32c2yGKNo6Utz7jlu20ss2P3YIp57VX3dlNQb1-6U")
    // const subscriptions = await Subscription.find({})
    // const payload = {
    //   title: 'New Promo Code',
    //   message: "New Promo Code Addedd With Great Discount",

    // }
    // subscriptions.forEach(sub => {
    //   let pushConfig = {
    //     endpoint: sub.endpoint,
    //     keys: {
    //       auth: sub.keys.auth,
    //       p256dh: sub.keys.p256dh
    //     }
    //   }
    //   // console.log(sub);
    //   webPush.sendNotification(sub, JSON.stringify(payload)).catch(function (err) {
    //     console.log(err)
    //   })
    // })
    await newPromo.save()
    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Created' : 'تم الانشاء '}`, messageType: 'success', promo: newPromo })



  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
  }
}

exports.editPromo = async (req, res, next) => {
  const id = req.params.id;
  try {

    const promo = await Promo.findOne({ _id: id })
    if (!promo) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'warning' })

    promo.name = req.body.name
    promo.limit = req.body.limit
    promo.discount = req.body.discount || promo.discount
    await promo.save()

    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Edited' : 'تم التعديل '}`, messageType: 'success', promo: promo })

  } catch (error) {
    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
  }
}

exports.deletePromo = async (req, res, next) => {
  const id = req.params.id
  try {
    const promo = await Promo.findOne({ _id: id })
    if (!promo) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'warning' })

    await promo.remove()
    return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Deleted' : 'تم الحذف '}`, messageType: 'success' })
  } catch (error) {

    return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
  }
}





exports.zones = async (req, res, next) => {

  return res.render(`${res.locals.lang || 'en'}/admin/zones`, {
    path: "/zones",
    pageTitle: "Zones",
    isAuth: req.session.isLoggedIn,
    user: req.session.user

  });
}


exports.getZones = async (req, res, next) => {
  try {
    const zones = await Zone.find()
    return res.status(200).json({ zones: zones, message: 'Zones Fetched', messageType: 'success' })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: ' cannot fetched', messageType: 'danger' })
  }
}



exports.createZone = async (req, res, next) => {
  const { name, id, shipping, governorate, notes, delivery, pickup } = req.body
  try {
    const zone = await Zone.findOne({ $or: [{ name: name, governorate: governorate }, { governorate: governorate, zoneId: parseInt(id, 10) }] })
    if (zone) return res.status(400).json({ message: `zone with same name and ID in ${governorate} already exist`, messageType: 'info' })



    const newZone = new Zone({ name: name.toLowerCase(), zoneId: id, shipping: shipping, shipments: [], governorate: governorate, notes: notes, delivery: true, pickup: false })
    await newZone.save()
    return res.status(200).json({ zone: newZone, message: 'Zone Created', messageType: 'success' })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: ' cannot Created', messageType: 'danger' })
  }
}
exports.deleteZone = async (req, res, next) => {
  const id = req.params.id
  try {
    const zone = await Zone.findOne({ _id: id })
    if (!zone) return res.status(404).json({ message: 'Cannot find matched zone!!', messageType: 'info' })
    await zone.remove()
    return res.status(200).json({ message: 'zone Delete', messageType: 'success' })
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}

exports.editZone = async (req, res, next) => {
  const id = req.params.id

  try {
    const zone = await Zone.findOne({ _id: id })
    if (!zone) return res.status(404).json({ message: 'Cannot find matched zone!!', messageType: 'info' })


    zone.name = req.body.name.toLowerCase();
    zone.zoneId = req.body.id
    zone.governorate = req.body.governorate
    zone.shipping = req.body.shipping
    zone.notes = req.body.notes
    // zone.delivery = req.body.delivery
    // zone.pickup = req.body.pickup
    await zone.save()
    return res.status(200).json({ message: 'zone Updated', messageType: 'success', zone: zone })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}






exports.settings = async (req, res, next) => {
  const msgs = msg(req, res)

  try {

    const user = await Admin.findById(req.user._id)
    if (!user) {
      req.flash('alert', `${res.locals.lang == 'en' ? 'Something went worng, Re-login please' : 'برجاء اعاده تسجيل الدخول و المحاوله مره اخري'}`)
      return res.redirect('/admin/settings')
    }
    return res.render(`${res.locals.lang || 'en'}/admin/settings`, {
      user: user,
      pageTitle: `${user.name}`,
      path: '/admin/settings',
      errmsg: msgs.err,
      succmsg: msgs.success,
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
      lang: res.locals.lang


    })
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
}



exports.newAdmin = async (req, res, next) => {
  const { name, mobile, password, confirmPassword } = req.body
  try {
    if (!mobile || !name) {
      req.flash('alert', `${res.locals.lang == 'en' ? 'Mobile and name are required' : 'ادخل الاسم و رقم الموبايل'}`)
      return res.redirect('/admin/settings')
    }
    if (!password) {
      req.flash('alert', `${res.locals.lang == 'en' ? 'Add password' : 'ادخل رقم المرور'}`)
      return res.redirect('/admin/settings')
    }
    if (password != confirmPassword) {
      req.flash('alert', `${res.locals.lang == 'en' ? 'Password Not match' : 'رقم المرور غير متطابق'}`)
      return res.redirect('/admin/settings')
    }
    const hashedPassword = await bcrypt.hash(password, 12)
    const newAdmin = new Admin({
      name: name,
      mobile: mobile,
      password: hashedPassword,
      isAdmin: true
    })
    await newAdmin.save()
    req.flash('success', `${res.locals.lang == 'en' ? 'Created' : 'تم الانشاء'}`)
    return res.redirect('/admin/settings')

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}

exports.updateInfo = async (req, res, next) => {
  const { mobile, name } = req.body
  try {
    const user = await Admin.findOne({ _id: req.user._id })
    if (!user) {
      req.flash('alert', `${res.locals.lang == 'en' ? 'Something went worng, Re-login please' : 'برجاء اعاده تسجيل الدخول و المحاوله مره اخري'}`)
      return res.redirect('/admin/settings')
    }

    if (!mobile || !name) {
      req.flash('alert', `${res.locals.lang == 'en' ? 'Mobile and name are required' : 'ادخل الاسم و رقم الموبايل'}`)
      return res.redirect('/admin/settings')
    }

    user.mobile = mobile
    user.name = name
    await user.save()
    req.flash('success', `${res.locals.lang == 'en' ? 'Edited' : 'تم التعديل'}`)
    return res.redirect('/admin/settings')


  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}
exports.changePassword = async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body
  try {
    const user = await Admin.findOne({ _id: req.user._id })
    if (!user) {
      req.flash('alert', `${res.locals.lang == 'en' ? 'Something went worng, Re-login please' : 'برجاء اعاده تسجيل الدخول و المحاوله مره اخري'}`)
      return res.redirect('/admin/settings')
    }
    const isMatched = await bcrypt.compare(oldPassword, user.password)
    if (!isMatched) {
      req.flash('alert', `${res.locals.lang == 'en' ? 'Old password incorrect' : ' خطأ في رقم المرور القديم'}`)
      return res.redirect('/admin/settings')
    }
    if (newPassword != confirmPassword) {
      req.flash('alert', `${res.locals.lang == 'en' ? 'Password Not match' : 'رقم المرور غير متطابق'}`)

      return res.redirect('/admin/settings')
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedPassword
    await user.save()
    req.flash('success', `${res.locals.lang == 'en' ? 'Passwrod Changed' : 'تم تغير رقم المرور'}`)

    return res.redirect('/admin/settings')


  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}


exports.reports = async (req, res, next) => {

  return res.render("admin/reports", {
    path: "/admin/reports",
    pageTitle: "Reports",
    isAuth: req.session.isLoggedIn,
    user: req.session.user

  });
}




exports.templates = async (req, res, next) => {
  let files = []
  try {
    fs.readdirSync("admin/views/templates").forEach(file => {
      files.push(file)
    });
    return res.render('admin/templates', {
      path: '/admin/templates',
      title: 'All Templates',
      files: files
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.template = async (req, res, next) => {
  const name = req.params.name
  try {
    return res.render(`admin/templates/${name}`, {
      path: '/admin/templates',
      title: 'All Templates',
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};



exports.edit = async (req, res, next) => {
  const name = req.params.name
  try {
    return res.render(`admin/edit`, {
      path: '/admin/edit',
      title: 'Edit Template',
      name: name
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};



exports.save = (req, res, next) => {
  const searchValue = req.body.searchValue;
};
