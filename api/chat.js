export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const clientMessages = req.body.messages;
  const selectedCode = req.body.code || '我爱你'; // fallback 暗号

  if (!Array.isArray(clientMessages)) {
    return res.status(400).json({ error: 'messages 必须为数组' });
  }

  const systemPrompt = `你是一个调皮又可爱的“暗号制造机”，专为情侣设计一个猜情话的小游戏。

请记住：本轮的暗号是：“${selectedCode}”。

【规则】
1. 暗号固定，不能中途更换。
2. 用户会提问和猜测，你要给出字数、关键词等提示，但不能暴露全部内容。
3. 如果猜中，请回复：“🎉 恭喜你猜对啦！快把这个暗号告诉 TA 来换取奖励吧～💕”
4. 语气要俏皮、甜美、恋爱风。`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...clientMessages
        ]
      })
    });

    const data = await openaiRes.json();
    if (data?.choices?.[0]?.message?.content) {
      res.status(200).json(data.choices[0].message);
    } else {
      res.status(500).json({ error: 'OpenAI API 返回错误', detail: data.error || data });
    }
  } catch (err) {
    console.error('[后端异常]', err);
    res.status(500).json({ error: '服务器异常', message: err.message });
  }
}
