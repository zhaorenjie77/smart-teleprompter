import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import './ScriptsPage.css';

const getBackendUrl = () => {
  // 优先使用环境变量
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  // 本地开发
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8000';
  }
  // 生产环境默认值
  return 'https://smart-teleprompter-production.up.railway.app';
};

const ScriptsPage = ({ onScriptUploaded }) => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [pptUploading, setPptUploading] = useState(false);

  const handleScriptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${getBackendUrl()}/upload_script`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        onScriptUploaded(data.segments);
        navigate('/teleprompter');
      } else {
        setError(data.detail || '上传失败');
      }
    } catch (err) {
      setError('上传失败，请检查网络');
    } finally {
      setUploading(false);
    }
  };

  const handlePPTUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPptUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${getBackendUrl()}/upload_ppt`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        alert('PPT 上传成功！');
      } else {
        setError(data.detail || 'PPT 上传失败');
      }
    } catch (err) {
      setError('PPT 上传失败，请检查网络');
    } finally {
      setPptUploading(false);
    }
  };

  return (
    <div className="scripts-page">
      <PageHeader title="演讲稿管理" />

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="upload-section">
        <div className="upload-card">
          <div className="upload-icon">📄</div>
          <h3>上传演讲稿</h3>
          <p>支持 .txt, .doc, .docx 格式</p>
          <label className="upload-btn primary">
            {uploading ? '处理中...' : '选择文件'}
            <input
              type="file"
              accept=".txt,.doc,.docx"
              onChange={handleScriptUpload}
              disabled={uploading}
            />
          </label>
        </div>

        <div className="upload-card">
          <div className="upload-icon">📊</div>
          <h3>上传 PPT</h3>
          <p>支持 PDF 格式</p>
          <label className="upload-btn">
            {pptUploading ? '分析中...' : '选择文件'}
            <input
              type="file"
              accept=".pdf"
              onChange={handlePPTUpload}
              disabled={pptUploading}
            />
          </label>
        </div>
      </div>

      <div className="info-section">
        <h2>使用说明</h2>
        <div className="info-list">
          <div className="info-item">
            <div className="info-number">1</div>
            <div className="info-content">
              <h4>准备演讲稿</h4>
              <p>将演讲内容整理成文本文件，建议按句/段分行</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-number">2</div>
            <div className="info-content">
              <h4>上传材料</h4>
              <p>上传演讲稿和 PPT（可选），系统会自动进行预处理</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-number">3</div>
            <div className="info-content">
              <h4>开始演讲</h4>
              <p>进入提词器页面，点击开始演讲即可实时追踪</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptsPage;

