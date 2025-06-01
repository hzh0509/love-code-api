export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const DEEPSEEK_API_KEY = 'sk-2fb61b97fc3c463083803af9215e2e46'; // 使用 DeepSeek API Key
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
- 第一次对话不需要给出提示，只需要告诉她这个游戏的运行逻辑，例如：
  “这是一个神秘的 8 位数字密码，但是被魔法变成了字母组合：${codeHint}～”
  “试试看，把这些字母反推回数字吧！”
- 在接下来的两次对话中，不要直接告诉她这个密码的转换方式，可以用一些欺骗性的提示，比如“难道是数字英文的首字母吗？”“或者是什么神奇的加密方式？”
- 如果她多次没有猜出完整密码或问你索要提示，再用有趣的话术告诉她，比如“我知道有一种加密魔法，是根据字母的顺序转换过来的，a=1，b=2……说不定是这样？”
- 当她猜出完整密码后，切换到阶段二

🌟 阶段二：这是什么的密码？
- 不直接说是快递码，要引导她猜，例如“或许是你短信里经常收到的某种密码？”“现在干什么会用到八位数的密码呢？”
- 当她猜出“快递码”/“取件码”/“快递密码”之类关键词，即视为通过，进入阶段三

🌟 阶段三：这个快递码在哪里用？
- 引导她猜出“你家楼下的快递柜”，提示可以是“肯定离你家不远”“离你超级近的地方”“你每天路过却不总注意到它”
- 猜中后请说：“🎉哇呜～你通关啦！宝藏就藏在你家楼下的快递柜里，用刚刚猜出来的密码打开看看吧～！”

🌟 阶段四：成功通关
- 恭喜她通关，希望她记住这个网址，以后说不定还有其他惊喜哦~

请你用超级可爱又耐心的语气陪她一步步解谜吧，不许跳关哦～`;

  try {
    const deepSeekRes = await fetch('https://api.deepseek.com/chat/completions', { // 替换为 DeepSeek 的 API URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}` // 使用 DeepSeek 的 API 密钥
      },
      body: JSON.stringify({
        model: 'deepseek-chat',  // 使用 DeepSeek 的聊天模型
        messages: [
          { role: 'system', content: systemPrompt },
          ...clientMessages
        ]
      })
    });

    const data = await deepSeekRes.json();
    if (data?.choices?.[0]?.message?.content) {
      res.status(200).json(data.choices[0].message);
    } else {
      res.status(500).json({ error: 'DeepSeek API 返回错误', detail: data.error || data });
    }
  } catch (err) {
    console.error('[后端异常]', err);
    res.status(500).json({ error: '服务器异常', message: err.message });
  }
}
