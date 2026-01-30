import Product from '../../../models/Product';

function getStoreDefaults(store: any) {
  const po = store?.paymentOptions && typeof store.paymentOptions === 'object' ? store.paymentOptions : {};
  return {
    codEnabled: typeof po.codEnabled === 'boolean' ? po.codEnabled : false,
    stripeEnabled: typeof po.stripeEnabled === 'boolean' ? po.stripeEnabled : true,
  };
}

function computeEffectivePaymentOptions(product: any) {
  const storeDefaults = getStoreDefaults(product?.store);
  const override =
    product?.paymentOptionsOverride && typeof product.paymentOptionsOverride === 'object'
      ? product.paymentOptionsOverride
      : {};

  return {
    codEnabled: typeof override.codEnabled === 'boolean' ? override.codEnabled : storeDefaults.codEnabled,
    stripeEnabled: typeof override.stripeEnabled === 'boolean' ? override.stripeEnabled : storeDefaults.stripeEnabled,
  };
}

function withEffectivePaymentOptions(product: any) {
  if (!product) return product;
  const obj: any = product?.toObject ? product.toObject() : product;
  obj.effectivePaymentOptions = computeEffectivePaymentOptions(obj);
  return obj;
}

export async function getAllProducts(input: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { category, search } = input;
  const limit = input.limit ?? 10;
  const page = input.page ?? 1;

  const query: any = {};
  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: 'i' };

  const products = await Product.find(query)
    .populate('store', 'name logo paymentOptions')
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(query);

  return {
    products: products.map(withEffectivePaymentOptions),
    total,
    pages: Math.ceil(total / limit),
  };
}

export async function getProductById(id: string) {
  const product = await Product.findById(id)
    .populate('store', 'name logo followers paymentOptions')
    .populate('reviews.user', 'name profileImage');

  return withEffectivePaymentOptions(product);
}

export async function toggleLikeProduct(id: string, userId: string) {
  const product: any = await Product.findById(id);
  if (!product) return null;

  const likeIds = (product.likes || []).map((l: any) => l.toString());
  const alreadyLiked = likeIds.includes(userId);

  if (alreadyLiked) {
    product.likes = (product.likes || []).filter((l: any) => l.toString() !== userId);
  } else {
    (product.likes as any).push(userId);
  }

  await product.save();

  return {
    message: alreadyLiked ? 'Product unliked' : 'Product liked',
    isLiked: !alreadyLiked,
    likes: (product.likes || []).length,
  };
}

export async function getLikedProducts(userId: string) {
  const products = await Product.find({ likes: userId })
    .populate('store', 'name logo paymentOptions')
    .sort({ createdAt: -1 });

  return products.map(withEffectivePaymentOptions);
}

export async function getFeaturedProducts() {
  const products = await Product.find()
    .populate('store', 'name logo paymentOptions')
    .sort({ likes: -1 })
    .limit(5);

  return products.map(withEffectivePaymentOptions);
}

export async function getProductsByStore(storeId: string) {
  const products = await Product.find({ store: storeId })
    .populate('store', 'name logo paymentOptions')
    .sort({ createdAt: -1 });

  return products.map(withEffectivePaymentOptions);
}
