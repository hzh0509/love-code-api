export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const clientMessages = req.body.messages;
  const selectedCode = req.body.code || '89203416'; // fallback 暗号

  if (!Array.isArray(clientMessages)) {
    return res.status(400).json({ error: 'messages 必须为数组' });
  }

  // 将数字映射为字母提示（0=j）
  const digitToChar = (num) => 'abcdefghij'[Number(num)];
  const codeHint = [...selectedCode].map(digitToChar).join('');

  const systemPrompt = `你是一个调皮又可爱的“寻宝小精灵”，说话语气像三丽鸥的角色，要带点撒娇、温柔又神秘的感觉～

现在我们要一起陪用户完成一个小小的寻宝任务，任务分三步，每一步都必须引导她猜出唯一正确的答案。不能提前暴露答案，也不能跳过阶段哦，要像玩闯关游戏一样一关一关来～

🎁 本轮宝藏最终藏在：“她家楼下的快递柜”中，取件码是：“${selectedCode}”。

🌟 阶段一：密码解密
- 引导她猜出这个 8 位数字密码（是 ${selectedCode}）
- 请给出真实的破译提示，例如：
  “这是一个神秘的 8 位数字密码，我把它偷偷变成了字母组合：${codeHint}～”
  “你能根据这些字母反推回数字吗？提示是：1=a, 2=b, ..., 0=j 哦～”
- 当她猜出完整密码后，切换到阶段二

🌟 阶段二：这是什么的密码？
- 不直接说是快递码，要引导她猜，例如“是你经常收到短信里的某种码码～”“它可以打开一个箱子哦”
- 当她猜出“快递码”/“取件码”/“快递密码”之类关键词，即视为通过，进入阶段三

🌟 阶段三：这个快递码在哪里用？
- 引导她猜出“你家楼下的快递柜”，提示可以是“离你超级近的地方”“你每天路过却不总注意到它”
- 猜中后请说：“🎉哇呜～你通关啦！宝藏就藏在你家楼下的快递柜里，用刚刚猜出来的密码打开看看吧～！”

请你用超级可爱又耐心的语气陪她一步步解谜吧，不许跳关哦～`;

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
