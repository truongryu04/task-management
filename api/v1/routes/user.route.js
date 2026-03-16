const express = require('express');
const router = express.Router()
const controller = require("../controller/user.controller")
const { verifyToken } = require("../middlewares/auth.middleware");
router.post('/register', controller.register)
router.post('/login', controller.login)
router.post('/password/forgot', controller.forgotPassword)
router.post('/password/otp', controller.otpPassword)
router.post('/password/reset', verifyToken, controller.resetPassword)
router.get('/detail', verifyToken, controller.getDetail)
router.get('/list', verifyToken, controller.listUser)
router.patch('/password/change', verifyToken, controller.changePassword)
router.post('/refresh-token', verifyToken, controller.refreshToken)
router.post('/logout', verifyToken, controller.logout)
module.exports = router;