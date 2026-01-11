const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

/* ======================
   CONFIG
====================== */
const PORT = 3000;
const OPENAI_API_KEY = "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";

/* ======================
   MIDDLEWARE
====================== */
app.use(cors());
app.use(bodyParser.json());

/* ======================
   CHAT API
====================== */
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  console.log("DATA NHẬN:", req.body);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Bạn là Dũng AI, nói tiếng Việt." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    const reply =
      data.choices?.[0]?.message?.content || "AI không phản hồi";

    res.json({ reply });

  } catch (err) {
    console.error("LỖI SERVER:", err);
    res.status(500).json({ reply: "Lỗi AI server" });
  }
});

/* ======================
   START SERVER
====================== */
app.listen(PORT, () => {
  console.log("✅ AI SERVER chạy cổng " + PORT);
});
