import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import './TeleprompterPage.css';

const getWebSocketUrl = () => {
  const hostname = window.location.hostname;
  const backendHost = hostname === 'localhost' ? 'localhost' : hostname;
  return `ws://${backendHost}:8000`;
};

const TeleprompterPage = ({ segments: initialSegments }) => {
  const [segments, setSegments] = useState(initialSegments || []);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [isFreeStyle, setIsFreeStyle] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const scrollRef = useRef([]);
  const ws = useRef(null);
  const recognition = useRef(null);

  // WebSocket连接
  useEffect(() => {
    if (segments.length > 0) {
      ws.current = new WebSocket(`${getWebSocketUrl()}/ws/speech`);
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!data.error) {
          setSegments(data.segments);
          setCurrentIdx(data.current_idx);
          setIsFreeStyle(data.is_free_style);
        }
      };
      
      return () => ws.current?.close();
    }
  }, [segments.length]);

  // 自动滚动
  useEffect(() => {
    if (currentIdx !== -1 && scrollRef.current[currentIdx]) {
      scrollRef.current[currentIdx].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentIdx]);

  // 计算进度
  useEffect(() => {
    if (segments.length > 0) {
      const covered = segments.filter(s => s.status === 'covered').length;
      setProgress(Math.round((covered / segments.length) * 100));
    }
  }, [segments]);

  // 语音识别
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = false;
      recognition.current.lang = 'zh-CN';

      recognition.current.onresult = (event) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ text }));
        }
      };

      recognition.current.onerror = (event) => {
        if (event.error === 'no-speech') {
          setTimeout(() => {
            if (isListening) recognition.current.start();
          }, 1000);
        }
      };
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!recognition.current) {
      alert('您的浏览器不支持语音识别');
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
    }
  };

  if (segments.length === 0) {
    return (
      <div className="teleprompter-page">
        <PageHeader title="提词器" />
        <div className="empty-prompt">
          <div className="empty-icon">📝</div>
          <h2>还没有演讲稿</h2>
          <p>请先在"演讲稿"页面上传您的演讲内容</p>
        </div>
      </div>
    );
  }

  const headerRightAction = (
    <button 
      className={`listen-toggle-mini ${isListening ? 'active' : ''}`}
      onClick={toggleListening}
    >
      {isListening ? '⏸️' : '🎙️'}
    </button>
  );

  return (
    <div className={`teleprompter-page ${isFreeStyle ? 'free-style-active' : ''}`}>
      <PageHeader 
        title="提词器" 
        rightAction={headerRightAction}
      />
      
      <div className="teleprompter-status">
        <div className="progress-info">
          <span className="progress-text">进度 {progress}%</span>
          <div className="progress-bar-small">
            <div className="progress-fill-small" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      {isFreeStyle && (
        <div className="free-style-indicator">
          ✨ 自由发挥中
        </div>
      )}

      <div className="script-content">
        {segments.map((seg, idx) => (
          <div
            key={seg.id}
            ref={el => scrollRef.current[idx] = el}
            className={`speech-segment ${seg.status} ${currentIdx === idx ? 'active' : ''}`}
          >
            {seg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeleprompterPage;

