import { Request, Response } from 'express';
import { asyncHandler } from '../../common/http/asyncHandler';
import { ApiError } from '../../common/http/ApiError';
import * as paymentsService from './payments.service';

export const createIntent = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentsService.createPaymentIntent(req.user.userId);
  res.status(201).json(result);
});

export const webhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    throw new ApiError(400, 'Missing stripe-signature header');
  }

  const rawBody = (req as any).rawBody as Buffer | undefined;
  if (!rawBody) {
    throw new ApiError(400, 'Missing raw body');
  }

  const event = paymentsService.constructWebhookEvent({ rawBody, signature });
  await paymentsService.handleWebhookEvent(event);

  res.json({ received: true });
});
