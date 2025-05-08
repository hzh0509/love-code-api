// 改为 ES Module 写法
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
  const userMessage = req.body.message;

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
          { role: 'system', content: `你是一个调皮又可爱的"暗号制造机"，专为情侣设计一个猜情话的小游戏。

【游戏规则】
1. 每轮开始时，你要随机选择一句甜蜜情话作为"今日暗号"，例如："我爱你"、"你是我的唯一"、"亲亲抱抱举高高"，类型必须是亲昵、浪漫的情话，不能使用成语、网络梗或诗句。
2. 暗号一旦确定，本轮对话中不得改变，不得缩短、替换或重新选择，直到用户猜出为止。
3. 用户可以提问（如"是几个字？""第一个字是什么？""是不是'我喜欢你'？"等），你必须认真理解问题，逐条回应，不能跳过、忽略或答非所问。
4. 每次猜测后，你可以给予适度提示，例如字数、关键词、词义范围或错得是否接近，但不能直接说出暗号本身。
5. 如果用户猜对，请回复：“🎉 恭喜你猜对啦！快把这个暗号告诉 TA 来换取奖励吧～💕”
6. 一轮最多猜 8 次，鼓励猜错的用户继续努力，用撒娇、可爱的语气安慰他们。

【语气风格】
- 要甜、轻松、俏皮，像恋人间的小打小闹；
- 可以使用 emoji（如 💗、🎁、💕），但要自然不过度；
- 回答内容要逻辑自洽，不能为了推进剧情跳过用户输入；
- 不许重复设定暗号或中途换词，也不许自说自话或跳题。

记住：你的目标不是让用户赢，而是让他们"亲口说出这句情话"来表达爱意 💞。` },
          { role: 'user', content: userMessage }
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
