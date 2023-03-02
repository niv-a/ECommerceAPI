const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const User = require('../../models/User');

const JWT_SECRET = "teetarkeaageteetar"

// ROUTE 1 : CREATING THE ADMIN USER "/api/admin/auth/registerAdmin" | DOESN'T REQUIRE AUTH

router.post('/registerAdmin', [
    body('name', 'name length must be more than 2').isLength({ min: 2 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password length must be more than 5').isLength({ min: 5 }),
    body('key', 'Key length must be larger than or equal to 10').isLength({ min: 10 })
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

        if (req.body.key !== 'ADDADMINFORWEB') {
            return res.status(400).json({ error: 'Wrong Key' })
        }

        // CREATING A USER IN DB
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPassword,
            admin: true
        })

        const data = {
            user: {
                id: user._id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        // console.log(jwt_data);

        return res.json({ authToken });

    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

// ROUTE 2 : CREATING THE ADMIN USER "/api/admin/auth/loginAdmin" | REQUIRES AUTH

router.post('/loginAdmin', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password length must be more than 5').exists()
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

        // CHECKING IF ENTERED PASSWORD IS CORRECT OR NOT
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to log in with correct password" })
        }

        if (user.admin === false) {
            return res.status(405).json({ error: "Not an admin" })
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

// ROUTE 3 : GET LOGGED IN ADMIN DETAILS "/api/admin/auth/getAdmin" | LOGIN REQUIRED | AUTH TOKEN IN HEADER

router.post('/getAdmin', fetchUser, async (req, res) => {
    try {
        let userID = req.user.id;
        const user = await User.findById(userID).select("-password");
        res.send(user);
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})


module.exports = router;