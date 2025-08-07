export interface Nurse {
  id: string;
  name: string;
  type: 'nurse' | 'assistant';
  isPartTime?: boolean;
}

export interface Shift {
  id: string;
  code: string;
  name: string;
  color: string;
  backgroundColor?: string;
}

export interface ScheduleEntry {
  date: string;
  nurseId: string;
  shiftId: string;
  customText?: string;
  shiftType?: 'morning' | 'afternoon' | 'night'; // เพิ่มประเภทเวร
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number; // เพิ่มขนาดตัวอักษร
  };
}

export interface MonthlySchedule {
  year: number;
  month: number;
  entries: ScheduleEntry[];
}

export interface WorkAssignment {
  id: string;
  date: string;
  shift?: string; // เวร (เช้า/บ่าย/ดึก)
  nurseId: string;
  // สำหรับพยาบาล
  bedArea?: string; // เตียงที่ดูแล
  duties?: string[]; // หน้าที่ (multi-select)
  drugSupervision?: boolean; // ดูแลยาเสพติด
  // สำหรับทุกคน
  ert?: string; // ERT
  // สำหรับผู้ช่วย
  team?: string; // ทีมที่ดูแล
  assignment: string;
  notes?: string;
}

export interface Holiday {
  date: string;
  name: string;
  type: 'weekend' | 'public' | 'special';
}

export interface CustomHoliday {
  id: string;
  date: string;
  name: string;
  type: 'custom';
}



export interface AdminUser {
  username: string;
  password: string;
} 