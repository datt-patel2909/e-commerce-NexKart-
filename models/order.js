const mongoose=require('mongoose')
const { type } = require('os')

const orderSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true
    },
    items:[{
         product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"product",
            require:true
        },
        quantity:{
            type:Number,
            require:true,
            min:1
        } }
    
       
    ],
    totalPrice:{
        type:Number,
        require:true
        
    } ,
    status:{
        type:String,
        enum:["pending","shipped","delivered","cancelled"],
        default:"pending"
    }   
},{timestamps:true})

module.exports=mongoose.model("Order",orderSchema)