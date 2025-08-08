import { db } from '../firebase/config';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export interface StaffAccount {
  staffId: string;
  password: string;
  createdAt: Date;
  lastLogin?: Date;
}

// สมัครสมาชิก
export const registerStaff = async (staffId: string, password: string): Promise<boolean> => {
  try {
    // ตรวจสอบว่ามีบัญชีนี้อยู่แล้วหรือไม่
    const existingAccount = await getStaffAccount(staffId);
    if (existingAccount) {
      return false; // มีบัญชีอยู่แล้ว
    }

    // สร้างบัญชีใหม่
    const newAccount: StaffAccount = {
      staffId,
      password, // ในระบบจริงควรเข้ารหัส
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'staffAccounts', staffId), newAccount);
    return true;
  } catch (error) {
    console.error('Error registering staff:', error);
    return false;
  }
};

// ล็อกอิน
export const loginStaff = async (staffId: string, password: string): Promise<boolean> => {
  try {
    const account = await getStaffAccount(staffId);
    if (!account) {
      return false; // ไม่มีบัญชี
    }

    if (account.password !== password) {
      return false; // รหัสผ่านไม่ถูกต้อง
    }

    // อัปเดตเวลาล็อกอินล่าสุด
    await setDoc(doc(db, 'staffAccounts', staffId), {
      ...account,
      lastLogin: new Date(),
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error logging in staff:', error);
    return false;
  }
};

// ดึงข้อมูลบัญชี
export const getStaffAccount = async (staffId: string): Promise<StaffAccount | null> => {
  try {
    const docRef = doc(db, 'staffAccounts', staffId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as StaffAccount;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting staff account:', error);
    return null;
  }
};

// ตรวจสอบว่ามีบัญชีอยู่แล้วหรือไม่
export const checkStaffAccountExists = async (staffId: string): Promise<boolean> => {
  const account = await getStaffAccount(staffId);
  return account !== null;
}; 