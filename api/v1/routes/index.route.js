const express = require('express');
const taskRouter = require("./task.route")
module.exports = (app) => {
    app.use("/api/v1/tasks", taskRouter)

}