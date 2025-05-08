export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const clientMessages = req.body.messages;

  // 如果 messages 为空或不是数组，直接报错
  if (!Array.isArray(clientMessages)) {
    return res.status(400).json({ error: '请求必须包含 messages 数组' });
  }

  const possibleCodes = [
    "我爱你", "亲亲抱抱", "你是我的唯一", "你是我的宝贝",
    "超喜欢你", "陪你到老", "和我在一起吧"
  ];
  const selectedCode = possibleCodes[Math.floor(Math.random() * possibleCodes.length)];

  const systemPrompt = `你是一个调皮又可爱的“暗号制造机”，专为情侣设计一个猜情话的小游戏。

请记住：本轮的暗号是："${selectedCode}"。

【游戏规则】
1. 本轮的暗号必须保持不变，直到用户猜出。
2. 用户会提问和猜测，你要逐步给予提示，但不能直接说出暗号。
3. 回答逻辑要连贯，不要跳题或换词。
4. 如果用户猜对，请回复：“🎉 恭喜你猜对啦！快把这个暗号告诉 TA 来换取奖励吧～💕”
5. 语气要撒娇、轻松、可爱。`;

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
    console.log('[OpenAI 原始响应]', JSON.stringify(data, null, 2));

    if (data?.choices?.[0]?.message?.content) {
      res.status(200).json(data.choices[0].message);
    } else if (data?.error) {
      res.status(500).json({ error: 'OpenAI API 返回错误', detail: data.error });
    } else {
      res.status(500).json({ error: 'OpenAI 响应格式错误', raw: data });
    }
  } catch (err) {
    console.error('[后端异常]', err);
    res.status(500).json({ error: '服务器异常', message: err.message });
  }
}
