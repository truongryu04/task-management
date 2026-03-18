# Task Management API

Task Management API là backend RESTful giúp quản lý công việc cá nhân/nhóm, hỗ trợ xác thực người dùng, quản lý task, lọc – tìm kiếm – phân trang và hiển thị lịch làm việc theo dạng calendar.

## 1. Tính năng chính

- Đăng ký/đăng nhập người dùng, xác thực bằng JWT (access token, refresh token).
- Quên mật khẩu qua email OTP, đặt lại và đổi mật khẩu an toàn (hash bằng bcrypt).
- CRUD công việc (task), hỗ trợ xoá mềm (soft delete) và lưu dấu thời gian (createdAt, updatedAt, deletedAt, completedAt).
- Lọc, tìm kiếm task theo tiêu đề, trạng thái; phân trang và sắp xếp linh hoạt.
- Cập nhật trạng thái đơn lẻ hoặc hàng loạt cho nhiều task.
- Lấy danh sách công việc theo khoảng thời gian để hiển thị dưới dạng calendar.
- Phân quyền theo người tạo và người được gán task (createdBy, listUser) qua middleware verifyToken.

## 2. Công nghệ sử dụng

- Runtime: Node.js, Express.js
- Cơ sở dữ liệu: MongoDB, Mongoose
- Bảo mật & xác thực: JWT, bcryptjs
- Khác: dotenv, cors, nodemailer

## 3. Cấu trúc thư mục chính

```text
task-management/
├─ index.js              # Entry point của ứng dụng Express
├─ vercel.json           # Cấu hình deploy Vercel
├─ config/
│  └─ database.js        # Kết nối MongoDB qua Mongoose
├─ api/
│  └─ v1/
│     ├─ controller/     # task.controller.js, user.controller.js
│     ├─ middlewares/    # auth.middleware.js (verifyToken)
│     ├─ model/          # task.model.js, user.model.js, refresh-token.model.js, forgot-password.model.js
│     └─ routes/         # task.route.js, user.route.js, index.route.js
└─ helpers/              # generate, jwt, pagination, search, sendMail
```

## 4. Cài đặt & chạy dự án

### 4.1. Yêu cầu môi trường

- Node.js >= 18
- MongoDB (local hoặc cloud, ví dụ MongoDB Atlas)

### 4.2. Cài đặt

```bash
npm install
``

### 4.3. Biến môi trường

Tạo file `.env` ở thư mục gốc với nội dung tương tự:

```env
PORT=3000
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>/<database>

# JWT
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Email (dùng cho gửi OTP quên mật khẩu)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

### 4.4. Chạy dự án

```bash
npm start
```

Mặc định server chạy tại:

```text
http://localhost:3000
```

## 5. API tổng quan

Tất cả route đều prefix bằng `/api/v1`.

### 5.1. Nhóm User `/api/v1/users`

- `POST /register` – Đăng ký tài khoản.
- `POST /login` – Đăng nhập, trả về accessToken & refreshToken.
- `POST /password/forgot` – Gửi OTP quên mật khẩu qua email.
- `POST /password/otp` – Xác thực OTP.
- `POST /password/reset` – Đặt lại mật khẩu (yêu cầu token).
- `GET /detail` – Lấy thông tin tài khoản hiện tại.
- `GET /list` – Lấy danh sách người dùng (đã lọc deleted=false).
- `PATCH /password/change` – Đổi mật khẩu.
- `POST /refresh-token` – Cấp mới access token bằng refresh token.
- `POST /logout` – Đăng xuất, xoá refresh token trong DB.

Các route nhạy cảm yêu cầu header `Authorization: Bearer <access_token>` và được bảo vệ bởi middleware `verifyToken`.

### 5.2. Nhóm Task `/api/v1/tasks`

- `GET /` – Lấy danh sách task theo user, hỗ trợ lọc, tìm kiếm, phân trang, sort.
- `GET /detail/:id` – Lấy chi tiết một task.
- `POST /create` – Tạo task mới (tự gán createdBy theo user đang đăng nhập).
- `PATCH /edit/:id` – Cập nhật thông tin task.
- `PATCH /change-status/:id` – Đổi trạng thái task, tự động set completedAt nếu hoàn thành.
- `PATCH /change-multi` – Cập nhật trạng thái hoặc xoá mềm cho nhiều task cùng lúc.
- `DELETE /delete/:id` – Xoá mềm task (đánh dấu deleted=true, lưu deletedAt).
- `GET /calendar` – Lấy danh sách task trong khoảng thời gian (start, end) để hiển thị dạng calendar.

Tất cả route task yêu cầu đăng nhập (JWT) và sử dụng `verifyToken` để gắn thông tin user vào request.

## 6. Ghi chú

- Dự án được thiết kế hướng tới việc dùng làm backend cho web/mobile client.
- Có thể deploy nhanh lên Vercel thông qua file `vercel.json`.
