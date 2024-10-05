const express = require("express");
const router = express.Router();
const db = require('./queries');
const { authMiddleware } = require("./middleware");

router.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

//signin signup
router.post('/signup', db.signup);
router.post('/signin', db.signin);
router.get('/JWTVerifier', authMiddleware, db.JWTVerifier);
router.post('/upload-photo',authMiddleware,db.uploadPhoto)
router.post('/saveImageDb', authMiddleware,db.saveImageDb);
router.get('/getImageURI', authMiddleware,db.getImageURI);
router.delete('/deleteImage', authMiddleware,db.deleteImage);

module.exports = router