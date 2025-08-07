import { Nurse } from '../types';

export const nurses: Nurse[] = [
  // พยาบาล
  { id: 'n1', name: 'น.ส.ประนอม', type: 'nurse' },
  { id: 'n2', name: 'นางสาวศิรินทรา', type: 'nurse' },
  { id: 'n3', name: 'นางหทัยชนก', type: 'nurse' },
  { id: 'n4', name: 'นางสาวโยธกา', type: 'nurse' },
  { id: 'n5', name: 'นางสาวปาณิสรา', type: 'nurse' },
  { id: 'n6', name: 'นางสาวขวัญเรือน', type: 'nurse' },
  { id: 'n7', name: 'นางสาวสุวรรณา', type: 'nurse' },
  { id: 'n8', name: 'นางสาวนฤมล', type: 'nurse' },
  { id: 'n9', name: 'นางสาวอมลกานต์', type: 'nurse' },
  { id: 'n10', name: 'นางสาวนนทิยา', type: 'nurse' },
  { id: 'n11', name: 'นางสาวกรกนก', type: 'nurse' },
  { id: 'n12', name: 'นางสาวสุรีรัตน์', type: 'nurse' },
  { id: 'n13', name: 'นางสาวสุธิตรา', type: 'nurse' },
  { id: 'n14', name: 'นางสาววิภาวี', type: 'nurse' },
  { id: 'n15', name: 'นางสาวพณิดา', type: 'nurse' },
];

export const assistants: Nurse[] = [
  // ผู้ช่วยพยาบาลและผู้ช่วยเหลือคนไข้ (ตัวจริง)
  { id: 'a1', name: 'ภาณุวัฒน์', type: 'assistant' },
  { id: 'a2', name: 'สุกัญญา', type: 'assistant' },
  { id: 'a3', name: 'ณัทชกา', type: 'assistant' },
  { id: 'a4', name: 'ดวงแก้ว', type: 'assistant' },
  { id: 'a5', name: 'อรอุษา', type: 'assistant' },
  { id: 'a6', name: 'อัมพร', type: 'assistant' },
  
  // Parttime
  { id: 'a7', name: 'ดวงพร', type: 'assistant', isPartTime: true },
  { id: 'a8', name: 'กาญจนา', type: 'assistant', isPartTime: true },
  { id: 'a9', name: 'สาริสา', type: 'assistant', isPartTime: true },
  { id: 'a10', name: 'รุ้งจินดา', type: 'assistant', isPartTime: true },
];

export const allStaff = [...nurses, ...assistants]; 