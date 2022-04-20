const Category = require("../models/Category");

exports.get404 = async (req, res, next) => {
  const categories = await Category.find()

  return res.status(404).render('404', { pageTitle: 'Page Not Found', path: '/404', categories: categories });
};

exports.get500 = (req, res, next) => {
  return res.status(500).render('500', { pageTitle: 'Error Occurred!!', path: '/500', })
}