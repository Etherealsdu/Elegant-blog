import React from 'react';
import toast from 'react-hot-toast';
import { FiLink } from 'react-icons/fi';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title, description }) => {
  const fullUrl = window.location.origin + url;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || title);

  const shareLinks = {
    wechat: () => {
      // WeChat sharing typically uses a QR code - show a modal with QR
      toast.success('请使用微信扫描二维码分享', { duration: 3000 });
      // In production, generate a QR code for the URL
    },
    weibo: () => {
      window.open(
        `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`,
        '_blank',
        'width=600,height=400'
      );
    },
    twitter: () => {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        '_blank',
        'width=600,height=400'
      );
    },
    facebook: () => {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        '_blank',
        'width=600,height=400'
      );
    },
    copyLink: async () => {
      try {
        await navigator.clipboard.writeText(fullUrl);
        toast.success('链接已复制到剪贴板');
      } catch {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = fullUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('链接已复制到剪贴板');
      }
    },
  };

  return (
    <div className="share-buttons">
      <button className="share-btn wechat" onClick={shareLinks.wechat} title="分享到微信">
        微
      </button>
      <button className="share-btn weibo" onClick={shareLinks.weibo} title="分享到微博">
        微
      </button>
      <button className="share-btn twitter" onClick={shareLinks.twitter} title="Share on Twitter">
        T
      </button>
      <button className="share-btn facebook" onClick={shareLinks.facebook} title="Share on Facebook">
        f
      </button>
      <button className="share-btn copy-link" onClick={shareLinks.copyLink} title="复制链接">
        <FiLink />
      </button>
    </div>
  );
};

export default ShareButtons;
