const {StatusCodes}=require('http-status-codes')
const Product=require('../models/product')

const addproduct = async (req, res) => {
  const { name, price, stock, category, image } = req.body;

  if (price < 1) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Price must be at least 1" });
  }

  if (stock < 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Stock cannot be negative" });
  }

  const validCategories = ["electroincs","fashion","home","books","other"];
  if (category && !validCategories.includes(category)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Please select category from: electroincs, fashion, home, books, other"
    });
  }

  const existing = await Product.findOne({ name });
  if (existing) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Product already exists" });
  }

  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};


const getAllproduct=async(req,res)=>{
  try {
    const {search,category,minPrice,maxPrice,sort,page=1,limit=10}=req.query
        const query={}

        if(search){
            query.name={$regex:search,$options:"i"}
        }

        if(category){
            query.category=category
        }

        if(minPrice||maxPrice){
            query.price={}
            if(minPrice) query.price.$gte=Number(minPrice)
            if(maxPrice) query.price.$lte=Number(maxPrice)
        }

        let sortOption={}
        if(sort){
            const sortFields=sort.split(",")
            sortFields.forEach((field)=>{
                if(field.startsWith("-")){
                    sortOption[field.substring(1)]=-1
                }
                else{
                    sortOption[field]=1
                }
            })
        }
        else{
            sortOption={createdAt:-1}
        }

        const pageNum=parseInt(page,10)
        const limitNum=parseInt(limit,10)
        const skip=(pageNum-1)*limitNum

        const products=await Product.find(query)
          .sort(sortOption)
          .skip(skip)
          .limit(limitNum)

        const totalProducts=await Product.countDocuments(query)

        res.status(StatusCodes.OK).json({
            totalProducts,
            page:pageNum,
            totalPages:Math.ceil(totalProducts/limitNum)||1,
            products
        })
    
  } catch (error) {
    res.status(500).json({msg:error.message})
  }
}

const getproduct=async(req,res)=>{
    const product= await Product.findById(req.params.id)
    if(!product){
        return res.status(StatusCodes.NOT_FOUND).json({msg:"Product Not Found"})
    }
    res.status(StatusCodes.OK).json({product})
}

const updateproduct = async (req, res) => {
  const { price, stock, category } = req.body;

  if (price !== undefined && price < 1) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Price must be at least 1" });
  }

  if (stock !== undefined && stock < 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Stock cannot be negative" });
  }

  const validCategories = ["electroincs","fashion","home","books","other"];
  if (category && !validCategories.includes(category)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Please select valid category"
    });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: "Product Not Found" });
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteproduct=async(req,res)=>{
    const product= await Product.findByIdAndDelete(req.params.id)
    if(!product){
        return res.status(StatusCodes.NOT_FOUND).json({msg:"Product Not Found"})
    }
    res.status(StatusCodes.OK).json({msg:"Product Sucessfully Deleted"})
}

module.exports={getproduct,getAllproduct,updateproduct,deleteproduct,addproduct}
