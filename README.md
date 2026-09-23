<div align="center">

# Kyoto Journey
### 京都旅遊工具 · Firebase 版本

**A travel planner built with React, TypeScript and Firebase.**  
整合每日行程、景點、美食、支出、購物與航班資訊。

`React 18` · `TypeScript` · `Firebase` · `Vite`

[Featured implementation / 精選版本 →](https://github.com/Acce1erator-1215/kyoto-trip-firebase-final)

</div>

---

## About this version / 關於此版本

This implementation keeps the main application state, data listeners and tab navigation together in the root `App.tsx`. Feature components handle itineraries, sightseeing, restaurants, expenses and shopping.

本版本將主要應用狀態、資料監聽與分頁切換集中於根目錄的 `App.tsx`，並以獨立元件處理行程、景點、餐廳、記帳與購物功能。

For the implementation organized into Context providers, reusable hooks and separate tab components, see **[kyoto-trip-firebase-final](https://github.com/Acce1erator-1215/kyoto-trip-firebase-final)**.

若要查看拆分為 Context、共用 Hooks 與獨立分頁的版本，請前往上方精選專案。

## Features / 功能

| View / 頁面 | Use / 用途 |
| :--- | :--- |
| Itinerary / 行程 | Daily plans and preparation tasks／每日安排與行前準備 |
| Sightseeing & food / 景點與美食 | Places and restaurant lists／景點與餐廳口袋名單 |
| Expenses / 記帳 | Spending records／旅費紀錄 |
| Shopping / 購物 | Purchase checklist／購買清單 |
| Flights / 航班 | Flight information／航班資訊 |

## Local setup / 本機執行

Requires Node.js, npm and your own Firebase project configuration. Review `firebase.ts` before running a personal copy.

需要 Node.js、npm 與自己的 Firebase 專案設定。執行副本前請先檢查 `firebase.ts`。

```bash
git clone https://github.com/Acce1erator-1215/kyoto-trip-firebase.git
cd kyoto-trip-firebase
npm install
npm run dev
```

- `npm run build` — production bundle／正式環境建置
- `npm run preview` — local preview of the build／本機預覽建置結果

<details>
<summary>Project origin / 專案來源</summary>

Generated from the Google AI Studio repository template.  
本專案起始於 Google AI Studio 儲存庫範本。

[Original AI Studio project / 原始 AI Studio 專案](https://ai.studio/apps/drive/1eWOUlDbLVYjNg-ejUuuZAf6atUieb3iN) — access may require permission／可能需要存取權限。

</details>
