export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 后端服务器地址
    const BACKEND = 'http://43.128.123.207:3000';
    
    // 构造目标 URL
    const targetPath = url.pathname.replace('/api', '');
    const targetUrl = `${BACKEND}${targetPath}${url.search}`;
    
    // 转发请求
    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Cloudflare-Worker'
        },
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.text()
      });
      
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Backend unavailable', 
        message: error.message 
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
