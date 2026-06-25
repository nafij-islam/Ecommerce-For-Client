import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductVariant {
  size: string;
  colorName: string;
  colorHex: string;
  priceAdjustment?: number;
  stock: number;
  sku: string;
  variantImage?: string;
  isAvailable: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: mongoose.Types.ObjectId | string;
  subcategoryId?: mongoose.Types.ObjectId | string;
  brand?: string;
  collectionName?: string; // mapping from collection in requirements
  images: string[];
  thumbnail: string;
  price: number;
  salePrice: number;
  discountPercentage: number;
  sku: string;
  stock: number;
  variants: IProductVariant[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  size: { type: String, required: true },
  colorName: { type: String, required: true },
  colorHex: { type: String, required: true },
  priceAdjustment: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true },
  variantImage: { type: String },
  isAvailable: { type: Boolean, default: true }
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    brand: { type: String, default: '' },
    collectionName: { type: String, default: '' },
    images: [{ type: String }],
    thumbnail: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0 },
    sku: { type: String, required: true, unique: true },
    stock: { type: Number, required: true, default: 0 },
    variants: [ProductVariantSchema],
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    seoTitle: { type: String },
    seoDescription: { type: String },
    metaKeywords: [{ type: String }]
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
