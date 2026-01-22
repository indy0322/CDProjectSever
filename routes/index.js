const router = require("express").Router()
const controller = require('../controller/api')
const multer = require('multer')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
})

router.get("/node", controller.apiNode)

router.post("/nodetest", controller.apiNodeTest)

router.post("/login", controller.apiLogin)

router.get("/auth", controller.auth, controller.apiAuth)

router.post("/register", controller.apiRegister)

router.post('/changepassword', controller.apiChangePassword)

router.post('/changelang', controller.apiChangeLang)

router.post("/reviewregister", controller.apiReviewRegister)

router.post('/authnumber',controller.apiAuthNumber)

router.post('/audio', controller.apiAudio)

router.post('/speech/stt', upload.single('file'), controller.apiSpeechToText)

router.post('/latlng',controller.apiChangeLatLng)

router.post('/reviewinfo',controller.apiReviewInfo)

router.post('/reviewremove',controller.apiReviewRemove)

router.post('/wishregister',controller.apiWishRegister)

router.post('/wishremove',controller.apiWishRemove)

router.post('/wishremove2',controller.apiWishRemove2)

router.post('/wishinfo',controller.apiWishInfo)

router.get('/tour/search', controller.apiTourSearch)

router.post('/tour/explain', controller.apiTourExplain)


module.exports = router;



