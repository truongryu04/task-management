const express = require('express')
require('dotenv').config()
const database = require("./config/database")
const route = require("./api/v1/routes/index.route")

// Kết nối database
database.connect()

const app = express()
const port = process.env.PORT || 3000

// Middleware parse JSON & form-data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Khai báo routes v1
route(app)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})