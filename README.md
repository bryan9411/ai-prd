# AI 產品需求文件生成平台

> 輸入一句產品概念，AI 自動生成完整的產品需求文件（PRD）

**[➜ 線上 Demo：AI 產品需求文件生成平台](https://aiprd-studio.vercel.app/)**

## 功能介紹

- **產品需求生成**：輸入產品想法，自動生成 PRD、任務清單、開發流程、階段規劃、策略建議
- **雲端多專案管理**：支援完整的使用者註冊、登入與登出功能，專案與版本歷史資料皆與 Supabase 雲端資料庫進行即時同步，並支援版本釘選功能
- **OpenAI API Key 加密儲存**：API Key 由使用者自行輸入，經由加密後儲存
- **深色 / 淺色模式切換**
- **輸入語意驗證**：生成前先以輕量模型（gpt-4o-mini）判斷輸入是否為有效的產品及輸入，非預期輸入（如程式碼請求、一般問答）會即時提示，不消耗生成 token
- **語意快取**：生成完成後將想法的 embedding 向量存入 Supabase 資料庫；下次輸入語意相似的想法時，利用 pgvector 在資料庫端進行相似度比對並詢問是否沿用既有結果，避免重複消耗 token
- **生成串流（Streaming）**：採用 Vercel AI SDK 逐字顯示生成內容，提升使用者體驗。

## 使用技術

| 類別     | 使用技術                                                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 框架     | Next.js 16 App Router                                                                                                                                                   |
| UI       | React 19、Tailwind CSS v4、shadcn/ui                                                                                                                                    |
| 狀態管理 | Zustand                                                                                                                                                                 |
| AI       | 生成：Vercel AI SDK（串流、結構化 JSON 輸出）+ Zod Schema 驗證 + gpt-5-mini<br>語意檢查：OpenAI SDK + gpt-4o-mini<br>向量化：OpenAI Embeddings + text-embedding-3-small |
| 資料庫   | Supabase (PostgreSQL + pgvector)<br>Supabase Auth 身份驗證                                                                                                              |
| 測試     | Jest（API Route、工具函式單元測試）                                                                                                                                     |
| 語言     | TypeScript                                                                                                                                                              |


## 資料夾結構

```
app/api/generate/      # AI 生成 API Route
app/api/pre-check/     # 輸入語意檢查 + embedding 向量化 API Route
app/api/settings/      # API Key 加密儲存/讀取 API Route
components/            # React 元件
hooks/                 # 自訂 hooks
store/                 # Zustand 狀態管理
types/                 # TypeScript 型別定義
lib/                   # 相關工具、AI Schema 與 Supabase 用戶端/資料庫操作
skills/                # AI 輔助開發 Skill
__tests__/             # 測試案例
```

## 本地啟動

1. **安裝依賴**
   ```bash
   pnpm install
   ```

2. **設定環境變數**
   複製 `.env.example` 並重新命名為 `.env.local`，填入對應的環境變數：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=你的_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_SUPABASE_ANON_KEY
   ENCRYPTION_KEY=你的加密金鑰 (用於加密存放於 Supabase 的 API Key)
   ```

3. **啟動開發伺服器**
   ```bash
   pnpm dev
   ```

啟動後即可註冊/登入帳號，並在設定中輸入你的 OpenAI API Key。

## 測試說明
- **執行所有測試**：`pnpm test`
- **監聽模式**：`pnpm test:watch`
- **產生測試報告**：`pnpm test:coverage`
