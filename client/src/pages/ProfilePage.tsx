import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, loadUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile({ displayName, bio, avatar } as any);
      await loadUser();
      toast.success('个人资料已更新');
    } catch (error) {
      toast.error('更新失败');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>个人设置 - Elegant Blog</title>
      </Helmet>

      <div className="container main-content">
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ marginBottom: 32 }}>个人设置</h1>

          <div className="card" style={{ padding: 32 }}>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">邮箱</label>
                <input type="email" className="form-input" value={user.email} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">用户名</label>
                <input type="text" className="form-input" value={user.username} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">显示名称</label>
                <input
                  type="text"
                  className="form-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label className="form-label">头像 URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                {avatar && (
                  <img
                    src={avatar}
                    alt="Preview"
                    style={{ width: 60, height: 60, borderRadius: '50%', marginTop: 8, objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">个人简介</label>
                <textarea
                  className="form-input form-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  placeholder="介绍一下自己..."
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '保存中...' : '保存修改'}
              </button>
            </form>
          </div>

          {/* Account Info */}
          <div className="card" style={{ padding: 32, marginTop: 24 }}>
            <h3 style={{ marginBottom: 16 }}>账户信息</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              注册方式: {user.provider === 'local' ? '邮箱注册' : user.provider.toUpperCase()}
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              角色: {user.role === 'admin' ? '管理员' : user.role === 'author' ? '作者' : '用户'}
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              邮箱验证: {user.isEmailVerified ? '已验证' : '未验证'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
