/* ======================
   GEMINI AI SERVER CJS - SAFE
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
if (!GEMINI_API_KEY) {
  console.error("❌ Chưa thiết lập GEMINI_API_KEY trên server/Render");
}

/* ======================
   ROOT TEST
====================== */
app.get("/", (req, res) => {
  res.send("✅ GEMINI AI SERVER is running");
});

/* ======================
   POST /chat
====================== */
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log("DATA NHẬN:", req.body);

    if (!userMessage) {
      return res.json({ reply: "❌ Không có tin nhắn gửi lên" });
    }

    if (!GEMINI_API_KEY) {
      return res.json({ reply: "❌ Chưa có Gemini API KEY" });
    }

    // ======================
    // GỌI GEMINI
    // ======================
    const url = "https://gemini.googleapis.com/v1/generateText"; // sửa theo docs Gemini
    const body = {
      prompt: userMessage,
      model: "gemini-1.5", // chỉnh theo model cậu muốn
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text(); // đọc raw text

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("❌ KHÔNG PHẢI JSON:", text);
      return res.json({
        reply:
          "❌ Lỗi API: Không nhận được JSON hợp lệ từ Gemini. Đây là fallback text.",
      });
    }

    if (response.status !== 200) {
      console.error("❌ GEMINI ERROR:", data);
      return res.json({
        reply: `❌ GEMINI ERROR: ${data.error?.message || "Unknown error"}`,
      });
    }

    const aiReply = data?.text || "AI không trả lời";
    console.log("AI REPLY:", aiReply);

    return res.json({ reply: aiReply });
  } catch (err) {
    console.error("LỖI SERVER:", err);
    return res.status(500).json({ reply: "❌ Lỗi server" });
  }
});

/* ======================
   START SERVER
====================== */
app.listen(PORT, () => {
  console.log(`✅ GEMINI AI SERVER chạy cổng ${PORT}`);
});
