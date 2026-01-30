import mongoose from 'mongoose';
import Address from '../../../models/Address';
import { ApiError } from '../../common/http/ApiError';

function assertValidObjectId(id: string, label: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
}

export async function listAddresses(userId: string) {
  return await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
}

export async function createAddress(userId: string, input: any) {
  const hasAny = await Address.exists({ user: userId });
  const shouldDefault = typeof input?.isDefault === 'boolean' ? input.isDefault : !hasAny;

  const address: any = new Address({
    user: userId,
    type: input.type,
    fullName: input.fullName,
    phone: input.phone,
    street: input.street,
    city: input.city,
    state: input.state,
    zip: input.zip,
    country: input.country,
    isDefault: shouldDefault,
    updatedAt: new Date(),
  });

  await address.save();

  if (shouldDefault) {
    await Address.updateMany({ user: userId, _id: { $ne: address._id } }, { $set: { isDefault: false } });
  }

  return address;
}

export async function updateAddress(userId: string, id: string, updates: any) {
  assertValidObjectId(id, 'address id');

  const address: any = await Address.findOne({ _id: id, user: userId });
  if (!address) throw new ApiError(404, 'Address not found');

  if (updates.type !== undefined) address.type = updates.type;
  if (updates.fullName !== undefined) address.fullName = updates.fullName;
  if (updates.phone !== undefined) address.phone = updates.phone;
  if (updates.street !== undefined) address.street = updates.street;
  if (updates.city !== undefined) address.city = updates.city;
  if (updates.state !== undefined) address.state = updates.state;
  if (updates.zip !== undefined) address.zip = updates.zip;
  if (updates.country !== undefined) address.country = updates.country;

  const wantsDefault = typeof updates.isDefault === 'boolean' ? updates.isDefault : null;
  if (wantsDefault !== null) {
    address.isDefault = wantsDefault;
  }

  address.updatedAt = new Date();
  await address.save();

  if (wantsDefault === true) {
    await Address.updateMany({ user: userId, _id: { $ne: address._id } }, { $set: { isDefault: false } });
  }

  return address;
}

export async function deleteAddress(userId: string, id: string) {
  assertValidObjectId(id, 'address id');

  const address: any = await Address.findOne({ _id: id, user: userId });
  if (!address) throw new ApiError(404, 'Address not found');

  const wasDefault = !!address.isDefault;
  await Address.deleteOne({ _id: id, user: userId });

  if (wasDefault) {
    const next: any = await Address.findOne({ user: userId }).sort({ createdAt: -1 });
    if (next) {
      next.isDefault = true;
      next.updatedAt = new Date();
      await next.save();
    }
  }

  return { message: 'Address deleted' };
}

export async function setDefaultAddress(userId: string, id: string) {
  assertValidObjectId(id, 'address id');

  const address: any = await Address.findOne({ _id: id, user: userId });
  if (!address) throw new ApiError(404, 'Address not found');

  await Address.updateMany({ user: userId }, { $set: { isDefault: false } });

  address.isDefault = true;
  address.updatedAt = new Date();
  await address.save();

  return address;
}

export async function getDefaultAddress(userId: string) {
  return await Address.findOne({ user: userId, isDefault: true });
}
