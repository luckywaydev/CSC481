-- ตั้งค่าการเข้ารหัสเป็น UTF8 ไมม่งั่้นจะเป็นภาษาเอเลี่ยน
SET client_encoding = 'UTF8';

-- สร้างฐานข้อมูลถ้ายังไม่มี
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = :'dbname') THEN
    -- สร้างฐานข้อมูลใหม่
    EXECUTE format('CREATE DATABASE %I WITH ENCODING ''UTF8'' LC_COLLATE ''en_US.UTF-8'' LC_CTYPE ''en_US.UTF-8'' TEMPLATE template0', :'dbname');
  END IF;
END
$$;

-- เชื่อมต่อเข้าฐานข้อมูลที่สร้าง
\c :"dbname"

-- สร้างผู้ใช้ถ้ายังไม่มี
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'dbuser') THEN
    -- สร้างผู้ใช้ใหม่พร้อมรหัสผ่าน
    EXECUTE format('CREATE USER %I WITH PASSWORD %L', :'dbuser', :'dbpass');
    -- จำกัดสิทธิ์การเชื่อมต่อ
    EXECUTE format('ALTER USER %I WITH CONNECTION LIMIT 100', :'dbuser');
  END IF;
END
$$;

-- กำหนดสิทธิ์สำหรับผู้ใช้
-- ให้สิทธิ์เฉพาะที่จำเป็นเท่านั้น
GRANT CONNECT ON DATABASE :"dbname" TO :"dbuser";
GRANT USAGE ON SCHEMA public TO :"dbuser";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO :"dbuser";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :"dbuser";

-- ตั้งค่าสิทธิ์เริ่มต้นสำหรับตารางใหม่ในอนาคต
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"dbuser";
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO :"dbuser";

-- แสดงข้อมูลเพื่อยืนยัน
\echo '\nDatabase List:'
\l
\echo '\nUser List:'
\du