const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const mongoose = require("mongoose");
const AWS = require("aws-sdk");
require("dotenv").config();
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

// Google OAuth Setup
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post("/auth/google", async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: "Token is required" });

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        res.json({ user: { id: payload.sub, email: payload.email } });
    } catch (error) {
        console.error("OAuth verification failed:", error);
        res.status(401).json({ error: "Invalid token" });
    }
});

// MongoDB Setup
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection failed:", err));

const taskSchema = new mongoose.Schema({
    userId: String,
    title: String,
    status: { type: String, enum: ["todo", "inProgress", "done"], default: "todo" },
    fileUrl: String,
});
const Task = mongoose.model("Task", taskSchema);

// AWS S3 Setup
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: "us-east-1",
});
const s3 = new AWS.S3();

// Task Routes
app.get("/tasks/:userId", async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.params.userId });
        res.json(tasks);
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

app.post("/tasks", async (req, res) => {
    const { userId, title, file } = req.body;
    let fileUrl = "";

    try {
        if (!userId || !title) {
            return res.status(400).json({ error: "userId and title are required" });
        }

        if (file) {
            const uploadParams = {
                Bucket: process.env.S3_BUCKET,
                Key: `${Date.now()}-${file.name}`,
                Body: Buffer.from(file.data, "base64"),
            };
            const result = await s3.upload(uploadParams).promise();
            fileUrl = result.Location;
        }

        const task = new Task({ userId, title, fileUrl });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error("Failed to create task:", error);
        res.status(500).json({ error: "Failed to create task" });
    }
});

app.put("/tasks/:id", async (req, res) => {
    const { status } = req.body;

    try {
        if (!status) return res.status(400).json({ error: "Status is required" });

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json(task);
    } catch (error) {
        console.error("Failed to update task:", error);
        res.status(500).json({ error: "Failed to update task" });
    }
});

app.delete("/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.sendStatus(204);
    } catch (error) {
        console.error("Failed to delete task:", error);
        res.status(500).json({ error: "Failed to delete task" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));