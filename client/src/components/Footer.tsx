import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Elegant Blog</h3>
            <p>一个优雅的博客平台，让写作成为享受。支持 Markdown 编辑，丰富的交互功能，和完善的会员体系。</p>
          </div>
          <div className="footer-section">
            <h4>浏览</h4>
            <Link to="/">首页</Link>
            <Link to="/categories">分类</Link>
            <Link to="/tags">标签</Link>
          </div>
          <div className="footer-section">
            <h4>服务</h4>
            <Link to="/membership">会员计划</Link>
            <Link to="/about">关于我们</Link>
            <Link to="/contact">联系我们</Link>
          </div>
          <div className="footer-section">
            <h4>法律</h4>
            <Link to="/privacy">隐私政策</Link>
            <Link to="/terms">服务条款</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Elegant Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
