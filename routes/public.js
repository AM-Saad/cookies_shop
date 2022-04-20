const express = require("express");
const publicControllers = require("../controllers/public");

const router = express.Router();

// router.get('/',  checkAuth, publicControllers.getHome)
router.get('/about', publicControllers.getAbout)
router.get('/contact', publicControllers.contact)
router.get('/policy', publicControllers.policy)
router.get('/helpcenter', publicControllers.getHelpCenter)
// router.get('/login', publicControllers.getLogin)
router.get('/logout', publicControllers.postLogout)

module.exports = router;