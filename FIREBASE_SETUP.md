# การตั้งค่า Firebase สำหรับระบบตารางเวร

## ขั้นตอนการตั้งค่า Firebase

### 1. สร้างโปรเจกต์ Firebase
1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก "เพิ่มโปรเจกต์" หรือ "Add project"
3. ตั้งชื่อโปรเจกต์ เช่น "nursing-schedule"
4. เลือกการตั้งค่า Analytics (แนะนำให้เปิด)
5. คลิก "สร้างโปรเจกต์"

### 2. ตั้งค่า Firestore Database
1. ในโปรเจกต์ Firebase ไปที่เมนู "Firestore Database"
2. คลิก "สร้างฐานข้อมูล"
3. เลือก "Start in test mode" (สำหรับการทดสอบ)
4. เลือก location ที่ใกล้ที่สุด (asia-southeast1 สำหรับประเทศไทย)

### 3. เพิ่ม Web App
1. ในหน้า Project Overview คลิกไอคอน Web (</>)
2. ตั้งชื่อแอป เช่น "nursing-schedule-web"
3. เลือก "Firebase Hosting" (ถ้าต้องการ host บน Firebase)
4. คลิก "ลงทะเบียนแอป"

### 4. คัดลอก Configuration
หลังจากสร้างแอปแล้ว จะได้ config object แบบนี้:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "nursing-schedule-xxxxx.firebaseapp.com",
  projectId: "nursing-schedule-xxxxx",
  storageBucket: "nursing-schedule-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

### 5. อัปเดตไฟล์ config
แก้ไขไฟล์ `src/firebase/config.ts` โดยแทนที่ค่าใน firebaseConfig ด้วยค่าจริงที่ได้จาก Firebase Console

### 6. ตั้งค่า Security Rules (สำคัญ!)
ในหน้า Firestore Database > Rules แก้ไขเป็น:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // อนุญาตให้อ่านข้อมูลที่เผยแพร่แล้วได้ทุกคน
    match /published/{document} {
      allow read: if true;
      allow write: if false; // ป้องกันการแก้ไขโดยตรง
    }
    
    // อนุญาตให้เขียนข้อมูลร่างได้ทุกคน (สำหรับการทดสอบ)
    // ในการใช้งานจริงควรเพิ่ม authentication
    match /drafts/{document} {
      allow read, write: if true;
    }
  }
}
```

**หมายเหตุ:** Rules ข้างต้นเป็นแบบทดสอบ ในการใช้งานจริงควรเพิ่ม Authentication

## การทดสอบ

1. รันแอป: `npm start`
2. เข้าสู่ระบบแอดมิน (admin/admin123)
3. ลองจัดตารางเวรและกดบันทึกร่าง
4. เปิดคอมพิวเตอร์เครื่องอื่นหรือ browser ใหม่
5. เข้าเว็บเดียวกัน ข้อมูลร่างที่บันทึกไว้จะยังอยู่

## ข้อมูลเพิ่มเติม

### โครงสร้างข้อมูลใน Firestore:
```
/drafts/
  - schedule: {schedule: [], customHolidays: [], savedAt: timestamp}
  - assignments: {assignments: [], savedAt: timestamp}

/published/
  - current: {publishedSchedule: [], publishedAssignments: [], publishedCustomHolidays: [], publishedAt: timestamp}
```

### ฟีเจอร์ที่เพิ่มขึ้น:
- ✅ บันทึกร่างแบบ Real-time sync
- ✅ เข้าถึงข้อมูลจากคอมพิวเตอร์หลายเครื่อง
- ✅ Loading states สำหรับการโหลดข้อมูล
- ✅ Error handling

### การปรับปรุงในอนาคต:
- เพิ่ม Authentication สำหรับความปลอดภัย
- เพิ่ม Real-time updates (ถ้าหลายคนแก้ไขพร้อมกัน)
- เพิ่มการสำรองข้อมูลอัตโนมัติ