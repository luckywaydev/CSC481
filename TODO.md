## Tasks

- [ ] 1. Setup Project และ Design System
  - สร้างโครงสร้างโปรเจกต์ Frontend และ Backend
  - ตั้งค่า Design System (Dark + Purple theme, 3D buttons)
  - ตั้งค่า Development Environment
  - _Requirements: 24, 25_

- [x] 1.1 Setup Frontend Project (Next.js + TypeScript + Tailwind)

  - สร้างโปรเจกต์ Next.js 14 with App Router
  - ติดตั้ง TypeScript, Tailwind CSS, และ dependencies
  - ตั้งค่า Tailwind config สำหรับ Dark + Purple theme
  - สร้าง custom 3D button components
  - ตั้งค่า folder structure: `/app`, `/components`, `/lib`, `/types`, `/styles`
  - **สร้าง README.md (ภาษาไทย) พร้อม:**
    - คำอธิบายโปรเจกต์
    - โปรแกรมที่ต้องติดตั้ง (Node.js version, npm/yarn)
    - วิธีติดตั้ง dependencies
    - วิธีรันโปรเจกต์
    - โครงสร้าง folder
  - **สร้าง INSTALLATION.md (ภาษาไทย) พร้อม:**
    - ขั้นตอนติดตั้ง Node.js
    - ขั้นตอนติดตั้ง dependencies
    - การตั้งค่า environment variables

- [x] 1.2 Setup Backend Project (Node.js + Express + TypeScript)


  - สร้างโปรเจกต์ Node.js with Express
  - ติดตั้ง TypeScript, Express, และ dependencies
  - ตั้งค่า folder structure: `/src/controllers`, `/src/services`, `/src/repositories`, `/src/models`, `/src/middleware`
  - ตั้งค่า ESLint และ Prettier
  - **สร้าง README.md (ภาษาไทย) พร้อม:**
    - คำอธิบาย Backend API
    - โปรแกรมที่ต้องติดตั้ง (Node.js, PostgreSQL)
    - วิธีติดตั้ง dependencies
    - วิธีรัน development server
    - API endpoints documentation
  - **สร้าง INSTALLATION.md (ภาษาไทย) พร้อม:**
    - ขั้นตอนติดตั้ง Node.js
    - ขั้นตอนติดตั้ง PostgreSQL
    - การตั้งค่า database
    - การตั้งค่า environment variables
  - **สร้าง API.md (ภาษาไทย):**
    - รายการ API endpoints ทั้งหมด (อัปเดตเมื่อเพิ่ม endpoint ใหม่)


- [x] 1.3 Setup Database (PostgreSQL)

  - ติดตั้ง PostgreSQL
  - สร้าง database และ user
  - ตั้งค่า connection pooling
  - ติดตั้ง migration tool (Prisma หรือ TypeORM)
  - **สร้าง DATABASE.md (ภาษาไทย) พร้อม:**
    - ขั้นตอนติดตั้ง PostgreSQL
    - วิธีสร้าง database
    - วิธีรัน migrations
    - โครงสร้างตารางทั้งหมด
    - ER Diagram
    - เพิ่มขั้นตอนติดตั้ง PostgreSQL
    - เพิ่มคำสั่ง setup database

- [x] 1.4 Create Design System Components

  - สร้าง Button component (3D floating effect)
  - สร้าง Input component (dark theme)
  - สร้าง Card component
  - สร้าง Modal component
  - สร้าง Toast notification component
  - สร้าง Loading spinner component
  - เขียน Storybook สำหรับแต่ละ component

- [x] 2. Database Schema Implementation


  - สร้างตารางทั้งหมดตาม database-schema.md
  - ตั้งค่า relationships และ foreign keys
  - สร้าง indexes

- [x] 2.1 Create User และ Role Tables

  - สร้างตาราง `users` พร้อม columns ทั้งหมด
  - สร้างตาราง `roles` และ insert default roles (admin, free, pro)
  - สร้างตาราง `role_settings` พร้อม default values
  - สร้างตาราง `user_settings`
  - สร้าง indexes: `users.email`, `users.role_id`
  - เขียน migration script

- [x] 2.2 Create Project และ Audio Tables

  - สร้างตาราง `projects` พร้อม slug generation
  - สร้างตาราง `audio_files` พร้อม status enum
  - สร้าง indexes: `projects.user_id`, `audio_files.project_id`
  - เขียน migration script
  - _Requirements: 27.2, 2, 3_

- [x] 2.3 Create Transcript และ Translation Tables

  - สร้างตาราง `transcripts` พร้อม JSONB column
  - สร้างตาราง `transcript_segments`
  - สร้างตาราง `speakers`
  - สร้างตาราง `translations`
  - สร้าง indexes ที่จำเป็น
  - เขียน migration script

