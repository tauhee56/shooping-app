import { Router } from 'express';
import auth from '../../middleware/auth';
import { validate } from '../../common/http/validate';
import * as controller from './addresses.controller';
import { addressIdSchema, createAddressSchema, listAddressesSchema, updateAddressSchema } from './addresses.validation';

const router = Router();

router.get('/', auth, validate(listAddressesSchema), controller.listAddresses);
router.post('/', auth, validate(createAddressSchema), controller.createAddress);
router.put('/:id', auth, validate(updateAddressSchema), controller.updateAddress);
router.delete('/:id', auth, validate(addressIdSchema), controller.deleteAddress);
router.post('/:id/default', auth, validate(addressIdSchema), controller.setDefault);

export default router;
