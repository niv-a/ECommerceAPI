const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../../middleware/fetchuser');
const Cart = require('../../models/Cart');

const JWT_SECRET = "teetarkeaageteetar"

// ROUTE 1 : CREATING THE USER "/api/auth/register" | DOESN'T REQUIRE AUTH

router.post('/register', [
    body('name', 'Name length must be greater than 2').isLength({ min: 2 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password length must be more than 5').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    // CHECKING FOR THE ERRORS
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // CHECKING IF A USER WITH EMAIL ALREADY EXISTS
        let user = await User.findOne({ email: req.body.email })

        // CREATING A NEW USER
        if (user) {
            return res.status(400).json({ error: 'Sorry user with this email already exists' })
        }

        // GENERATING THE SALT
        const salt = await bcrypt.genSalt(10);
        let secPassword = await bcrypt.hash(req.body.password, salt);

        // CREATING A USER IN DB
        user = await User.create({
            name: req.body.name,
            password: secPassword,
            email: req.body.email
        })

        const data = {
            user: {
                id: user._id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        // console.log(jwt_data);

        await Cart.create({
            user: user._id
        })

        return res.json({ authToken });

    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

// ROUTE 2 :  LOGGING IN USER "/api/auth/login" | DOESN'T REQUIRE AUTH

router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {

    const errors = validationResult(req);
    // CHECKING FOR THE ERRORS
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {

        // CHECKING IF A USER EXISTS OR NOT
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: "Please try to log in with correct password" })
        }

        if (user.blocked === true) {
            return res.status(401).json({ error: "Sorry you are Blocked" })
        }

        // CHECKING IF ENTERED PASSWORD IS CORRECT OR NOT
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to log in with correct password" })
        }

        const payload = {
            user: {
                id: user._id
            }
        }
        const authToken = await jwt.sign(payload, JWT_SECRET);
        return res.send({ authToken });

    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }

})

// ROUTE 3 : GET LOGGED IN USER DETAILS "/api/auth/getuser" | LOGIN REQUIRED | AUTH TOKEN REQUIRED IN HEADERS
router.post('/getuser', fetchUser, async (req, res) => {
    try {
        let userID = req.user.id;
        const user = await User.findById(userID).select("-password");
        res.send(user);
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})


// ROUTE 4 : CHANGE CREDENTIALS "/api/auth/changecredentials" | AUTH REQUIRED
router.post('/changecredentials', fetchUser, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newCreds = {
            name, email
        };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            let secPassword = await bcrypt.hash(password, salt);
            newCreds.password = secPassword
        }

        let user = await User.findById(req.user.id);
        user = await User.findByIdAndUpdate(req.user.id, { $set: newCreds }, { new: true })

        user = await User.findById(req.user.id);
        res.json(user);

    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

// ROUTE 5 : DELETE THE ACCOUNT "/api/auth/deleteaccount" | AUTH REQUIRED
router.delete('/deleteaccount', fetchUser, async (req, res) => {
    try {
        let user = await User.findById(req.user.id);

        const { email, password } = req.body;

        if (email !== user.email) {
            return res.status(400).json({ error: "Please try with correct credentials" })
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try with correct credentials" })
        }

        await User.findByIdAndDelete(user.id);
        res.json({ success: "User deleted successfully" })
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})



module.exports = router;
