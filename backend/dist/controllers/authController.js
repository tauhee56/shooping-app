"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.followUser = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        let user = await User_1.default.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        user = new User_1.default({
            name,
            email,
            password,
            phone,
        });
        await user.save();
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: 'JWT secret not configured' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, jwtSecret, {
            expiresIn: '30d',
        });
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Type assertion for correct method access
        const userDoc = user;
        const isMatch = await userDoc.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: 'JWT secret not configured' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, jwtSecret, {
            expiresIn: '30d',
        });
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                isStore: user.isStore,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.userId)
            .populate('followers', 'name profileImage')
            .populate('following', 'name profileImage');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { name, bio, profileImage } = req.body;
        let user = await User_1.default.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.name = name || user.name;
        user.bio = bio || user.bio;
        user.profileImage = profileImage || user.profileImage;
        await user.save();
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateProfile = updateProfile;
const followUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = await User_1.default.findById(req.user.userId);
        const targetUser = await User_1.default.findById(userId);
        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Convert ObjectId arrays to string for comparison
        const followingIds = currentUser.following.map(f => f.toString());
        const followerIds = targetUser.followers.map(f => f.toString());
        if (!followingIds.includes(userId)) {
            currentUser.following.push(userId);
        }
        if (!followerIds.includes(req.user.userId)) {
            targetUser.followers.push(req.user.userId);
        }
        await currentUser.save();
        await targetUser.save();
        res.json({ message: 'User followed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.followUser = followUser;
