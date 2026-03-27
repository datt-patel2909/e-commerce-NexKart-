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
const reviewRouter=require('./routes/review')

app.use(rateLimiter({
    windowMs: 15 * 60 * 1000, 
	limit: 500, 
}))
app.use(helmet({
  contentSecurityPolicy: false, // Allows external images/scripts
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false, // Fixes popup blocking
  crossOriginResourcePolicy: false,
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin" // REQUIRED for Google OAuth
  }
}))
app.use(express.json())
app.use(express.static('./public'))
app.use(cors())
const path = require('path');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use('/api/v1/auth',authrouter)
app.use('/api/v1/product',productRouter)
app.use('/api/v1/cart',cartRouter)
app.use('/api/v1/order',orderRouter)
app.use('/api/v1/review',reviewRouter)

// Handle 404 for API routes cleanly with JSON
app.use('/api', (req, res) => res.status(404).json({ msg: 'API Route not found' }));

// Catch-all route to serve React's index.html for unknown routes (used for clientside routing)
app.use((req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Global Error Handler for turning exceptions into clean JSON
app.use(errorHandlerMiddleware);

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