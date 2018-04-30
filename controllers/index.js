var express = require('express')
var router = express.Router()

router.use('/api/user', require('./user'))

module.exports = router