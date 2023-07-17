const express = require('express');
const path = require('path');

const adminController = require('../controllers/admin');

const router = express.Router();

router.post('/add-product', adminController.postAddProduct);
router.get('/add-product', adminController.getAddProduct);
router.get('/products', adminController.getAdminProducts);
router.get('/edit-product/:productID', adminController.getEditProduct);
router.post('/edit-product', adminController.postEditProduct);
// router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;