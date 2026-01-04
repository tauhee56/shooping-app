
import { Request, Response } from 'express';
import Product from '../models/Product';
import Store from '../models/Store';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    let query: any = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const numLimit = typeof limit === 'string' ? parseInt(limit) : Number(limit);
    const numPage = typeof page === 'string' ? parseInt(page) : Number(page);
    const products = await Product.find(query)
      .populate('store', 'name logo')
      .limit(numLimit)
      .skip((numPage - 1) * numLimit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      pages: Math.ceil(total / numLimit),
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('store', 'name logo followers')
      .populate('reviews.user', 'name profileImage');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const likeProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const likeIds = product.likes.map((l: any) => l.toString());
    if (!likeIds.includes(req.user.userId)) {
      (product.likes as any).push(req.user.userId);
      await product.save();
    }

    res.json({ message: 'Product liked', likes: product.likes.length });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find()
      .populate('store', 'name logo')
      .sort({ likes: -1 })
      .limit(5);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getProductsByStore = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const products = await Product.find({ store: storeId })
      .populate('store', 'name logo')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
