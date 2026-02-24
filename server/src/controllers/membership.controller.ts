import { Request, Response, NextFunction } from 'express';
import { MembershipService } from '../services/membership.service';
import { AuthRequest } from '../middleware/auth';
import { PaymentProvider } from '@elegant-blog/shared';
import config from '../config';

export class MembershipController {
  static async getPlans(_req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await MembershipService.getPlans();
      res.json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  }

  static async getMySubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await MembershipService.getActiveSubscription(req.user!.id);
      res.json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  }

  static async subscribe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { planId, provider } = req.body;
      const result = await MembershipService.subscribe(req.user!.id, planId, provider as PaymentProvider);

      // Generate payment URL based on provider
      let paymentUrl = '';

      switch (provider) {
        case PaymentProvider.STRIPE:
          paymentUrl = await generateStripeCheckout(result.payment.id, result.plan);
          break;
        case PaymentProvider.WECHAT_PAY:
          paymentUrl = await generateWechatPayUrl(result.payment.id, result.plan);
          break;
        case PaymentProvider.ALIPAY:
          paymentUrl = await generateAlipayUrl(result.payment.id, result.plan);
          break;
      }

      res.json({
        success: true,
        data: {
          paymentId: result.payment.id,
          paymentUrl,
          provider,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await MembershipService.cancelSubscription(req.params.id, req.user!.id);
      res.json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, pageSize } = req.query;
      const result = await MembershipService.getUserPayments(
        req.user!.id,
        page ? parseInt(page as string) : undefined,
        pageSize ? parseInt(pageSize as string) : undefined
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Webhook handlers for payment providers
  static async stripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const sig = req.headers['stripe-signature'] as string;
      // In production, verify the webhook signature with Stripe
      const { paymentId, providerPaymentId } = req.body;
      await MembershipService.confirmPayment(paymentId, providerPaymentId);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  static async wechatPayNotify(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId, transaction_id } = req.body;
      await MembershipService.confirmPayment(paymentId, transaction_id);
      res.json({ return_code: 'SUCCESS', return_msg: 'OK' });
    } catch (error) {
      next(error);
    }
  }

  static async alipayNotify(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId, trade_no } = req.body;
      await MembershipService.confirmPayment(paymentId, trade_no);
      res.send('success');
    } catch (error) {
      next(error);
    }
  }
}

// Payment provider URL generators (placeholders for actual integration)
async function generateStripeCheckout(paymentId: string, plan: any): Promise<string> {
  // In production, use Stripe SDK to create a checkout session
  // const stripe = new Stripe(config.payment.stripe.secretKey);
  // const session = await stripe.checkout.sessions.create({...});
  return `https://checkout.stripe.com/pay/${paymentId}`;
}

async function generateWechatPayUrl(paymentId: string, plan: any): Promise<string> {
  // In production, call WeChat Pay unified order API
  // Returns a QR code URL for scanning
  return `weixin://wxpay/bizpayurl?pr=${paymentId}`;
}

async function generateAlipayUrl(paymentId: string, plan: any): Promise<string> {
  // In production, use Alipay SDK to generate payment page URL
  return `https://openapi.alipay.com/gateway.do?app_id=${config.payment.alipay}&biz_content=${paymentId}`;
}
