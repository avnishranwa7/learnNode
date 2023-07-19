const express = require('express');

const isAuth = require('../middleware/is-auth');
const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', isAuth, adminController.getAdminProducts);
router.get('/edit-product/:productID', isAuth, adminController.getEditProduct);
router.post('/add-product', isAuth, adminController.postAddProduct);
router.post('/edit-product', isAuth, adminController.postEditProduct);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;