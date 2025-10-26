## Tasks

// ทำเฉพาะงานหลักๆไปก่อนพวกยิบย่อยคนทำทีหลัง อันไหนข้ามได้ข้าม


- [X] 1. Setup Project และ Design System

- [X] 1.1 Setup Frontend Project 
  - สร้างโปรเจกต์ Next.js 14 กับ App Router
  - ติดตั้ง TypeScript, Tailwind CSS

- [ ] 1.2 Setup Backend Project (Node.js + Express + TypeScript)
  - สร้างโปรเจกต์ Node.js
  - ติดตั้ง TypeScript, Express, และ dependencies

- [X] 1.3 Setup Database (PostgreSQL)
  - ติดตั้ง PostgreSQL
  - สร้าง database
  - ติดตั้ง migration tool (Prisma เด้อ)

- [X] 1.4 Create Design System Components
  - สร้าง WebUi

- [X] 2. Database Schema Implementation
  - สร้างตาราง schema

- [X] 2.1 Create User และ Role Tables
  - สร้างตาราง `users` กับ columns //เอาแต่พวก user, pass hash,email ก่อน
  - สร้างตาราง `roles` (admin, free, pro) //อันนี้ทำเผื่อไว้เลย
  - สร้างตาราง `role_settings`,`user_settings`, `users.email`, `users.role_id`


- [ ] 2.2 Create Project และ Audio Tables //ข้ามอันนี้ไปก่อนยังไม่สรุป
  - สร้างตาราง `projects` , `audio_files`, `projects.user_id`, `audio_files.project_id`

- [ ] 2.3 Create Transcript และ Translation Tables //ข้ามอันนี้ไปก่อนยังไม่สรุป
  - สร้างตาราง `transcripts`,`transcript_segments`,`speakers`,`translations`

- [ ] 2.4 Create AI Model และ Job Tables  //ข้ามอันนี้ไปก่อน
  - สร้างตาราง `ai_models` พร้อม config_json

- [X] 3. Authentication System // บอลทำแล้ว
  - สร้าง API endpoints สำหรับ authentication

- [x] 3.1 Implement Password Hashing และ JWT // บอลทำแล้ว
  - สร้าง utility functions สำหรับ bcrypt hashing
  - สร้าง JWT 

- [X] 3.2 Implement Register API // บอลทำแล้ว
  - endpoint `/api/v1/auth/register` endpoint
  - เช็คข้อมูลซ้ำ
  - Hash password และเซฟข้อมูล user ลง data


- [X] 3.3 Implement Login API // บอลทำแล้ว
  - endpoint `/api/v1/auth/login` 
  - เช็ค Validate 
  - //เพื่ม schema last_login_at


- [X] 3.4 Implement Token Refresh API
  - endpoint `/api/v1/auth/refresh` 
  - //เพิ่ม Validate refresh token ไว้เผื่อ


- [ ] 3.5 Implement Forgot Password และ Reset Password APIs
  - สร้าง endpoint `/api/v1/auth/forgot-password` 
  - สร้าง endpoint `/api/v1/auth/reset-password` 
  - Update password

- [ ] 3.6 Implement Get Current User API
  - สร้าง endpoint `/api/v1/auth/me`
  - Return user data พร้อม role และ settings

- [X] 4. Authentication UI 
  - สร้างหน้า Login, Register, Forgot Password, Reset Password
  - เชื่อมกับ Backend API
     
- [X] 4.1 Create Auth Layout Component
  - สร้าง AuthLayout component
  - สร้าง responsive layout สำหรับมือถือ
  - เพิ่ม logo


- [X] 4.2 Create Register Page
  - สร้างหน้า `/register`
  - โชว์หน้า loading ระหว่าง submit
  - แสดง error messages จาก API //เชื่อมให้แล้ว
  - Redirect ไป dashboard หลัง register สำเร็จ


- [X] 4.3 Create Login Page
  - สร้างหน้า `/login`
  - เพิ่มม็อคอัพ "Forgot Password?"
  - Redirect ไป dashboard หลัง login สำเร็จ

- [ ] 4.4 Create Forgot Password Page
  - สร้างหน้า `/forgot-password` 


- [ ] 4.5 Create Reset Password Page
  - สร้างหน้า `/reset-password`


