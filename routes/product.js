const express=require('express')
const router=express.Router()
const {auth,authorizeroles}=require('../middleware/authentication')
const{getproduct,getAllproduct,updateproduct,deleteproduct,addproduct}=require('../controllers/product')
const upload = require('../middleware/upload');

router.get('/',getAllproduct)
router.get('/:id',getproduct)
router.put('/:id',auth,authorizeroles("admin"), upload.single('image'), updateproduct)
router.delete('/:id',auth,authorizeroles("admin"),deleteproduct)
router.post('/',auth,authorizeroles("admin"), upload.single('image'), addproduct)

module.exports=router