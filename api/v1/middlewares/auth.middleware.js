const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

module.exports.verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"]; // đề phòng khác kiểu viết hoa

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Không có token hoặc sai định dạng Authorization" });
        }

        const token = authHeader.split(" ")[1];

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "JWT_SECRET is not configured" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Lưu userId từ token
        req.userId = decoded.userId;

        const user = await User.findOne({
            _id: decoded.userId,
            deleted: false,
        }).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Tài khoản không tồn tại hoặc đã bị xoá" });
        }

        // Gán user vào req để dùng ở các handler sau
        req.user = user;

        return next();
    } catch (error) {
        console.error("JWT verify error:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token đã hết hạn" });
        }

        return res.status(401).json({ message: "Token không hợp lệ" });
    }
};
