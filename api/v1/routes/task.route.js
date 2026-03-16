const express = require('express');
const router = express.Router()
const controller = require("../controller/task.controller")
const { verifyToken } = require("../middlewares/auth.middleware");


router.get('/', verifyToken, controller.index)
router.get('/detail/:id', verifyToken, controller.detail)
router.patch('/change-status/:id', verifyToken, controller.changeStatus)
router.patch('/change-multi', verifyToken, controller.changeMulti)
router.post('/create', verifyToken, controller.create)
router.patch('/edit/:id', verifyToken, controller.edit)
router.delete('/delete/:id', verifyToken, controller.delete)
router.get('/calendar', verifyToken, controller.getCalendarTasks)



module.exports = router;