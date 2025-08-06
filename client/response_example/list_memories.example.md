# 📝 Found 2 memory(ies):

---

## Filters & Limit

**Filters:** None  
**Limit:** 50

---

## Memory List

### Memory 1: Kiến trúc & công nghệ backend workspace
**ID:** 618bb757-1bb0-4b55-b15c-2124d705feb6

Content:  
```markdown
## Công nghệ & cấu hình

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
- SRP: Database, ap⋯📄
```
Category: architecture  
Created: 24/07/2025, 11:25:24

---

### Memory 2: Workspace Backend Tổng Quan
**ID:** fce19df6-ee15-43e8-b98d-7d4583c8e69d

Content:  
```markdown
## Tổng quan cấu hình backend workspace

### Port & Database
- Port server: 8080 (lấy từ .env)
- MongoDB URI: mongodb://localhost:27017/bengmt_stack
- JWT_SECRET: nên cấu hình trong .env, mặc định là "changeme" nếu không set

### API Endpoints
- POST /api/auth/login: Đăng nhập, trả về token, không yêu cầu xác thực
- POST /api/auth/logout: Đăng xuất, yêu cầu xác thực (middleware isValidAuthToken)
- GET /api/core/profile: Lấy thông tin profile, yêu cầu xác thực + quyền 'read'
- GET /api/me: Lấy thông tin user hiện tại, yêu cầu xác thực
- /download/*, /public/*: Chưa có endpoint cụ thể

### Middleware
- Xác thực: createAuthMiddleware (JWT, cookie, session)
- Phân quyền: hasPermission (role-based, quyền: create, read, update, delete, download, upload, admin)
- Các role: owner, admin, manager, employee, staff, create_only, read_only

### Models
- User: name, email, password (hash), role, avatar, sessions

### Demo Accounts
- Email: admin@demo.com
- Password: admin123
- Role: admin

### Depe⋯📄
```
Category: architecture  
Created: 24/07/2025, 02:42:58

---

## 📊 Overall Statistics

• Total memories: 2  
• Categories: 1  
• Oldest memory: 24/07/2025, 02:42:58  
• Newest memory: 24/07/2025, 11:25:24  

---

**Note:**  
The symbol "⋯📄" in content indicates truncated or incomplete data. Use get_memory with a specific ID to see full details, or search_memories for text-based search.
