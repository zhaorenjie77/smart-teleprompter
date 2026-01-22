import React, { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import './QAPage.css';

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

const QAPage = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSkippedContent, setHasSkippedContent] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setError('请输入问题');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const res = await fetch(`${getBackendUrl()}/ask_qa?question=${encodeURIComponent(question)}`, {
        method: 'POST'
      });
      
      const data = await res.json();
      
      if (data.success) {
        setAnswer(data.answer);
        setHasSkippedContent(data.has_skipped_content);
      } else {
        setError(data.detail || 'AI 回答失败');
      }
    } catch (err) {
      setError('网络错误，请检查后端服务是否运行');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  const exampleQuestions = [
    '这个主题的核心观点是什么？',
    '有哪些关键数据支持我的论点？',
    '如果教授问到技术细节该如何回答？',
    '我刚才跳过的内容是什么？'
  ];

  return (
    <div className="qa-page">
      <PageHeader title="Q&A 助手" />
      
      <div className="qa-content">
        {/* 介绍区域 */}
        <div className="qa-intro">
          <div className="intro-icon">💬</div>
          <h2>智能问答助手</h2>
          <p>基于您的演讲内容和状态，提供专业的回答建议</p>
        </div>

        {/* 输入区域 */}
        <div className="qa-input-section">
          <label className="input-label">教授的问题</label>
          <textarea
            className="qa-textarea"
            placeholder="输入教授的问题，或使用语音输入..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={4}
          />
          
          <button 
            className="ask-button"
            onClick={handleAskQuestion}
            disabled={loading || !question.trim()}
          >
            {loading ? (
              <>
                <span className="loading-spinner">⏳</span>
                思考中...
              </>
            ) : (
              <>
                <span>🤖</span>
                获取回答建议
              </>
            )}
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="qa-error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* 回答区域 */}
        {answer && (
          <div className="qa-answer-section">
            <div className="answer-header">
              <span className="answer-icon">✨</span>
              <h3>AI 回答建议</h3>
              {hasSkippedContent && (
                <span className="skip-badge">包含跳过内容提醒</span>
              )}
            </div>
            <div className="answer-content">
              {answer}
            </div>
            <div className="answer-actions">
              <button className="action-btn" onClick={() => setAnswer('')}>
                清除
              </button>
              <button className="action-btn primary" onClick={() => {
                navigator.clipboard.writeText(answer);
                alert('已复制到剪贴板');
              }}>
                复制
              </button>
            </div>
          </div>
        )}

        {/* 示例问题 */}
        {!answer && !loading && (
          <div className="example-questions">
            <h3>常见问题示例</h3>
            <div className="example-list">
              {exampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  className="example-btn"
                  onClick={() => setQuestion(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 使用提示 */}
        <div className="qa-tips">
          <div className="tip-item">
            <span className="tip-icon">💡</span>
            <div className="tip-text">
              <strong>智能提醒</strong>
              <p>如果问题涉及您跳过的内容，AI 会特别提醒您补充说明</p>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🎯</span>
            <div className="tip-text">
              <strong>上下文感知</strong>
              <p>基于您的演讲稿和 PPT 内容，提供精准的回答建议</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAPage;




