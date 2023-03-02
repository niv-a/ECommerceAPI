const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const User = require('../../models/User');
const { body, validationResult } = require('express-validator');
const fetchUser = require('../../middleware/fetchuser');

// ROUTE 1 : FETCHING ALL PRODUCTS "/api/product/getallproducts" | DOESN'T REQUIRE AUTH

router.get('/getallproducts', async (req, res) => {
    try {
        // GETTING ALL THE PRODUCTS IN COLLECTION 'products'
        let products = await Product.find();
        // console.log(products);
        res.json(products);
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

// ROUTE 2 : FETCHING ALL PRODUCTS BY CATAGORY "/api/product/fetchbycategory" | DOESN'T REQUIRE AUTH

router.get('/fetchbycategory', [
    body('category', 'Enter a valid category').isLength({ min: 4 })
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const category = req.body.category;
        let products = await Product.find({ category: category });
        console.log(products);
        res.json(products);
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }

})

// ROUTE 3 : LIKING A PRODUCT "/api/product/likeproduct/:productId" | REQUIRES AUTH | REQUIRES PRODUCT ID | REQUIRES AUTH-TOKEN IN HEADER

router.put('/likeproduct/:productId', fetchUser, async (req, res) => {
    try {
        let product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(400).send('Product does not exist or id is wrong');
        }

        const newProduct = {
            likes: product.likes + 1
        }

        const likedProduct = {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            image: product.image
        }

        // ADDING THE LIKED PRODUCT TO THE USER DB
        let user = await User.findById(req.user.id);
        await user.liked.push(likedProduct);
        user.save();

        // UPDATING THE LIKES IN PRODUCT IN DB
        product = await Product.findByIdAndUpdate(req.params.productId, { $set: newProduct }, { new: true });
        res.json(product);

    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

// ROUTE 4 : DISLIKING A PRODUCT "/api/product/dislikeproduct/:id" | REQUIRES AUTH | REQUIRES PRODUCT ID | REQUIRES AUTH-TOKEN IN HEADER

router.put('/dislikeproduct/:id', fetchUser, async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(400).send('Product does not exist or id is wrong');
        }

        const newProduct = {
            dislikes: product.dislikes + 1
        }

        product = await Product.findByIdAndUpdate(req.params.id, { $set: newProduct }, { new: true });
        res.json(product);
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

// ROUTE 5 : ADDING PRODUCT TO WISHLIST "/api/product/addtowishlist/:productId" | REQUIRES AUTH | REQUIRES PRODUCT ID | REQUIRES AUTH-TOKEN IN HEADER

router.put('/addtowishlist/:productId', fetchUser, async (req, res) => {
    try {
        let product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(400).send('Product does not exist or id is wrong');
        }

        const wishlistProduct = {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            image: product.image
        }

        // ADDING THE LIKED PRODUCT TO THE USER DB
        let user = await User.findById(req.user.id);
        await user.wishlist.push(wishlistProduct);
        user.save();

        res.json(user);

    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})


module.exports = router