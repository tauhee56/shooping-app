import Store from '../../../models/Store';
import Product from '../../../models/Product';
import User from '../../../models/User';
import { ApiError } from '../../common/http/ApiError';
import { env } from '../../config/env';
import { v2 as cloudinary } from 'cloudinary';

export async function listStores() {
  const stores = await Store.find()
    .sort({ createdAt: -1 })
    .select('name description location storeType tags logo banner rating products followers createdAt')
    .lean();

  return stores;
}

export async function getFollowedStores(userId: string) {
  const stores = await Store.find({ followers: userId })
    .sort({ createdAt: -1 })
    .select('name description location storeType tags logo banner rating products followers createdAt')
    .lean();

  return stores;
}

export async function createStore(
  userId: string,
  input: { name: string; description?: string; location?: string; storeType?: string; tags?: string[] }
) {
  const store = new Store({
    name: input.name,
    storeType: (input as any)?.storeType,
    tags: (input as any)?.tags,
    owner: userId,
    description: input.description,
    location: input.location,
    logo: (input as any)?.logo,
    banner: (input as any)?.banner,
  });

  await store.save();

  const user: any = await User.findById(userId).select('isStore storeId');
  const update: any = { isStore: true };
  if (!user?.storeId) {
    update.storeId = store._id;
  }
  await User.findByIdAndUpdate(userId, update);

  return store;
}

export async function listMyStores(userId: string) {
  const stores = await Store.find({ owner: userId })
    .sort({ createdAt: -1 })
    .populate('products')
    .select('name description location storeType tags logo banner rating products followers createdAt')
    .lean();

  return stores;
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

async function uploadStoreAsset(
  userId: string,
  file: { buffer?: Buffer; mimetype?: string; originalname?: string } | undefined,
  opts: { kind: 'logo' | 'banner'; storeId?: string }
): Promise<string> {
  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!file?.buffer) throw new ApiError(400, 'Missing image file');
  if (file?.mimetype && !file.mimetype.startsWith('image/')) {
    throw new ApiError(400, 'Invalid file type');
  }

  const targetStoreId = typeof opts.storeId === 'string' && opts.storeId.trim() ? opts.storeId.trim() : '';
  const store = targetStoreId ? await Store.findOne({ _id: targetStoreId, owner: userId }) : null;

  const publicId = store
    ? `${String(store._id)}-${opts.kind}`
    : `${String(userId)}-${opts.kind}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const url = await uploadBufferToCloudinary({
    buffer: file.buffer,
    folder: 'store-assets',
    publicId,
  });

  if (store) {
    (store as any)[opts.kind] = url;
    await store.save();
  }

  return url;
}

export async function uploadStoreLogo(
  userId: string,
  file?: { buffer?: Buffer; mimetype?: string; originalname?: string },
  storeId?: string
): Promise<string> {
  return uploadStoreAsset(userId, file, { kind: 'logo', storeId });
}

export async function uploadStoreBanner(
  userId: string,
  file?: { buffer?: Buffer; mimetype?: string; originalname?: string },
  storeId?: string
): Promise<string> {
  return uploadStoreAsset(userId, file, { kind: 'banner', storeId });
}

export async function uploadProductImages(
  userId: string,
  files: Array<{ buffer?: Buffer; mimetype?: string; originalname?: string }>,
  storeId?: string
): Promise<string[]> {
  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!Array.isArray(files) || files.length === 0) throw new ApiError(400, 'Missing image files');

  let store: any = null;
  if (typeof storeId === 'string' && storeId.trim()) {
    store = await Store.findOne({ _id: storeId.trim(), owner: userId });
  } else {
    store = await getMyStore(userId);
  }
  if (!store) throw new ApiError(404, 'Store not found');

  for (const file of files) {
    if (!file?.buffer) throw new ApiError(400, 'Missing image file');
    if (file?.mimetype && !file.mimetype.startsWith('image/')) {
      throw new ApiError(400, 'Invalid file type');
    }
  }

  const urls = await Promise.all(
    files.map((file) =>
      uploadBufferToCloudinary({
        buffer: file.buffer as Buffer,
        folder: 'product-images',
        publicId: `${String(store._id)}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      })
    )
  );

  return urls;
}

export async function getStoreById(id: string) {
  const store = await Store.findById(id).populate('owner', 'name profileImage bio').populate('products');
  if (!store) throw new ApiError(404, 'Store not found');
  return store;
}

export async function getMyStore(userId: string) {
  const user: any = await User.findById(userId).select('storeId');
  const storeId = user?.storeId ? String(user.storeId) : '';

  if (storeId) {
    const byId = await Store.findOne({ _id: storeId, owner: userId }).populate('products');
    if (byId) return byId;
  }

  const store = await Store.findOne({ owner: userId }).sort({ createdAt: -1 }).populate('products');
  if (!store) throw new ApiError(404, 'Store not found');
  return store;
}

