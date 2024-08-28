import { Schema, model } from 'mongoose';
import { IProperty } from './property.interface';
import {
  ALLOWED_GENDER,
  CATEGORY,
  DECORATION_TYPE,
  GUEST_TYPE,
  OCCUPATION,
  OWNER_TYPE,
  PRICE_TYPE,
  PROPERTY_TYPE,
  STATUS,
} from './property.constant';

const propertySchema = new Schema<IProperty>(
  {
    createdBy: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    ownerType: {
      type: String,
      enum: Object.values(OWNER_TYPE),
      required: true,
    },
    ownershipImages: {
      type: [String], // Array of strings for ownership proof documents
      required: true,
    },
    ownerNumber: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    propertyImages: {
      type: [String], // Array of strings for image URLs
      required: true,
    },
    propertyVideo: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(CATEGORY),
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    priceType: {
      type: String,
      enum: Object.values(PRICE_TYPE),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    decorationType: {
      type: String,
      enum: Object.values(DECORATION_TYPE),
      required: true,
    },
    flore: {
      type: String,
      required: true,
    },
    propertyType: {
      type: String,
      enum: Object.values(PROPERTY_TYPE),
      required: true,
    },
    bedType: {
      type: String,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    bathroooms: {
      type: Number,
      required: true,
    },
    balcony: {
      type: Number,
      required: true,
    },
    kitchen: {
      type: Number,
      required: true,
    },
    dining: {
      type: Number,
      required: true,
    },
    drawing: {
      type: Number,
      required: true,
    },
    moveOn: {
      type: Date,
    },
    unavailableDay: {
      type: Date,
    },
    allowedGender: {
      type: String,
      enum: Object.values(ALLOWED_GENDER),
    },
    guestType: {
      type: String,
      enum: Object.values(GUEST_TYPE),
    },
    occupation: {
      type: String,
      enum: Object.values(OCCUPATION),
    },
    facilities: {
      type: [String], // Array of strings for facilities
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: 'pending',
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Method to remove sensitive fields before returning property object as JSON
propertySchema.methods.toJSON = function () {
  const propertyObject = this.toObject();

  // Remove password and role fields from the user object
  delete propertyObject?.isApproved;
  delete propertyObject?.isBooked;

  return propertyObject;
};

// Create the property model using the schema
export const Property = model<IProperty>('Property', propertySchema);
