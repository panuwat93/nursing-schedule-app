import React, { useState, useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  TextField,
  useTheme,
  useMediaQuery,
  Toolbar,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatColorFill,
  FormatColorText,
  Clear,
  Add,
  Remove,
  Refresh,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Nurse, Shift, ScheduleEntry } from '../types';
import { nurses, assistants } from '../data/nurses';
import { nurseShifts, assistantShifts } from '../data/shifts';
import { getMonthDays, isHoliday, getDayName } from '../utils/dateUtils';

interface ScheduleTableProps {
  year: number;
  month: number;
  schedule: ScheduleEntry[];
  onScheduleChange: (entries: ScheduleEntry[]) => void;
  isReadOnly?: boolean;
  customHolidays?: CustomHoliday[];
}

interface CustomHoliday {
  id: string;
  date: string;
  name: string;
  type: 'custom';
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  year,
  month,
  schedule,
  onScheduleChange,
  isReadOnly = false,
  customHolidays = []
}) => {
  const [editingCell, setEditingCell] = useState<{ nurseId: string; date: string; shiftType?: 'morning' | 'afternoon' | 'night' } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [selectedCells, setSelectedCells] = useState<{ nurseId: string; date: string; shiftType?: 'morning' | 'afternoon' | 'night' }[]>([]);
  const [showColorPicker, setShowColorPicker] = useState<'background' | 'text' | null>(null);
  
  // โหมดการดู
  const [viewMode, setViewMode] = useState<'summary' | 'individual'>('summary');
  const [selectedStaff, setSelectedStaff] = useState<string>('');

  // สีให้เลือก
  const colorOptions = [
    { name: 'ไม่มีสี', value: '' },
    { name: 'แดง', value: '#ff0000' },
    { name: 'ส้ม', value: '#ff8000' },
    { name: 'เหลือง', value: '#ffff00' },
    { name: 'เขียว', value: '#00ff00' },
    { name: 'เขียวอมฟ้า', value: '#00ffff' },
    { name: 'ฟ้า', value: '#0080ff' },
    { name: 'น้ำเงิน', value: '#0000ff' },
    { name: 'ม่วง', value: '#8000ff' },
    { name: 'ชมพู', value: '#ff0080' },
    { name: 'น้ำตาล', value: '#804000' },
    { name: 'เทา', value: '#808080' },
    { name: 'ดำ', value: '#000000' },
    { name: 'ขาว', value: '#ffffff' },
    { name: 'แดงอ่อน', value: '#ffcccc' },
    { name: 'ส้มอ่อน', value: '#ffd9cc' },
    { name: 'เหลืองอ่อน', value: '#ffffcc' },
    { name: 'เขียวอ่อน', value: '#ccffcc' },
    { name: 'ฟ้าอ่อน', value: '#ccffff' },
    { name: 'น้ำเงินอ่อน', value: '#cce5ff' },
    { name: 'ม่วงอ่อน', value: '#e6ccff' },
    { name: 'ชมพูอ่อน', value: '#ffcce6' },
  ];
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const days = getMonthDays(year, month);
  const allStaff = [...nurses, ...assistants];

  const getShiftForNurse = (nurseId: string, date: string, shiftType?: 'morning' | 'afternoon' | 'night'): Shift | null => {
    const entry = schedule.find(e => e.nurseId === nurseId && e.date === date && e.shiftType === shiftType);
    if (!entry) return null;

    const nurse = allStaff.find(n => n.id === nurseId);
    const shifts = nurse?.type === 'nurse' ? nurseShifts : assistantShifts;
    return shifts.find(s => s.id === entry.shiftId) || null;
  };

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      // Select all text when editing starts
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.select();
        }
      }, 0);
    }
  }, [editingCell]);

  const handleCellClick = (nurseId: string, date: string, event: React.MouseEvent, shiftType?: 'morning' | 'afternoon' | 'night') => {
    if (isReadOnly) return;
    
    // ถ้ากด Ctrl/Cmd ให้เลือกหลายช่อง
    if (event.ctrlKey || event.metaKey) {
      setSelectedCells(prev => {
        const exists = prev.find(cell => cell.nurseId === nurseId && cell.date === date && cell.shiftType === shiftType);
        if (exists) {
          return prev.filter(cell => !(cell.nurseId === nurseId && cell.date === date && cell.shiftType === shiftType));
        } else {
          return [...prev, { nurseId, date, shiftType }];
        }
      });
      return;
    }
    
    // ถ้าไม่ได้กด Ctrl/Cmd ให้เลือกช่องเดียว
    setSelectedCells([{ nurseId, date, shiftType }]);
  };

  const handleCellDoubleClick = (nurseId: string, date: string, shiftType?: 'morning' | 'afternoon' | 'night') => {
    if (isReadOnly) return;
    
    const currentEntry = schedule.find(e => e.nurseId === nurseId && e.date === date && e.shiftType === shiftType);
    const currentShift = getShiftForNurse(nurseId, date, shiftType);
    
    // เริ่มการแก้ไข
    setEditingCell({ nurseId, date, shiftType });
    setEditValue(currentEntry?.customText || currentShift?.code || '');
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;

    const newSchedule = schedule.filter(
      e => !(e.nurseId === editingCell.nurseId && e.date === editingCell.date && e.shiftType === editingCell.shiftType)
    );

    if (editValue.trim() !== '') {
      // หา shift ที่ตรงกับ editValue
      const allShifts = [...nurseShifts, ...assistantShifts];
      const matchingShift = allShifts.find(s => s.code === editValue.trim());
      
      // ตรวจสอบข้อความพิเศษและจัดรูปแบบสีอัตโนมัติ
      let formatting = undefined;
      const trimmedValue = editValue.trim().toUpperCase();
      
      if (trimmedValue === 'O') {
        formatting = { textColor: '#ff0000', backgroundColor: '#ffffff' }; // ตัวอักษรสีแดงพื้นสีขาว
      } else if (trimmedValue === 'VA') {
        formatting = { backgroundColor: '#ff0000', textColor: '#ffffff' }; // พื้นแดงตัวอักษรสีขาว
      } else if (trimmedValue === 'MB') {
        formatting = { backgroundColor: '#00ff00', textColor: '#000000' }; // พื้นเขียวตัวอักษรดำ
      }
      
      newSchedule.push({
        date: editingCell.date,
        nurseId: editingCell.nurseId,
        shiftId: matchingShift?.id || 'other',
        ...(matchingShift ? {} : { customText: editValue.trim() }),
        ...(editingCell.shiftType ? { shiftType: editingCell.shiftType } : {}),
        ...(formatting && Object.keys(formatting).length > 0 ? { formatting } : {}),
      });
    }

    onScheduleChange(newSchedule);
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSaveEdit();
    } else if (event.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleBlur = () => {
    handleSaveEdit();
  };

  // Formatting functions
  const applyFormatting = (formatType: keyof NonNullable<ScheduleEntry['formatting']>, value: any) => {
    if (selectedCells.length === 0) return;
    
    const newSchedule = [...schedule];
    
    selectedCells.forEach(({ nurseId, date, shiftType }) => {
      const entryIndex = newSchedule.findIndex(e => e.nurseId === nurseId && e.date === date && e.shiftType === shiftType);
      
      if (entryIndex >= 0) {
        const currentEntry = newSchedule[entryIndex];
        const currentValue = currentEntry.formatting?.[formatType];
        
        // สำหรับ boolean properties (bold, italic, underline) - toggle behavior
        if (typeof value === 'boolean' && typeof currentValue === 'boolean') {
          newSchedule[entryIndex] = {
            ...currentEntry,
            formatting: {
              ...currentEntry.formatting,
              [formatType]: !currentValue
            },
          };
        } else {
          // สำหรับ color properties - ใช้ค่าที่ส่งมา
          newSchedule[entryIndex] = {
            ...currentEntry,
            formatting: {
              ...currentEntry.formatting,
              [formatType]: value,
            },
          };
        }
      }
    });
    
    onScheduleChange(newSchedule);
  };

  const clearFormatting = () => {
    if (selectedCells.length === 0) return;
    
    const newSchedule = [...schedule];
    
    selectedCells.forEach(({ nurseId, date, shiftType }) => {
      const entryIndex = newSchedule.findIndex(e => e.nurseId === nurseId && e.date === date && e.shiftType === shiftType);
      
      if (entryIndex >= 0) {
        const { formatting, ...entryWithoutFormatting } = newSchedule[entryIndex];
        newSchedule[entryIndex] = entryWithoutFormatting;
      }
    });
    
    onScheduleChange(newSchedule);
  };

  const resetTable = () => {
    // เคลียร์ตารางทั้งหมดให้เป็นตารางเปล่า
    onScheduleChange([]);
  };

  const getSelectedCellFormatting = () => {
    if (selectedCells.length === 1) {
      const { nurseId, date, shiftType } = selectedCells[0];
      const entry = schedule.find(e => e.nurseId === nurseId && e.date === date && e.shiftType === shiftType);
      return entry?.formatting || {
        bold: false,
        italic: false,
        underline: false,
        backgroundColor: '',
        textColor: '',
        fontSize: 14
      };
    }
    
    // สำหรับหลายช่องที่เลือก ให้แสดงค่าเริ่มต้น
    return {
      bold: false,
      italic: false,
      underline: false,
      backgroundColor: '',
      textColor: '',
      fontSize: 14
    };
  };

  const renderViewModeSelector = () => {
    return (
      <Box sx={{ mb: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Kanit', mb: 2 }}>
          โหมดการดู
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => {
                if (newMode !== null) {
                  setViewMode(newMode);
                  if (newMode === 'summary') {
                    setSelectedStaff('');
                  }
                }
              }}
              sx={{ fontFamily: 'Kanit' }}
            >
              <ToggleButton value="summary">
                ตารางรวม
              </ToggleButton>
              <ToggleButton value="individual">
                รายบุคคล
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          {viewMode === 'individual' && (
            <Grid item>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel sx={{ fontFamily: 'Kanit' }}>เลือกเจ้าหน้าที่</InputLabel>
                <Select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  label="เลือกเจ้าหน้าที่"
                  sx={{ fontFamily: 'Kanit' }}
                >
                  {allStaff.map((staff) => (
                    <MenuItem key={staff.id} value={staff.id} sx={{ fontFamily: 'Kanit' }}>
                      {staff.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const renderIndividualCalendar = () => {
    if (!selectedStaff) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Kanit', color: '#666' }}>
            กรุณาเลือกเจ้าหน้าที่เพื่อดูตารางเวร
          </Typography>
        </Box>
      );
    }

    const staff = allStaff.find(s => s.id === selectedStaff);
    if (!staff) return null;

    const daysInMonth = new Date(year, month, 0).getDate();

    return (
      <Box>
        <Typography variant="h5" sx={{ fontFamily: 'Kanit', mb: 2, textAlign: 'center' }}>
          ตารางเวรของ {staff.name} - {format(new Date(year, month - 1), 'MMMM yyyy', { locale: th })}
        </Typography>
        
        <Grid container spacing={1}>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const date = new Date(year, month - 1, day);
            const dayName = getDayName(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            // ตรวจสอบวันหยุดชดเชย
            const publicHoliday = isPublicHoliday(date);
            const isHoliday = isWeekend || publicHoliday.isHoliday;
            
            // ดึงเวรเช้าและเวรบ่ายจากตารางปกติ
            const morningShift = getShiftForNurse(selectedStaff, dateStr, 'morning');
            const afternoonShift = getShiftForNurse(selectedStaff, dateStr, 'afternoon');
            
            // สำหรับผู้ช่วยพาร์ทไทม์ (ไม่มี shiftType)
            const staff = allStaff.find(s => s.id === selectedStaff);
            const partTimeShift = staff?.isPartTime ? getShiftForNurse(selectedStaff, dateStr) : null;
            
            return (
              <Grid item xs={6} sm={4} md={3} lg={2} key={day}>
                <Card 
                  sx={{ 
                    height: 120,
                    backgroundColor: isHoliday ? '#ffebee' : '#ffffff',
                    border: '1px solid #e0e0e0',
                    '&:hover': { backgroundColor: isHoliday ? '#ffcdd2' : '#f5f5f5' }
                  }}
                >
                  <CardContent sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Kanit', fontSize: '1.1rem' }}>
                      {day}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'Kanit', color: isHoliday ? '#d32f2f' : '#666' }}>
                      {dayName}
                    </Typography>
                    
                    {/* แสดงเวรเช้า */}
                    {morningShift && (
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={morningShift.id === 'other' && schedule.find(e => e.nurseId === selectedStaff && e.date === dateStr && e.shiftType === 'morning')?.customText ? 
                            schedule.find(e => e.nurseId === selectedStaff && e.date === dateStr && e.shiftType === 'morning')?.customText : 
                            morningShift.code}
                          size="small"
                          sx={{ 
                            fontFamily: 'Kanit',
                            backgroundColor: schedule.find(e => e.nurseId === selectedStaff && e.date === dateStr && e.shiftType === 'morning')?.formatting?.backgroundColor || morningShift.backgroundColor || '#e3f2fd',
                            color: schedule.find(e => e.nurseId === selectedStaff && e.date === dateStr && e.shiftType === 'morning')?.formatting?.textColor || morningShift.color || '#000',
                            fontSize: '0.6rem',
                            height: '16px'
                          }}
                        />
                      </Box>
                    )}
                    
                    {/* แสดงเวรบ่าย */}
                    {afternoonShift && (
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={afternoonShift.id === 'other' && schedule.find(e => e.nurseId === selectedStaff && e.date === dateStr && e.shiftType === 'afternoon')?.customText ? 
                            schedule.find(e => e.nurseId === selectedStaff && e.date === dateStr && e.shiftType === 'afternoon')?.customText : 
                            afternoonShift.code}
                          size="small"
                          sx={{ 
                            fontFamily: 'Kanit',
                            backgroundColor: schedule.find(e => e.nurseId === selectedStaff && e.date === dateStr && e.shiftType === 'afternoon')?.formatting?.backgroundColor || afternoonShift.backgroundColor || '#e3f2fd',
                            color: schedule.find(e => e.nurseId === selectedStaff && e.date === dateStr && e.shiftType === 'afternoon')?.formatting?.textColor || afternoonShift.color || '#000',
                            fontSize: '0.6rem',
                            height: '16px'
                          }}
                        />
                      </Box>
                    )}
                    
                    {/* สำหรับผู้ช่วยพาร์ทไทม์ */}
                    {partTimeShift && (
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={partTimeShift.id === 'other' && schedule.find(e => e.nurseId === selectedStaff && e.date === dateStr)?.customText ? 
                            schedule.find(e => e.nurseId === selectedStaff && e.date === dateStr)?.customText : 
                            partTimeShift.code}
                          size="small"
                          sx={{ 
                            fontFamily: 'Kanit',
                            backgroundColor: schedule.find(e => e.nurseId === selectedStaff && e.date === dateStr)?.formatting?.backgroundColor || partTimeShift.backgroundColor || '#e3f2fd',
                            color: schedule.find(e => e.nurseId === selectedStaff && e.date === dateStr)?.formatting?.textColor || partTimeShift.color || '#000',
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderFormattingToolbar = () => {
    if (isReadOnly) return null;
    
    const currentFormatting = getSelectedCellFormatting();
    
    return (
      <Toolbar 
        variant="dense" 
        sx={{ 
          backgroundColor: '#f5f5f5', 
          borderBottom: '1px solid #e0e0e0',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontFamily: 'Kanit', mr: 1 }}>
          จัดรูปแบบ:
        </Typography>
        
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="ตัวหนา (Ctrl+B)">
            <IconButton 
              size="small"
              onClick={() => applyFormatting('bold', !currentFormatting.bold)}
              sx={{ 
                backgroundColor: currentFormatting.bold ? '#e3f2fd' : 'transparent',
                '&:hover': { backgroundColor: currentFormatting.bold ? '#bbdefb' : '#f5f5f5' }
              }}
            >
              <FormatBold />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="ตัวเอียง (Ctrl+I)">
            <IconButton 
              size="small"
              onClick={() => applyFormatting('italic', !currentFormatting.italic)}
              sx={{ 
                backgroundColor: currentFormatting.italic ? '#e3f2fd' : 'transparent',
                '&:hover': { backgroundColor: currentFormatting.italic ? '#bbdefb' : '#f5f5f5' }
              }}
            >
              <FormatItalic />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="ขีดเส้นใต้ (Ctrl+U)">
            <IconButton 
              size="small"
              onClick={() => applyFormatting('underline', !currentFormatting.underline)}
              sx={{ 
                backgroundColor: currentFormatting.underline ? '#e3f2fd' : 'transparent',
                '&:hover': { backgroundColor: currentFormatting.underline ? '#bbdefb' : '#f5f5f5' }
              }}
            >
              <FormatUnderlined />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
        
        <Divider orientation="vertical" flexItem />
        
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="สีพื้นหลัง">
            <Box sx={{ position: 'relative' }}>
              <IconButton 
                size="small"
                onClick={() => setShowColorPicker(showColorPicker === 'background' ? null : 'background')}
                sx={{
                  backgroundColor: currentFormatting.backgroundColor ? '#e3f2fd' : 'transparent',
                  '&:hover': { backgroundColor: currentFormatting.backgroundColor ? '#bbdefb' : '#f5f5f5' }
                }}
              >
                <FormatColorFill />
              </IconButton>
              {showColorPicker === 'background' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 1000,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '4px',
                    minWidth: '180px'
                  }}
                >
                  {colorOptions.map((color) => (
                    <Box
                      key={color.value}
                      onClick={() => {
                        applyFormatting('backgroundColor', color.value);
                        setShowColorPicker(null);
                      }}
                      sx={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: color.value || 'transparent',
                        border: color.value ? '1px solid #ccc' : '1px dashed #ccc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }
                      }}
                      title={color.name}
                    >
                      {!color.value && '×'}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Tooltip>
          
          <Tooltip title="สีตัวอักษร">
            <Box sx={{ position: 'relative' }}>
              <IconButton 
                size="small"
                onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
                sx={{
                  backgroundColor: currentFormatting.textColor ? '#e3f2fd' : 'transparent',
                  '&:hover': { backgroundColor: currentFormatting.textColor ? '#bbdefb' : '#f5f5f5' }
                }}
              >
                <FormatColorText />
              </IconButton>
              {showColorPicker === 'text' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 1000,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '4px',
                    minWidth: '180px'
                  }}
                >
                  {colorOptions.map((color) => (
                    <Box
                      key={color.value}
                      onClick={() => {
                        applyFormatting('textColor', color.value);
                        setShowColorPicker(null);
                      }}
                      sx={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: color.value || 'transparent',
                        border: color.value ? '1px solid #ccc' : '1px dashed #ccc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }
                      }}
                      title={color.name}
                    >
                      {!color.value && '×'}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Tooltip>
        </ButtonGroup>
        
        <Divider orientation="vertical" flexItem />
        
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="ลดขนาดตัวอักษร">
            <span>
              <IconButton 
                size="small"
                onClick={() => {
                  const currentSize = currentFormatting.fontSize || 14;
                  const newSize = Math.max(8, currentSize - 2);
                  applyFormatting('fontSize', newSize);
                }}
                disabled={selectedCells.length === 0}
              >
                <Remove />
              </IconButton>
            </span>
          </Tooltip>
          
          <Typography 
            variant="caption" 
            sx={{ 
              fontFamily: 'Kanit', 
              display: 'flex', 
              alignItems: 'center', 
              px: 1,
              minWidth: '30px',
              justifyContent: 'center'
            }}
          >
            {currentFormatting.fontSize || 14}
          </Typography>
          
          <Tooltip title="เพิ่มขนาดตัวอักษร">
            <span>
              <IconButton 
                size="small"
                onClick={() => {
                  const currentSize = currentFormatting.fontSize || 14;
                  const newSize = Math.min(24, currentSize + 2);
                  applyFormatting('fontSize', newSize);
                }}
                disabled={selectedCells.length === 0}
              >
                <Add />
              </IconButton>
            </span>
          </Tooltip>
        </ButtonGroup>
        
        <Divider orientation="vertical" flexItem />
        
        <Tooltip title="ล้างการจัดรูปแบบ">
          <IconButton size="small" onClick={clearFormatting}>
            <Clear />
          </IconButton>
        </Tooltip>
        
        <Divider orientation="vertical" flexItem />
        
        <Tooltip title="รีเซ็ตตาราง (เคลียร์ทั้งหมด)">
          <IconButton 
            size="small" 
            onClick={resetTable}
            sx={{ 
              color: 'error.main',
              '&:hover': { 
                backgroundColor: 'error.light',
                color: 'error.contrastText'
              }
            }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
        
        <Typography variant="caption" sx={{ fontFamily: 'Kanit', color: 'text.secondary', ml: 'auto' }}>
          {selectedCells.length > 0 ? `เลือก ${selectedCells.length} ช่อง` : 'คลิกช่องเพื่อเลือก'}
        </Typography>
      </Toolbar>
    );
  };

  const renderShiftCell = (shift: Shift | null, nurseId: string, date: string, shiftType?: 'morning' | 'afternoon' | 'night') => {
    const entry = schedule.find(e => e.nurseId === nurseId && e.date === date && e.shiftType === shiftType);
    const isSelected = selectedCells.some(cell => cell.nurseId === nurseId && cell.date === date && cell.shiftType === shiftType);

    if (!shift) {
      // แสดงช่องว่างที่สามารถ double-click ได้
      return (
        <Box
          sx={{
            width: isMobile ? '20px' : '30px',
            height: isMobile ? '18px' : '22px',
            border: isSelected ? '2px solid #1976d2' : '1px dashed #ccc',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: entry?.formatting?.backgroundColor || 'transparent',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            }
          }}
        />
      );
    }

    const displayText = shift.id === 'other' && entry?.customText ? entry.customText : shift.code;

    return (
      <Chip
        label={displayText}
        size="small"
        sx={{
          backgroundColor: entry?.formatting?.backgroundColor || shift.backgroundColor || 'transparent',
          color: entry?.formatting?.textColor || shift.color,
          fontWeight: entry?.formatting?.bold ? 'bold' : 'bold',
          fontStyle: entry?.formatting?.italic ? 'italic' : 'normal',
          textDecoration: entry?.formatting?.underline ? 'underline' : 'none',
          fontSize: entry?.formatting?.fontSize ? `${entry.formatting.fontSize}px` : (isMobile ? '0.6rem' : '0.75rem'),
          width: '100%',
          height: '100%',
          borderRadius: '0',
          border: isSelected ? '2px solid #1976d2' : 'none',
          '& .MuiChip-label': {
            padding: isMobile ? '2px' : '4px',
            width: '100%',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }
        }}
      />
    );
  };

  const renderEditableCell = (nurseId: string, date: string, shift: Shift | null, shiftType?: 'morning' | 'afternoon' | 'night') => {
    const isEditing = editingCell?.nurseId === nurseId && editingCell?.date === date && editingCell?.shiftType === shiftType;
    
    if (isEditing) {
      return (
        <TextField
          inputRef={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          size="small"
          variant="outlined"
          sx={{
            '& .MuiInputBase-root': {
              fontSize: isMobile ? '0.6rem' : '0.75rem',
              height: isMobile ? '20px' : '22px',
              minWidth: isMobile ? '30px' : '40px',
              maxWidth: isMobile ? '50px' : '60px',
            },
            '& .MuiInputBase-input': {
              padding: isMobile ? '2px 4px' : '4px 6px',
              textAlign: 'center',
              fontFamily: 'Kanit',
              fontWeight: 'bold',
            }
          }}
        />
      );
    }

    return (
      <Box onDoubleClick={() => handleCellDoubleClick(nurseId, date, shiftType)}>
        {renderShiftCell(shift, nurseId, date, shiftType)}
      </Box>
    );
  };

  // Get Thai public holidays for the month
  const getThaiPublicHolidays = (year: number, month: number): { [key: string]: string } => {
    const holidays: { [key: string]: string } = {
      // มกราคม
      '01-01': 'วันขึ้นปีใหม่',
      
      // เมษายน
      '04-06': 'วันจักรี',
      '04-13': 'วันสงกรานต์',
      '04-14': 'วันสงกรานต์',
      '04-15': 'วันสงกรานต์',
      
      // พฤษภาคม
      '05-01': 'วันแรงงานแห่งชาติ',
      '05-05': 'วันฉัตรมงคล',
      
      // กรกฎาคม
      '07-28': 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว',
      
      // สิงหาคม
      '08-12': 'วันแม่แห่งชาติ',
      
      // ตุลาคม
      '10-23': 'วันปิยมหาราช',
      
      // ธันวาคม
      '12-05': 'วันพ่อแห่งชาติ',
      '12-10': 'วันรัฐธรรมนูญ',
    };

    // Add Buddhist holidays
    const buddhistHolidays = getBuddhistHolidays(year, month);
    Object.assign(holidays, buddhistHolidays);

    return holidays;
  };

  // Get Buddhist holidays (calculated based on lunar calendar)
  const getBuddhistHolidays = (year: number, month: number): { [key: string]: string } => {
    const holidays: { [key: string]: string } = {};
    
    // วันหยุดทางพุทธศาสนาตามปี 2025
    if (year === 2025) {
      // วันมาฆบูชา - 13 กุมภาพันธ์ 2025 (วันพฤหัสบดี)
      if (month === 2) {
        holidays['02-13'] = 'วันมาฆบูชา';
      }
      
      // วันวิสาขบูชา - 13 พฤษภาคม 2025 (วันอังคาร)
      if (month === 5) {
        holidays['05-13'] = 'วันวิสาขบูชา';
      }
      
      // วันอาสาฬหบูชา - 11 กรกฎาคม 2025 (วันศุกร์)
      if (month === 7) {
        holidays['07-11'] = 'วันอาสาฬหบูชา';
      }
      
      // วันเข้าพรรษา - 12 กรกฎาคม 2025 (วันเสาร์) - ไม่ใช่วันหยุดราชการ
      // ไม่เพิ่มวันเข้าพรรษาเพราะเป็นวันเสาร์
      
      // วันออกพรรษา - 9 ตุลาคม 2025 (วันพฤหัสบดี)
      if (month === 10) {
        holidays['10-09'] = 'วันออกพรรษา';
      }
    }
    
    // วันหยุดทางพุทธศาสนาตามปี 2024
    if (year === 2024) {
      // วันมาฆบูชา - 24 กุมภาพันธ์ 2024 (วันเสาร์) - ไม่ใช่วันหยุดราชการ
      // ไม่เพิ่มวันมาฆบูชาเพราะเป็นวันเสาร์
      
      // วันวิสาขบูชา - 22 พฤษภาคม 2024 (วันพุธ)
      if (month === 5) {
        holidays['05-22'] = 'วันวิสาขบูชา';
      }
      
      // วันอาสาฬหบูชา - 20 กรกฎาคม 2024 (วันเสาร์) - ไม่ใช่วันหยุดราชการ
      // ไม่เพิ่มวันอาสาฬหบูชาเพราะเป็นวันเสาร์
      
      // วันเข้าพรรษา - 21 กรกฎาคม 2024 (วันอาทิตย์) - ไม่ใช่วันหยุดราชการ
      // ไม่เพิ่มวันเข้าพรรษาเพราะเป็นวันอาทิตย์
      
      // วันออกพรรษา - 18 ตุลาคม 2024 (วันศุกร์)
      if (month === 10) {
        holidays['10-18'] = 'วันออกพรรษา';
      }
    }
    
    return holidays;
  };

  // Check if a date is a public holiday
  const isPublicHoliday = (date: Date): { isHoliday: boolean; holidayName: string } => {
    const dateStr = format(date, 'MM-dd');
    const holidays = getThaiPublicHolidays(year, month);
    const holidayName = holidays[dateStr];
    
    // Check for custom holidays
    const fullDateStr = format(date, 'yyyy-MM-dd');
    const customHoliday = customHolidays.find(h => h.date === fullDateStr);
    
    if (customHoliday) {
      return {
        isHoliday: true,
        holidayName: customHoliday.name
      };
    }
    
    return {
      isHoliday: !!holidayName,
      holidayName: holidayName || ''
    };
  };

  // Calculate shift counts for a specific group of staff
  const getShiftCounts = (staffList: Nurse[], date: string) => {
    let nightCount = 0;
    let morningCount = 0;
    let afternoonCount = 0;

    staffList.forEach(staff => {
      // ตรวจสอบเวรเช้า
      const morningShift = getShiftForNurse(staff.id, date, 'morning');
      if (morningShift) {
        switch (morningShift.id) {
          case 'night': // เวรดึก
            nightCount++;
            break;
          case 'morning': // เวรเช้า
            // ไม่นับประนอม (n1) และศิรินทรา (n2) เมื่อขึ้นเวรเช้าปกติ
            if (staff.id !== 'n1' && staff.id !== 'n2') {
              morningCount++;
            }
            break;
          case 'morning_special': // เวรเช้า* - นับปกติ
            morningCount++;
            break;
          case 'afternoon': // เวรบ่าย
            afternoonCount++;
            break;
          case 'morning_afternoon': // เวรเช้าบ่าย - นับทั้งเช้าและบ่าย
            // สำหรับเวรเช้า ไม่นับประนอม/ศิรินทรา แต่ยังนับเวรบ่าย
            if (staff.id !== 'n1' && staff.id !== 'n2') {
              morningCount++;
            }
            afternoonCount++;
            break;
          case 'night_afternoon': // เวรดึกบ่าย - นับทั้งดึกและบ่าย
            nightCount++;
            afternoonCount++;
            break;
          case 'housekeeping_afternoon': // แม่บ้านบ่าย - นับแค่บ่าย
            afternoonCount++;
            break;
          case 'training': // อบรม
          case 'night_training': // ดึกอบรม
          case 'housekeeping': // แม่บ้าน - ไม่นับ
          case 'off': // Off
          case 'vacation': // Vacation
          case 'other': // อื่นๆ
          default:
            // ไม่นับ
            break;
        }
      }

      // ตรวจสอบเวรบ่าย
      const afternoonShift = getShiftForNurse(staff.id, date, 'afternoon');
      if (afternoonShift) {
        switch (afternoonShift.id) {
          case 'night': // เวรดึก
            nightCount++;
            break;
          case 'morning': // เวรเช้า
            // ไม่นับประนอม (n1) และศิรินทรา (n2) เมื่อขึ้นเวรเช้าปกติ
            if (staff.id !== 'n1' && staff.id !== 'n2') {
              morningCount++;
            }
            break;
          case 'morning_special': // เวรเช้า* - นับปกติ
            morningCount++;
            break;
          case 'afternoon': // เวรบ่าย
            afternoonCount++;
            break;
          case 'morning_afternoon': // เวรเช้าบ่าย - นับทั้งเช้าและบ่าย
            // สำหรับเวรเช้า ไม่นับประนอม/ศิรินทรา แต่ยังนับเวรบ่าย
            if (staff.id !== 'n1' && staff.id !== 'n2') {
              morningCount++;
            }
            afternoonCount++;
            break;
          case 'night_afternoon': // เวรดึกบ่าย - นับทั้งดึกและบ่าย
            nightCount++;
            afternoonCount++;
            break;
          case 'housekeeping_afternoon': // แม่บ้านบ่าย - นับแค่บ่าย
            afternoonCount++;
            break;
          case 'training': // อบรม
          case 'night_training': // ดึกอบรม
          case 'housekeeping': // แม่บ้าน - ไม่นับ
          case 'off': // Off
          case 'vacation': // Vacation
          case 'other': // อื่นๆ
          default:
            // ไม่นับ
            break;
        }
      }

      // สำหรับผู้ช่วยพาร์ทไทม์ (ไม่มี shiftType)
      if (staff.isPartTime) {
        const shift = getShiftForNurse(staff.id, date);
        if (shift) {
          switch (shift.id) {
            case 'night': // เวรดึก
              nightCount++;
              break;
            case 'morning': // เวรเช้า
              // ไม่นับประนอม (n1) และศิรินทรา (n2) เมื่อขึ้นเวรเช้าปกติ
              if (staff.id !== 'n1' && staff.id !== 'n2') {
                morningCount++;
              }
              break;
            case 'morning_special': // เวรเช้า* - นับปกติ
              morningCount++;
              break;
            case 'afternoon': // เวรบ่าย
              afternoonCount++;
              break;
            case 'morning_afternoon': // เวรเช้าบ่าย - นับทั้งเช้าและบ่าย
              // สำหรับเวรเช้า ไม่นับประนอม/ศิรินทรา แต่ยังนับเวรบ่าย
              if (staff.id !== 'n1' && staff.id !== 'n2') {
                morningCount++;
              }
              afternoonCount++;
              break;
            case 'night_afternoon': // เวรดึกบ่าย - นับทั้งดึกและบ่าย
              nightCount++;
              afternoonCount++;
              break;
            case 'housekeeping_afternoon': // แม่บ้านบ่าย - นับแค่บ่าย
              afternoonCount++;
              break;
            case 'training': // อบรม
            case 'night_training': // ดึกอบรม
            case 'housekeeping': // แม่บ้าน - ไม่นับ
            case 'off': // Off
            case 'vacation': // Vacation
            case 'other': // อื่นๆ
            default:
              // ไม่นับ
              break;
          }
        }
      }
    });

    return { nightCount, morningCount, afternoonCount };
  };

  // Calculate total shifts for a specific staff member
  const getTotalShiftsForStaff = (staffId: string) => {
    let totalShifts = 0;

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // ตรวจสอบเวรเช้า
      const morningShift = getShiftForNurse(staffId, dateStr, 'morning');
      if (morningShift) {
        // หา entry เพื่อตรวจสอบข้อความที่แสดง
        const entry = schedule.find(e => e.nurseId === staffId && e.date === dateStr && e.shiftType === 'morning');
        const displayText = morningShift.id === 'other' && entry?.customText ? entry.customText : morningShift.code;
        
        // ไม่นับตัวอักษร O (Off) เป็นเวรรวม
        if (displayText !== 'O') {
          totalShifts++;
        }
      }

      // ตรวจสอบเวรบ่าย
      const afternoonShift = getShiftForNurse(staffId, dateStr, 'afternoon');
      if (afternoonShift) {
        // หา entry เพื่อตรวจสอบข้อความที่แสดง
        const entry = schedule.find(e => e.nurseId === staffId && e.date === dateStr && e.shiftType === 'afternoon');
        const displayText = afternoonShift.id === 'other' && entry?.customText ? entry.customText : afternoonShift.code;
        
        // ไม่นับตัวอักษร O (Off) เป็นเวรรวม
        if (displayText !== 'O') {
          totalShifts++;
        }
      }

      // สำหรับผู้ช่วยพาร์ทไทม์ (ไม่มี shiftType)
      const staff = allStaff.find(s => s.id === staffId);
      if (staff?.isPartTime) {
        const shift = getShiftForNurse(staffId, dateStr);
        if (shift) {
          // หา entry เพื่อตรวจสอบข้อความที่แสดง
          const entry = schedule.find(e => e.nurseId === staffId && e.date === dateStr);
          const displayText = shift.id === 'other' && entry?.customText ? entry.customText : shift.code;
          
          // ไม่นับตัวอักษร O (Off) เป็นเวรรวม
          if (displayText !== 'O') {
            totalShifts++;
          }
        }
      }
    });

    return totalShifts;
  };

  // Calculate OT shifts (red colored shifts) for a specific staff member
  const getOTShiftsForStaff = (staffId: string) => {
    let otShifts = 0;

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // ตรวจสอบเวรเช้า
      const morningShift = getShiftForNurse(staffId, dateStr, 'morning');
      if (morningShift) {
        // หา entry เพื่อตรวจสอบการจัดรูปแบบ
        const entry = schedule.find(e => e.nurseId === staffId && e.date === dateStr && e.shiftType === 'morning');
        const textColor = entry?.formatting?.textColor || morningShift.color;
        const displayText = morningShift.id === 'other' && entry?.customText ? entry.customText : morningShift.code;
        
        // ตรวจสอบว่าเป็นเวรสีแดงหรือไม่ (ช, บ, ด ที่มีสีแดง) และไม่ใช่ตัวอักษร O
        if ((textColor === '#ff0000' || textColor === '#d32f2f') && displayText !== 'O') {
          otShifts++;
        }
      }

      // ตรวจสอบเวรบ่าย
      const afternoonShift = getShiftForNurse(staffId, dateStr, 'afternoon');
      if (afternoonShift) {
        // หา entry เพื่อตรวจสอบการจัดรูปแบบ
        const entry = schedule.find(e => e.nurseId === staffId && e.date === dateStr && e.shiftType === 'afternoon');
        const textColor = entry?.formatting?.textColor || afternoonShift.color;
        const displayText = afternoonShift.id === 'other' && entry?.customText ? entry.customText : afternoonShift.code;
        
        // ตรวจสอบว่าเป็นเวรสีแดงหรือไม่ (ช, บ, ด ที่มีสีแดง) และไม่ใช่ตัวอักษร O
        if ((textColor === '#ff0000' || textColor === '#d32f2f') && displayText !== 'O') {
          otShifts++;
        }
      }

      // สำหรับผู้ช่วยพาร์ทไทม์ (ไม่มี shiftType)
      const staff = allStaff.find(s => s.id === staffId);
      if (staff?.isPartTime) {
        const shift = getShiftForNurse(staffId, dateStr);
        if (shift) {
          // หา entry เพื่อตรวจสอบการจัดรูปแบบ
          const entry = schedule.find(e => e.nurseId === staffId && e.date === dateStr);
          const textColor = entry?.formatting?.textColor || shift.color;
          const displayText = shift.id === 'other' && entry?.customText ? entry.customText : shift.code;
          
          // ตรวจสอบว่าเป็นเวรสีแดงหรือไม่ (ช, บ, ด ที่มีสีแดง) และไม่ใช่ตัวอักษร O
          if ((textColor === '#ff0000' || textColor === '#d32f2f') && displayText !== 'O') {
            otShifts++;
          }
        }
      }
    });

    return otShifts;
  };

  // Calculate shift pay (black colored afternoon/night shifts) for a specific staff member
  const getShiftPayForStaff = (staffId: string) => {
    let shiftPay = 0;

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // ตรวจสอบเวรเช้า
      const morningShift = getShiftForNurse(staffId, dateStr, 'morning');
      if (morningShift) {
        // หา entry เพื่อตรวจสอบการจัดรูปแบบ
        const entry = schedule.find(e => e.nurseId === staffId && e.date === dateStr && e.shiftType === 'morning');
        const textColor = entry?.formatting?.textColor || morningShift.color;
        
        // ตรวจสอบว่าเป็นเวรบ่ายหรือดึกสีดำหรือไม่
        if ((morningShift.id === 'afternoon' || morningShift.id === 'night') && 
            (textColor === '#000000' || textColor === '#000000')) {
          shiftPay++;
        }
      }

      // ตรวจสอบเวรบ่าย
      const afternoonShift = getShiftForNurse(staffId, dateStr, 'afternoon');
      if (afternoonShift) {
        // หา entry เพื่อตรวจสอบการจัดรูปแบบ
        const entry = schedule.find(e => e.nurseId === staffId && e.date === dateStr && e.shiftType === 'afternoon');
        const textColor = entry?.formatting?.textColor || afternoonShift.color;
        
        // ตรวจสอบว่าเป็นเวรบ่ายหรือดึกสีดำหรือไม่
        if ((afternoonShift.id === 'afternoon' || afternoonShift.id === 'night') && 
            (textColor === '#000000' || textColor === '#000000')) {
          shiftPay++;
        }
      }

      // สำหรับผู้ช่วยพาร์ทไทม์ (ไม่มี shiftType)
      const staff = allStaff.find(s => s.id === staffId);
      if (staff?.isPartTime) {
        const shift = getShiftForNurse(staffId, dateStr);
        if (shift) {
          // หา entry เพื่อตรวจสอบการจัดรูปแบบ
          const entry = schedule.find(e => e.nurseId === staffId && e.date === dateStr);
          const textColor = entry?.formatting?.textColor || shift.color;
          
          // ตรวจสอบว่าเป็นเวรบ่ายหรือดึกสีดำหรือไม่
          if ((shift.id === 'afternoon' || shift.id === 'night') && 
              (textColor === '#000000' || textColor === '#000000')) {
            shiftPay++;
          }
        }
      }
    });

    return shiftPay;
  };

  // Calculate responsive column widths based on screen size and number of days
  const getColumnWidth = () => {
    const daysInMonth = days.length;
    if (isMobile) {
      // For mobile, use very compact columns
      return `${Math.max(25, Math.min(30, (100 - 120) / daysInMonth))}px`;
    }
    if (isTablet) {
      // For tablet, use medium compact columns
      return `${Math.max(30, Math.min(40, (100 - 120) / daysInMonth))}px`;
    }
    // For desktop, use comfortable columns
    return `${Math.max(35, Math.min(50, (100 - 120) / daysInMonth))}px`;
  };

  const getNameColumnWidth = () => {
    if (isMobile) return '120px';
    if (isTablet) return '120px';
    return '120px';
  };

  const renderGroupHeader = (title: string, backgroundColor: string) => (
    <TableRow>
      <TableCell 
        colSpan={days.length + 4}
        sx={{
          backgroundColor: backgroundColor,
          color: 'white',
          fontWeight: 'bold',
          fontFamily: 'Kanit',
          fontSize: isMobile ? '0.8rem' : '1rem',
          textAlign: 'center',
          padding: isMobile ? '8px 4px' : '12px 8px',
          borderBottom: '2px solid #e0e0e0',
        }}
      >
        {title}
      </TableCell>
    </TableRow>
  );

  const renderSummaryRow = (label: string, staffList: Nurse[], backgroundColor: string) => (
    <TableRow>
      <TableCell sx={{ 
        backgroundColor: backgroundColor,
        fontWeight: 'bold',
        fontFamily: 'Kanit',
        width: getNameColumnWidth(),
        position: 'sticky',
        left: 0,
        zIndex: 1,
        fontSize: isMobile ? '0.6rem' : '0.7rem',
        padding: isMobile ? '4px 2px' : '6px 4px',
        borderRight: '2px solid #e0e0e0',
        color: 'white',
      }}>
        {label}
      </TableCell>
      {days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const { nightCount, morningCount, afternoonCount } = getShiftCounts(staffList, dateStr);
        const holiday = isHoliday(day);
        const publicHoliday = isPublicHoliday(day);
        
        return (
          <TableCell
            key={`summary-${dateStr}`}
            align="center"
            sx={{
              backgroundColor: publicHoliday.isHoliday ? '#ffcdd2' : (holiday ? '#fff3e0' : backgroundColor),
              border: '1px solid #e0e0e0',
              fontSize: isMobile ? '0.5rem' : '0.6rem',
              padding: isMobile ? '2px 1px' : '4px 2px',
              verticalAlign: 'middle',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            <Box>
              <Typography variant="caption" display="block" sx={{ 
                fontSize: isMobile ? '0.5rem' : '0.6rem',
                fontWeight: 'bold',
                color: 'black'
              }}>
                ดึก: {nightCount}
              </Typography>
              <Typography variant="caption" display="block" sx={{ 
                fontSize: isMobile ? '0.5rem' : '0.6rem',
                fontWeight: 'bold',
                color: 'black'
              }}>
                เช้า: {morningCount}
              </Typography>
              <Typography variant="caption" display="block" sx={{ 
                fontSize: isMobile ? '0.5rem' : '0.6rem',
                fontWeight: 'bold',
                color: 'black'
              }}>
                บ่าย: {afternoonCount}
              </Typography>
            </Box>
          </TableCell>
        );
      })}
      {/* คอลัมน์เวรรวม */}
      <TableCell sx={{ 
        backgroundColor: backgroundColor,
        border: '1px solid #e0e0e0',
        width: isMobile ? '40px' : '50px',
        fontSize: isMobile ? '0.5rem' : '0.6rem',
        padding: isMobile ? '2px 1px' : '4px 2px',
        textAlign: 'center',
        verticalAlign: 'middle',
        color: 'white',
        fontWeight: 'bold',
      }}>
        0
      </TableCell>
      {/* คอลัมน์ OT */}
      <TableCell sx={{ 
        backgroundColor: backgroundColor,
        border: '1px solid #e0e0e0',
        width: isMobile ? '35px' : '45px',
        fontSize: isMobile ? '0.5rem' : '0.6rem',
        padding: isMobile ? '2px 1px' : '4px 2px',
        textAlign: 'center',
        verticalAlign: 'middle',
        color: 'white',
        fontWeight: 'bold',
      }}>
        0
      </TableCell>
      {/* คอลัมน์ค่าเวร */}
      <TableCell sx={{ 
        backgroundColor: backgroundColor,
        border: '1px solid #e0e0e0',
        width: isMobile ? '40px' : '50px',
        fontSize: isMobile ? '0.5rem' : '0.6rem',
        padding: isMobile ? '2px 1px' : '4px 2px',
        textAlign: 'center',
        verticalAlign: 'middle',
        color: 'white',
        fontWeight: 'bold',
      }}>
        0
      </TableCell>
    </TableRow>
  );

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      {renderViewModeSelector()}
      {viewMode === 'individual' ? (
        renderIndividualCalendar()
      ) : (
        <>
          {renderFormattingToolbar()}
          <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Kanit' }}>
            ตารางเวรประจำเดือน {format(new Date(year, month - 1), 'MMMM yyyy', { locale: th })}
          </Typography>

          <TableContainer 
            component={Paper} 
            sx={{ 
              maxHeight: 600,
              width: '100%',
          overflowX: 'hidden',
          overflowY: 'auto',
          '& .MuiTable-root': {
            width: '100%',
            tableLayout: 'fixed',
          }
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                backgroundColor: '#f5f5f5', 
                fontWeight: 'bold',
                fontFamily: 'Kanit',
                width: getNameColumnWidth(),
                position: 'sticky',
                left: 0,
                zIndex: 2,
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                padding: isMobile ? '4px 2px' : '8px 4px',
              }}>
                ชื่อเจ้าหน้าที่
              </TableCell>
              {days.map((day) => {
                const holiday = isHoliday(day);
                const publicHoliday = isPublicHoliday(day);
                
                return (
                  <TableCell
                    key={day.toISOString()}
                    align="center"
                    sx={{
                      backgroundColor: publicHoliday.isHoliday ? '#ffcdd2' : (holiday ? '#ffebee' : '#f5f5f5'),
                      fontWeight: 'bold',
                      fontFamily: 'Kanit',
                      width: getColumnWidth(),
                      fontSize: isMobile ? '0.5rem' : '0.65rem',
                      padding: isMobile ? '2px 1px' : '4px 2px',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Box>
                      <Typography variant="caption" display="block" sx={{ 
                        fontSize: isMobile ? '0.5rem' : '0.65rem',
                        fontWeight: 'bold'
                      }}>
                        {format(day, 'd')}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ 
                        fontSize: isMobile ? '0.4rem' : '0.55rem',
                        color: publicHoliday.isHoliday ? '#d32f2f' : (holiday ? '#d32f2f' : 'inherit')
                      }}>
                        {getDayName(day)}
                      </Typography>
                    </Box>
                  </TableCell>
                );
              })}
              {/* คอลัมน์เวรรวม */}
              <TableCell sx={{ 
                backgroundColor: '#f5f5f5', 
                fontWeight: 'bold',
                fontFamily: 'Kanit',
                width: isMobile ? '40px' : '50px',
                fontSize: isMobile ? '0.6rem' : '0.7rem',
                padding: isMobile ? '4px 2px' : '8px 4px',
                textAlign: 'center',
                border: '1px solid #e0e0e0',
              }}>
                เวรรวม
              </TableCell>
              {/* คอลัมน์ OT */}
              <TableCell sx={{ 
                backgroundColor: '#f5f5f5', 
                fontWeight: 'bold',
                fontFamily: 'Kanit',
                width: isMobile ? '35px' : '45px',
                fontSize: isMobile ? '0.6rem' : '0.7rem',
                padding: isMobile ? '4px 2px' : '8px 4px',
                textAlign: 'center',
                border: '1px solid #e0e0e0',
              }}>
                OT
              </TableCell>
              {/* คอลัมน์ค่าเวร */}
              <TableCell sx={{ 
                backgroundColor: '#f5f5f5', 
                fontWeight: 'bold',
                fontFamily: 'Kanit',
                width: isMobile ? '40px' : '50px',
                fontSize: isMobile ? '0.6rem' : '0.7rem',
                padding: isMobile ? '4px 2px' : '8px 4px',
                textAlign: 'center',
                border: '1px solid #e0e0e0',
              }}>
                ค่าเวร
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Nurses Group Header */}
            {renderGroupHeader('พยาบาล', '#1976d2')}
            
            {/* Nurses */}
            {nurses.map((staff, index) => (
              <React.Fragment key={staff.id}>
                {/* Divider Row between nurses */}
                {index > 0 && (
                  <TableRow>
                    <TableCell 
                      colSpan={days.length + 4}
                      sx={{
                        height: '4px',
                        backgroundColor: '#e3f2fd',
                        borderBottom: '2px solid #1976d2',
                        padding: 0,
                      }}
                    />
                  </TableRow>
                )}
                {/* แถวบน - เวรเช้า */}
                <TableRow>
                  <TableCell 
                    rowSpan={2}
                    sx={{ 
                      fontWeight: 'bold',
                      fontFamily: 'Kanit',
                      backgroundColor: '#fafafa',
                      borderRight: '2px solid #e0e0e0',
                      width: getNameColumnWidth(),
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      fontSize: isMobile ? '0.65rem' : '0.75rem',
                      padding: isMobile ? '4px 2px' : '8px 4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ 
                        fontSize: 'inherit',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {staff.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const shift = getShiftForNurse(staff.id, dateStr, 'morning');
                    const holiday = isHoliday(day);
                    const publicHoliday = isPublicHoliday(day);
                    
                    return (
                      <TableCell
                        key={`${staff.id}-${dateStr}-morning`}
                        align="center"
                        onClick={(e) => handleCellClick(staff.id, dateStr, e, 'morning')}
                        sx={{
                          cursor: isReadOnly ? 'default' : 'pointer',
                          backgroundColor: publicHoliday.isHoliday ? '#ffebee' : (holiday ? '#fff3e0' : 'white'),
                          border: '1px solid #e0e0e0',
                          '&:hover': {
                            backgroundColor: isReadOnly ? 'inherit' : '#f5f5f5',
                          },
                          minHeight: isMobile ? 20 : 25,
                          width: getColumnWidth(),
                          padding: isMobile ? '1px' : '2px',
                          verticalAlign: 'middle',
                          borderBottom: '1px solid #e0e0e0',
                        }}
                      >
                        {renderEditableCell(staff.id, dateStr, shift, 'morning')}
                      </TableCell>
                    );
                  })}
                  {/* คอลัมน์เวรรวม */}
                  <TableCell 
                    rowSpan={2}
                    sx={{ 
                      backgroundColor: '#fafafa',
                      border: '1px solid #e0e0e0',
                      width: isMobile ? '40px' : '50px',
                      fontSize: isMobile ? '0.6rem' : '0.7rem',
                      padding: isMobile ? '4px 2px' : '8px 4px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 'bold',
                    }}
                  >
                    {getTotalShiftsForStaff(staff.id)}
                  </TableCell>
                  {/* คอลัมน์ OT */}
                  <TableCell 
                    rowSpan={2}
                    sx={{ 
                      backgroundColor: '#fafafa',
                      border: '1px solid #e0e0e0',
                      width: isMobile ? '35px' : '45px',
                      fontSize: isMobile ? '0.6rem' : '0.7rem',
                      padding: isMobile ? '4px 2px' : '8px 4px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 'bold',
                    }}
                  >
                    {getOTShiftsForStaff(staff.id)}
                  </TableCell>
                  {/* คอลัมน์ค่าเวร */}
                  <TableCell 
                    rowSpan={2}
                    sx={{ 
                      backgroundColor: '#fafafa',
                      border: '1px solid #e0e0e0',
                      width: isMobile ? '40px' : '50px',
                      fontSize: isMobile ? '0.6rem' : '0.7rem',
                      padding: isMobile ? '4px 2px' : '8px 4px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 'bold',
                    }}
                  >
                    {getShiftPayForStaff(staff.id)}
                  </TableCell>
                </TableRow>
                {/* แถวล่าง - เวรบ่าย */}
                <TableRow>
                  {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const shift = getShiftForNurse(staff.id, dateStr, 'afternoon');
                    const holiday = isHoliday(day);
                    const publicHoliday = isPublicHoliday(day);
                    
                    return (
                      <TableCell
                        key={`${staff.id}-${dateStr}-afternoon`}
                        align="center"
                        onClick={(e) => handleCellClick(staff.id, dateStr, e, 'afternoon')}
                        sx={{
                          cursor: isReadOnly ? 'default' : 'pointer',
                          backgroundColor: publicHoliday.isHoliday ? '#ffebee' : (holiday ? '#fff3e0' : 'white'),
                          border: '1px solid #e0e0e0',
                          '&:hover': {
                            backgroundColor: isReadOnly ? 'inherit' : '#f5f5f5',
                          },
                          minHeight: isMobile ? 20 : 25,
                          width: getColumnWidth(),
                          padding: isMobile ? '1px' : '2px',
                          verticalAlign: 'middle',
                        }}
                      >
                        {renderEditableCell(staff.id, dateStr, shift, 'afternoon')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </React.Fragment>
            ))}

            {/* Nurses Summary Row */}
            {renderSummaryRow('สรุปจำนวนพยาบาล', nurses, '#1565c0')}

            {/* Divider Row */}
            <TableRow>
              <TableCell 
                colSpan={days.length + 4}
                sx={{
                  height: '8px',
                  backgroundColor: '#f5f5f5',
                  borderBottom: '3px solid #1976d2',
                  padding: 0,
                }}
              />
            </TableRow>

            {/* Assistants Group Header */}
            {renderGroupHeader('ผู้ช่วยพยาบาลและผู้ช่วยเหลือคนไข้', '#4caf50')}
            
            {/* Assistants - Full Time */}
            {assistants.filter(staff => !staff.isPartTime).map((staff, index) => (
              <React.Fragment key={staff.id}>
                {/* Divider Row between full time assistants */}
                {index > 0 && (
                  <TableRow>
                    <TableCell 
                      colSpan={days.length + 4}
                      sx={{
                        height: '4px',
                        backgroundColor: '#e8f5e8',
                        borderBottom: '2px solid #4caf50',
                        padding: 0,
                      }}
                    />
                  </TableRow>
                )}
                {/* แถวบน - เวรเช้า */}
                <TableRow>
                  <TableCell 
                    rowSpan={2}
                    sx={{ 
                      fontWeight: 'bold',
                      fontFamily: 'Kanit',
                      backgroundColor: '#fafafa',
                      borderRight: '2px solid #e0e0e0',
                      width: getNameColumnWidth(),
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      fontSize: isMobile ? '0.65rem' : '0.75rem',
                      padding: isMobile ? '4px 2px' : '8px 4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ 
                        fontSize: 'inherit',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {staff.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const shift = getShiftForNurse(staff.id, dateStr, 'morning');
                    const holiday = isHoliday(day);
                    const publicHoliday = isPublicHoliday(day);
                    
                    return (
                      <TableCell
                        key={`${staff.id}-${dateStr}-morning`}
                        align="center"
                        onClick={(e) => handleCellClick(staff.id, dateStr, e, 'morning')}
                        sx={{
                          cursor: isReadOnly ? 'default' : 'pointer',
                          backgroundColor: publicHoliday.isHoliday ? '#ffebee' : (holiday ? '#fff3e0' : 'white'),
                          border: '1px solid #e0e0e0',
                          '&:hover': {
                            backgroundColor: isReadOnly ? 'inherit' : '#f5f5f5',
                          },
                          minHeight: isMobile ? 20 : 25,
                          width: getColumnWidth(),
                          padding: isMobile ? '1px' : '2px',
                          verticalAlign: 'middle',
                          borderBottom: '1px solid #e0e0e0',
                        }}
                      >
                        {renderEditableCell(staff.id, dateStr, shift, 'morning')}
                      </TableCell>
                    );
                  })}
                  {/* คอลัมน์เวรรวม */}
                  <TableCell 
                    rowSpan={2}
                    sx={{ 
                      backgroundColor: '#fafafa',
                      border: '1px solid #e0e0e0',
                      width: isMobile ? '40px' : '50px',
                      fontSize: isMobile ? '0.6rem' : '0.7rem',
                      padding: isMobile ? '4px 2px' : '8px 4px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 'bold',
                    }}
                  >
                    {getTotalShiftsForStaff(staff.id)}
                  </TableCell>
                  {/* คอลัมน์ OT */}
                  <TableCell 
                    rowSpan={2}
                    sx={{ 
                      backgroundColor: '#fafafa',
                      border: '1px solid #e0e0e0',
                      width: isMobile ? '35px' : '45px',
                      fontSize: isMobile ? '0.6rem' : '0.7rem',
                      padding: isMobile ? '4px 2px' : '8px 4px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 'bold',
                    }}
                  >
                    {getOTShiftsForStaff(staff.id)}
                  </TableCell>
                  {/* คอลัมน์ค่าเวร */}
                  <TableCell 
                    rowSpan={2}
                    sx={{ 
                      backgroundColor: '#fafafa',
                      border: '1px solid #e0e0e0',
                      width: isMobile ? '40px' : '50px',
                      fontSize: isMobile ? '0.6rem' : '0.7rem',
                      padding: isMobile ? '4px 2px' : '8px 4px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 'bold',
                    }}
                  >
                    {getShiftPayForStaff(staff.id)}
                  </TableCell>
                </TableRow>
                {/* แถวล่าง - เวรบ่าย */}
                <TableRow>
                  {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const shift = getShiftForNurse(staff.id, dateStr, 'afternoon');
                    const holiday = isHoliday(day);
                    const publicHoliday = isPublicHoliday(day);
                    
                    return (
                      <TableCell
                        key={`${staff.id}-${dateStr}-afternoon`}
                        align="center"
                        onClick={(e) => handleCellClick(staff.id, dateStr, e, 'afternoon')}
                        sx={{
                          cursor: isReadOnly ? 'default' : 'pointer',
                          backgroundColor: publicHoliday.isHoliday ? '#ffebee' : (holiday ? '#fff3e0' : 'white'),
                          border: '1px solid #e0e0e0',
                          '&:hover': {
                            backgroundColor: isReadOnly ? 'inherit' : '#f5f5f5',
                          },
                          minHeight: isMobile ? 20 : 25,
                          width: getColumnWidth(),
                          padding: isMobile ? '1px' : '2px',
                          verticalAlign: 'middle',
                        }}
                      >
                        {renderEditableCell(staff.id, dateStr, shift, 'afternoon')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </React.Fragment>
            ))}

            {/* Divider Row between Full Time and Part Time Assistants */}
            <TableRow>
              <TableCell 
                colSpan={days.length + 4}
                sx={{
                  height: '4px',
                  backgroundColor: '#e8f5e8',
                  borderBottom: '2px solid #4caf50',
                  padding: 0,
                }}
              />
            </TableRow>

            {/* Assistants - Part Time */}
            {assistants.filter(staff => staff.isPartTime).map((staff, index) => (
              <React.Fragment key={staff.id}>
                {/* Divider Row between part time assistants */}
                {index > 0 && (
                  <TableRow>
                    <TableCell 
                      colSpan={days.length + 4}
                      sx={{
                        height: '4px',
                        backgroundColor: '#e8f5e8',
                        borderBottom: '2px solid #4caf50',
                        padding: 0,
                      }}
                    />
                  </TableRow>
                )}
                <TableRow>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  fontFamily: 'Kanit',
                  backgroundColor: '#fafafa',
                  borderRight: '2px solid #e0e0e0',
                  width: getNameColumnWidth(),
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  fontSize: isMobile ? '0.65rem' : '0.75rem',
                  padding: isMobile ? '4px 2px' : '8px 4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ 
                      fontSize: 'inherit',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {staff.name}
                    </Typography>
                    <Chip 
                      label="PT" 
                      size="small" 
                      color="secondary" 
                      sx={{ 
                        fontSize: isMobile ? '0.4rem' : '0.5rem',
                        height: isMobile ? '14px' : '16px',
                        minWidth: isMobile ? '14px' : '16px',
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                </TableCell>
                {days.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const shift = getShiftForNurse(staff.id, dateStr);
                  const holiday = isHoliday(day);
                  const publicHoliday = isPublicHoliday(day);
                  
                  return (
                    <TableCell
                      key={`${staff.id}-${dateStr}`}
                      align="center"
                      onClick={(e) => handleCellClick(staff.id, dateStr, e)}
                      sx={{
                        cursor: isReadOnly ? 'default' : 'pointer',
                        backgroundColor: publicHoliday.isHoliday ? '#ffebee' : (holiday ? '#fff3e0' : 'white'),
                        border: '1px solid #e0e0e0',
                        '&:hover': {
                          backgroundColor: isReadOnly ? 'inherit' : '#f5f5f5',
                        },
                        minHeight: isMobile ? 40 : 50,
                        width: getColumnWidth(),
                        padding: isMobile ? '2px 1px' : '4px 2px',
                        verticalAlign: 'middle',
                      }}
                    >
                      {renderEditableCell(staff.id, dateStr, shift)}
                    </TableCell>
                  );
                })}
                {/* คอลัมน์เวรรวม */}
                <TableCell sx={{ 
                  backgroundColor: '#fafafa',
                  border: '1px solid #e0e0e0',
                  width: isMobile ? '40px' : '50px',
                  fontSize: isMobile ? '0.6rem' : '0.7rem',
                  padding: isMobile ? '4px 2px' : '8px 4px',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  fontWeight: 'bold',
                }}>
                  {getTotalShiftsForStaff(staff.id)}
                </TableCell>
                {/* คอลัมน์ OT */}
                <TableCell sx={{ 
                  backgroundColor: '#fafafa',
                  border: '1px solid #e0e0e0',
                  width: isMobile ? '35px' : '45px',
                  fontSize: isMobile ? '0.6rem' : '0.7rem',
                  padding: isMobile ? '4px 2px' : '8px 4px',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  fontWeight: 'bold',
                }}>
                  {getOTShiftsForStaff(staff.id)}
                </TableCell>
                {/* คอลัมน์ค่าเวร */}
                <TableCell sx={{ 
                  backgroundColor: '#fafafa',
                  border: '1px solid #e0e0e0',
                  width: isMobile ? '40px' : '50px',
                  fontSize: isMobile ? '0.6rem' : '0.7rem',
                  padding: isMobile ? '4px 2px' : '8px 4px',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  fontWeight: 'bold',
                }}>
                  {getShiftPayForStaff(staff.id)}
                </TableCell>
                </TableRow>
              </React.Fragment>
            ))}

            {/* All Assistants Summary Row */}
            {renderSummaryRow('สรุปจำนวนผู้ช่วย', assistants, '#4caf50')}

            {/* Divider Row */}
            <TableRow>
              <TableCell 
                colSpan={days.length + 4}
                sx={{
                  height: '8px',
                  backgroundColor: '#f5f5f5',
                  borderBottom: '3px solid #4caf50',
                  padding: 0,
                }}
              />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
        </>
      )}
    </Box>
  );
};

export default ScheduleTable; 