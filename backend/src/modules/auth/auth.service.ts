import jwt from 'jsonwebtoken';
import User, { UserDocument } from '../../../models/User';
import { ApiError } from '../../common/http/ApiError';
import { env } from '../../config/env';
import { getFirebaseAuth } from '../../config/firebaseAdmin';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const { name, email, password, phone } = input;

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(400, 'User already exists');

  const user = new User({ name, email, password, phone });
  await user.save();

  const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, { expiresIn: '30d' });

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

export async function loginUser(input: { email: string; password: string }) {
  const { email, password } = input;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, 'Invalid credentials');

  const userDoc = user as UserDocument;
  const isMatch = await userDoc.matchPassword(password);
  if (!isMatch) throw new ApiError(400, 'Invalid credentials');

  const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, { expiresIn: '30d' });

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

export async function firebaseAuth(input: { idToken: string }) {
  const { idToken } = input;

  let decoded: any;
  try {
    decoded = await getFirebaseAuth().verifyIdToken(idToken);
  } catch (err) {
    const e = err as any;
    const projectId = (getFirebaseAuth() as any)?.app?.options?.projectId;
    throw new ApiError(401, 'Invalid Firebase token', {
      projectId,
      error: {
        code: e?.code,
        message: e?.message,
      },
    });
  }

  const email = decoded?.email as string | undefined;
  if (!email) {
    throw new ApiError(400, 'Firebase token missing email');
  }

  const name = (decoded?.name as string | undefined) || email.split('@')[0] || 'User';
  const picture = decoded?.picture as string | undefined;

  let user = await User.findOne({ email });
  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString('hex');
    user = new User({
      name,
      email,
      password: randomPassword,
      profileImage: picture || null,
    });
    await user.save();
  } else {
    let changed = false;
    if (!user.name && name) {
      user.name = name;
      changed = true;
    }
    if (!user.profileImage && picture) {
      user.profileImage = picture as any;
      changed = true;
    }
    if (changed) {
      await user.save();
    }
  }

  const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, { expiresIn: '30d' });

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

export async function getProfile(userId: string) {
  const user = await User.findById(userId)
    .populate('followers', 'name profileImage')
    .populate('following', 'name profileImage');

  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

export async function updateProfile(
  userId: string,
  updates: { name?: string; bio?: string; profileImage?: string }
) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.name = updates.name || user.name;
  user.bio = updates.bio !== undefined ? updates.bio : user.bio;
  user.profileImage = updates.profileImage !== undefined ? updates.profileImage : user.profileImage;

  await user.save();
  return user;
}

export async function followUser(currentUserId: string, targetUserId: string) {
  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);

  if (!currentUser || !targetUser) throw new ApiError(404, 'User not found');

  const followingIds = currentUser.following.map((f) => f.toString());
  const followerIds = targetUser.followers.map((f) => f.toString());

  if (!followingIds.includes(targetUserId)) {
    (currentUser.following as any).push(targetUserId);
  }
  if (!followerIds.includes(currentUserId)) {
    (targetUser.followers as any).push(currentUserId);
  }

  await currentUser.save();
  await targetUser.save();

  return { message: 'User followed successfully' };
}

function ensureCloudinaryConfigured(): void {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new ApiError(500, 'Cloudinary not configured');
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

async function uploadBufferToCloudinary(input: {
  buffer: Buffer;
  folder: string;
  publicId?: string;
}): Promise<string> {
  ensureCloudinaryConfigured();

  const { buffer, folder, publicId } = input;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

export async function uploadProfileImage(
  userId: string,
  file?: { buffer?: Buffer; mimetype?: string; originalname?: string }
) {
  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!file?.buffer) throw new ApiError(400, 'Missing image file');
  if (file?.mimetype && !file.mimetype.startsWith('image/')) {
    throw new ApiError(400, 'Invalid file type');
  }

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const url = await uploadBufferToCloudinary({
    buffer: file.buffer,
    folder: 'profile-images',
    publicId: String(user._id),
  });

  return url;
}
