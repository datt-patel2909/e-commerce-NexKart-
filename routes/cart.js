const express=require('express')
const router=express.Router()
const{auth}=require('../middleware/authentication')
const{addtocart,getcart,updatecart,deletecart}=require('../controllers/cart')

router.post('/',auth,addtocart)
router.get('/',auth,getcart)
router.put('/:productId',auth,updatecart)
router.delete('/:productId',auth,deletecart)

module.exports=router