/* ======================
   GEMINI AI SERVER - HTML -> JSON
====================== */

const express = require("express");
const cors = require("cors");

// Node <18 thì dùng node-fetch
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(cors());
app.use(express.json());

/* ======================
   PORT
====================== */
const PORT = process.env.PORT || 3000;

/* ======================
   GEMINI KEY
====================== */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) console.error("❌ Chưa thiết lập GEMINI_API_KEY");

/* ======================
   ROOT
====================== */
app.get("/", (req, res) => res.send("✅ GEMINI AI SERVER is running"));

/* ======================
   CHAT
====================== */
app.post("https://dungai-server.onrender.com/chat", async (req, res) => {
  const userMessage = req.body.message || "";
  console.log("DATA NHẬN:", req.body);

  if (!userMessage) return res.json({ reply: "❌ Không có tin nhắn gửi lên" });
  if (!GEMINI_API_KEY) return res.json({ reply: "❌ Chưa có Gemini API KEY" });

  try {
    const response = await fetch(
      "https://gemini.googleapis.com/v1/html-endpoint", // đổi theo docs Gemini
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userMessage, model: "gemini-1.5" }),
      }
    );

    const html = await response.text(); // đọc raw HTML

    // parse text đơn giản từ HTML
    let reply = "AI không trả lời";

    // ví dụ lấy text trong <p>
    const match = html.match(/<p>(.*?)<\/p>/s);
    if (match) reply = match[1].trim();
    else reply = html.replace(/<[^>]+>/g, "").trim(); // fallback: remove all tags

    console.log("AI REPLY PARSED:", reply);
    return res.json({ reply });

  } catch (err) {
    console.error("❌ LỖI SERVER:", err);
    return res.status(500).json({ reply: "❌ Lỗi server khi gọi Gemini" });
  }
});

/* ======================
   START SERVER
====================== */
app.listen(PORT, () => {
  console.log(`✅ GEMINI AI SERVER chạy cổng ${PORT}`);
});

