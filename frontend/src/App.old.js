import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// 自动检测后端地址：如果从手机访问，使用电脑的局域网 IP
const getBackendUrl = () => {
  const hostname = window.location.hostname;
  // 如果是 localhost，使用 localhost；否则使用当前访问的主机名（电脑的 IP）
  const backendHost = hostname === 'localhost' ? 'localhost' : hostname;
  return `http://${backendHost}:8000`;
};

const getWebSocketUrl = () => {
  const hostname = window.location.hostname;
  const backendHost = hostname === 'localhost' ? 'localhost' : hostname;
  return `ws://${backendHost}:8000`;
};

function App() {
  const [segments, setSegments] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [isFreeStyle, setIsFreeStyle] = useState(false);
  const [qaAnswer, setQaAnswer] = useState("");
  const [isQAOpen, setIsQAOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ script: false, ppt: false });
  const [loading, setLoading] = useState({ script: false, ppt: false, qa: false });
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  
  const scrollRef = useRef([]);
  const ws = useRef(null);
  const recognition = useRef(null);

  // 初始化 WebSocket
  useEffect(() => {
    if (uploadStatus.script) {
      ws.current = new WebSocket(`${getWebSocketUrl()}/ws/speech`);
      
      ws.current.onopen = () => {
        console.log("WebSocket 连接成功");
      };
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) {
          setError(data.error);
          return;
        }
        setSegments(data.segments);
        setCurrentIdx(data.current_idx);
        setIsFreeStyle(data.is_free_style);
      };
      
      ws.current.onerror = () => {
        setError("实时追踪连接失败，请检查后端服务");
      };
      
      return () => ws.current?.close();
    }
  }, [uploadStatus.script]);

  // 自动滚动逻辑（优化：更平滑）
  useEffect(() => {
    if (currentIdx !== -1 && scrollRef.current[currentIdx]) {
      scrollRef.current[currentIdx].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [currentIdx]);

  // 计算演讲进度
  useEffect(() => {
    if (segments.length > 0) {
      const covered = segments.filter(s => s.status === 'covered').length;
      setProgress(Math.round((covered / segments.length) * 100));
    }
  }, [segments]);

  // 初始化 Web Speech API（前端实时STT）
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = false;
      recognition.current.lang = 'zh-CN';  // 支持中文，可动态切换

      recognition.current.onresult = (event) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        
        // 发送到后端进行匹配
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ text }));
        }
      };

      recognition.current.onerror = (event) => {
        console.error("语音识别错误:", event.error);
        if (event.error === 'no-speech') {
          // 自动重启（用户体验优化）
          setTimeout(() => {
            if (isListening) recognition.current.start();
          }, 1000);
        }
      };
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!uploadStatus.script) {
      setError("请先上传演讲稿");
      return;
    }

    if (!recognition.current) {
      setError("您的浏览器不支持语音识别，请使用 Chrome 或 Edge");
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
      setError("");
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading({ ...loading, [type]: true });
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    
    const endpoint = type === 'script' ? '/upload_script' : '/upload_ppt';
    
    try {
      const res = await fetch(`${getBackendUrl()}${endpoint}`, {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      
      if (data.success) {
        if (type === 'script') {
          setSegments(data.segments);
          setUploadStatus({ ...uploadStatus, script: true });
        } else {
          setUploadStatus({ ...uploadStatus, ppt: true });
        }
      } else {
        setError(data.detail || "上传失败");
      }
    } catch (err) {
      setError(`${type === 'script' ? '演讲稿' : 'PPT'} 上传失败，请检查网络`);
    } finally {
      setLoading({ ...loading, [type]: false });
    }
  };

  const askQuestion = async (text) => {
    if (!text.trim()) {
      setError("请输入问题");
      return;
    }

    setLoading({ ...loading, qa: true });
    setError("");

    try {
      const res = await fetch(`${getBackendUrl()}/ask_qa?question=${encodeURIComponent(text)}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        setQaAnswer(data.answer);
      } else {
        setError(data.detail);
      }
    } catch (err) {
      setError("AI 回答失败，请重试");
    } finally {
      setLoading({ ...loading, qa: false });
    }
  };

  return (
    <div className={`app-container ${isFreeStyle ? 'free-style-active' : ''}`}>
      <header>
        <h1>🎤 Smart Teleprompter</h1>
        <div className="controls">
          <label className="file-upload-btn">
            {loading.script ? "处理中..." : uploadStatus.script ? "✓ 稿件已上传" : "📄 上传演讲稿"}
            <input 
              type="file" 
              accept=".txt,.doc,.docx" 
              onChange={(e) => handleFileUpload(e, 'script')} 
              disabled={loading.script}
            />
          </label>
          
          <label className="file-upload-btn">
            {loading.ppt ? "分析中..." : uploadStatus.ppt ? "✓ PPT已分析" : "📊 上传PPT (PDF)"}
            <input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => handleFileUpload(e, 'ppt')} 
              disabled={loading.ppt}
            />
          </label>

          <button 
            className={`listen-btn ${isListening ? 'active' : ''}`}
            onClick={toggleListening}
            disabled={!uploadStatus.script}
          >
            {isListening ? '🔴 停止监听' : '🎙️ 开始演讲'}
          </button>

          <button 
            className="qa-btn"
            onClick={() => setIsQAOpen(!isQAOpen)}
            disabled={!uploadStatus.script}
          >
            💬 Q&A 助手
          </button>
        </div>

        {/* 进度条 */}
        {segments.length > 0 && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}>
              {progress}%
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="error-toast">
            ⚠️ {error}
            <button onClick={() => setError("")}>✕</button>
          </div>
        )}
      </header>

      <main className="teleprompter-view">
        {isFreeStyle && (
          <div className="free-style-banner">
            ✨ Free Style Mode - 您正在自由发挥
          </div>
        )}
        
        <div className="script-container">
          {segments.length === 0 ? (
            <div className="empty-state">
              <h2>欢迎使用智能提词器</h2>
              <p>请上传您的演讲稿开始</p>
            </div>
          ) : (
            segments.map((seg, idx) => (
              <div
                key={seg.id}
                ref={el => scrollRef.current[idx] = el}
                className={`segment ${seg.status} ${currentIdx === idx ? 'active' : ''}`}
              >
                <span className="segment-number">{idx + 1}</span>
                {seg.text}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Q&A 面板 */}
      {isQAOpen && (
        <div className="qa-overlay" onClick={(e) => e.target.className === 'qa-overlay' && setIsQAOpen(false)}>
          <div className="qa-panel">
            <div className="qa-header">
              <h3>💬 AI 问答助手</h3>
              <button className="close-btn" onClick={() => setIsQAOpen(false)}>✕</button>
            </div>
            
            <textarea 
              placeholder="输入教授的问题..." 
              id="q-input"
              rows="3"
            />
            
            <button 
              className="ask-btn"
              onClick={() => askQuestion(document.getElementById('q-input').value)}
              disabled={loading.qa}
            >
              {loading.qa ? "思考中..." : "🤖 获取回答建议"}
            </button>
            
            {qaAnswer && (
              <div className="ai-response">
                <strong>AI 建议：</strong>
                <div className="answer-content">{qaAnswer}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

