const express = require("express");
const cors = require("cors");
require("dotenv").config();

const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const clubRoutes = require("./routes/clubRoutes");
const eventRoutes = require("./routes/eventRoutes");
const eventRegistrationRoutes = require("./routes/eventRegistrationRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const statsRoutes = require("./routes/statsRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 5000;

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/events", eventRoutes);
app.use("/api", eventRegistrationRoutes);
app.use("/api", notificationRoutes);
app.use("/api", attendanceRoutes);
app.use("/api", reportRoutes);
app.use("/api", statsRoutes);
app.use("/api", recommendationRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Campus OS Backend is running!"
    });
});

app.listen(PORT, () => {
    console.log(`Campus OS server running on port ${PORT}`);
});