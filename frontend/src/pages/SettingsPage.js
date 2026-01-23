import React, { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import './SettingsPage.css';

const SettingsPage = () => {
  // 从 localStorage 加载保存的设置
  const loadSettings = () => {
    const defaultSettings = {
      speechLanguage: 'zh-CN',
      sensitivity: 0.5,  // 默认 50%（中等）
      autoScroll: true,
      showProgress: true,
      fontSize: 'medium',
      theme: 'light'
    };
    
    const savedSettings = {};
    Object.keys(defaultSettings).forEach(key => {
      const saved = localStorage.getItem(`setting_${key}`);
      if (saved !== null) {
        // 处理不同类型的值
        if (key === 'sensitivity') {
          savedSettings[key] = parseFloat(saved);
        } else if (key === 'autoScroll' || key === 'showProgress') {
          savedSettings[key] = saved === 'true';
        } else {
          savedSettings[key] = saved;
        }
      } else {
        savedSettings[key] = defaultSettings[key];
      }
    });
    
    return savedSettings;
  };
  
  const [settings, setSettings] = useState(loadSettings());

  const [backendUrl, setBackendUrl] = useState(
    localStorage.getItem('backend_url') || ''
  );

  const handleBackendUrlSave = () => {
    if (backendUrl) {
      localStorage.setItem('backend_url', backendUrl);
      alert('后端地址已保存！刷新页面生效。');
      window.location.reload();
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    // 这里可以保存到 localStorage
    localStorage.setItem(`setting_${key}`, value);
  };

  const handleReset = () => {
    if (window.confirm('确定要恢复默认设置吗？')) {
      const defaultSettings = {
        speechLanguage: 'zh-CN',
        sensitivity: 0.5,  // 默认 50%
        autoScroll: true,
        showProgress: true,
        fontSize: 'medium',
        theme: 'light'
      };
      setSettings(defaultSettings);
      Object.keys(defaultSettings).forEach(key => {
        localStorage.removeItem(`setting_${key}`);
      });
      alert('已恢复默认设置！');
    }
  };

  return (
    <div className="settings-page">
      <PageHeader title="设置" />
      
      <div className="settings-content">
        
        {/* 网络设置 */}
        <section className="settings-section">
          <h2 className="section-title">网络设置</h2>
          
          <div className="setting-item backend-url-setting">
            <div className="setting-info">
              <h3>后端 API 地址</h3>
              <p>使用 ngrok 时需要配置后端地址</p>
            </div>
          </div>
          <div className="backend-url-input">
            <input
              type="text"
              placeholder="https://your-backend.ngrok-free.dev"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="url-input"
            />
            <button onClick={handleBackendUrlSave} className="save-url-btn">
              保存
            </button>
          </div>
          <p className="backend-hint">
            💡 提示：如果已在 Vercel 配置环境变量，无需手动输入
          </p>
          <p className="backend-hint">
            当前地址: {localStorage.getItem('backend_url') || process.env.REACT_APP_BACKEND_URL || '使用默认'}
          </p>
        </section>

        {/* 语音识别设置 */}
        <section className="settings-section">
          <h2 className="section-title">语音识别</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>识别语言</h3>
              <p>选择演讲的主要语言</p>
            </div>
            <select 
              className="setting-select"
              value={settings.speechLanguage}
              onChange={(e) => handleSettingChange('speechLanguage', e.target.value)}
            >
              <option value="zh-CN">中文（简体）</option>
              <option value="zh-TW">中文（繁体）</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>匹配灵敏度</h3>
              <p>调整语义匹配的严格程度</p>
            </div>
            <div className="sensitivity-control">
              <input
                type="range"
                min="0.5"
                max="0.9"
                step="0.05"
                value={settings.sensitivity}
                onChange={(e) => handleSettingChange('sensitivity', parseFloat(e.target.value))}
                className="setting-slider"
              />
              <span className="sensitivity-value">{Math.round(settings.sensitivity * 100)}%</span>
            </div>
            <div className="sensitivity-labels">
              <span>宽松</span>
              <span>精确</span>
            </div>
          </div>
        </section>

        {/* 显示设置 */}
        <section className="settings-section">
          <h2 className="section-title">显示</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>字体大小</h3>
              <p>提词器文字的大小</p>
            </div>
            <div className="font-size-options">
              {['small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  className={`font-btn ${settings.fontSize === size ? 'active' : ''}`}
                  onClick={() => handleSettingChange('fontSize', size)}
                >
                  {size === 'small' && '小'}
                  {size === 'medium' && '中'}
                  {size === 'large' && '大'}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>自动滚动</h3>
              <p>跟随演讲进度自动滚动</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.autoScroll}
                onChange={(e) => handleSettingChange('autoScroll', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>显示进度</h3>
              <p>在顶部显示演讲进度条</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.showProgress}
                onChange={(e) => handleSettingChange('showProgress', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </section>

        {/* 关于 */}
        <section className="settings-section">
          <h2 className="section-title">关于</h2>
          
          <div className="about-card">
            <div className="app-icon">🎤</div>
            <h3>Smart Teleprompter</h3>
            <p className="version">版本 1.0.0</p>
            <p className="description">
              基于 AI 的智能演讲提词助手，支持实时追踪和智能问答
            </p>
            <div className="about-links">
              <a href="https://github.com" className="about-link">GitHub</a>
              <span className="link-divider">•</span>
              <a href="#" className="about-link">使用帮助</a>
              <span className="link-divider">•</span>
              <a href="#" className="about-link">反馈</a>
            </div>
          </div>
        </section>

        {/* 数据管理 */}
        <section className="settings-section">
          <h2 className="section-title">数据管理</h2>
          
          <button className="danger-btn" onClick={handleReset}>
            <span>🔄</span>
            恢复默认设置
          </button>
        </section>

        {/* 技术信息 */}
        <div className="tech-info">
          <p>🚀 Powered by Gemini AI</p>
          <p>Made with ❤️ by Jack</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

