const express=require('express');
const router=express.Router();

const {login,register,googleLogin,googleSignup}=require('../controllers/auth')

router.post('/login',login)
router.post('/register',register)
router.post('/google/login',googleLogin)
router.post('/google/signup',googleSignup)
module.exports=router