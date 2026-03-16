const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../model/user.model')
const ForgotPassword = require('../model/forgot-password.model')
const generate = require('../../../helpers/generate')
const sendMailHelper = require('../../../helpers/sendMail')
const { generateAccessToken, generateRefreshToken } = require("../../../helpers/jwt");
const RefreshToken = require("../model/refresh-token.model");
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
        const payload = { userId: user._id.toString() };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
        });

        return res.json({
            success: true,
            message: "Đăng nhập thành công",
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};


// [POST] api/v1/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
    try {
        const email = req.body.email
        const user = await User.find({
            email: email,
            deleted: false
        })
        if (!user) {
            return res.status(400).json({
                message: "Email không tồn tại",
            });
        }
        const timeExpire = 3
        const otp = generate.generateRandomNumber(8)
        const objectForgotPassword = {
            email: email,
            otp: otp,
            expireAt: new Date(Date.now() + timeExpire * 60 * 1000)
        }
        const forgotPassword = new ForgotPassword(objectForgotPassword)
        await forgotPassword.save()
        // Send otp to email

        const subject = "Mã xác thực otp lấy lại mật khẩu"
        const html = `Mã OTP để lấy lại mật khẩu của bạn là <b>${otp}</b> (Sử dụng trong ${timeExpire} phút).
        Vui lòng không chia sẻ mã OTP này cho bất kỳ ai!`
        sendMailHelper.sendMail(email, subject, html)
        res.status(200).json({ message: "Đã gửi OTP thành công !" })
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};


// [POST] api/v1/users/password/otp
module.exports.otpPassword = async (req, res) => {
    try {
        const email = req.body.email;
        const otp = req.body.otp;

        const user = await User.findOne({
            email: email,
            deleted: false
        });

        if (!user) {
            return res.status(400).json({
                message: "Email không tồn tại",
            });
        }

        const otpRecord = await ForgotPassword.findOne({
            email: email,
            otp: otp
        });

        if (!otpRecord) {
            return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "JWT_SECRET is not configured" });
        }

        const accessToken = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            success: true,
            message: "Xác thực OTP thành công",
            accessToken
        });
    } catch (error) {
        console.error("OTP error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

// [POST] api/v1/users/password/reset
module.exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Vui lòng nhập mật khẩu mới" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
        }

        const user = await User.findOne({
            _id: req.userId,
            deleted: false
        });

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        await user.save();

        // Có thể xoá OTP sau khi đổi mật khẩu (không bắt buộc)
        await ForgotPassword.deleteMany({ email: user.email });

        return res.status(200).json({
            success: true,
            message: "Đổi mật khẩu thành công",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};


// [GET] api/v1/users/detail
module.exports.getDetail = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findOne({
            _id: userId,
            deleted: false
        }).select("fullName email")
        res.status(200).json({
            success: true,
            message: "Lấy thông tin tài khoản thành công",
            data: user
        })
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }

}

// [GET] api/v1/users/detail
module.exports.listUser = async (req, res) => {
    try {
        const users = await User.find({
            deleted: false
        }).select("fullName email")
        res.status(200).json({
            success: true,
            message: "Thành công",
            data: users
        })
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }

}

// [PATCH] api/v1/users/password/change
module.exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body
    const userId = req.user.id
    try {
        const user = await User.findOne({
            _id: userId,
        })
        if (!user) {
            return res.status(404).json({
                message: "User không tồn tại"
            });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Sai mật khẩu ",
            });
        }
        if (oldPassword === newPassword) {
            return res.status(400).json({
                message: "Mật khẩu mới không được trùng mật khẩu cũ"
            })
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Mật khẩu quá ngắn",
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Mật khẩu xác nhận không đúng",
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Thay đổ mật khẩu thành công",
        })
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
        });
    }
}

