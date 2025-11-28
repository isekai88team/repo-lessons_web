const express = require("express");
const { postUser, loginUser } = require("./auth.controller");

const router = express.Router();

//Register Route
router.post("/register",postUser)
router.post("/login",loginUser)

module.exports = router;