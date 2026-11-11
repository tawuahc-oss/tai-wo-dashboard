# Tai Wo Dashboard

## 開啟網站

直接用 Edge 或 Chrome 開啟此資料夾的 `index.html`，並連接互聯網。
若不允許定位，天氣會使用太和的位置。按右上角 ↻ 可重新整理；🔇 可切換語音朗讀。

## 本次修正

- 手機版可以向下捲動至新聞及頁尾。
- 今日／明日日曆按香港時間計算，跨午夜會自動更新。
- 附有香港政府公布的 2025–2027 年公眾假期資料，亦會嘗試從政府更新。
- 資料請求會在 10 秒後中止，包括回應內容的下載；新聞會嘗試後備來源。
- 港鐵目的地代碼會顯示及朗讀中文站名。
- 只有一個天氣提示面板時，會使用整個可用空間。

假期來源：https://www.1823.gov.hk/common/ical/tc.json
`holidays.js` 是 2026-11-12 下載的本機副本，無法連線時仍可使用。
未涵蓋的年份會顯示提示。原有二十四節氣固定日期表仍保留，並非按年份計算的精確節氣日曆。

## 驗證

安裝 Node.js 後，在此資料夾執行：

```powershell
node --check script.js
node --test tests/dashboard.test.cjs
```

`tests/browser-check.cjs` 是額外的瀏覽器檢查，需要 Playwright 及 Edge。
它模擬外部資料服務斷線，檢查手機捲動、桌面／平板版面及頁面執行錯誤。

## 發佈檔案

上傳網站時，請一併上傳 `index.html`、`script.js`、`style.css`、`holidays.js`
及 `Weather & News Dashboard Thumbnail.png`，保持它們在同一資料夾。
正式網站：https://tawuahc-oss.github.io/tai-wo-dashboard/