- [x] 2.4 Create AI Model และ Job Tables

  - สร้างตาราง `ai_models` พร้อม config_json
  - สร้างตาราง `jobs` พร้อม status enum
  - สร้างตาราง `notifications`
  - สร้างตาราง `logs`
  - สร้างตาราง `usage_stats`
  - สร้าง indexes ที่จำเป็น
  - เขียน migration script

- [ ] 3. Authentication System (Backend)

  - สร้าง API endpoints สำหรับ authentication
  - Implement JWT token generation และ validation
  - Implement password hashing

- [ ] 3.1 Implement Password Hashing และ JWT

  - สร้าง utility functions สำหรับ bcrypt hashing
  - สร้าง JWT token generation (access token + refresh token)
  - สร้าง JWT verification middleware
  - เขียน unit tests

- [ ] 3.2 Implement Register API

  - สร้าง POST `/api/v1/auth/register` endpoint
  - Validate input (email format, password strength)
  - Check email uniqueness
  - Hash password และ save user to database
  - Generate JWT tokens
  - Return user data และ tokens
  - เขียน integration tests
  - **อัปเดต API.md:**
    - เพิ่ม endpoint documentation สำหรับ `/auth/register`
    - ระบุ request/response format
    - ระบุ error codes

- [ ] 3.3 Implement Login API

  - สร้าง POST `/api/v1/auth/login` endpoint
  - Validate credentials
  - Check user is_active status
  - Generate JWT tokens
  - Update last_login_at
  - Return user data และ tokens
  - Implement rate limiting (5 attempts per 15 minutes)
  - เขียน integration tests

- [ ] 3.4 Implement Token Refresh API

  - สร้าง POST `/api/v1/auth/refresh` endpoint
  - Validate refresh token
  - Generate new access token และ refresh token
  - Return new tokens
  - เขียน integration tests

- [ ] 3.5 Implement Forgot Password และ Reset Password APIs

  - สร้าง POST `/api/v1/auth/forgot-password` endpoint
  - Generate reset token และ send email
  - สร้าง POST `/api/v1/auth/reset-password` endpoint
  - Validate reset token
  - Update password
  - เขียน integration tests

- [ ] 3.6 Implement Get Current User API

  - สร้าง GET `/api/v1/auth/me` endpoint
  - Return user data พร้อม role และ settings
  - Return usage stats (files uploaded this month)
  - เขียน integration tests

- [ ] 4. Authentication UI (Frontend)

  - สร้างหน้า Login, Register, Forgot Password, Reset Password
  - Implement form validation
  - Integrate กับ Backend APIs
     
- [ ] 4.1 Create Auth Layout Component

  - สร้าง AuthLayout component (centered card on dark background)
  - ใช้ purple gradient background
  - สร้าง responsive layout (mobile + desktop)
  - เพิ่ม logo และ branding
  - Comment อธิบายแต่ละส่วน


- [ ] 4.2 Create Register Page

  - สร้างหน้า `/register` with form fields: email, password, confirm password, first name, last name
  - Implement client-side validation (email format, password strength, password match)
  - ใช้ 3D button สำหรับ submit
  - แสดง loading state ระหว่าง submit
  - แสดง error messages จาก API
  - Redirect ไป dashboard หลัง register สำเร็จ
  - เก็บ token ใน localStorage
  - Comment อธิบายแต่ละส่วน
  - _Requirements: 1.1, 1.2, 25.5, 25.7_

- [ ] 4.3 Create Login Page

  - สร้างหน้า `/login` with form fields: email, password
  - Implement client-side validation
  - ใช้ 3D button สำหรับ submit
  - แสดง loading state
  - แสดง error messages
  - เพิ่ม "Forgot Password?" link
  - Redirect ไป dashboard หลัง login สำเร็จ
  - เก็บ token ใน localStorage
  - Comment อธิบายแต่ละส่วน
  - _Requirements: 1.3, 25.5, 25.7_

- [ ] 4.4 Create Forgot Password Page

  - สร้างหน้า `/forgot-password` with email field
  - ใช้ 3D button สำหรับ submit
  - แสดง success message หลังส่ง email
  - Comment อธิบายแต่ละส่วน
  - _Requirements: 1.4, 25.5_

- [ ] 4.5 Create Reset Password Page

  - สร้างหน้า `/reset-password` with password และ confirm password fields
  - รับ reset token จาก URL query parameter
  - Implement client-side validation
  - ใช้ 3D button สำหรับ submit
  - แสดง success message และ redirect ไป login
  - Comment อธิบายแต่ละส่วน
  - _Requirements: 1.4, 25.5_

