const express=require('express');
const app=express()
require('dotenv').config();


//security packages 
const helmet=require('helmet')
const cors=require('cors')
const rateLimiter=require('express-rate-limit')



const authrouter=require('./routes/auth');
const connectDB = require('./db/connect');
const productRouter=require('./routes/product')
const cartRouter=require('./routes/cart')
const orderRouter=require('./routes/order')

app.use(rateLimiter({
    windowMs: 15 * 60 * 1000, 
	limit: 100,
}))
app.use(express.json())
app.use(express.static('./public'))
app.use(helmet())
app.use(cors())
app.use('/api/v1/auth',authrouter)
app.use('/api/v1/product',productRouter)
app.use('/api/v1/cart',cartRouter)
app.use('/api/v1/order',orderRouter)

const port = process.env.Port || 3000
const start= async()=>{
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port,()=>{
            console.log(`Server is listening on port ${port}...`)
        })
    } catch (error) {
        console.log(error)
    }
}
start()