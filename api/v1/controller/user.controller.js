const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../model/user.model')
// Hàm helper đơn giản để validate email
const isValidEmail = (email) => {
    // Regex đơn giản, đủ dùng cho đa số trường hợp
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// [POST] api/v1/users/register
module.exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Validate cơ bản trước khi xử lý tiếp
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }

        const existEmail = await User.findOne({
            email: email,
            deleted: false
        });
        if (existEmail) {
            return res.status(400).json({
                message: "Email đã tồn tại",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            fullName: fullName,
            email: email,
            password: hashedPassword
        });
        await user.save();

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "JWT_SECRET is not configured" });
        }

        const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(201).json({
            token: token,
            user: {
                id: user._id,
                email: user.email,
            },
            message: "Đăng ký thành công",
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

// [POST] api/v1/users/login
module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate cơ bản
        if (!email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }

        const user = await User.findOne({
            email: email,
            deleted: false
        });
        if (!user) {
            return res.status(400).json({
                message: "Sai email",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Sai mật khẩu ",
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "JWT_SECRET is not configured" });
        }

        const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.json({
            token: token
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};