import { 
  doc, 
  setDoc, 
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { ScheduleEntry, WorkAssignment, CustomHoliday } from '../types';

interface ScheduleData {
  schedule: ScheduleEntry[];
  customHolidays: CustomHoliday[];
  leaveEntries: any[];
  savedAt: any;
}

interface AssignmentData {
  assignments: WorkAssignment[];
  savedAt: any;
}

interface PublishedData {
  publishedSchedule: ScheduleEntry[];
  publishedAssignments: WorkAssignment[];
  publishedCustomHolidays: CustomHoliday[];
  publishedLeaveEntries: any[];
  publishedAt: any;
}

// บันทึกร่างตารางเวร
export const saveScheduleDraft = async (
  schedule: ScheduleEntry[], 
  customHolidays: CustomHoliday[]
): Promise<void> => {
  try {
    // กรองข้อมูล undefined และทำความสะอาดข้อมูล
    const filteredSchedule = schedule
      .filter(item => item !== undefined && item !== null)
      .map(item => {
        // ลบฟิลด์ที่เป็น undefined ออก
        const cleanedItem: any = { ...item };
        Object.keys(cleanedItem).forEach(key => {
          if (cleanedItem[key] === undefined) {
            delete cleanedItem[key];
          }
        });
        
        // ทำความสะอาด formatting object
        if (cleanedItem.formatting) {
          Object.keys(cleanedItem.formatting).forEach(key => {
            if (cleanedItem.formatting[key] === undefined) {
              delete cleanedItem.formatting[key];
            }
          });
          // ลบ formatting object ถ้าว่าง
          if (Object.keys(cleanedItem.formatting).length === 0) {
            delete cleanedItem.formatting;
          }
        }
        
        return cleanedItem;
      });
    
    const filteredCustomHolidays = customHolidays
      .filter(item => item !== undefined && item !== null)
      .map(item => {
        const cleanedItem: any = { ...item };
        Object.keys(cleanedItem).forEach(key => {
          if (cleanedItem[key] === undefined) {
            delete cleanedItem[key];
          }
        });
        return cleanedItem;
      });
    
    const data: ScheduleData = {
      schedule: filteredSchedule,
      customHolidays: filteredCustomHolidays,
      leaveEntries: [],
      savedAt: new Date() as any
    };
    
    await setDoc(doc(db, 'drafts', 'schedule'), data);
  } catch (error) {
    console.error('Error saving schedule draft:', error);
    throw new Error('ไม่สามารถบันทึกร่างตารางเวรได้');
  }
};

// บันทึกร่างตารางมอบหมายงาน
export const saveAssignmentsDraft = async (assignments: WorkAssignment[]): Promise<void> => {
  try {
    // กรองข้อมูล undefined และทำความสะอาดข้อมูล
    const filteredAssignments = assignments
      .filter(item => item !== undefined && item !== null)
      .map(item => {
        const cleanedItem: any = { ...item };
        Object.keys(cleanedItem).forEach(key => {
          if (cleanedItem[key] === undefined) {
            delete cleanedItem[key];
          }
        });
        return cleanedItem;
      });
    
    const data: AssignmentData = {
      assignments: filteredAssignments,
      savedAt: new Date() as any
    };
    
    await setDoc(doc(db, 'drafts', 'assignments'), data);
  } catch (error) {
    console.error('Error saving assignments draft:', error);
    throw new Error('ไม่สามารถบันทึกร่างตารางมอบหมายงานได้');
  }
};

// โหลดร่างตารางเวร
export const loadScheduleDraft = async (): Promise<{
  schedule: ScheduleEntry[];
  customHolidays: CustomHoliday[];
} | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'drafts', 'schedule'));
    
    if (docSnap.exists()) {
      const data = docSnap.data() as ScheduleData;
      return {
        schedule: data.schedule || [],
        customHolidays: data.customHolidays || []
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading schedule draft:', error);
    return null;
  }
};

// โหลดร่างตารางมอบหมายงาน
export const loadAssignmentsDraft = async (): Promise<{
  assignments: WorkAssignment[];
} | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'drafts', 'assignments'));
    
    if (docSnap.exists()) {
      const data = docSnap.data() as AssignmentData;
      return {
        assignments: data.assignments || []
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading assignments draft:', error);
    return null;
  }
};

// เผยแพร่ตารางเวรและมอบหมายงาน
export const publishScheduleAndAssignments = async (
  schedule: ScheduleEntry[],
  assignments: WorkAssignment[],
  customHolidays: CustomHoliday[]
): Promise<void> => {
  try {
    // กรองข้อมูล undefined และทำความสะอาดข้อมูล
    const filteredSchedule = schedule
      .filter(item => item !== undefined && item !== null)
      .map(item => {
        const cleanedItem: any = { ...item };
        Object.keys(cleanedItem).forEach(key => {
          if (cleanedItem[key] === undefined) {
            delete cleanedItem[key];
          }
        });
        
        // ทำความสะอาด formatting object
        if (cleanedItem.formatting) {
          Object.keys(cleanedItem.formatting).forEach(key => {
            if (cleanedItem.formatting[key] === undefined) {
              delete cleanedItem.formatting[key];
            }
          });
          // ลบ formatting object ถ้าว่าง
          if (Object.keys(cleanedItem.formatting).length === 0) {
            delete cleanedItem.formatting;
          }
        }
        
        return cleanedItem;
      });
    
    const filteredAssignments = assignments
      .filter(item => item !== undefined && item !== null)
      .map(item => {
        const cleanedItem: any = { ...item };
        Object.keys(cleanedItem).forEach(key => {
          if (cleanedItem[key] === undefined) {
            delete cleanedItem[key];
          }
        });
        return cleanedItem;
      });
    
    const filteredCustomHolidays = customHolidays
      .filter(item => item !== undefined && item !== null)
      .map(item => {
        const cleanedItem: any = { ...item };
        Object.keys(cleanedItem).forEach(key => {
          if (cleanedItem[key] === undefined) {
            delete cleanedItem[key];
          }
        });
        return cleanedItem;
      });
    
    const data: PublishedData = {
      publishedSchedule: filteredSchedule,
      publishedAssignments: filteredAssignments,
      publishedCustomHolidays: filteredCustomHolidays,
      publishedLeaveEntries: [],
      publishedAt: new Date() as any
    };
    
    await setDoc(doc(db, 'published', 'current'), data);
  } catch (error) {
    console.error('Error publishing data:', error);
    throw new Error('ไม่สามารถเผยแพร่ข้อมูลได้');
  }
};

// โหลดข้อมูลที่เผยแพร่แล้ว
export const loadPublishedData = async (): Promise<{
  publishedSchedule: ScheduleEntry[];
  publishedAssignments: WorkAssignment[];
  publishedCustomHolidays: CustomHoliday[];
} | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'published', 'current'));
    
    if (docSnap.exists()) {
      const data = docSnap.data() as PublishedData;
      return {
        publishedSchedule: data.publishedSchedule || [],
        publishedAssignments: data.publishedAssignments || [],
        publishedCustomHolidays: data.publishedCustomHolidays || []
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading published data:', error);
    return null;
  }
};