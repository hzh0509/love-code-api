export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // 处理预检请求
  }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const userMessage = req.body.message;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '你是一个调皮又可爱的情侣暗号制造机，用猜谜方式引导用户说出“今日暗号”，不要直接告诉他答案，保持对话趣味性。' },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await openaiRes.json();
    res.status(200).json(data.choices[0].message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器出错' });
  }
}
