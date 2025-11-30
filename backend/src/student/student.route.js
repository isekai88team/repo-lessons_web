const express = require('express')

const router = express.Router
const authMiddleware = require("../middlewares/auth.middleware")

router.post("/login",authMiddleware,)


module.exports = router