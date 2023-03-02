const express = require('express');
const router = express.Router();
const fetchUser = require('../../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const Product = require('../../models/Product');
const User = require('../../models/User');


// ROUTE 1 : GETTING ALL THE PRODUCTS "/api/admin/products/getallproducts"

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


// ROUTE 2 : EDIT THE PRODUCT "/api/admin/products/editProduct/:productId" | SIGN IN REQUIRED | AUTH TOKEN IN HEADER

router.post('/editProduct/:productId', fetchUser, async (req, res) => {
    try {
        const { name, description, price, category, image, quantity } = req.body;

        const newProduct = { name, description, price, category, image, quantity };

        let product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).send("Not Found")
        }

        product = await Product.findByIdAndUpdate(req.params.productId, { $set: newProduct })
        product = await Product.findById(req.params.productId);
        res.json(product);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error Occured")
    }
})

// ROUTE 3 : DELETE THE PRODUCT "/api/admin/products/deleteProduct/:productId" | SIGN IN REQUIRED | AUTH TOKEN IN HEADER

router.post('/deleteProduct/:productId', fetchUser, async (req, res) => {
    try {
        let product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).send("Not Found")
        }

        await Product.findByIdAndDelete(req.params.productId);
        res.json({ success: "product deleted successfully" })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error Occured")
    }
})

// ROUTE 4 : ADD PRODUCT "/api/admin/products/addproduct" | SIGN IN REQUIRED | AUTH TOKEN IN HEADER

router.post('/addproduct', fetchUser, [
    body('name', 'Name length must be greater than 2').isLength({ min: 2 }),
    body('description', 'Description length must be greater than 2').isLength({ min: 10 }),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        let product = await Product.findOne({ name: req.body.name })
        if (product) {
            return res.status(400).json({ error: 'Sorry product with this name already exists' })
        }

        let user = await User.findById(req.user.id);

        if (user.admin === false) {
            return res.status(401).json({ error: 'Sorry you do not have permission' })
        }

        product = await Product.create({
            name: req.body.name,
            description: req.body.description,
            rating: req.body.rating,
            price: req.body.price,
            category: req.body.category,
            image: req.body.image,
            quantity: req.body.quantity
        })

        res.json(product);

    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})


module.exports = router