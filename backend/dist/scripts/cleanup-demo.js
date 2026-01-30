"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = __importDefault(require("../models/Product"));
const Store_1 = __importDefault(require("../models/Store"));
async function main() {
    const allow = String(process.env.ALLOW_DEMO_CLEANUP || '').toLowerCase() === 'true';
    if (!allow) {
        throw new Error('Cleanup blocked: set ALLOW_DEMO_CLEANUP=true to proceed');
    }
    const dryRun = String(process.env.DRY_RUN || 'true').toLowerCase() !== 'false';
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri || typeof mongoUri !== 'string' || mongoUri.trim().length === 0) {
        throw new Error('MONGODB_URI is required for cleanup-demo');
    }
    await mongoose_1.default.connect(mongoUri);
    const storeNameRegexes = [
        /^Test Store \d{13}$/,
        /^Store [A-Z] \d{13}$/,
        /^[A-Z] \d{13}$/,
    ];
    const productNameRegexes = [/^Soap \d{13}$/];
    const storeNameQuery = { $or: storeNameRegexes.map((re) => ({ name: re })) };
    const productNameQuery = { $or: productNameRegexes.map((re) => ({ name: re })) };
    const demoStores = await Store_1.default.find(storeNameQuery).select('_id name').lean();
    const demoStoreIds = demoStores.map((s) => s._id);
    const productDeleteQuery = demoStoreIds.length > 0
        ? { $or: [productNameQuery, { store: { $in: demoStoreIds } }] }
        : productNameQuery;
    if (dryRun) {
        const demoProducts = await Product_1.default.find(productDeleteQuery).select('_id name store').limit(50).lean();
        console.log(JSON.stringify({
            dryRun: true,
            matchedDemoStores: demoStores,
            matchedDemoProductsSample: demoProducts,
            matchedDemoProductCountEstimate: demoProducts.length,
            note: 'Set DRY_RUN=false to actually delete. Sample is capped at 50.'
        }, null, 2));
        await mongoose_1.default.disconnect();
        return;
    }
    const productsResult = await Product_1.default.deleteMany(productDeleteQuery);
    const storesResult = await Store_1.default.deleteMany({ _id: { $in: demoStoreIds } });
    console.log(JSON.stringify({
        dryRun: false,
        deletedProducts: productsResult.deletedCount || 0,
        deletedStores: storesResult.deletedCount || 0,
        matchedDemoStores: demoStores.length,
    }, null, 2));
    await mongoose_1.default.disconnect();
}
main().catch(async (err) => {
    console.error(err);
    try {
        await mongoose_1.default.disconnect();
    }
    catch {
        // ignore
    }
    process.exit(1);
});