- [ ] 4.6 Implement Auth State Management

  - สร้าง auth context หรือ store (Zustand/Redux)
  - Implement login, logout, register functions
  - Implement token refresh logic
  - Implement auto-logout เมื่อ token expired
  - Persist auth state ใน localStorage
  - Comment อธิบายแต่ละส่วน


- [ ] 4.7 Create Protected Route Component

  - สร้าง ProtectedRoute component
  - Check authentication status
  - Redirect ไป login ถ้ายังไม่ login
  - แสดง loading state ระหว่าง check auth
  - Comment อธิบายแต่ละส่วน


- [ ] 5. Dashboard Layout (Frontend)

  - สร้าง layout สำหรับหน้าหลังจาก login
  - Implement navigation


- [ ] 5.1 Create Desktop Layout

  - สร้าง DashboardLayout component
  - สร้าง Sidebar (fixed, dark background, purple accents)
  - สร้าง Header (user menu, notifications icon)
  - สร้าง Main content area
  - Implement responsive behavior (collapse sidebar on mobile)
  - Comment อธิบายแต่ละส่วน


- [ ] 5.2 Create Mobile Layout

  - สร้าง MobileLayout component
  - สร้าง Mobile header (hamburger menu, logo)
  - สร้าง Mobile navigation drawer
  - สร้าง Bottom navigation bar
  - ใช้ large touch-friendly buttons
  - Comment อธิบายแต่ละส่วน


- [ ] 5.3 Create Sidebar Navigation

  - สร้าง navigation items: Dashboard, Projects, Settings
  - Highlight active route
  - ใช้ purple color สำหรับ active state
  - เพิ่ม icons สำหรับแต่ละ item
  - Comment อธิบายแต่ละส่วน


- [ ] 5.4 Create User Menu Component

  - สร้าง dropdown menu ที่ header
  - แสดง user name และ email
  - เพิ่ม menu items: Profile, Settings, Logout
  - Implement logout function
  - Comment อธิบายแต่ละส่วน


- [ ] 6. Dashboard Page (Frontend)

  - สร้างหน้า Dashboard แสดงภาพรวม
  - แสดงสถิติการใช้งาน


- [ ] 6.1 Create Dashboard Stats Cards

  - สร้าง stat cards แสดง: Total Projects, Files This Month, Remaining Quota
  - ใช้ 3D card effect
  - ใช้ purple gradient สำหรับ highlights
  - แสดง loading skeleton ระหว่างโหลดข้อมูล
  - Comment อธิบายแต่ละส่วน


- [ ] 6.2 Create Recent Projects List

  - แสดงรายการโปรเจกต์ล่าสุด (5 รายการ)
  - แสดง project name, file count, last updated
  - เพิ่ม "View All" button
  - ใช้ 3D card สำหรับแต่ละ project
  - Comment อธิบายแต่ละส่วน


- [ ] 6.3 Integrate Dashboard with Backend API

  - เรียก GET `/api/v1/auth/me` เพื่อดึงข้อมูล user และ usage
  - เรียก GET `/api/v1/projects?limit=5` เพื่อดึง recent projects
  - แสดง error message ถ้า API fail
  - Implement retry logic
  - Comment อธิบายแต่ละส่วน


- [ ] 7. Projects Management (Backend)

  - สร้าง API endpoints สำหรับจัดการโปรเจกต์


- [ ] 7.1 Implement Create Project API

  - สร้าง POST `/api/v1/projects` endpoint
  - Validate input (name required, max length)
  - Generate unique slug from name
  - Save project to database
  - Return created project
  - เขียน integration tests


- [ ] 7.2 Implement Get Projects API

  - สร้าง GET `/api/v1/projects` endpoint
  - Support pagination (page, limit)
  - Support search (by name)
  - Support filter (is_archived)
  - Return projects พร้อม audio_files_count
  - เขียน integration tests


- [ ] 7.3 Implement Get Project Detail API

  - สร้าง GET `/api/v1/projects/:projectId` endpoint
  - Return project พร้อม audio files list
  - Check user ownership
  - เขียน integration tests


- [ ] 7.4 Implement Update Project API

  - สร้าง PATCH `/api/v1/projects/:projectId` endpoint
  - Validate input
  - Update slug ถ้า name เปลี่ยน
  - Check user ownership
  - เขียน integration tests


- [ ] 7.5 Implement Delete Project API

  - สร้าง DELETE `/api/v1/projects/:projectId` endpoint
  - Soft delete (set deleted_at)
  - Delete related audio files และ transcripts
  - Check user ownership
  - เขียน integration tests


- [ ] 8. Projects Management UI (Frontend)

  - สร้างหน้าจัดการโปรเจกต์


