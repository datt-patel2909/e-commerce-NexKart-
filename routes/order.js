const express=require("express")
const router=express.Router()
const {auth,authorizeroles}=require("../middleware/authentication")
const {placeOrder,getOrder,getALlOrder,updateOrderstatus}=require("../controllers/order")
const { buyNow } = require("../controllers/order");

router.post("/buy-now", auth, buyNow);
router.post('/',auth,placeOrder)
router.get('/my',auth,getOrder)
router.get('/',auth,authorizeroles("admin"),getALlOrder)
router.put('/:id',auth,authorizeroles("admin"),updateOrderstatus)

module.exports=router
