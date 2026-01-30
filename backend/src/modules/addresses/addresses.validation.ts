import { z } from 'zod';

export const addressIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

const addressBodySchema = z.object({
  type: z.enum(['Home', 'Work', 'Other']).optional(),
  fullName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  street: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  zip: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  isDefault: z.boolean().optional(),
});

export const createAddressSchema = z.object({
  body: addressBodySchema.refine(
    (v) => !!v.fullName && !!v.phone && !!v.street && !!v.city && !!v.state && !!v.zip,
    { message: 'Missing required address fields' }
  ),
});

export const updateAddressSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: addressBodySchema,
});

export const listAddressesSchema = z.object({
  body: z.any().optional(),
  params: z.any().optional(),
  query: z.any().optional(),
});
