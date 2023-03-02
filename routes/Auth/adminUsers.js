const express = require('express');
const router = express.Router();
const fetchUser = require('../../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const User = require('../../models/User');

// ROUTE 1 : LIST ALL USERS "/api/admin/users/listusers" | AUTH NEEDED | AUTH TOKEN NEEDED IN HEADER

router.post('/listusers', fetchUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.admin === false) {
            return res.status(401).json({ error: 'Sorry you are not allowed to do this' })
        }
        let users = await User.find({ admin: false });
        res.json(users)
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

// ROUTE 2 : BLOCK USER "/api/admin/users/blockUser/:userId" | AUTH NEEDED | AUTH TOKEN NEEDED IN HEADER

router.post('/blockUser/:userId', fetchUser, async (req, res) => {
    try {
        const newUser = {
            blocked: true
        }
        let user = await User.findById(req.user.id);
        if (user.admin === false) {
            return res.status(401).json({ error: 'Sorry you are not allowed to do this' })
        }
        user = await User.findByIdAndUpdate(req.params.userId, { $set: newUser }, { new: true });
        res.json({ success: "User is blocked" })
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

// ROUTE 3 : UNBLOCK USER /api/admin/users/unblockUser/:userId | AUTH NEEDED | AUTH TOKEN NEEDED IN HEADER

router.post('/unblockUser/:userId', fetchUser, async (req, res) => {
    try {
        const newUser = {
            blocked: false
        }
        const user = await User.findById(req.user.id);
        if (user.admin === false) {
            return res.status(401).json({ error: 'Sorry you are not allowed to do this' })
        }
        await User.findByIdAndUpdate(req.params.userId, { $set: newUser }, { new: true });
        res.json({ success: "User is unblocked successfully" })
    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
})

module.exports = router