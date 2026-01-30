"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.firebaseAuth = firebaseAuth;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.followUser = followUser;
exports.uploadProfileImage = uploadProfileImage;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../../../models/User"));
const ApiError_1 = require("../../common/http/ApiError");
const env_1 = require("../../config/env");
const firebaseAdmin_1 = require("../../config/firebaseAdmin");
const crypto_1 = __importDefault(require("crypto"));
const cloudinary_1 = require("cloudinary");
async function registerUser(input) {
    const { name, email, password, phone } = input;
    const exists = await User_1.default.findOne({ email });
    if (exists)
        throw new ApiError_1.ApiError(400, 'User already exists');
    const user = new User_1.default({ name, email, password, phone });
    await user.save();
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, env_1.env.JWT_SECRET, { expiresIn: '30d' });
    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
        },
    };
}
async function loginUser(input) {
    const { email, password } = input;
    const user = await User_1.default.findOne({ email });
    if (!user)
        throw new ApiError_1.ApiError(400, 'Invalid credentials');
    const userDoc = user;
    const isMatch = await userDoc.matchPassword(password);
    if (!isMatch)
        throw new ApiError_1.ApiError(400, 'Invalid credentials');
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, env_1.env.JWT_SECRET, { expiresIn: '30d' });
    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            isStore: user.isStore,
        },
    };
}
async function firebaseAuth(input) {
    const { idToken } = input;
    let decoded;
    try {
        decoded = await (0, firebaseAdmin_1.getFirebaseAuth)().verifyIdToken(idToken);
    }
    catch (err) {
        const e = err;
        const projectId = (0, firebaseAdmin_1.getFirebaseAuth)()?.app?.options?.projectId;
        throw new ApiError_1.ApiError(401, 'Invalid Firebase token', {
            projectId,
            error: {
                code: e?.code,
                message: e?.message,
            },
        });
    }
    const email = decoded?.email;
    if (!email) {
        throw new ApiError_1.ApiError(400, 'Firebase token missing email');
    }
    const name = decoded?.name || email.split('@')[0] || 'User';
    const picture = decoded?.picture;
    let user = await User_1.default.findOne({ email });
    if (!user) {
        const randomPassword = crypto_1.default.randomBytes(32).toString('hex');
        user = new User_1.default({
            name,
            email,
            password: randomPassword,
            profileImage: picture || null,
        });
        await user.save();
    }
    else {
        let changed = false;
        if (!user.name && name) {
            user.name = name;
            changed = true;
        }
        if (!user.profileImage && picture) {
            user.profileImage = picture;
            changed = true;
        }
        if (changed) {
            await user.save();
        }
    }
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, env_1.env.JWT_SECRET, { expiresIn: '30d' });
    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            isStore: user.isStore,
        },
    };
}
async function getProfile(userId) {
    const user = await User_1.default.findById(userId)
        .populate('followers', 'name profileImage')
        .populate('following', 'name profileImage');
    if (!user)
        throw new ApiError_1.ApiError(404, 'User not found');
    return user;
}
async function updateProfile(userId, updates) {
    const user = await User_1.default.findById(userId);
    if (!user)
        throw new ApiError_1.ApiError(404, 'User not found');
    user.name = updates.name || user.name;
    user.bio = updates.bio !== undefined ? updates.bio : user.bio;
    user.profileImage = updates.profileImage !== undefined ? updates.profileImage : user.profileImage;
    await user.save();
    return user;
}
async function followUser(currentUserId, targetUserId) {
    const currentUser = await User_1.default.findById(currentUserId);
    const targetUser = await User_1.default.findById(targetUserId);
    if (!currentUser || !targetUser)
        throw new ApiError_1.ApiError(404, 'User not found');
    const followingIds = currentUser.following.map((f) => f.toString());
    const followerIds = targetUser.followers.map((f) => f.toString());
    if (!followingIds.includes(targetUserId)) {
        currentUser.following.push(targetUserId);
    }
    if (!followerIds.includes(currentUserId)) {
        targetUser.followers.push(currentUserId);
    }
    await currentUser.save();
    await targetUser.save();
    return { message: 'User followed successfully' };
}
function ensureCloudinaryConfigured() {
    if (!env_1.env.CLOUDINARY_CLOUD_NAME || !env_1.env.CLOUDINARY_API_KEY || !env_1.env.CLOUDINARY_API_SECRET) {
        throw new ApiError_1.ApiError(500, 'Cloudinary not configured');
    }
    cloudinary_1.v2.config({
        cloud_name: env_1.env.CLOUDINARY_CLOUD_NAME,
        api_key: env_1.env.CLOUDINARY_API_KEY,
        api_secret: env_1.env.CLOUDINARY_API_SECRET,
    });
}
async function uploadBufferToCloudinary(input) {
    ensureCloudinaryConfigured();
    const { buffer, folder, publicId } = input;
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            public_id: publicId,
            resource_type: 'image',
        }, (error, result) => {
            if (error || !result?.secure_url) {
                reject(error || new Error('Cloudinary upload failed'));
                return;
            }
            resolve(result.secure_url);
        });
        stream.end(buffer);
    });
}
async function uploadProfileImage(userId, file) {
    if (!userId)
        throw new ApiError_1.ApiError(401, 'Unauthorized');
    if (!file?.buffer)
        throw new ApiError_1.ApiError(400, 'Missing image file');
    if (file?.mimetype && !file.mimetype.startsWith('image/')) {
        throw new ApiError_1.ApiError(400, 'Invalid file type');
    }
    const user = await User_1.default.findById(userId);
    if (!user)
        throw new ApiError_1.ApiError(404, 'User not found');
    const url = await uploadBufferToCloudinary({
        buffer: file.buffer,
        folder: 'profile-images',
        publicId: String(user._id),
    });
    return url;
}