export async function updateStore(userId: string, storeId: string, updates: any) {
  const store: any = await Store.findOne({ _id: storeId, owner: userId });
  if (!store) throw new ApiError(404, 'Store not found');

  store.name = updates.name || store.name;
  store.description = updates.description !== undefined ? updates.description : store.description;
  store.location = updates.location !== undefined ? updates.location : store.location;
  store.banner = updates.banner !== undefined ? updates.banner : store.banner;
  store.logo = updates.logo !== undefined ? updates.logo : store.logo;
  store.storeType = updates.storeType !== undefined ? updates.storeType : store.storeType;
  store.tags = updates.tags !== undefined ? updates.tags : store.tags;

  if (updates && typeof updates === 'object' && updates.paymentOptions && typeof updates.paymentOptions === 'object') {
    store.paymentOptions = store.paymentOptions || {};
    if (typeof updates.paymentOptions.codEnabled === 'boolean') {
      store.paymentOptions.codEnabled = updates.paymentOptions.codEnabled;
    }
    if (typeof updates.paymentOptions.stripeEnabled === 'boolean') {
      store.paymentOptions.stripeEnabled = updates.paymentOptions.stripeEnabled;
    }
  }

  await store.save();
  return store;
}

export async function addProductToStore(userId: string, storeId: string, input: any) {
  const store: any = await Store.findOne({ _id: storeId, owner: userId });
  if (!store) throw new ApiError(404, 'Store not found');

  const product: any = new Product({
    name: input.name,
    description: input.description,
    price: input.price,
    originalPrice: input.originalPrice,
    category: input.category,
    images: input.images,
    ingredients: input.ingredients,
    benefits: input.benefits,
    weight: input.weight,
    freeDelivery: input.freeDelivery,
    stock: input.stock,
    paymentOptionsOverride: input?.paymentOptionsOverride,
    store: store._id,
  });

  await product.save();
  store.products.push(product._id);
  await store.save();

  return product;
}

export async function followStore(storeId: string, userId: string) {
  const store: any = await Store.findById(storeId);
  if (!store) throw new ApiError(404, 'Store not found');

  const followerIds = (store.followers || []).map((f: any) => f.toString());
  const alreadyFollowing = followerIds.includes(userId);

  if (alreadyFollowing) {
    store.followers = (store.followers || []).filter((f: any) => f.toString() !== userId);
  } else {
    (store.followers as any).push(userId);
  }

  await store.save();

  return {
    message: alreadyFollowing ? 'Store unfollowed' : 'Store followed',
    followers: store.followers.length,
    isFollowing: !alreadyFollowing,
  };
}

export async function updateProduct(userId: string, storeId: string, productId: string, updates: any) {
  const sid = String(storeId || '').trim();
  if (!sid) throw new ApiError(400, 'Invalid store');
  const store: any = await Store.findOne({ _id: sid, owner: userId });
  if (!store) throw new ApiError(404, 'Store not found');

  const product: any = await Product.findOne({ _id: productId, store: store._id });
  if (!product) throw new ApiError(404, 'Product not found');

  product.name = updates.name || product.name;
  product.description = updates.description || product.description;
  product.price = updates.price !== undefined ? updates.price : product.price;
  product.originalPrice = updates.originalPrice !== undefined ? updates.originalPrice : product.originalPrice;
  product.category = updates.category || product.category;
  product.images = updates.images || product.images;
  product.freeDelivery = updates.freeDelivery !== undefined ? updates.freeDelivery : product.freeDelivery;
  product.stock = updates.stock !== undefined ? updates.stock : product.stock;

  if (updates && typeof updates === 'object' && updates.paymentOptionsOverride && typeof updates.paymentOptionsOverride === 'object') {
    product.paymentOptionsOverride = product.paymentOptionsOverride || {};
    if (typeof updates.paymentOptionsOverride.codEnabled === 'boolean') {
      product.paymentOptionsOverride.codEnabled = updates.paymentOptionsOverride.codEnabled;
    }
    if (typeof updates.paymentOptionsOverride.stripeEnabled === 'boolean') {
      product.paymentOptionsOverride.stripeEnabled = updates.paymentOptionsOverride.stripeEnabled;
    }
  }

  await product.save();
  return product;
}

export async function deleteProduct(userId: string, storeId: string, productId: string) {
  const sid = String(storeId || '').trim();
  if (!sid) throw new ApiError(400, 'Invalid store');
  const store: any = await Store.findOne({ _id: sid, owner: userId });
  if (!store) throw new ApiError(404, 'Store not found');

  const product: any = await Product.findOne({ _id: productId, store: store._id });
  if (!product) throw new ApiError(404, 'Product not found');

  await Product.findByIdAndDelete(productId);
  store.products = store.products.filter((p: any) => p.toString() !== productId);
  await store.save();

  return { message: 'Product deleted' };
}
