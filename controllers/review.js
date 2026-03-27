const { StatusCodes } = require('http-status-codes');
const Review = require('../models/Review');
const Product = require('../models/product');
const { BadRequestError, NotFoundError } = require('../errors/index');

const createReview = async (req, res) => {
  const { product: productId } = req.body;

  const isValidProduct = await Product.findById(productId);
  if (!isValidProduct) {
    throw new NotFoundError(`No product with id : ${productId}`);
  }

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (alreadySubmitted) {
    throw new BadRequestError('Already submitted review for this product');
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);

  res.status(StatusCodes.CREATED).json({ review });
};

const getProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId }).populate({
    path: 'user',
    select: 'name role',
  });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = { createReview, getProductReviews };
