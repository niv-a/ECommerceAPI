const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fetchUser = require('../../middleware/fetchuser');
const Cart = require('../../models/Cart');

// ALL ROUTES REQUIRE AUTH & AUTH-TOKEN IN HEADER

// ROUTE 1 : GETTING CART ITEMS "/api/cart/getcart"
router.get('/getcart', fetchUser, async (req, res) => {
    try {
        const cart = await Cart.find({ user: req.user.id })
        if (!cart) {
            return res.status(400).send("Cart doesn't exist")
        }
        res.json(cart);
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

// ROUTE 2 : ADDING CART ITEMS "/api/cart/additemtocart"
router.post('/additemtocart', fetchUser, async (req, res) => {
    try {
        const cart = await Cart.find({ user: req.user.id })
        if (!cart) {
            return res.status(400).send("Cart doesn't exist")
        }
        // console.log(cart);
        const { productId, name, price, quantity, image } = req.body;

        const item = {
            productId, name, price, quantity, image
        }
        // console.log(item);
        await cart[0].cartitems.push(item);
        cart[0].save();

        res.json(cart);
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

// ROUTE 3 : DELETING ITEMS IN CART "/api/cart/deletecartitems/:itemId"
router.delete('/deletecartitems/:itemId', fetchUser, async (req, res) => {
    try {
        const cart = await Cart.find({ user: req.user.id })
        if (!cart) {
            return res.status(400).send("Cart doesn't exist")
        }

        await cart[0].cartitems.pull({ _id: req.params.itemId });
        cart[0].save();

        res.json(cart);
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

// ROUTE 4 : INCREASING ITEM QUANTITY "/api/cart/increasequantity/:itemId"
router.put('/increasequantity/:itemId', fetchUser, async (req, res) => {
    try {
        let cart = await Cart.find({ user: req.user.id })
        if (!cart) {
            return res.status(400).send("Cart doesn't exist")
        }

        await Cart.updateOne({ user: req.user.id, 'cartitems._id': req.params.itemId }, { $inc: { "cartitems.$.quantity": 1 } })

        cart = await Cart.find({ user: req.user.id })
        res.json(cart);
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

// ROUTE 5 : DECREASING THE QUANTITY "/api/cart/decreasequantity/:itemId"
router.put('/decreasequantity/:itemId', fetchUser, async (req, res) => {
    try {
        let cart = await Cart.find({ user: req.user.id })
        if (!cart) {
            return res.status(400).send("Cart doesn't exist")
        }

        await Cart.updateOne({ user: req.user.id, 'cartitems._id': req.params.itemId }, { $inc: { "cartitems.$.quantity": -1 } })

        cart = await Cart.find({ user: req.user.id })
        res.json(cart);
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})


module.exports = router;