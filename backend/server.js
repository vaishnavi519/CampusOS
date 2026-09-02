const express = require("express");
const cors = require("cors");
require("dotenv").config();

const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const clubRoutes = require("./routes/clubRoutes");
const eventRoutes = require("./routes/eventroutes");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/events", eventRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Campus OS Backend is running!"
    });
});

app.listen(PORT, () => {
    console.log(`Campus OS server running on port ${PORT}`);
});