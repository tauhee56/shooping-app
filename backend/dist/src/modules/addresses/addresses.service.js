"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAddresses = listAddresses;
exports.createAddress = createAddress;
exports.updateAddress = updateAddress;
exports.deleteAddress = deleteAddress;
exports.setDefaultAddress = setDefaultAddress;
exports.getDefaultAddress = getDefaultAddress;
const mongoose_1 = __importDefault(require("mongoose"));
const Address_1 = __importDefault(require("../../../models/Address"));
const ApiError_1 = require("../../common/http/ApiError");
function assertValidObjectId(id, label) {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.ApiError(400, `Invalid ${label}`);
    }
}
async function listAddresses(userId) {
    return await Address_1.default.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
}
async function createAddress(userId, input) {
    const hasAny = await Address_1.default.exists({ user: userId });
    const shouldDefault = typeof input?.isDefault === 'boolean' ? input.isDefault : !hasAny;
    const address = new Address_1.default({
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
        await Address_1.default.updateMany({ user: userId, _id: { $ne: address._id } }, { $set: { isDefault: false } });
    }
    return address;
}
async function updateAddress(userId, id, updates) {
    assertValidObjectId(id, 'address id');
    const address = await Address_1.default.findOne({ _id: id, user: userId });
    if (!address)
        throw new ApiError_1.ApiError(404, 'Address not found');
    if (updates.type !== undefined)
        address.type = updates.type;
    if (updates.fullName !== undefined)
        address.fullName = updates.fullName;
    if (updates.phone !== undefined)
        address.phone = updates.phone;
    if (updates.street !== undefined)
        address.street = updates.street;
    if (updates.city !== undefined)
        address.city = updates.city;
    if (updates.state !== undefined)
        address.state = updates.state;
    if (updates.zip !== undefined)
        address.zip = updates.zip;
    if (updates.country !== undefined)
        address.country = updates.country;
    const wantsDefault = typeof updates.isDefault === 'boolean' ? updates.isDefault : null;
    if (wantsDefault !== null) {
        address.isDefault = wantsDefault;
    }
    address.updatedAt = new Date();
    await address.save();
    if (wantsDefault === true) {
        await Address_1.default.updateMany({ user: userId, _id: { $ne: address._id } }, { $set: { isDefault: false } });
    }
    return address;
}
async function deleteAddress(userId, id) {
    assertValidObjectId(id, 'address id');
    const address = await Address_1.default.findOne({ _id: id, user: userId });
    if (!address)
        throw new ApiError_1.ApiError(404, 'Address not found');
    const wasDefault = !!address.isDefault;
    await Address_1.default.deleteOne({ _id: id, user: userId });
    if (wasDefault) {
        const next = await Address_1.default.findOne({ user: userId }).sort({ createdAt: -1 });
        if (next) {
            next.isDefault = true;
            next.updatedAt = new Date();
            await next.save();
        }
    }
    return { message: 'Address deleted' };
}
async function setDefaultAddress(userId, id) {
    assertValidObjectId(id, 'address id');
    const address = await Address_1.default.findOne({ _id: id, user: userId });
    if (!address)
        throw new ApiError_1.ApiError(404, 'Address not found');
    await Address_1.default.updateMany({ user: userId }, { $set: { isDefault: false } });
    address.isDefault = true;
    address.updatedAt = new Date();
    await address.save();
    return address;
}
async function getDefaultAddress(userId) {
    return await Address_1.default.findOne({ user: userId, isDefault: true });
}
