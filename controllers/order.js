const Order=require('../models/order')
const Product=require('../models/product')
const Cart=require('../models/cart')
const { StatusCodes } = require('http-status-codes')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
        })),
        totalPrice:totalprice
    })
    await order.save()

    const lineItems = cart.items.map(item => ({
        price_data: {
            currency: 'inr',
            product_data: {
                name: item.product.name,
                images: item.product.image ? [item.product.image] : [],
            },
            unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
    }));

    const baseUrl = req.get('origin') || `http://localhost:3000`;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/orders?success=true`,
        cancel_url: `${baseUrl}/cart?canceled=true`,
        client_reference_id: order._id.toString(),
    });

    cart.items=[]
    await cart.save()
    res.status(StatusCodes.OK).json({ url: session.url })
}

const getOrder=async(req,res)=>{
    try {
         const order= await Order.find({user:req.user.userId}).populate("items.product").sort({ createdAt: -1 })
    res.status(StatusCodes.OK).json({count:order.length,order})
    
    } catch (error) {
        
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"Error in fetching Order"})
    }
}

const getALlOrder=async(req,res)=>{
try {
    const order= await Order.find().populate("user","name email").populate("items.product").sort({ createdAt: -1 })
    res.status(StatusCodes.OK).json({count:order.length,order})
} catch (error) {
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
    const existingOrder = await Order.findById(id)
    if(!existingOrder){
        return res.status(StatusCodes.BAD_REQUEST).json({msg:"Order not found"})
    }
    if(existingOrder.status === "delivered"){
        return res.status(StatusCodes.BAD_REQUEST).json({msg:"Order already delivered. Status cannot be changed."})
    }
    existingOrder.status = status
    await existingOrder.save()
    res.status(StatusCodes.OK).json({msg:"Order status updated",order: existingOrder})

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

  const baseUrl = req.get('origin') || `http://localhost:3000`;

  const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
          {
              price_data: {
                  currency: 'inr',
                  product_data: {
                      name: product.name,
                      images: product.image ? [product.image] : [],
                  },
                  unit_amount: Math.round(product.price * 100),
              },
              quantity: quantity,
          }
      ],
      mode: 'payment',
      success_url: `${baseUrl}/orders?success=true`,
      cancel_url: `${baseUrl}/product/${productId}?canceled=true`,
      client_reference_id: order._id.toString(),
  });

  res.status(StatusCodes.OK).json({ url: session.url });
};

const cancelOrder = async (req, res) => {
  const userId = req.user.userId;
  const { id: orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "Order not found or unauthorized to cancel" });
    }

    if (order.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: `Cannot cancel order with status: ${order.status}` });
    }

    // Restore stock inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.status(StatusCodes.OK).json({ msg: "Order cancelled successfully", order });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Error cancelling order", error: error.message });
  }
};

module.exports={placeOrder,getOrder,getALlOrder,updateOrderstatus,buyNow,cancelOrder}