import { Schema, model } from 'mongoose';
import { IPricingPlan } from './pricingPlan.interface';

const pricingPlanSchema = new Schema<IPricingPlan>(
  {
    createdBy: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    priceId: {
      type: String,
      required: true,
    },
    features: {
      type: [String],
      required: true,
    },
    maxProperties: {
      type: Schema.Types.Mixed,
      required: true,
    },
    maxHighlightedProperties: {
      type: Number,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    subscriptionLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt timestamps to the schema
);

// Create the 'Pricing Plan' model using the schema
export const PricingPlan = model<IPricingPlan>(
  'PricingPlan',
  pricingPlanSchema,
);
