const express = require('express');
const Product = require('../../models/Product');
const Review = require('../../models/Review');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fetchUser = require('../../middleware/fetchuser');

// ROUTE 1 : GETTING THE REVIEWS FOR THE PRODUCT "/api/review/getreview/:productId" | DOESN'T REQUIRE AUTHENTICATION

router.get('/getreview/:productId', async (req, res) => {
    try {
        const productid = req.params.productId;
        const product = await Product.findById(productid);
        if (!product) {
            return res.status(500).send('No such product or internal server error');
        }
        const reviews = await Review.find({ productId: productid });
        res.json(reviews);
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

// ROUTE 2 : ADDING THE REVIEW TO THE PRODUCT "/api/review/addreview/:productId" | REQUIRES AUTHENTICATION

router.post('/addreview/:productId', fetchUser, [
    body('text', 'Text length must be greater than or equal to 5').isLength({ min: 5 })
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const productid = req.params.productId;

        const product = await Product.findById(productid);
        if (!product) {
            return res.status(500).send('No such product or internal server error');
        }

        const reviewJson = await Review.create({
            user: req.user.id,
            productId: productid,
            username: req.body.username,
            text: req.body.text
        })
        res.json(reviewJson);

    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})


// ROUTE 3 : DELETE THE REVIEW TO THE PRODUCT IF USER OWNS THE REVIEW "/api/review/deletereview/:productId" | REQUIRES AUTHENTICATION

router.post('/deletereview/:reviewId', fetchUser, async (req, res) => {

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const reviewId = req.params.reviewId;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(500).send('No such product or internal server error');
        }
        if (review.user.toString() !== req.user.id) {
            return res.status(401).send('You cannot delete this review');
        }
        await Review.findByIdAndDelete(reviewId);
        res.json({ success: "Review Deleted Successfully" });

    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

module.exports = router