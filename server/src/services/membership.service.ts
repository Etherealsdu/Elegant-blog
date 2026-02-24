import { MembershipPlan, Subscription, Payment } from '../models';
import { MembershipPlan as PlanEnum, SubscriptionStatus, PaymentProvider, PaymentStatus } from '@elegant-blog/shared';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

export class MembershipService {
  static async getPlans() {
    return MembershipPlan.findAll({
      where: { isActive: true },
      order: [['price', 'ASC']],
    });
  }

  static async getPlanById(id: string) {
    const plan = await MembershipPlan.findByPk(id);
    if (!plan) {
      throw new AppError('Membership plan not found', 404);
    }
    return plan;
  }

  static async createPlan(data: {
    name: string;
    plan: PlanEnum;
    price: number;
    durationDays: number;
    description: string;
    features: string[];
  }) {
    return MembershipPlan.create(data);
  }

  static async getActiveSubscription(userId: string) {
    return Subscription.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: { [Op.gt]: new Date() },
      },
      include: [{ model: MembershipPlan, as: 'plan' }],
      order: [['endDate', 'DESC']],
    });
  }

  static async isSubscribed(userId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId);
    return !!subscription;
  }

  static async subscribe(userId: string, planId: string, provider: PaymentProvider) {
    const plan = await this.getPlanById(planId);

    // Create pending payment
    const payment = await Payment.create({
      userId,
      amount: plan.price,
      currency: plan.currency,
      provider,
      status: PaymentStatus.PENDING,
      description: `Subscription to ${plan.name}`,
    });

    return {
      payment,
      plan,
    };
  }

  static async confirmPayment(paymentId: string, providerPaymentId: string) {
    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppError('Payment already processed', 400);
    }

    // Update payment status
    await payment.update({
      status: PaymentStatus.COMPLETED,
      providerPaymentId,
    });

    // Find the plan - we need to find it by looking up the subscription or via the description
    const plans = await MembershipPlan.findAll({ where: { isActive: true } });
    const matchedPlan = plans.find((p) => payment.description.includes(p.name));

    if (!matchedPlan) {
      throw new AppError('Associated plan not found', 404);
    }

    // Create subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + matchedPlan.durationDays);

    const subscription = await Subscription.create({
      userId: payment.userId,
      planId: matchedPlan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate,
      endDate,
    });

    // Link payment to subscription
    await payment.update({ subscriptionId: subscription.id });

    return { subscription, payment };
  }

  static async cancelSubscription(subscriptionId: string, userId: string) {
    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    if (subscription.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    await subscription.update({
      status: SubscriptionStatus.CANCELLED,
      autoRenew: false,
    });

    return subscription;
  }

  static async getUserPayments(userId: string, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Payment.findAndCountAll({
      where: { userId },
      include: [{ model: Subscription, as: 'subscription', include: [{ model: MembershipPlan, as: 'plan' }] }],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });

    return {
      items: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  }

  static async seedDefaultPlans() {
    const plans = [
      {
        name: '月度会员',
        plan: PlanEnum.MONTHLY,
        price: 29.9,
        durationDays: 30,
        description: '按月订阅，解锁所有付费内容',
        features: ['阅读全部订阅文章', '评论互动', '无广告体验', '月度会员标识'],
      },
      {
        name: '季度会员',
        plan: PlanEnum.QUARTERLY,
        price: 79.9,
        durationDays: 90,
        description: '季度订阅，享受更多优惠',
        features: ['阅读全部订阅文章', '评论互动', '无广告体验', '季度会员标识', '专属客服支持'],
      },
      {
        name: '年度会员',
        plan: PlanEnum.YEARLY,
        price: 259.9,
        durationDays: 365,
        description: '年度订阅，最大优惠',
        features: ['阅读全部订阅文章', '评论互动', '无广告体验', '年度会员标识', '专属客服支持', '优先体验新功能', '年度赠品'],
      },
    ];

    for (const planData of plans) {
      const existing = await MembershipPlan.findOne({ where: { plan: planData.plan } });
      if (!existing) {
        await MembershipPlan.create(planData);
      }
    }
  }
}
