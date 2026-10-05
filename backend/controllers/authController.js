const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// ============================================================
// STUDENT SELF-REGISTRATION
// ============================================================
// Normal registration is ONLY for students.
// Club Admin, Faculty Coordinator and System Admin accounts
// must be created by a System Admin.
// ============================================================

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Check if email already exists
        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Public registration ALWAYS creates a STUDENT.
        // Privileged roles are created by SYSTEM_ADMIN.
        const [result] = await db.query(
            `INSERT INTO users (name, email, password, role)
             VALUES (?, ?, ?, 'STUDENT')`,
            [name, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "Student account registered successfully",
            user: {
                id: result.insertId,
                name,
                email,
                role: "STUDENT"
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
};


// ============================================================
// LOGIN
// ============================================================

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};


// ============================================================
// GET CURRENT USER PROFILE
// ============================================================

const getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT id, name, email, role, created_at
             FROM users
             WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error("Get profile error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching profile"
        });
    }
};


module.exports = {
    register,
    login,
    getProfile
};