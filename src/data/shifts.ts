import { Shift } from '../types';

export const nurseShifts: Shift[] = [
  { id: 'morning', code: 'ช', name: 'เวรเช้า', color: '#000000' },
  { id: 'morning_special', code: 'ช*', name: 'เวรเช้า*', color: '#000000', backgroundColor: '#e3f2fd' },
  { id: 'afternoon', code: 'บ', name: 'เวรบ่าย', color: '#000000' },
  { id: 'night', code: 'ด', name: 'เวรดึก', color: '#000000' },
  { id: 'morning_afternoon', code: 'ชบ', name: 'เวรเช้าบ่าย', color: '#000000' },
  { id: 'night_afternoon', code: 'ดบ', name: 'เวรดึกบ่าย', color: '#000000' },
  { id: 'training', code: 'อ', name: 'อบรม', color: '#000000' },
  { id: 'night_training', code: 'ดอ', name: 'ดึกอบรม', color: '#000000' },
  { id: 'off', code: 'O', name: 'Off', color: '#ffffff', backgroundColor: '#f44336' },
  { id: 'vacation', code: 'va', name: 'Vacation', color: '#ffffff', backgroundColor: '#d32f2f' },
  { id: 'other', code: 'อื่นๆ', name: 'อื่นๆ', color: '#000000', backgroundColor: '#ffeb3b' },
];

export const assistantShifts: Shift[] = [
  { id: 'morning', code: 'ช', name: 'เวรเช้า', color: '#000000' },
  { id: 'afternoon', code: 'บ', name: 'เวรบ่าย', color: '#000000' },
  { id: 'night', code: 'ด', name: 'เวรดึก', color: '#000000' },
  { id: 'morning_afternoon', code: 'ชบ', name: 'เวรเช้าบ่าย', color: '#000000' },
  { id: 'night_afternoon', code: 'ดบ', name: 'เวรดึกบ่าย', color: '#000000' },
  { id: 'housekeeping', code: 'MB', name: 'แม่บ้าน', color: '#000000' },
  { id: 'housekeeping_afternoon', code: 'MBบ', name: 'แม่บ้านบ่าย', color: '#000000' },
  { id: 'training', code: 'อ', name: 'อบรม', color: '#000000' },
  { id: 'night_training', code: 'ดอ', name: 'ดึกอบรม', color: '#000000' },
  { id: 'off', code: 'O', name: 'Off', color: '#ffffff', backgroundColor: '#f44336' },
  { id: 'vacation', code: 'va', name: 'Vacation', color: '#ffffff', backgroundColor: '#d32f2f' },
  { id: 'other', code: 'อื่นๆ', name: 'อื่นๆ', color: '#000000', backgroundColor: '#ffeb3b' },
];

export const allShifts = [...nurseShifts, ...assistantShifts];

export const getShiftByCode = (code: string): Shift | undefined => {
  return allShifts.find(shift => shift.code === code);
};

export const getShiftsByType = (type: 'nurse' | 'assistant'): Shift[] => {
  return type === 'nurse' ? nurseShifts : assistantShifts;
}; 