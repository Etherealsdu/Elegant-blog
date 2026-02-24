import React, { useCallback } from 'react';
import {
  FiBold, FiItalic, FiList, FiLink, FiImage, FiCode,
  FiAlignLeft, FiMinus, FiCheckSquare, FiType
} from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { uploadApi } from '../api/upload';
import toast from 'react-hot-toast';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, placeholder }) => {
  const [isPreview, setIsPreview] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  }, [value, onChange]);

  const toolbarActions = [
    { icon: <FiType size={16} />, title: '标题 H1', action: () => insertText('\n# ', '\n', '标题') },
    { icon: <span style={{ fontSize: 12, fontWeight: 700 }}>H2</span>, title: '标题 H2', action: () => insertText('\n## ', '\n', '二级标题') },
    { icon: <span style={{ fontSize: 12, fontWeight: 700 }}>H3</span>, title: '标题 H3', action: () => insertText('\n### ', '\n', '三级标题') },
    { type: 'divider' },
    { icon: <FiBold size={16} />, title: '粗体', action: () => insertText('**', '**', '粗体文字') },
    { icon: <FiItalic size={16} />, title: '斜体', action: () => insertText('*', '*', '斜体文字') },
    { icon: <span style={{ textDecoration: 'line-through', fontSize: 13 }}>S</span>, title: '删除线', action: () => insertText('~~', '~~', '删除文字') },
    { type: 'divider' },
    { icon: <FiList size={16} />, title: '无序列表', action: () => insertText('\n- ', '\n', '列表项') },
    { icon: <span style={{ fontSize: 13 }}>1.</span>, title: '有序列表', action: () => insertText('\n1. ', '\n', '列表项') },
    { icon: <FiCheckSquare size={16} />, title: '任务列表', action: () => insertText('\n- [ ] ', '\n', '任务项') },
    { type: 'divider' },
    { icon: <FiLink size={16} />, title: '链接', action: () => insertText('[', '](https://)', '链接文字') },
    { icon: <FiImage size={16} />, title: '图片', action: () => handleImageUpload() },
    { icon: <FiCode size={16} />, title: '代码块', action: () => insertText('\n```\n', '\n```\n', '代码') },
    { icon: <FiAlignLeft size={16} />, title: '引用', action: () => insertText('\n> ', '\n', '引用文字') },
    { icon: <FiMinus size={16} />, title: '分割线', action: () => insertText('\n---\n') },
    { type: 'divider' },
    {
      icon: <span style={{ fontSize: 12 }}>表格</span>,
      title: '插入表格',
      action: () => insertText(
        '\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n',
        ''
      ),
    },
  ];

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        toast.loading('上传图片中...', { id: 'upload' });
        const response = await uploadApi.uploadImage(file);
        if (response.data.success && response.data.data) {
          insertText(`\n![${file.name}](${response.data.data.url})\n`);
          toast.success('图片上传成功', { id: 'upload' });
        }
      } catch (error) {
        toast.error('图片上传失败', { id: 'upload' });
      }
    };
    input.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  ');
    }
    // Ctrl/Cmd + B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertText('**', '**', '粗体文字');
    }
    // Ctrl/Cmd + I for italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertText('*', '*', '斜体文字');
    }
    // Ctrl/Cmd + K for link
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      insertText('[', '](https://)', '链接文字');
    }
  };

  return (
    <div style={{ border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        padding: '8px 12px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
      }}>
        {toolbarActions.map((item, index) => {
          if ((item as any).type === 'divider') {
            return (
              <div
                key={`divider-${index}`}
                style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }}
              />
            );
          }
          return (
            <button
              key={index}
              type="button"
              title={(item as any).title}
              onClick={(item as any).action}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: 4,
                color: 'var(--text-secondary)',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--border)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {(item as any).icon}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            className={`btn btn-sm ${!isPreview ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsPreview(false)}
            style={{ padding: '4px 12px', fontSize: '0.8rem' }}
          >
            编辑
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isPreview ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsPreview(true)}
            style={{ padding: '4px 12px', fontSize: '0.8rem' }}
          >
            预览
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {isPreview ? (
        <div
          className="post-detail-content"
          style={{ padding: 20, minHeight: 400, maxHeight: 600, overflow: 'auto' }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p style={{ color: 'var(--text-light)' }}>暂无内容可预览</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || '开始撰写你的文章...\n\n支持 Markdown 语法，也可以使用上方工具栏快速插入格式'}
          style={{
            width: '100%',
            minHeight: 400,
            maxHeight: 600,
            padding: 20,
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            fontFamily: "'SF Mono', 'Fira Code', 'Menlo', monospace",
            fontSize: '0.95rem',
            lineHeight: 1.8,
          }}
        />
      )}
    </div>
  );
};

export default MarkdownEditor;
