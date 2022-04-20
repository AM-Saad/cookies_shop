const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const isAuth = require('../middleware/shop-is-auth.js');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/shop', shopController.getProducts);

router.get('/products/:category', shopController.getCategory);

router.get('/product-details/:productId', shopController.getProduct);

router.get('/cart',  shopController.getCart);
router.post('/search', shopController.searchPost);




router.get('/checkout', shopController.getCheckout);
router.get('/checkout', shopController.getCheckout);

router.post('/orders', shopController.postCreateSales);

router.get('/my-account/orders', isAuth, shopController.getOrders);
router.get('/my-account/settings', isAuth, shopController.accountSettings);

router.post('/account-settings/info', isAuth, shopController.updateInfo);
router.post('/account-settings/password', isAuth, shopController.changePassword);
// router.get('/checkout/success', shopController.getCheckoutSuccess);

// router.get('/checkout/cancel', shopController.getCheckout);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);


router.post('/message', shopController.postSubscribe);


module.exports = router;