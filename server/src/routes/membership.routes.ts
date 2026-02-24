import { Router } from 'express';
import { body } from 'express-validator';
import { MembershipController } from '../controllers/membership.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public
router.get('/plans', MembershipController.getPlans);

// Protected
router.get('/subscription', authenticate, MembershipController.getMySubscription);
router.get('/payments', authenticate, MembershipController.getPaymentHistory);

router.post(
  '/subscribe',
  authenticate,
  validate([
    body('planId').isUUID().withMessage('Valid plan ID is required'),
    body('provider').isIn(['stripe', 'wechat_pay', 'alipay']).withMessage('Invalid payment provider'),
  ]),
  MembershipController.subscribe
);

router.post('/subscription/:id/cancel', authenticate, MembershipController.cancelSubscription);

// Payment webhooks (no auth - verified by provider signatures)
router.post('/webhook/stripe', MembershipController.stripeWebhook);
router.post('/webhook/wechat-pay', MembershipController.wechatPayNotify);
router.post('/webhook/alipay', MembershipController.alipayNotify);

export default router;
