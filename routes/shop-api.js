const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop-api');

// const isAuth = require('../middleware/is-auth');
const isAuth = require('../middleware/api-auth');

const router = express.Router();




router.get('/cart/', shopController.cart);

router.post('/cart/:id', shopController.postCart);


router.put('/cart/:id', shopController.updateQauntity);

router.delete('/cart/:id', shopController.postCartDeleteProduct);
router.post('/cart/promo/:id', shopController.applyPromo);
router.delete('/cart/promo/:id', shopController.removePromo);
router.get('/product/:id', shopController.product);
router.get('/search', shopController.search);


router.post('/product/rate/:id', shopController.rate);
router.post('/product/review/:id', shopController.review);

module.exports = router;
