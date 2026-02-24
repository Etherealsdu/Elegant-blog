import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { IMembershipPlan, ISubscription, PaymentProvider } from '@elegant-blog/shared';
import { membershipApi } from '../api/membership';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const MembershipPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState<IMembershipPlan[]>([]);
  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const plansRes = await membershipApi.getPlans();
      if (plansRes.data.success) {
        setPlans(plansRes.data.data || []);
      }

      if (isAuthenticated) {
        const subRes = await membershipApi.getMySubscription();
        if (subRes.data.success) {
          setSubscription(subRes.data.data || null);
        }
      }
    } catch (error) {
      console.error('Failed to load membership data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string, provider: PaymentProvider) => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    setProcessingPlan(planId);
    try {
      const response = await membershipApi.subscribe(planId, provider);
      if (response.data.success && response.data.data) {
        const { paymentUrl } = response.data.data;
        if (paymentUrl) {
          window.open(paymentUrl, '_blank');
          toast.success('请在新窗口中完成支付');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || '订阅失败');
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleCancel = async () => {
    if (!subscription || !window.confirm('确定要取消订阅吗？取消后你仍可使用至到期日。')) return;

    try {
      await membershipApi.cancelSubscription(subscription.id);
      toast.success('订阅已取消');
      loadData();
    } catch (error) {
      toast.error('取消失败');
    }
  };

  if (loading) {
    return <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  }

  return (
    <>
      <Helmet>
        <title>会员计划 - Elegant Blog</title>
      </Helmet>

      <div className="container main-content">
        {/* Hero */}
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          marginBottom: 40,
        }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: 12 }}>会员计划</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            升级会员，解锁全部订阅文章，享受无广告阅读体验
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 'var(--radius)',
            padding: 24,
            color: 'white',
            marginBottom: 32,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <h3>当前订阅</h3>
              <p>到期时间: {dayjs(subscription.endDate).format('YYYY-MM-DD')}</p>
              <p>状态: {subscription.status === 'active' ? '有效' : subscription.status}</p>
            </div>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} onClick={handleCancel}>
              取消订阅
            </button>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={plan.id} className={`pricing-card ${index === 1 ? 'popular' : ''}`}>
              <h3 className="pricing-name">{plan.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{plan.description}</p>
              <div className="pricing-price">
                &yen;{plan.price}
                <span>/{plan.durationDays <= 31 ? '月' : plan.durationDays <= 92 ? '季' : '年'}</span>
              </div>

              <ul className="pricing-features">
                {plan.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={() => handleSubscribe(plan.id, PaymentProvider.STRIPE)}
                  disabled={processingPlan === plan.id || !!subscription}
                >
                  {processingPlan === plan.id ? '处理中...' : subscription ? '已订阅' : '信用卡支付'}
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1, fontSize: '0.85rem', padding: '8px' }}
                    onClick={() => handleSubscribe(plan.id, PaymentProvider.WECHAT_PAY)}
                    disabled={processingPlan === plan.id || !!subscription}
                  >
                    微信支付
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1, fontSize: '0.85rem', padding: '8px' }}
                    onClick={() => handleSubscribe(plan.id, PaymentProvider.ALIPAY)}
                    disabled={processingPlan === plan.id || !!subscription}
                  >
                    支付宝
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 700, margin: '60px auto 0', textAlign: 'center' }}>
          <h2 style={{ marginBottom: 24 }}>常见问题</h2>
          {[
            { q: '订阅后可以随时取消吗？', a: '可以。取消后，你仍可以在订阅到期前继续使用所有会员功能。' },
            { q: '支持哪些支付方式？', a: '我们支持信用卡（通过 Stripe）、微信支付和支付宝三种方式。' },
            { q: '会员到期后文章还能看吗？', a: '到期后仅可阅读公开文章，订阅专享内容需续费后才能继续阅读。' },
            { q: '可以开发票吗？', a: '可以。请在支付完成后联系客服获取发票。' },
          ].map((item, i) => (
            <div key={i} style={{
              textAlign: 'left',
              padding: '16px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <h4 style={{ marginBottom: 6 }}>{item.q}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MembershipPage;
