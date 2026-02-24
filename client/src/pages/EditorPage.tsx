import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PostVisibility, PostStatus, ICategory, ITag } from '@elegant-blog/shared';
import { postApi } from '../api/posts';
import { categoryApi, tagApi } from '../api/categories';
import MarkdownEditor from '../components/MarkdownEditor';
import toast from 'react-hot-toast';

const EditorPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<PostVisibility>(PostVisibility.PUBLIC);
  const [status, setStatus] = useState<PostStatus>(PostStatus.DRAFT);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [tags, setTags] = useState<ITag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategoriesAndTags();
    if (isEditing && id) {
      loadPost(id);
    }
  }, [id]);

  const loadCategoriesAndTags = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([categoryApi.list(), tagApi.list()]);
      if (catRes.data.success) setCategories(catRes.data.data || []);
      if (tagRes.data.success) setTags(tagRes.data.data || []);
    } catch (error) {
      console.error('Failed to load categories/tags');
    }
  };

  const loadPost = async (postId: string) => {
    try {
      const response = await postApi.getById(postId);
      if (response.data.success && response.data.data) {
        const post = response.data.data;
        setTitle(post.title);
        setContent(post.content);
        setExcerpt(post.excerpt || '');
        setCoverImage(post.coverImage || '');
        setCategoryId(post.categoryId || '');
        setVisibility(post.visibility);
        setStatus(post.status);
        if (post.tags) {
          setSelectedTags(post.tags.map((t) => t.id));
        }
      }
    } catch (error) {
      toast.error('加载文章失败');
      navigate('/dashboard');
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      const response = await tagApi.create(newTag.trim());
      if (response.data.success && response.data.data) {
        const tag = response.data.data;
        if (!tags.find((t) => t.id === tag.id)) {
          setTags([...tags, tag]);
        }
        if (!selectedTags.includes(tag.id)) {
          setSelectedTags([...selectedTags, tag.id]);
        }
        setNewTag('');
      }
    } catch (error) {
      toast.error('添加标签失败');
    }
  };

  const handleSave = async (publishStatus: PostStatus) => {
    if (!title.trim()) {
      toast.error('请输入标题');
      return;
    }
    if (!content.trim()) {
      toast.error('请输入内容');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title: title.trim(),
        content,
        excerpt: excerpt || content.substring(0, 200),
        coverImage: coverImage || undefined,
        categoryId: categoryId || undefined,
        tagIds: selectedTags,
        visibility,
        status: publishStatus,
      };

      if (isEditing && id) {
        await postApi.update(id, postData);
        toast.success('文章已更新');
      } else {
        const response = await postApi.create(postData);
        toast.success(publishStatus === PostStatus.PUBLISHED ? '文章已发布' : '草稿已保存');
        if (response.data.data) {
          navigate(`/post/${response.data.data.slug}`);
          return;
        }
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditing ? '编辑文章' : '撰写新文章'} - Elegant Blog</title>
      </Helmet>

      <div className="container main-content">
        <div className="editor-page">
          <div className="editor-header">
            <h2>{isEditing ? '编辑文章' : '撰写新文章'}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary"
                onClick={() => handleSave(PostStatus.DRAFT)}
                disabled={saving}
              >
                保存草稿
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleSave(PostStatus.PUBLISHED)}
                disabled={saving}
              >
                {saving ? '保存中...' : '发布'}
              </button>
            </div>
          </div>

          {/* Title */}
          <input
            type="text"
            className="editor-title-input"
            placeholder="输入文章标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Settings */}
          <div className="editor-settings">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">分类</label>
              <select
                className="form-input form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">可见性</label>
              <select
                className="form-input form-select"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as PostVisibility)}
              >
                <option value={PostVisibility.PUBLIC}>公开 - 所有人可见</option>
                <option value={PostVisibility.SUBSCRIBERS_ONLY}>订阅专享 - 仅会员可见</option>
                <option value={PostVisibility.PRIVATE}>私密 - 仅自己可见</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">封面图片 URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://example.com/image.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">摘要</label>
              <input
                type="text"
                className="form-input"
                placeholder="文章摘要（可选）"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">标签</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {tags
                .filter((t) => selectedTags.includes(t.id))
                .map((tag) => (
                  <span
                    key={tag.id}
                    className="tag"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedTags(selectedTags.filter((id) => id !== tag.id))}
                  >
                    {tag.name} &times;
                  </span>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1 }}
                placeholder="输入标签名..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button className="btn btn-secondary" onClick={handleAddTag}>添加</button>
            </div>
            {tags.filter((t) => !selectedTags.includes(t.id)).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {tags
                  .filter((t) => !selectedTags.includes(t.id))
                  .slice(0, 10)
                  .map((tag) => (
                    <span
                      key={tag.id}
                      className="tag"
                      style={{ cursor: 'pointer', opacity: 0.6 }}
                      onClick={() => setSelectedTags([...selectedTags, tag.id])}
                    >
                      + {tag.name}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Markdown Editor */}
          <MarkdownEditor value={content} onChange={setContent} />
        </div>
      </div>
    </>
  );
};

export default EditorPage;
