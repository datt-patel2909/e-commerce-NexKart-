const Order=require('../models/order')
const Product=require('../models/product')
const Cart=require('../models/cart')
const { StatusCodes } = require('http-status-codes')

const placeOrder=async(req,res)=>{
    const userId=req.user.userId

    const cart=await Cart.findOne({user:userId}).populate("items.product")
    if(!cart|| cart.items.length===0)
    {
        return res.status(StatusCodes.BAD_REQUEST).json({msg:"Cart is empty"})
    }
    let totalprice=0
    for(const item of cart.items){
        const product=item.product
        if(product.stock<item.quantity)
        {
            return res.status(StatusCodes.BAD_REQUEST).json({msg:`Not enough stock for ${product.name}. Available: ${product.stock},requested: ${item.quantity}`})
        }
       
        product.stock-=item.quantity
        await product.save()
        totalprice+=product.price*item.quantity
    }

    const order=new Order({
        user:userId,
        items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
    }))
,
        totalPrice:totalprice
    })
    await order.save()

    cart.items=[]
    await cart.save()
    res.status(StatusCodes.OK).json({msg:"Order placed successfully",order})
}

const getOrder=async(req,res)=>{
    try {
         const order= await Order.find({user:req.user.userId}).populate("items.product")
    res.status(StatusCodes.OK).json({count:order.length,order})
    
    } catch (error) {
        
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"Error in fetching Order"})
    }
}

const getALlOrder=async(req,res)=>{
try {
    const order= await Order.find().populate("user","name email").populate("items.product")
    res.status(StatusCodes.OK).json({count:order.length,order})
} catch (error) {
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"Error in fetching all Order"})
}
}

const updateOrderstatus=async(req,res)=>{
    try {
            const{id}=req.params
    const{status}=req.body
  const  validStatus=["pending","shipped","delivered","cancelled"]
    if(!validStatus.includes(status))
    {
        return res.status(StatusCodes.BAD_REQUEST).json({msg:"Invalid Status value"})
    }
    const order= await Order.findByIdAndUpdate(id,{status},{new:true})
    if(!order){
        return res.status(StatusCodes.BAD_REQUEST).json({msg:"Order not found"})
    }
    res.status(StatusCodes.OK).json({msg:"Order status updated",order})

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"Error updating status",error:error.message})
    }
}
const buyNow = async (req, res) => {
  const userId = req.user.userId;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Product and valid quantity required"
    });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(StatusCodes.NOT_FOUND).json({
      msg: "Product not found"
    });
  }

  if (product.stock < quantity) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Not enough stock"
    });
  }

  product.stock -= quantity;
  await product.save();

  const order = await Order.create({
    user: userId,
    items: [
      {
        product: productId,
        quantity
      }
    ],
    totalPrice: product.price * quantity,
    status: "pending"
  });

  res.status(StatusCodes.CREATED).json({ order });
};

module.exports={placeOrder,getOrder,getALlOrder,updateOrderstatus,buyNow}