- [ ] 4.7 Create Protected Route Component
  - สร้าง ProtectedRoute component
  - Check authentication status
  - Redirect ไป login ถ้ายังไม่ login

- [X] 5. Dashboard Layout 
  - สร้าง layout สำหรับหน้าหลังจาก login


- [X] 5.1 Create Desktop Layout
  - สร้าง DashboardLayout 

- [X] 5.2 Create Mobile Layout

- [ ] 5.3 Create Sidebar Navigation
  - สร้าง Dashboard, Projects, Settings
  - เพิ่ม icons สำหรับแต่ละ item

- [ ] 5.4 Create User Menu Component
  - สร้าง dropdown menu ที่ header
  - แสดง user name และ email
  - เพิ่ม menu Profile, Settings, Logout


- [ ] 6. Dashboard Page 
  - สร้างหน้า Dashboard แสดงภาพรวม
  - แสดงสถิติการใช้งาน

- [ ] 6.1 Create Dashboard Stats Cards
  - stat แสดง Total Projects, Files This Month, Remaining Quota
  - แสดง loading ระหว่างโหลดข้อมูล

- [ ] 6.2 Create Recent Projects List
  - แสดงรายการโปรเจกต์ล่าสุด (5 รายการ)
  - แสดง project name, file count, last updated
  - เพิ่ม "View All" button

- [ ] 6.3 Integrate Dashboard with Backend API
  - เรียก `/api/v1/auth/me` เพื่อดึงข้อมูล user และ usage
  - เรียก `/api/v1/projects?limit=5` เพื่อดึง recent projects
  - แสดง error message ถ้า API fail

- [ ] 7. Projects Management (Backend)
  - สร้าง API endpoints สำหรับจัดการโปรเจกต์

- [ ] 7.1 Implement Create Project API
  - สร้าง endpoint projects

- [ ] 7.3 Implement Get Project Detail API
  - สร้าง endpoint สำหรับ ญพน่ำแะ รก
  - Return project พร้อม audio files list
  - Check user ownership // ทำไปเพื่อเลย


- [ ] 7.4 Implement Update Project API // ทำไปเพื่อเลย
  - สร้าง PATCH projectId endpoint สำหรับอัพเดทข้อมูล projectId
  - Update ถ้า name เปลี่ยน


- [ ] 7.5 Implement Delete Project API
  - สร้าง DELETE projectId endpoint


- [ ] 8. Projects Management UI
  - สร้างหน้าจัดการโปรเจกต์

- [ ] 8.1 Create Projects List Page
  - สร้างหน้า `/projects` แสดงรายการโปรเจกต์ทั้งหมด
  - แสดง project cards 


- [ ] 8.2 Create Project Card Component
  - แสดง project name, description, file count, created date


- [ ] 8.3 Create Create/Edit Project Modal
  - สร้าง modal สำหรับ create/edit project


- [ ] 8.5 Integrate Projects Page with Backend
  - เรียก GET `/api/v1/projects` เพื่อดึงรายการ
  - เรียก POST `/api/v1/projects` เพื่อสร้างใหม่
  - เรียก PATCH `/api/v1/projects/:id` เพื่ออัปเดต
  - เรียก DELETE `/api/v1/projects/:id` เพื่อลบ

- [ ] 9. File Upload System 
  - สร้าง API สำหรับอัปโหลดไฟล์เสียง

- [ ] 9.1 Setup File Storage //อาจจะยังน้า
  - ตั้งค่า local storage directory structure

- [ ] 9.2 Implement Upload Audio API
  - สร้าง endpoint upload
  - เช็ค file type (MP3, WAV, M4A, FLAC)


- [ ] 9.3 Implement Get Audio File API
  - สร้าง endpoint audioId


- [ ] 10. File Upload UI
  - สร้าง UI สำหรับอัปโหลดไฟล์

- [ ] 10.1 Create Project Detail Page
  - สร้างหน้า `/projects/:slug` ไว้ละเอียดโปรเจกต์
  - แสดง project info

- [ ] 10.2 Create Audio Upload Component
  - สร้าง file upload component 
  - แสดง file detail (name, size, duration)


- [ ] 10.4 Integrate Upload with Backend
  - เรียก POST `/api/v1/projects/:projectId/audio/upload`
  - แสดง real-time progress


- ควรเพิ่มระบบแจ้งเตือนผ่านเมล์ เพราะบางทีแม้งนานจริง




