
import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      phone,
    });

    await user.save();

    const jwtSecret = process.env.JWT_SECRET as string | undefined;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
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
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;


    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Type assertion for correct method access
    const userDoc = user as import('../models/User').UserDocument;
    const isMatch = await userDoc.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const jwtSecret = process.env.JWT_SECRET as string | undefined;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
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
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('followers', 'name profileImage')
      .populate('following', 'name profileImage');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, bio, profileImage } = req.body;
    
    let user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.profileImage = profileImage || user.profileImage;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const followUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user.userId);
    const targetUser = await User.findById(userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert ObjectId arrays to string for comparison
    const followingIds = currentUser.following.map(f => f.toString());
    const followerIds = targetUser.followers.map(f => f.toString());

    if (!followingIds.includes(userId)) {
      (currentUser.following as any).push(userId);
    }
    if (!followerIds.includes(req.user.userId)) {
      (targetUser.followers as any).push(req.user.userId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
