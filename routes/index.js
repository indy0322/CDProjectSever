const router = require("express").Router()
const controller = require('../controller/api')

router.get("/node", controller.apiNode)

router.post("/nodetest", controller.apiNodeTest)

router.post("/login", controller.apiLogin)

router.get("/auth", controller.auth, controller.apiAuth)

router.post("/register", controller.apiRegister)

module.exports = router;



