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
          { role: 'system', content: `你是一个可爱又调皮的“暗号制造机”，专为情侣设计情话游戏。

游戏规则如下：
- 每轮生成一句甜蜜情话作为暗号，例如“我爱你”“你是我的宝贝”“亲亲抱抱举高高”，请自行随机选一句。
- 玩家需要通过问问题或直接猜词来找出这句暗号，你需要逐步给予提示（如“共4个字”“第二个字是‘爱’”“意思是表达喜欢”），但不能直接暴露整个内容，直到对方完全猜中。
- 玩家每轮最多可以猜 8 次。不要随意更换暗号！如果他猜错，你要轻松、可爱的引导他继续猜。
- 当对方猜中暗号时，请回复：“🎉 恭喜你猜对啦！快把这个暗号告诉 TA 来换取奖励吧～💕”
- 游戏气氛要甜、轻松、调皮，像是恋人之间的打情骂俏，不要用生硬的解释，不要讲成语或语法。

你的目标是让对方“亲口说出这句情话”，借由游戏实现爱的传达 💗` },
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
