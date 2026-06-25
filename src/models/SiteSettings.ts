import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettings extends Document {
  storeName: string;
  logoUrl?: string;
  faviconUrl?: string;
  contactEmail: string;
  phone: string;
  address: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    pinterest?: string;
    youtube?: string;
    twitter?: string;
  };
  deliveryCharge: number;
  freeDeliveryMinAmount: number;
  announcementText: string;
  footerText: string;
  returnPolicy: string;
  privacyPolicy: string;
  terms: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    storeName: { type: String, required: true, default: 'Antigravity Fashion' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    contactEmail: { type: String, required: true, default: 'contact@antigravity-fashion.com' },
    phone: { type: String, required: true, default: '+8801700000000' },
    address: { type: String, required: true, default: 'Dhaka, Bangladesh' },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      pinterest: { type: String, default: '' },
      youtube: { type: String, default: '' },
      twitter: { type: String, default: '' }
    },
    deliveryCharge: { type: Number, required: true, default: 120 },
    freeDeliveryMinAmount: { type: Number, required: true, default: 3000 },
    announcementText: { type: String, default: 'Free delivery on orders over ৳3000' },
    footerText: { type: String, default: '© 2026 Antigravity Fashion. All Rights Reserved.' },
    returnPolicy: { type: String, default: 'Easy 7-day returns on all unwashed dresses.' },
    privacyPolicy: { type: String, default: 'Your privacy is protected with SSL encryption.' },
    terms: { type: String, default: 'Standard e-commerce terms & conditions apply.' }
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
export default SiteSettings;
