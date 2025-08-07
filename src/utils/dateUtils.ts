import { format, getDaysInMonth, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, getDay } from 'date-fns';
import { th } from 'date-fns/locale';
import { Holiday } from '../types';

// วันหยุดราชการไทย (ตัวอย่าง)
export const thaiHolidays: Holiday[] = [
  { date: '2024-01-01', name: 'วันขึ้นปีใหม่', type: 'public' },
  { date: '2024-01-16', name: 'วันครู', type: 'public' },
  { date: '2024-02-10', name: 'วันมาฆบูชา', type: 'public' },
  { date: '2024-04-06', name: 'วันจักรี', type: 'public' },
  { date: '2024-04-13', name: 'วันสงกรานต์', type: 'public' },
  { date: '2024-04-14', name: 'วันสงกรานต์', type: 'public' },
  { date: '2024-04-15', name: 'วันสงกรานต์', type: 'public' },
  { date: '2024-05-01', name: 'วันแรงงานแห่งชาติ', type: 'public' },
  { date: '2024-05-04', name: 'วันฉัตรมงคล', type: 'public' },
  { date: '2024-05-22', name: 'วันวิสาขบูชา', type: 'public' },
  { date: '2024-06-03', name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสุทิดา', type: 'public' },
  { date: '2024-07-28', name: 'วันเฉลิมพระชนมพรรษารัชกาลที่ 10', type: 'public' },
  { date: '2024-08-12', name: 'วันแม่แห่งชาติ', type: 'public' },
  { date: '2024-10-23', name: 'วันปิยมหาราช', type: 'public' },
  { date: '2024-12-05', name: 'วันพ่อแห่งชาติ', type: 'public' },
  { date: '2024-12-10', name: 'วันรัฐธรรมนูญ', type: 'public' },
  { date: '2024-12-31', name: 'วันสิ้นปี', type: 'public' },
];

export const getMonthDays = (year: number, month: number) => {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  
  return eachDayOfInterval({ start, end });
};

export const isHoliday = (date: Date): Holiday | null => {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // เช็ควันหยุดสุดสัปดาห์
  if (isWeekend(date)) {
    return {
      date: dateStr,
      name: getDay(date) === 0 ? 'วันอาทิตย์' : 'วันเสาร์',
      type: 'weekend'
    };
  }
  
  // เช็ควันหยุดราชการ
  const holiday = thaiHolidays.find(h => h.date === dateStr);
  return holiday || null;
};

export const getWorkingDays = (year: number, month: number) => {
  const days = getMonthDays(year, month);
  return days.filter(day => !isHoliday(day));
};

export const getHolidaysInMonth = (year: number, month: number) => {
  const days = getMonthDays(year, month);
  const holidays: Holiday[] = [];
  
  days.forEach(day => {
    const holiday = isHoliday(day);
    if (holiday) {
      holidays.push(holiday);
    }
  });
  
  return holidays;
};

export const formatThaiDate = (date: Date) => {
  return format(date, 'd MMMM yyyy', { locale: th });
};

export const formatThaiMonth = (date: Date) => {
  return format(date, 'MMMM yyyy', { locale: th });
};

export const getDayName = (date: Date) => {
  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  return dayNames[getDay(date)];
};

// Export สำหรับ LeaveDialog
export { getDaysInMonth, isWeekend }; 