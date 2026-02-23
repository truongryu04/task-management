const express = require('express');
const router = express.Router()
const controller = require("../controller/user.controller")
const { verifyToken } = require("../middlewares/auth.middleware");
router.post('/register', controller.register)
router.post('/login', controller.login)
router.post('/password/forgot', controller.forgotPassword)
router.post('/password/otp', controller.otpPassword)
router.post('/password/reset', verifyToken, controller.resetPassword)
module.exports = router;