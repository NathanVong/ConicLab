# ConicLab · 圓錐曲線探索實驗室

高二數學互動工具，以**橢圓、雙曲線**為核心，結合圖像可視化、即時演算法驗算與 DeepSeek 數學導師。前端純 HTML/CSS/JavaScript，後端 Cloudflare Workers。

## 功能

- 橢圓 / 雙曲線切換，拖動圖上 P 點與 a、b 滑桿
- 自動計算焦點 F₁/F₂、焦距 c、離心率 e、兩條焦距
- 驗證橢圓 `PF₁ + PF₂ = 2a` 或雙曲線 `|PF₁ − PF₂| = 2a`，顯示浮點誤差
- 顯示切線；橢圓呈現焦點光線路徑，雙曲線呈現兩條漸近線
- DeepSeek 導師可根據目前使用者的幾何參數講解和出題；沒有 AI Key 也可使用所有計算與圖像功能
- 手機及電腦均可使用，畫布可用方向鍵移動 P 點

## 數學核心

中心設為 (0,0)，長軸／實軸為 x 軸。

橢圓：`x²/a² + y²/b² = 1`，`c² = a² − b²`，`F₁=(-c,0), F₂=(c,0)`，`e=c/a < 1`。

雙曲線：`x²/a² − y²/b² = 1`，`c² = a² + b²`，`F₁=(-c,0), F₂=(c,0)`，`e=c/a > 1`，漸近線 `y=±(b/a)x`。

曲線上的點以參數化公式生成，使用 `Math.hypot` 計算距離。驗算引擎是確定性的，**不依賴 AI 生成數值**。

## 本地執行

需要 Node.js 20+：

```bash
npm install
npm run test
npm run dev
```

此時數學互動功能不需要 API Key。AI 可在專案根目錄新增本地 `.dev.vars`（已加入 `.gitignore`）：

```text
DEEPSEEK_API_KEY=your_local_key
```

**不要把 `.dev.vars`、金鑰或真實 Token 上傳 GitHub。**

## Cloudflare Workers 部署

1. 登入 Cloudflare 帳號，在專案目錄執行 `npx wrangler login`。
2. 執行 `npm run deploy`（`wrangler.jsonc` 裡的 Worker 名稱可自行調整）。
3. 執行 `npx wrangler secret put DEEPSEEK_API_KEY`，在終端機互動提示輸入 DeepSeek API Key；Secret 儲存於 Cloudflare，不進入前端或 Git。
4. 開啟部署結果顯示的 `https://...workers.dev` 網址。
5. 若已設置 Cloudflare Custom Domain，也可在 Cloudflare 控制台指派網域。

Cloudflare 設定遵照 2026 年 Workers Static Assets 用法；後端使用官方 DeepSeek `https://api.deepseek.com/chat/completions`，模型 `deepseek-flash`。

### 重要安全事項

- Worker 對問題長度、幾何參數、請求大小進行驗證；金鑰只從 `env.DEEPSEEK_API_KEY` 取得。
- 不會將金鑰包含在前端原始碼、HTTP 回應或 Git 檔案。
- **正式公開給全校使用前，應另外在 Cloudflare 加上 WAF/Rate Limiting 規則，以及視需要使用 Turnstile 驗證以限制 API 費用**。前端輸入驗證和本例的後端驗證本身不能防止大量請求。亦建議在 DeepSeek 帳號設定用量預算／監控。
- 現版本的 AI 回答只處理一次問答，不上傳對話歷史；不得在問題欄輸入私隱資料。

## 教學創新

以「猜想 → 動態實驗 → 數值驗證 → AI 解釋 → 延伸應用」為教學流程。比一般線上圖形計算器多出「焦點性質即時驗算」及「根據實驗情境解釋」兩個步驟。

## 提交內容

本倉庫包括完整前端、Cloudflare 後端、數學單元測試及部署說明。專題方向屬於高二課程的橢圓及雙曲線單元。
