const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

const router = require("./routes/apiRouter");

// ✅ Allow requests from frontend (localhost:5173)
app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json());

app.use("/leads", router);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
