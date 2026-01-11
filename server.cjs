/* ======================
   SERVER CJS RENDER-READY
====================== */

const express = require("express");
const cors = require("cors");

// Nếu Node <18 thì dùng node-fetch
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// ====================== MIDDLEWARE ======================
app.use(cors()); // Cho phép tất cả nguồn
app.use(express.json()); // Parse JSON body

// ====================== PORT ======================
const PORT = process.env.PORT || 3000;

// ====================== OPENAI KEY ======================
// Lấy từ Render, có thể tên là OPEN_API_KEY hoặc OPENAI_API_KEY
const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY;

if (!OPENAI_API_KEY) {
  console.error(
    "❌ Chưa thiết lập OPENAI_API_KEY hoặc OPEN_API_KEY trên Render"
  );
}

// ====================== TEST ROOT ======================
app.get("/", (req, res) => {
  res.send("✅ AI SERVER is running");
});

// ====================== POST /chat ======================
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log("DATA NHẬN:", req.body);

    if (!userMessage) {
      return res.json({ reply: "❌ Không có tin nhắn gửi lên" });
    }

    if (!OPENAI_API_KEY) {
      console.error("❌ OPENAI API KEY chưa có");
      return res.json({ reply: "❌ Chưa thiết lập API KEY" });
    }

    // ====================== GỌI OPENAI ======================
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: userMessage }],
        }),
      }
    );

    const data = await response.json();

    if (response.status !== 200) {
      console.error("❌ OPENAI ERROR:", data);
      return res.json({
        reply: `❌ OPENAI ERROR: ${data.error?.message || "Unknown error"}`,
      });
    }

    const aiReply =
      data?.choices?.[0]?.message?.content?.trim() || "AI không trả lời";

    console.log("AI REPLY:", aiReply);

    return res.json({ reply: aiReply });
  } catch (err) {
    console.error("LỖI SERVER:", err);
    return res.status(500).json({ reply: "❌ Lỗi server" });
  }
});

// ====================== START SERVER ======================
app.listen(PORT, () => {
  console.log(`✅ AI SERVER chạy cổng ${PORT}`);
  console.log(
    `📌 Test nhanh: curl -X POST http://localhost:${PORT}/chat -H "Content-Type: application/json" -d '{"message":"alo"}'`
  );
  console.log(
    "🛠 Debug env keys:",
    "OPEN
