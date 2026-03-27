const Cart=require('../models/cart')
const {StatusCodes}=require('http-status-codes')
const Product=require('../models/product')

const addtocart=async(req,res)=>{
    const {productId,quantity}=req.body
    const userId=req.user.userId
    if (!productId) {
  return res.status(400).json({ message: "productId is required" });
}

    let cart=await Cart.findOne({user:userId})
    if(!cart)
    {
          cart= new Cart({
            user:userId,
            items:[{product:productId,quantity}]
        })
    }
    else{
        const itemIndex=cart.items.findIndex(
            (item)=>item.product.toString()===productId
        )
        if(itemIndex>-1)
        {
            cart.items[itemIndex].quantity+=quantity
        }
        else{
            cart.items.push({product:productId,quantity})
        }
    }
    await cart.save();
    res.status(StatusCodes.OK).json(cart)
}

const getcart=async(req,res)=>{
    const userId=req.user.userId
    const cart= await Cart.findOne({user:userId}).populate("items.product","name price image")
    if(!cart){
        return res.status(StatusCodes.OK).json({items:[],totalprice:0})
    }
    const validItems=cart.items.filter(item => item.product)
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }
    const totalprice=cart.items.reduce((total,item)=>total+item.product.price*item.quantity,0)
    res.status(StatusCodes.OK).json({items:cart.items,totalprice})
}
const updatecart=async(req,res)=>{
    const userId=req.user.userId
    const {productId}=req.params
    const {quantity}=req.body
    if(quantity<1)
    {
        return res.status(StatusCodes.BAD_REQUEST).json({msg:"Quantity msut be 1"})

    }
    const cart= await Cart.findOne({user:userId})
    if(!cart)
    {
        return res.status(StatusCodes.BAD_REQUEST).json({msg:"Cart not found"})
    }
    const itemIndex= cart.items.findIndex((item)=>item.product.toString()===productId)
    if(itemIndex==-1)
    {
        return res.status(StatusCodes.BAD_REQUEST).json({msg:"product not found in cart"})

    }
    cart.items[itemIndex].quantity=quantity
    await cart.save()
    res.status(StatusCodes.OK).json(cart)

}

const deletecart=async(req,res)=>{
    const userId=req.user.userId
    const {productId}=req.params

    const cart= await Cart.findOne({user:userId})
    if(!cart)
    {
        return res.status(StatusCodes.BAD_REQUEST).json({msg:"Cart not found"})
    }
    const initialLength=cart.items.length

    cart.items= cart.items.filter((item)=>item.product.toString()!==productId)
    if(cart.items.length===initialLength)
    {
        return res.status(StatusCodes.BAD_REQUEST).json({msg:"Product not found in cart"})
    }
   
    await cart.save()
    res.status(StatusCodes.OK).json({msg:"Product removed from cart"})

}



module.exports={addtocart,getcart,updatecart,deletecart}