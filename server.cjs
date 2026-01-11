/* ======================
   SERVER CJS CHUẨN
====================== */

const express = require("express");
const cors = require("cors");

// Node.js trước v18 không có fetch → dùng node-fetch
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// ====================== MIDDLEWARE ======================
app.use(cors());
app.use(express.json()); // parse JSON body

// ====================== PORT ======================
const PORT = process.env.PORT || 3000;

// ====================== TEST ROOT ======================
app.get("/", (req, res) => {
  res.send("✅ AI SERVER is running");
});

// ====================== POST CHAT ======================
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log("DATA NHẬN:", req.body);

    if (!userMessage) {
      return res.json({ reply: "❌ Không có tin nhắn gửi lên" });
    }

    // ====================== TRẢ CỨNG TEST ======================
    // Khi frontend nhận được dòng này là server + JS hoạt động bình thường
    return res.json({
      reply: "Server đã nhận: " + userMessage
    });

    // ====================== CÓ THỂ GẮN OPENAI ======================
    /*
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content || "AI không trả lời";

    return res.json({ reply: aiReply });
    */

  } catch (err) {
    console.error("LỖI SERVER:", err);
    return res.status(500).json({ reply: "❌ Lỗi server" });
  }
});

// ====================== START SERVER ======================
app.listen(PORT, () => {
  console.log("✅ AI SERVER chạy cổng", PORT);
});