- [ ] 8.1 Create Projects List Page

  - สร้างหน้า `/projects` แสดงรายการโปรเจกต์ทั้งหมด
  - แสดง project cards (3D effect)
  - เพิ่ม search bar
  - เพิ่ม filter (archived/active)
  - เพิ่ม "Create Project" button (3D floating button)
  - Implement pagination
  - Comment อธิบายแต่ละส่วน


- [ ] 8.2 Create Project Card Component

  - แสดง project name, description, file count, created date
  - เพิ่ม action buttons: View, Edit, Delete (3D buttons)
  - ใช้ purple accent สำหรับ hover state
  - Comment อธิบายแต่ละส่วน


- [ ] 8.3 Create Create/Edit Project Modal

  - สร้าง modal สำหรับ create/edit project
  - Form fields: name, description
  - Validate input
  - ใช้ 3D buttons สำหรับ Save/Cancel
  - แสดง loading state
  - Comment อธิบายแต่ละส่วน


- [ ] 8.4 Implement Delete Project Confirmation

  - สร้าง confirmation modal
  - แสดง warning message
  - ใช้ 3D buttons สำหรับ Confirm/Cancel
  - Comment อธิบายแต่ละส่วน


- [ ] 8.5 Integrate Projects Page with Backend

  - เรียก GET `/api/v1/projects` เพื่อดึงรายการ
  - เรียก POST `/api/v1/projects` เพื่อสร้างใหม่
  - เรียก PATCH `/api/v1/projects/:id` เพื่ออัปเดต
  - เรียก DELETE `/api/v1/projects/:id` เพื่อลบ
  - แสดง error/success messages
  - Comment อธิบายแต่ละส่วน


- [ ] 9. File Upload System (Backend)

  - สร้าง API สำหรับอัปโหลดไฟล์เสียง


- [ ] 9.1 Setup File Storage

  - ตั้งค่า local storage directory structure
  - สร้าง utility functions สำหรับ file operations
  - Implement unique filename generation
  - Implement file type validation
  - Implement file size validation
  - เขียน unit tests


- [ ] 9.2 Implement Upload Audio API

  - สร้าง POST `/api/v1/projects/:projectId/audio/upload` endpoint
  - รับ multipart/form-data
  - Validate file type (MP3, WAV, M4A, FLAC)
  - Check file size limit (ตาม user settings)
  - Check user quota (files per month)
  - Save file to storage
  - Extract audio metadata (duration, format)
  - Create audio_files record in database
  - Return audio file data
  - เขียน integration tests


- [ ] 9.3 Implement Get Audio File API

  - สร้าง GET `/api/v1/audio/:audioId` endpoint
  - Return audio file data พร้อม signed URL
  - Check user ownership
  - เขียน integration tests


- [ ] 9.4 Implement Stream Audio API

  - สร้าง GET `/api/v1/audio/:audioId/stream` endpoint
  - Generate signed URL with expiration
  - Redirect to signed URL หรือ stream file directly
  - Check user ownership
  - เขียน integration tests


- [ ] 9.5 Implement Delete Audio API
      
  - สร้าง DELETE `/api/v1/audio/:audioId` endpoint
  - Delete file from storage
  - Soft delete audio_files record
  - Delete related transcripts
  - Check user ownership
  - เขียน integration tests


- [ ] 10. File Upload UI (Frontend)
      
  - สร้าง UI สำหรับอัปโหลดไฟล์


- [ ] 10.1 Create Project Detail Page
      
  - สร้างหน้า `/projects/:slug` แสดงรายละเอียดโปรเจกต์
  - แสดง project info (name, description)
  - แสดงรายการไฟล์เสียงทั้งหมด
  - เพิ่ม "Upload Audio" button (3D floating button)
  - Comment อธิบายแต่ละส่วน


- [ ] 10.2 Create Audio Upload Component
      
  - สร้าง file upload component (drag & drop + click to browse)
  - แสดง file preview (name, size, duration)
  - Validate file type และ size ก่อนอัปโหลด
  - แสดง upload progress bar
  - แสดง error messages
  - ใช้ 3D button สำหรับ Upload
  - Comment อธิบายแต่ละส่วน


- [ ] 10.3 Create Audio File List Component
      
  - แสดงรายการไฟล์เสียงเป็น table หรือ cards
  - แสดง: filename, duration, status, uploaded date
  - เพิ่ม action buttons: View Transcript, Delete (3D buttons)
  - แสดง status badge (uploaded, processing, completed, failed)
  - Comment อธิบายแต่ละส่วน


- [ ] 10.4 Integrate Upload with Backend

  - เรียก POST `/api/v1/projects/:projectId/audio/upload`
  - Implement chunked upload สำหรับไฟล์ใหญ่
  - แสดง real-time progress
  - Handle upload errors
  - Refresh file list หลังอัปโหลดสำเร็จ
  - Comment อธิบายแต่ละส่วน



---



