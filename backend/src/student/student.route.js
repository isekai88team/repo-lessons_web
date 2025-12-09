const express = require('express')
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware")
const { loginStudent } = require('./student.controller')

router.post("/login",loginStudent)


module.exports = router