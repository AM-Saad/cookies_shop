
const Category = require("../models/Category");
const msg = require("../util/message");

exports.getAbout = async (req, res, next) => {
    const categories = await Category.find()

    return res.render(`shop/aboutus`, {
        path: '/about',
        categories: categories,
        pageTitle: 'About',
        isAdmin: req.session.isAdmin,
        isAuthenticated: req.session.isLoggedIn,

    })
}

exports.contact = async (req, res, next) => {
    const msgs = msg(req, res)

    const categories = await Category.find()

    return res.render(`shop/contact`, {
        path: '/contact',
        categories: categories,
        pageTitle: 'Contact Us',
        errmsg: msgs.err,
        succmsg: msgs.success,
        isAdmin: req.session.isAdmin,
        isAuthenticated: req.session.isLoggedIn,

    })
}
exports.policy = async (req, res, next) => {
    const categories = await Category.find()

    return res.render(`shop/policy`, {
        path: '/Policy',
        categories: categories,
        pageTitle: 'Policy',
        isAdmin: req.session.isAdmin,
        isAuthenticated: req.session.isLoggedIn,

    })
}
exports.getHelpCenter = async (req, res, next) => {
    res.render(`${req.session.lang || 'en'}/public/helpcenter.ejs`, {
        pageTitle: 'Help Center',
        path: '/helpcenter',
        company: req.session.company,
        isAuth: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin,
        isAuthenticated: req.session.isLoggedIn,


    })
}




exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        return res.redirect("/");
    });
};