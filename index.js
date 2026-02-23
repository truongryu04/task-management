const express = require('express')
require('dotenv').config()
const database = require("./config/database")
const routesApiVer1 = require("./api/v1/routes/index.route")
const bodyParser = require('body-parser')
const cors = require('cors')
// Kết nối database
database.connect()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
// Middleware parse JSON & form-data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use(bodyParser.json)

// Khai báo routes v1
routesApiVer1(app)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})