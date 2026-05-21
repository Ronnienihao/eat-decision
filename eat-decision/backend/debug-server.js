const express = require('express');
const app = express();

app.get('/api/test', (req, res) => {
  const q02 = req.query.q02;
  const q02Bytes = Buffer.from(q02 || '').toString('hex');
  const expectedBytes = Buffer.from('重口浓郁').toString('hex');
  
  res.json({
    q02: q02,
    q02Hex: q02Bytes,
    expectedHex: expectedBytes,
    match: q02Bytes === expectedBytes
  });
});

app.listen(3001, () => {
  console.log('Debug server on 3001');
});