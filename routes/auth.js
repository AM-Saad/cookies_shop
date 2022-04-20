const express = require('express');

const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/signWithGoogle', authController.getSignWithGoogle);

router.get('/login', authController.getLogin);
router.post('/login', [
    body('email')
        .isEmail()
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .isAlphanumeric()
        .trim()
], authController.postLogin);

router.get('/logout', authController.postLogout);

router.get('/signup', authController.getSignUp);

router.post('/signup',
    [

        body('name', 'Enter Your Name')
            .isLength({ min: 1 }),
        body('mobile', 'Mobile should be only numbers ')
            .isNumeric()
            .trim(),
        body('password', 'Please Enter password with only number and text and at least 8 characters')
            .isLength({ min: 8 })
            .isAlphanumeric()
            .trim(),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password has to match!')
            }
            return true
        })
    ], authController.postSignup
);


router.get('/reset', authController.getResetPass);
router.post('/reset', authController.postResetPass);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

router.get('/thanks', authController.getThanks);

router.get('/verfiy/:token', authController.getVerify);
router.post('/verfiy', authController.postVerify);

module.exports = router;