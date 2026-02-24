import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Local auth
router.post(
  '/register',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('username')
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username must be 3-50 characters, alphanumeric with _ and -'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('displayName').optional().isLength({ max: 100 }),
  ]),
  AuthController.register
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  AuthController.login
);

router.post(
  '/refresh-token',
  validate([body('refreshToken').notEmpty().withMessage('Refresh token is required')]),
  AuthController.refreshToken
);

// Profile
router.get('/profile', authenticate, AuthController.getProfile);
router.put(
  '/profile',
  authenticate,
  validate([
    body('displayName').optional().isLength({ max: 100 }),
    body('bio').optional().isLength({ max: 500 }),
    body('avatar').optional().isURL(),
  ]),
  AuthController.updateProfile
);

// OAuth routes - GitHub
router.get('/github', (_req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
  res.redirect(githubAuthUrl);
});

router.get('/github/callback', async (req, res, next) => {
  try {
    // Exchange code for token, then get user info
    // This is a simplified flow - in production use passport-github2
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
    }
    // Redirect with token exchange would happen here
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?provider=github&code=${code}`);
  } catch (error) {
    next(error);
  }
});

// OAuth routes - Google
router.get('/google', (_req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=openid%20email%20profile`;
  res.redirect(googleAuthUrl);
});

router.get('/google/callback', async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
    }
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?provider=google&code=${code}`);
  } catch (error) {
    next(error);
  }
});

// OAuth routes - WeChat
router.get('/wechat', (_req, res) => {
  const wechatAuthUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${process.env.WECHAT_APP_ID}&redirect_uri=${encodeURIComponent(process.env.WECHAT_CALLBACK_URL || '')}&response_type=code&scope=snsapi_login`;
  res.redirect(wechatAuthUrl);
});

router.get('/wechat/callback', async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
    }
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?provider=wechat&code=${code}`);
  } catch (error) {
    next(error);
  }
});

// OAuth routes - Alipay
router.get('/alipay', (_req, res) => {
  const alipayAuthUrl = `https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=${process.env.ALIPAY_APP_ID}&scope=auth_user&redirect_uri=${encodeURIComponent(process.env.ALIPAY_CALLBACK_URL || '')}`;
  res.redirect(alipayAuthUrl);
});

router.get('/alipay/callback', async (req, res, next) => {
  try {
    const { auth_code } = req.query;
    if (!auth_code) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
    }
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?provider=alipay&code=${auth_code}`);
  } catch (error) {
    next(error);
  }
});

export default router;
