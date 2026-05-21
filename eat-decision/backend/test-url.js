const http = require('http');

// 用与 Express 相同的方式解析 URL
const URL = require('url').URL;

const rawUrl = '/api/dishes?q01=%E4%B8%AD%E5%9B%BD%E8%8F%9C&q02=%E9%87%8D%E5%8F%A3%E6%B5%93%E5%8D%8C';
const baseUrl = 'http://localhost:3000';

const parsed = new URL(rawUrl, baseUrl);
console.log('path:', parsed.pathname);
console.log('q01:', parsed.searchParams.get('q01'));
console.log('q02:', parsed.searchParams.get('q02'));
console.log('q02 bytes:', Buffer.from(parsed.searchParams.get('q02') || '').toString('hex'));

// 预期值
console.log('expected q02 hex:', Buffer.from('重口浓郁').toString('hex'));

// 实际测试 HTTP 请求
const options = {
  hostname: 'localhost',
  port: 3000,
  path: rawUrl,
  method: 'GET'
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const d = JSON.parse(data);
    console.log('API result total:', d.total);
  });
});
req.on('error', e => console.error('Error:', e));
req.end();