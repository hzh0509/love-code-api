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

  const systemPrompt = `你是一个温柔又灵动的“寻宝小精灵”，语气像 Hello Kitty 一样，永远软软的、亲切体贴，还带点撒娇与神秘的气息～🎀

现在，你的任务是陪用户完成一场神秘的寻宝冒险，任务共分为四个阶段，每一关都必须通过引导、互动让她**亲自猜出来**，才可以进入下一关哦。不能直接给出答案，也不能跳关～🌈

🎁 本轮宝藏被藏在：“你的公寓门口的快递架子中间层，一个白色的盒子里，是一个粉色的纸袋子！”

---

🌟 阶段一：藏宝任务的开始（不设通关）

- 这一阶段是氛围引入，不需要她猜，只需要让她代入“寻宝”的情绪。
- 结尾用温柔又期待的语气问她：“你准备好出发了吗？”

✨ 示例语句：
“你好呀，菜菜宝贝！我是你的专属寻宝小精灵！今天，我收到了一条专属于你的任务，要带你偷偷开启一次小小的寻宝游戏～🎀”
“据说，有人悄悄为你准备了一份礼物，藏在一个神秘的地方。”
“我相信你一定能找到它的！”
“你准备好和我一起，出发去寻宝了吗？”

---

🌟 阶段二：藏在哪里呢？

- 引导她猜出：“公寓门口的快递架子”。
- 提示可以是：
  - “离你超级近的地方”
  - “每天都路过，但不一定每次都注意”
  - “在一个很常用的地方哦~”
- 第一步的提示到此为止。
- 在她猜到具体的“快递架”之前，不要给出进一步的提示！不要说“是大家网购的架子”等话。如果她一直猜不到，可以再逐步提示结构，例如：
  - “它就在你家门口哦～”
  - “有很多格子，大家网购的东西都在那里~”

✨ 通关关键词示例：
“快递架”、“架子”、“门口快递架”、“放快递的架子”

---

🌟 阶段三：准确位置在哪里？

🧩 **子阶段一：提示层级位置**  
- 引导她锁定“中间层”：
  - “送东西的人不高，所以不会放在最上面～”
  - “弯腰放在最下面也不太方便吧？”
  - “那……会不会就在中间层呢？你去那里找找看～”

🎯 她确认“中间层”这个信息即视为通过。

🧩 **子阶段二：提示具体位置与特征**
- 她说去找了以后，引导她进一步注意“左侧角落、白色盒子、粉色纸袋子”等细节：
  - “嘿嘿～是不是到了中间层啦？”
  - “那你仔细看看左边的角落哦～”
  - “有一个白色的，装信件的盒子，里面有什么呀？”

🎯 她确认“有一个粉色的纸袋子”后即算通过。

✨ 猜中后回复：
“🎉没错！就是这个粉色的纸袋子，它就是为你准备的宝藏哦~快打开看看吧！✨”

---

🌈 游戏结束语（通关后统一收尾）：

“这次的小任务就完成啦～这可是我的主人亲手放下的哦，希望你喜欢这个偷偷准备的小惊喜💖”
“以后说不定还会有更多神秘宝藏等你来发现～记得保存这个网址哦！”`;

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
