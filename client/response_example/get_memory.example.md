📋 Memory Details:

**Memory ID:** 618bb757-1bb0-4b55-b15c-2124d705feb6
**Title:** Kiến trúc & công nghệ backend workspace
**Content:** ## Công nghệ & cấu hình

### Công nghệ chính
- Express (API, middleware)
- Apollo Server Express (GraphQL)
- Mongoose, @typegoose/typegoose (ORM, kết nối MongoDB)
- bcryptjs (hash mật khẩu)
- cookie-parser, cors (middleware)
- jsonwebtoken (JWT)
- Dataloader, graphql-tools (hỗ trợ GraphQL)

### Alias import
- Sử dụng alias '@/models/*' cho import module từ src/ (cấu hình trong tsconfig.json)

### Khởi tạo server
- Tách biệt logic khởi tạo app (src/app.ts) và khởi động server (src/server.ts)
- Kết nối MongoDB qua class Database, tuân thủ nguyên tắc SRP
- Sử dụng biến môi trường PORT, MONGODB_URI
- Khởi động server qua hàm startServer, đảm bảo kết nối DB trước khi lắng nghe port

### Định nghĩa router
- /api/core: yêu cầu xác thực
- /api/auth: không yêu cầu xác thực
- /download, /public: public
- /api/me: lấy thông tin user hiện tại

### Script Bun
- Chạy server bằng Bun script: 'bun dev', 'bun setup'

### Tuân thủ Clean Code & SOLID
- Tách biệt logic, dễ mở rộng/test
- SRP: Database, app, server
**Category:** architecture
**Created:** 24/07/2025, 11:25:24
**Updated:** 24/07/2025, 11:25:24
**Metadata:** None