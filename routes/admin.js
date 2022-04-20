const path = require('path');

const express = require('express');

const { check, body } = require('express-validator/check');

const adminController = require('../controllers/admin');

const isAdmin = require('../middleware/is-admin');

const router = express.Router();



router.get('/dashboard', isAdmin, adminController.dashboard);
router.get('/', adminController.getLogin);
router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/logout', adminController.postLogout);


router.get('/inventory', isAdmin, adminController.inventory)



router.get('/api/items', isAdmin, adminController.products)
router.post('/api/items', isAdmin, isAdmin, adminController.createProduct)
router.delete('/api/items/:id', isAdmin, adminController.deleteProduct)
router.put('/api/items/images/:id', isAdmin, adminController.editProductImage)

router.put('/api/items/:id', isAdmin, adminController.editProduct)




router.get('/orders', isAdmin, adminController.orders);
router.get('/api/orders', isAdmin, adminController.getOrders);
router.get('/api/orders/:id', isAdmin, adminController.getOrder);

// router.post('/api/orders', isAdmin, adminController.createOrder);
router.put('/api/orders/:id', isAdmin, adminController.editOrder);
router.put('/api/orders/status/:id', isAdmin, adminController.changeStatus);
router.delete('/api/orders/:id', isAdmin, adminController.deleteOrder);

router.get('/orders/new', adminController.createOrderPage)
router.post('/api/orders/new', adminController.createOrder)


router.get('/orders/edit/:id', adminController.editOrderPage)
// router.post('/api/orders/new', adminController.createOrder)


router.get('/category', isAdmin, adminController.category);
router.get('/api/category', isAdmin, adminController.getCategory);
router.post('/api/category', isAdmin, adminController.createCategory);
router.put('/api/category/:id', isAdmin, adminController.editCategory);
router.delete('/api/category/:id', isAdmin, adminController.deleteCategory);



router.get('/customers', isAdmin, adminController.customers);
router.get('/api/customers', isAdmin, adminController.getCustomers);
router.post('/api/customers', isAdmin, adminController.createCustomer);
// router.put('/api/customers/assign/:id', isAdmin, adminController.assignShipment);
router.get('/api/customers/orders/:id', isAdmin, adminController.customerOrders);
router.put('/api/customers/:id', isAdmin, adminController.editCustomer);
router.delete('/api/customers/:id', isAdmin, adminController.deleteCustomer);



router.get('/promos/', adminController.getPromos)
router.get('/api/promos/', isAdmin, adminController.promos)
router.post('/api/promos/', isAdmin, adminController.createPromo)
router.put('/api/promos/:id', isAdmin, adminController.editPromo)
router.delete('/api/promos/:id', isAdmin, adminController.deletePromo)





router.get('/zones', isAdmin, adminController.zones);
router.get('/api/zones', isAdmin, adminController.getZones);
router.post('/api/zones', isAdmin, adminController.createZone);
router.delete('/api/zones/:id', isAdmin, adminController.deleteZone);
router.put('/api/zones/:id', isAdmin, adminController.editZone);





router.get('/settings', isAdmin, adminController.settings);
router.post('/settings/info', isAdmin, adminController.updateInfo);
router.post('/settings/password', isAdmin, adminController.changePassword);
router.post('/settings/new-admin', isAdmin, adminController.newAdmin);



router.get('/reports', isAdmin, adminController.reports);




module.exports = router;
