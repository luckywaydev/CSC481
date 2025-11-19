# Frontend Documentation

เอกสารทั้งหมดสำหรับ Frontend Application

## 📚 คู่มือหลัก

### [INSTALLATION.md](./INSTALLATION.md)
คู่มือติดตั้งแบบละเอียด ทีละขั้นตอน
- ติดตั้ง Node.js
- ติดตั้ง dependencies
- ตั้งค่า environment variables
- รัน development server
- Troubleshooting

### [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
โครงสร้างโปรเจกต์แบบละเอียด
- Folder structure
- File descriptions
- App Router structure
- Component organization
- Naming conventions

## 🎨 Design System

### Colors
- **Background**: Dark theme (#0a0a0f, #13131a, #1a1a24)
- **Primary**: Purple (#a855f7, #9333ea, #c084fc)
- **Text**: White, Gray shades

### Components
- **Button**: 3D floating effect, 4 variants, 3 sizes
- **Input**: Dark theme with purple accents
- **Card**: Elevated with shadows

### Responsive Design
- **Desktop**: Full layout with sidebar
- **Mobile**: Optimized for touch, bottom navigation

## 📝 Component Documentation

### UI Components (`components/ui/`)
- **Button.tsx**: 3D floating button with variants
- **Input.tsx**: Form input with label and error
- **Card.tsx**: Container with header/content/footer

### Layout Components (`components/layout/`)
- **AuthLayout.tsx**: Layout for auth pages
- **DashboardLayout.tsx**: Layout with sidebar (planned)

### Feature Components (`components/features/`)
- (จะเพิ่มในภายหลัง)

## 🔍 การใช้งาน

### หาเอกสารที่ต้องการ

**ต้องการติดตั้งโปรเจกต์**:
→ [INSTALLATION.md](./INSTALLATION.md)

**ต้องการเข้าใจโครงสร้างโปรเจกต์**:
→ [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

**ต้องการดู Design System**:
→ อ่านส่วน Design System ใน README.md หลัก

**ต้องการดู Components**:
→ ดูใน `components/` folder หรือรัน Storybook (ในอนาคต)

## 📂 โครงสร้างเอกสาร

```
docs/
├── README.md              # เอกสารนี้
├── INSTALLATION.md        # คู่มือติดตั้ง
└── PROJECT_STRUCTURE.md   # โครงสร้างโปรเจกต์
```

## 🔄 การอัปเดตเอกสาร

เมื่อทำ task ใหม่เสร็จ:
1. สร้าง `TASK_X.X_SUMMARY.md` (ถ้าจำเป็น)
2. อัปเดต `README.md` (root)
3. อัปเดต `PROJECT_STRUCTURE.md` (ถ้ามีไฟล์ใหม่)

## 📱 Responsive Design Guidelines

### Desktop (≥1024px)
- Full sidebar navigation
- Multi-column layouts
- Hover effects

### Tablet (768px - 1023px)
- Collapsible sidebar
- Adjusted spacing
- Touch-friendly buttons

### Mobile (<768px)
- Bottom navigation
- Single column layout
- Large touch targets (44x44px minimum)
- Simplified UI

## 🎯 Code Standards

### Comment Rules (ภาษาไทย)
- ✅ ทุกไฟล์ต้องมี comment อธิบาย
- ✅ ทุก function/component ต้องมี documentation
- ✅ ทุก JSX element ต้องอธิบายว่าคืออะไร
- ✅ ทุกสีต้องอธิบายว่าเป็นสีของอะไร
- ✅ ทุก spacing ต้องอธิบายว่าใช้กับอะไร
- ❌ ห้ามใช้ comment ภาษาอังกฤษ

### Example
```tsx
/**
 * ปุ่มแบบ 3D Floating Effect
 * - รองรับ 4 variants: primary, secondary, outline, ghost
 * - รองรับ 3 sizes: sm, md, lg
 * - มีเงาด้านล่างและยกขึ้นเมื่อ hover
 */
export function Button({ variant = 'primary', size = 'md', children }) {
  return (
    // Container ของปุ่ม - ใช้ flexbox เพื่อจัดตำแหน่งกลาง
    <button className="...">
      {/* ข้อความในปุ่ม - สีขาวสำหรับ primary, สีม่วงสำหรับ outline */}
      {children}
    </button>
  )
}
```

## 📞 ติดต่อ

หากพบข้อผิดพลาดในเอกสาร กรุณาแจ้งทีมพัฒนา
