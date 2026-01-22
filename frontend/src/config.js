// API 配置
export const getBackendUrl = () => {
  // 如果有环境变量配置，优先使用
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // 获取当前访问的主机名
  const hostname = window.location.hostname;
  
  // 如果是 ngrok 域名，需要单独配置后端地址
  if (hostname.includes('ngrok')) {
    // 用户需要手动配置后端 ngrok 地址
    // 可以通过 localStorage 设置
    const backendUrl = localStorage.getItem('backend_url');
    if (backendUrl) {
      return backendUrl;
    }
    
    // 如果没有配置，提示用户
    console.warn('请配置后端地址：localStorage.setItem("backend_url", "https://your-backend.ngrok-free.dev")');
    return null;
  }
  
  // 本地开发或局域网访问
  const backendHost = hostname === 'localhost' ? 'localhost' : hostname;
  return `http://${backendHost}:8000`;
};

export const getWebSocketUrl = () => {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return null;
  
  // 将 http/https 转换为 ws/wss
  return backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
};




