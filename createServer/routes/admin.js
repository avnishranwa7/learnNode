const express = require('express');

const { check } = require('express-validator');

const isAuth = require('../middleware/is-auth');
const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', isAuth, adminController.getAdminProducts);

router.get('/edit-product/:productID', isAuth, adminController.getEditProduct);
router.post('/add-product', isAuth,
    [
        check('title', 'Title can only contain letters and numbers and minimum length should be 3').isString().isLength({ min: 3 }).trim(),
        check('imageUrl').isURL().withMessage('Please enter a valid URL for image'),
        check('price').isFloat().withMessage('Please enter price of the product'),
        check('description', 'Description length should be between 5 and 400 characters').isLength({ min: 5, max: 400 }).trim()
    ],
    adminController.postAddProduct);

router.post('/edit-product', isAuth, 
    [
        check('title', 'Title can only contain letters and numbers').isString().isLength({ min: 3 }).trim(),
        check('imageUrl').isURL().withMessage('Please enter a valid URL for image'),
        check('price').isFloat().withMessage('Please enter price of the product'),
        check('description', 'Description length should be between 5 and 400 characters').isLength({ min: 5, max: 400 }).trim()
    ],
    adminController.postEditProduct);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;