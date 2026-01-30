import 'dotenv/config';

import mongoose from 'mongoose';

import Product from '../models/Product';
import Store from '../models/Store';

async function main(): Promise<void> {
  const allow = String(process.env.ALLOW_DEMO_CLEANUP || '').toLowerCase() === 'true';
  if (!allow) {
    throw new Error('Cleanup blocked: set ALLOW_DEMO_CLEANUP=true to proceed');
  }

  const dryRun = String(process.env.DRY_RUN || 'true').toLowerCase() !== 'false';

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || typeof mongoUri !== 'string' || mongoUri.trim().length === 0) {
    throw new Error('MONGODB_URI is required for cleanup-demo');
  }

  await mongoose.connect(mongoUri);

  const storeNameRegexes = [
    /^Test Store \d{13}$/,
    /^Store [A-Z] \d{13}$/,
    /^[A-Z] \d{13}$/,
  ];
  const productNameRegexes = [/^Soap \d{13}$/];

  const storeNameQuery = { $or: storeNameRegexes.map((re) => ({ name: re })) };
  const productNameQuery = { $or: productNameRegexes.map((re) => ({ name: re })) };

  const demoStores = await Store.find(storeNameQuery).select('_id name').lean();
  const demoStoreIds = demoStores.map((s: any) => s._id);

  const productDeleteQuery: any = demoStoreIds.length > 0
    ? { $or: [productNameQuery, { store: { $in: demoStoreIds } }] }
    : productNameQuery;

  if (dryRun) {
    const demoProducts = await Product.find(productDeleteQuery).select('_id name store').limit(50).lean();
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          matchedDemoStores: demoStores,
          matchedDemoProductsSample: demoProducts,
          matchedDemoProductCountEstimate: demoProducts.length,
          note: 'Set DRY_RUN=false to actually delete. Sample is capped at 50.'
        },
        null,
        2
      )
    );
    await mongoose.disconnect();
    return;
  }

  const productsResult = await Product.deleteMany(productDeleteQuery);
  const storesResult = await Store.deleteMany({ _id: { $in: demoStoreIds } });

  console.log(
    JSON.stringify(
      {
        dryRun: false,
        deletedProducts: productsResult.deletedCount || 0,
        deletedStores: storesResult.deletedCount || 0,
        matchedDemoStores: demoStores.length,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
