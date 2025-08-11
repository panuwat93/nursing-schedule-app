import React, { useState } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Checkbox,
  Chip,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Fade,
  Grow,
  Zoom,
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { WorkAssignment, ScheduleEntry } from '../types';
import { allStaff } from '../data/nurses';

// ข้อมูลอ้างอิง
const SHIFTS = [
  { id: 'morning', name: 'เช้า' },
  { id: 'afternoon', name: 'บ่าย' },
  { id: 'night', name: 'ดึก' }
];

const BED_AREAS = [
  'B1-B3',
  'B4-Y2', 
  'B5-B7',
  'Y3-Y4',
  'B1-B2',
  'B3-B4',
  'Y1-Y2'
];

const DUTIES = [
  'Productivity',
  'ลงทะเบียน / จองเตียง',
  'Pipe line',
  'Check Delfib',
  'ยา Stock',
  'รถ Emergency'
];

const ERT_ROLES = [
  'หัวหน้าแผน',
  'เคลื่อนย้ายกู้ชีพ',
  'เช็คชีวิตติดต่อ',
  'ดับเพลิง',
  'ช่างและเส้นทาง'
];

const TEAMS = [
  'ทีม A',
  'ทีม B'
];

interface WorkAssignmentTableProps {
  year: number;
  month: number;
  assignments: WorkAssignment[];
  onAssignmentChange: (assignments: WorkAssignment[]) => void;
  schedule: ScheduleEntry[]; // เพิ่มตารางเวรเพื่อกรองเจ้าหน้าที่
  isReadOnly?: boolean;
  currentStaffId?: string;
}

const WorkAssignmentTable: React.FC<WorkAssignmentTableProps> = ({
  year,
  month,
  assignments,
  onAssignmentChange,
  schedule,
  isReadOnly = false,
  currentStaffId = '',
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState<WorkAssignment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Partial<WorkAssignment>>({});
  const [shiftAssignments, setShiftAssignments] = useState<{ [staffId: string]: Partial<WorkAssignment> }>({});
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLandscape = useMediaQuery('(orientation: landscape)');
  
  // Date selection state
  const [selectedYear, setSelectedYear] = useState(year.toString());
  const [selectedMonth, setSelectedMonth] = useState(month.toString());
  const [selectedDay, setSelectedDay] = useState('1');
  


  // Get current date for default selection
  const currentDate = new Date();
  const defaultYear = currentDate.getFullYear();
  const defaultDay = currentDate.getDate();

  // Initialize with current date if not provided
  React.useEffect(() => {
    if (year && month) {
      setSelectedYear(year.toString());
      setSelectedMonth(month.toString());
      setSelectedDay(defaultDay.toString());
    }
  }, [year, month, defaultDay]);

  // Get selected date string
  const getSelectedDateString = () => {
    const monthStr = selectedMonth.padStart(2, '0');
    const dayStr = selectedDay.padStart(2, '0');
    return `${selectedYear}-${monthStr}-${dayStr}`;
  };

  // Get assignments for selected date
  const getAssignmentsForSelectedDate = () => {
    const selectedDate = getSelectedDateString();
    return assignments.filter(a => a.date === selectedDate);
  };

  // Get days in selected month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getAssignmentsForStaff = (staffId: string, date: string) => {
    return assignments.filter(a => a.nurseId === staffId && a.date === date);
  };

  const getDayName = (date: Date) => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    return days[date.getDay()];
  };

  const handleAddAssignment = () => {
    setSelectedAssignment(null);
    setEditingAssignment({ date: getSelectedDateString() });
    setIsDialogOpen(true);
  };

  const handleEditAssignment = (assignment: WorkAssignment) => {
    setSelectedAssignment(assignment);
    setEditingAssignment(assignment);
    setIsDialogOpen(true);
  };

  const handleSaveAssignment = () => {
    if (!editingAssignment.date || !editingAssignment.shift) {
      return;
    }

    let newAssignments = [...assignments];
    
    // ลบข้อมูลเก่าของเวรและวันที่นี้ก่อน
    newAssignments = newAssignments.filter(a => 
      !(a.date === editingAssignment.date && a.shift === editingAssignment.shift)
    );

    // เพิ่มข้อมูลใหม่สำหรับทุกคนในเวร
    Object.values(shiftAssignments).forEach(staffAssignment => {
      if (staffAssignment.nurseId) {
        const newAssignment: WorkAssignment = {
          id: Date.now().toString() + Math.random().toString(),
          date: staffAssignment.date!,
          shift: staffAssignment.shift!,
          nurseId: staffAssignment.nurseId!,
          bedArea: staffAssignment.bedArea,
          duties: staffAssignment.duties,
          drugSupervision: staffAssignment.drugSupervision,
          ert: staffAssignment.ert,
          team: staffAssignment.team,
          assignment: '', // เซ็ตเป็นค่าว่าง
          notes: '',
        };
        newAssignments.push(newAssignment);
      }
    });

    onAssignmentChange(newAssignments);
    handleCloseDialog();
  };

  const handleDeleteAssignment = (id: string) => {
    const newAssignments = assignments.filter(a => a.id !== id);
    onAssignmentChange(newAssignments);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAssignment(null);
    setEditingAssignment({});
    setShiftAssignments({});
  };

  const getNurseName = (nurseId: string) => {
    return allStaff.find(n => n.id === nurseId)?.name || '';
  };

  // กรองเจ้าหน้าที่ตามเวรและวันที่ที่เลือก (ใช้ตรรกะเดียวกับตารางเวร)
  const getStaffByShift = (shift: string, date: string) => {
    if (!shift || !date) return [];

    const staffInShift: typeof allStaff = [];

    allStaff.forEach(staff => {
      let shouldInclude = false;

      // ตรวจสอบเวรเช้า
      const morningShift = schedule.find(e => e.nurseId === staff.id && e.date === date && e.shiftType === 'morning');
      if (morningShift) {
        const shiftId = morningShift.shiftId;
        if (shift === 'morning') {
          // สำหรับเวรเช้า ไม่นับประนอม (n1) และศิรินทรา (n2) เมื่อขึ้นเวรเช้าปกติ
          if (shiftId === 'morning' && (staff.id === 'n1' || staff.id === 'n2')) {
            shouldInclude = false;
          } else if (['morning', 'morning_special', 'morning_afternoon'].includes(shiftId)) {
            shouldInclude = true;
          }
        } else if (shift === 'afternoon' && ['afternoon', 'morning_afternoon', 'night_afternoon'].includes(shiftId)) {
          shouldInclude = true;
        } else if (shift === 'night' && ['night', 'night_afternoon'].includes(shiftId)) {
          shouldInclude = true;
        }
      }

      // ตรวจสอบเวรบ่าย
      const afternoonShift = schedule.find(e => e.nurseId === staff.id && e.date === date && e.shiftType === 'afternoon');
      if (afternoonShift) {
        const shiftId = afternoonShift.shiftId;
        if (shift === 'morning') {
          // สำหรับเวรเช้า ไม่นับประนอม (n1) และศิรินทรา (n2) เมื่อขึ้นเวรเช้าปกติ
          if (shiftId === 'morning' && (staff.id === 'n1' || staff.id === 'n2')) {
            shouldInclude = false;
          } else if (['morning', 'morning_special', 'morning_afternoon'].includes(shiftId)) {
            shouldInclude = true;
          }
        } else if (shift === 'afternoon' && ['afternoon', 'morning_afternoon', 'night_afternoon'].includes(shiftId)) {
          shouldInclude = true;
        } else if (shift === 'night' && ['night', 'night_afternoon'].includes(shiftId)) {
          shouldInclude = true;
        }
      }

      // สำหรับผู้ช่วยพาร์ทไทม์ (ไม่มี shiftType)
      if (staff.isPartTime) {
        const partTimeShift = schedule.find(e => e.nurseId === staff.id && e.date === date && !e.shiftType);
        if (partTimeShift) {
          const shiftId = partTimeShift.shiftId;
          if (shift === 'morning') {
            // สำหรับเวรเช้า ไม่นับประนอม (n1) และศิรินทรา (n2) เมื่อขึ้นเวรเช้าปกติ
            if (shiftId === 'morning' && (staff.id === 'n1' || staff.id === 'n2')) {
              shouldInclude = false;
            } else if (['morning', 'morning_special', 'morning_afternoon'].includes(shiftId)) {
              shouldInclude = true;
            }
          } else if (shift === 'afternoon' && ['afternoon', 'morning_afternoon', 'night_afternoon'].includes(shiftId)) {
            shouldInclude = true;
          } else if (shift === 'night' && ['night', 'night_afternoon'].includes(shiftId)) {
            shouldInclude = true;
          }
        }
      }

      if (shouldInclude) {
        staffInShift.push(staff);
      }
    });

    return staffInShift;
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'd MMMM yyyy', { locale: th });
  };

  // เริ่มต้นข้อมูลสำหรับทุกคนในเวร
  const initializeShiftAssignments = (shift: string, date: string) => {
    const staffInShift = getStaffByShift(shift, date);
    const initialAssignments: { [staffId: string]: Partial<WorkAssignment> } = {};
    
    staffInShift.forEach(staff => {
      // ตรวจสอบว่ามีข้อมูลเดิมอยู่แล้วหรือไม่
      const existingAssignment = assignments.find(a => 
        a.nurseId === staff.id && a.date === date && a.shift === shift
      );
      
      initialAssignments[staff.id] = existingAssignment || {
        date,
        shift,
        nurseId: staff.id,
        bedArea: '',
        duties: [],
        drugSupervision: false,
        ert: '',
        team: '',
        assignment: '',
        notes: ''
      };
    });
    
    setShiftAssignments(initialAssignments);
  };

  // ดึงข้อมูลมอบหมายของเจ้าหน้าที่
  const getStaffAssignment = (staffId: string, field: keyof WorkAssignment) => {
    const assignment = shiftAssignments[staffId];
    if (!assignment) return field === 'duties' ? [] : field === 'drugSupervision' ? false : '';
    
    const value = assignment[field];
    if (field === 'duties') return value || [];
    if (field === 'drugSupervision') return Boolean(value);
    return value || '';
  };

  // อัปเดตข้อมูลมอบหมายของเจ้าหน้าที่
  const updateStaffAssignment = (staffId: string, field: string, value: any) => {
    setShiftAssignments(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [field]: value
      }
    }));
  };

  const selectedDateAssignments = getAssignmentsForSelectedDate();
  const daysInMonth = getDaysInMonth(Number(selectedYear), Number(selectedMonth));

  // สำหรับ Mobile: แสดงแบบ Card แทน Table
  const renderMobileAssignmentCards = () => {
    if (selectedDateAssignments.length === 0) {
      return (
        <Card sx={{ mt: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" sx={{ fontFamily: 'Kanit', color: '#666' }}>
              ไม่มีงานที่มอบหมายในวันที่ {formatDate(getSelectedDateString())}
            </Typography>
          </CardContent>
        </Card>
      );
    }

    // จัดกลุ่มตามเวร
    const assignmentsByShift = selectedDateAssignments.reduce((acc, assignment) => {
      const shiftName = SHIFTS.find(s => s.id === assignment.shift)?.name || assignment.shift || 'ไม่ระบุเวร';
      if (!acc[shiftName]) {
        acc[shiftName] = [];
      }
      acc[shiftName].push(assignment);
      return acc;
    }, {} as { [key: string]: WorkAssignment[] });

    // สำหรับ Mobile Landscape: แสดงแบบ Grid 2 คอลัมน์
    if (isMobile && isLandscape) {
      return (
        <Box sx={{ mt: 2 }}>
          {Object.entries(assignmentsByShift).map(([shiftName, shiftAssignments]) => (
            <Accordion key={shiftName} defaultExpanded sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>
                  เวร{shiftName} ({shiftAssignments.length} คน)
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 1 }}>
                <Grid container spacing={1}>
                  {shiftAssignments.map((assignment) => {
                    const staff = allStaff.find(s => s.id === assignment.nurseId);
                    
                    return (
                      <Grid item xs={6} key={assignment.id}>
                        <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
                          <CardContent sx={{ p: 1.5 }}>
                            {/* ชื่อเจ้าหน้าที่ - แบบกะทัดรัด */}
                            <Typography variant="subtitle2" sx={{ fontFamily: 'Kanit', fontWeight: 'bold', mb: 1, fontSize: '0.85rem' }}>
                              {getNurseName(assignment.nurseId)}
                              <Chip 
                                label={staff?.type === 'nurse' ? 'พยาบาล' : 'ผู้ช่วย'} 
                                size="small" 
                                sx={{ ml: 1, fontSize: '0.6rem', height: '16px' }}
                              />
                            </Typography>

                            {/* รายละเอียดงาน - แบบกะทัดรัด */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {/* เตียงที่ดูแล */}
                              {assignment.bedArea && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: '0.7rem' }}>
                                    เตียง:
                                  </Typography>
                                  <Chip 
                                    label={assignment.bedArea} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.6rem', height: '18px' }}
                                  />
                                </Box>
                              )}

                              {/* หน้าที่ */}
                              {assignment.duties && assignment.duties.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
                                  {assignment.duties.map((duty, index) => (
                                    <Chip 
                                      key={index}
                                      label={duty} 
                                      size="small" 
                                      color="secondary" 
                                      variant="outlined"
                                      sx={{ fontSize: '0.5rem', height: '16px' }}
                                    />
                                  ))}
                                </Box>
                              )}

                              {/* ERT & ยาเสพติด & ทีม - ในบรรทัดเดียว */}
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
                                {assignment.ert && (
                                  <Chip 
                                    label={`ERT: ${assignment.ert}`} 
                                    size="small" 
                                    color="success" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.5rem', height: '16px' }}
                                  />
                                )}
                                {assignment.drugSupervision && (
                                  <Chip 
                                    label="ยาเสพติด" 
                                    size="small" 
                                    color="warning"
                                    sx={{ fontSize: '0.5rem', height: '16px' }}
                                  />
                                )}
                                {assignment.team && (
                                  <Chip 
                                    label={assignment.team} 
                                    size="small" 
                                    color="info" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.5rem', height: '16px' }}
                                  />
                                )}
                              </Box>
                            </Box>

                            {/* ปุ่มจัดการ - แบบกะทัดรัด */}
                            {!isReadOnly && (
                              <Box sx={{ display: 'flex', gap: 0.5, mt: 1, justifyContent: 'flex-end' }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleEditAssignment(assignment)}
                                  sx={{ fontFamily: 'Kanit', fontSize: '0.7rem', minWidth: '50px', py: 0.3 }}
                                >
                                  แก้ไข
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                  sx={{ fontFamily: 'Kanit', fontSize: '0.7rem', minWidth: '40px', py: 0.3 }}
                                >
                                  ลบ
                                </Button>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      );
    }

    // สำหรับ Mobile Portrait: แสดงแบบเดิม
    return (
      <Box sx={{ mt: 2 }}>
        {Object.entries(assignmentsByShift).map(([shiftName, shiftAssignments]) => (
          <Accordion key={shiftName} defaultExpanded sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>
                เวร{shiftName} ({shiftAssignments.length} คน)
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1 }}>
              {shiftAssignments.map((assignment) => {
                const staff = allStaff.find(s => s.id === assignment.nurseId);
                
                return (
                  <Card key={assignment.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                    <CardContent sx={{ p: 2 }}>
                      {/* ชื่อเจ้าหน้าที่ */}
                      <Typography variant="subtitle1" sx={{ fontFamily: 'Kanit', fontWeight: 'bold', mb: 1 }}>
                        {getNurseName(assignment.nurseId)} 
                        <Chip 
                          label={staff?.type === 'nurse' ? 'พยาบาล' : 'ผู้ช่วย'} 
                          size="small" 
                          sx={{ ml: 1, fontSize: '0.7rem' }}
                        />
                      </Typography>

                      {/* รายละเอียดงาน */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* เตียงที่ดูแล */}
                        {assignment.bedArea && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Kanit', fontWeight: 'bold', minWidth: '60px' }}>
                              เตียง:
                            </Typography>
                            <Chip 
                              label={assignment.bedArea} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          </Box>
                        )}

                        {/* หน้าที่ */}
                        {assignment.duties && assignment.duties.length > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Kanit', fontWeight: 'bold', minWidth: '60px', mt: 0.5 }}>
                              หน้าที่:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {assignment.duties.map((duty, index) => (
                                <Chip 
                                  key={index}
                                  label={duty} 
                                  size="small" 
                                  color="secondary" 
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* ERT */}
                        {assignment.ert && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Kanit', fontWeight: 'bold', minWidth: '60px' }}>
                              ERT:
                            </Typography>
                            <Chip 
                              label={assignment.ert} 
                              size="small" 
                              color="success" 
                              variant="outlined"
                            />
                          </Box>
                        )}

                        {/* ดูแลยาเสพติด */}
                        {assignment.drugSupervision && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label="ดูแลยาเสพติด" 
                              size="small" 
                              color="warning"
                            />
                          </Box>
                        )}

                        {/* ทีม */}
                        {assignment.team && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Kanit', fontWeight: 'bold', minWidth: '60px' }}>
                              ทีม:
                            </Typography>
                            <Chip 
                              label={assignment.team} 
                              size="small" 
                              color="info" 
                              variant="outlined"
                            />
                          </Box>
                        )}
                      </Box>

                      {/* ปุ่มจัดการ */}
                      {!isReadOnly && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEditAssignment(assignment)}
                            sx={{ fontFamily: 'Kanit' }}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            sx={{ fontFamily: 'Kanit' }}
                          >
                            ลบ
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>

      {/* ส่วนเลือกวันที่ - สวยแบบตะโกน */}
      <Fade in timeout={800}>
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          boxShadow: '0 15px 35px rgba(102, 126, 234, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CalendarIcon sx={{ 
              fontSize: 32, 
              color: 'white',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }} />
            <Typography variant="h5" sx={{ 
              fontFamily: 'Kanit', 
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              เลือกวันที่
            </Typography>
          </Box>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ 
                  fontFamily: 'Kanit', 
                  color: 'white',
                  fontWeight: 'bold',
                  '&.Mui-focused': { color: 'white' }
                }}>
                  วัน
                </InputLabel>
                <Select
                  value={selectedDay}
                  label="วัน"
                  onChange={(e: SelectChangeEvent) => {
                    const newDay = e.target.value;
                    setSelectedDay(newDay);
                  }}
                  sx={{ 
                    fontFamily: 'Kanit',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '15px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                      }
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {Array.from({ length: getDaysInMonth(Number(selectedYear), Number(selectedMonth)) }, (_, i) => i + 1).map((day) => (
                    <MenuItem key={day} value={day.toString()} sx={{ fontFamily: 'Kanit' }}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ 
                  fontFamily: 'Kanit', 
                  color: 'white',
                  fontWeight: 'bold',
                  '&.Mui-focused': { color: 'white' }
                }}>
                  เดือน
                </InputLabel>
                <Select
                  value={selectedMonth}
                  label="เดือน"
                  onChange={(e: SelectChangeEvent) => {
                    const newMonth = Number(e.target.value);
                    setSelectedMonth(newMonth.toString());
                    // Reset day if it exceeds days in new month
                    const newDaysInMonth = getDaysInMonth(Number(selectedYear), newMonth);
                    if (Number(selectedDay) > newDaysInMonth) {
                      setSelectedDay(newDaysInMonth.toString());
                    }
                  }}
                  sx={{ 
                    fontFamily: 'Kanit',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '15px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                      }
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <MenuItem key={month} value={month.toString()} sx={{ fontFamily: 'Kanit' }}>
                      {format(new Date(Number(selectedYear), month - 1, 1), 'MMMM', { locale: th })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ 
                  fontFamily: 'Kanit', 
                  color: 'white',
                  fontWeight: 'bold',
                  '&.Mui-focused': { color: 'white' }
                }}>
                  ปี
                </InputLabel>
                <Select
                  value={selectedYear}
                  label="ปี"
                  onChange={(e: SelectChangeEvent) => {
                    const newYear = Number(e.target.value);
                    setSelectedYear(newYear.toString());
                    // Reset day if it exceeds days in new year/month
                    const newDaysInMonth = getDaysInMonth(newYear, Number(selectedMonth));
                    if (Number(selectedDay) > newDaysInMonth) {
                      setSelectedDay(newDaysInMonth.toString());
                    }
                  }}
                  sx={{ 
                    fontFamily: 'Kanit',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '15px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                      }
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {Array.from({ length: 10 }, (_, i) => defaultYear - 2 + i).map((year) => (
                    <MenuItem key={year} value={year.toString()} sx={{ fontFamily: 'Kanit' }}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '15px',
                p: 2,
                textAlign: 'center',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'Kanit', 
                  fontWeight: 'bold', 
                  color: '#667eea',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {formatDate(getSelectedDateString())}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Fade>



      {/* ปุ่มเพิ่มมอบหมายงาน - สวยแบบตะโกน */}
      {!isReadOnly && (
        <Zoom in timeout={1200}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAssignment}
              sx={{ 
                fontFamily: 'Kanit',
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '15px 30px',
                borderRadius: '25px',
                background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                color: 'white',
                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #43a047, #4caf50)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 35px rgba(76, 175, 80, 0.4)'
                }
              }}
            >
              เพิ่มมอบหมายงาน
            </Button>
          </Box>
        </Zoom>
      )}

            {/* แสดงตารางมอบหมายงาน - สวยแบบตะโกน */}
      {isMobile ? (
        // Mobile View: Card Layout - สวยแบบตะโกน
        renderMobileAssignmentCards()
      ) : (
        // Desktop View: Table Layout - สวยแบบตะโกน
        <Fade in timeout={1400}>
          <TableContainer component={Paper} sx={{
            borderRadius: '20px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
            border: '2px solid rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                  <TableCell sx={{ 
                    fontFamily: 'Kanit', 
                    fontWeight: 'bold',
                    color: 'white',
                    fontSize: '16px',
                    borderBottom: 'none'
                  }}>
                    เวร
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Kanit', 
                    fontWeight: 'bold',
                    color: 'white',
                    fontSize: '16px',
                    borderBottom: 'none'
                  }}>
                    เจ้าหน้าที่
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Kanit', 
                    fontWeight: 'bold',
                    color: 'white',
                    fontSize: '16px',
                    borderBottom: 'none'
                  }}>
                    รายละเอียด
                  </TableCell>
                  {!isReadOnly && (
                    <TableCell sx={{ 
                      fontFamily: 'Kanit', 
                      fontWeight: 'bold',
                      color: 'white',
                      fontSize: '16px',
                      borderBottom: 'none'
                    }}>
                      การจัดการ
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedDateAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isReadOnly ? 3 : 4} align="center" sx={{ 
                      fontFamily: 'Kanit',
                      fontSize: '18px',
                      color: '#666',
                      py: 4
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: 2 
                      }}>
                        <AssignmentIcon sx={{ 
                          fontSize: 48, 
                          color: '#ccc',
                          animation: 'float 3s ease-in-out infinite'
                        }} />
                        ไม่มีงานที่มอบหมายในวันที่ {formatDate(getSelectedDateString())}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedDateAssignments.map((assignment, index) => {
                    const staff = allStaff.find(s => s.id === assignment.nurseId);
                    const shiftName = SHIFTS.find(s => s.id === assignment.shift)?.name || '';
                    
                    return (
                      <Grow in timeout={500 + index * 100} key={assignment.id}>
                        <TableRow sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                            transform: 'scale(1.01)',
                            transition: 'all 0.3s ease'
                          }
                        }}>
                          <TableCell sx={{ 
                            fontFamily: 'Kanit',
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }}>
                            <Chip 
                              label={shiftName} 
                              sx={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                padding: '8px 16px'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ 
                            fontFamily: 'Kanit',
                            fontSize: '16px'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon sx={{ color: '#667eea' }} />
                              {getNurseName(assignment.nurseId)} 
                              <Chip 
                                label={staff?.type === 'nurse' ? 'พยาบาล' : 'ผู้ช่วย'} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  borderColor: staff?.type === 'nurse' ? '#4caf50' : '#ff9800',
                                  color: staff?.type === 'nurse' ? '#4caf50' : '#ff9800',
                                  fontWeight: 'bold'
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Kanit' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {/* เตียงที่ดูแล */}
                              {assignment.bedArea && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{ 
                                    fontFamily: 'Kanit',
                                    fontWeight: 'bold',
                                    color: '#667eea'
                                  }}>
                                    เตียง:
                                  </Typography>
                                  <Chip 
                                    label={assignment.bedArea} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ 
                                      borderColor: '#667eea',
                                      color: '#667eea',
                                      fontWeight: 'bold'
                                    }}
                                  />
                                </Box>
                              )}
                              {/* หน้าที่ */}
                              {assignment.duties && assignment.duties.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {assignment.duties.map((duty) => (
                                    <Chip 
                                      key={duty} 
                                      label={duty} 
                                      size="small" 
                                      variant="outlined"
                                      sx={{ 
                                        borderColor: '#4caf50',
                                        color: '#4caf50',
                                        fontWeight: 'bold'
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                              {/* ดูแลยาเสพติด */}
                              {assignment.drugSupervision && (
                                <Chip 
                                  label="ดูแลยาเสพติด" 
                                  size="small" 
                                  color="warning"
                                  sx={{ fontWeight: 'bold' }}
                                />
                              )}
                              {/* ERT */}
                              {assignment.ert && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{ 
                                    fontFamily: 'Kanit',
                                    fontWeight: 'bold',
                                    color: '#ff9800'
                                  }}>
                                    ERT:
                                  </Typography>
                                  <Chip 
                                    label={assignment.ert} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ 
                                      borderColor: '#ff9800',
                                      color: '#ff9800',
                                      fontWeight: 'bold'
                                    }}
                                  />
                                </Box>
                              )}
                              {/* ทีม */}
                              {assignment.team && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{ 
                                    fontFamily: 'Kanit',
                                    fontWeight: 'bold',
                                    color: '#9c27b0'
                                  }}>
                                    ทีม:
                                  </Typography>
                                  <Chip 
                                    label={assignment.team} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ 
                                      borderColor: '#9c27b0',
                                      color: '#9c27b0',
                                      fontWeight: 'bold'
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                          {!isReadOnly && (
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<EditIcon />}
                                  onClick={() => handleEditAssignment(assignment)}
                                  sx={{ 
                                    fontFamily: 'Kanit',
                                    fontWeight: 'bold',
                                    borderColor: '#2196f3',
                                    color: '#2196f3',
                                    '&:hover': {
                                      backgroundColor: '#2196f3',
                                      color: 'white',
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  แก้ไข
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<DeleteIcon />}
                                  color="error"
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                  sx={{ 
                                    fontFamily: 'Kanit',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  ลบ
                                </Button>
                              </Box>
                            </TableCell>
                          )}
                        </TableRow>
                      </Grow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Fade>
      )}

      {/* Dialog for adding/editing assignment - สวยแบบตะโกน */}
      <Dialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: '2px solid rgba(102, 126, 234, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Kanit',
          fontWeight: 'bold',
          fontSize: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          {selectedAssignment ? 'แก้ไขงานที่มอบหมาย' : 'เพิ่มงานที่มอบหมาย'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* 1. วันที่ */}
            <TextField
              fullWidth
              label="วันที่"
              type="date"
              value={editingAssignment.date || getSelectedDateString()}
              onChange={(e) => setEditingAssignment({ ...editingAssignment, date: e.target.value })}
              InputLabelProps={{ sx: { fontFamily: 'Kanit', fontWeight: 'bold' } }}
              sx={{ 
                fontFamily: 'Kanit',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                  }
                },
                transition: 'all 0.3s ease'
              }}
            />
            
            {/* 2. เวร */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>เวร</InputLabel>
              <Select
                value={editingAssignment.shift || ''}
                label="เวร"
                onChange={(e: SelectChangeEvent) => {
                  const selectedShift = e.target.value;
                  setEditingAssignment({ 
                    ...editingAssignment, 
                    shift: selectedShift,
                    nurseId: '' 
                  });
                  // เริ่มต้นข้อมูลสำหรับทุกคนในเวร
                  initializeShiftAssignments(selectedShift, editingAssignment.date || getSelectedDateString());
                }}
                sx={{ 
                  fontFamily: 'Kanit',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '15px',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                    }
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {SHIFTS.map((shift) => (
                  <MenuItem key={shift.id} value={shift.id} sx={{ fontFamily: 'Kanit' }}>
                    {shift.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 3. ตารางมอบหมายงานสำหรับทุกคนในเวร */}
            {editingAssignment.shift && editingAssignment.date && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'Kanit', 
                  mb: 2,
                  fontWeight: 'bold',
                  color: '#667eea'
                }}>
                  มอบหมายงานสำหรับเวร{SHIFTS.find(s => s.id === editingAssignment.shift)?.name}
                </Typography>
                
                <TableContainer component={Paper} sx={{ 
                  maxHeight: 400,
                  borderRadius: '15px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  border: '2px solid rgba(0,0,0,0.05)'
                }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}>
                        <TableCell sx={{ 
                          fontFamily: 'Kanit', 
                          fontWeight: 'bold',
                          color: 'white',
                          borderBottom: 'none'
                        }}>
                          ชื่อเจ้าหน้าที่
                        </TableCell>
                        <TableCell sx={{ 
                          fontFamily: 'Kanit', 
                          fontWeight: 'bold',
                          color: 'white',
                          borderBottom: 'none'
                        }}>
                          เตียง
                        </TableCell>
                        <TableCell sx={{ 
                          fontFamily: 'Kanit', 
                          fontWeight: 'bold',
                          color: 'white',
                          borderBottom: 'none'
                        }}>
                          หน้าที่
                        </TableCell>
                        <TableCell sx={{ 
                          fontFamily: 'Kanit', 
                          fontWeight: 'bold',
                          color: 'white',
                          borderBottom: 'none'
                        }}>
                          ERT
                        </TableCell>
                        <TableCell sx={{ 
                          fontFamily: 'Kanit', 
                          fontWeight: 'bold',
                          color: 'white',
                          borderBottom: 'none'
                        }}>
                          ยาเสพติด
                        </TableCell>
                        <TableCell sx={{ 
                          fontFamily: 'Kanit', 
                          fontWeight: 'bold',
                          color: 'white',
                          borderBottom: 'none'
                        }}>
                          ทีม
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getStaffByShift(editingAssignment.shift || '', editingAssignment.date || '').map((staff) => (
                        <TableRow key={staff.id} sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.05)'
                          }
                        }}>
                          <TableCell sx={{ fontFamily: 'Kanit' }}>
                            {staff.name} ({staff.type === 'nurse' ? 'พยาบาล' : 'ผู้ช่วย'})
                          </TableCell>
                          
                          {/* เตียง (เฉพาะพยาบาล) */}
                          <TableCell>
                            {staff.type === 'nurse' ? (
                              <Select
                                size="small"
                                value={getStaffAssignment(staff.id, 'bedArea')}
                                onChange={(e) => updateStaffAssignment(staff.id, 'bedArea', e.target.value)}
                                sx={{ 
                                  fontFamily: 'Kanit', 
                                  minWidth: 100,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px'
                                  }
                                }}
                              >
                                <MenuItem value="">-</MenuItem>
                                {BED_AREAS.map((area) => (
                                  <MenuItem key={area} value={area} sx={{ fontFamily: 'Kanit' }}>
                                    {area}
                                  </MenuItem>
                                ))}
                              </Select>
                            ) : '-'}
                          </TableCell>
                          
                          {/* หน้าที่ (เฉพาะพยาบาล) */}
                          <TableCell>
                            {staff.type === 'nurse' ? (
                              <Select
                                multiple
                                size="small"
                                value={getStaffAssignment(staff.id, 'duties') as string[]}
                                onChange={(e) => {
                                  const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                                  updateStaffAssignment(staff.id, 'duties', value);
                                }}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
                                    {(selected as string[]).map((value: string) => (
                                      <Chip key={value} label={value} size="small" />
                                    ))}
                                  </Box>
                                )}
                                sx={{ 
                                  fontFamily: 'Kanit', 
                                  minWidth: 150,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px'
                                  }
                                }}
                              >
                                {DUTIES.map((duty) => (
                                  <MenuItem key={duty} value={duty} sx={{ fontFamily: 'Kanit' }}>
                                    <Checkbox 
                                      checked={(getStaffAssignment(staff.id, 'duties') as string[]).indexOf(duty) > -1}
                                      sx={{ mr: 1 }}
                                    />
                                    <ListItemText primary={duty} />
                                  </MenuItem>
                                ))}
                              </Select>
                            ) : '-'}
                          </TableCell>
                          
                          {/* ERT (ทุกคน) */}
                          <TableCell>
                            <Select
                              size="small"
                              value={getStaffAssignment(staff.id, 'ert')}
                              onChange={(e) => updateStaffAssignment(staff.id, 'ert', e.target.value)}
                              sx={{ 
                                fontFamily: 'Kanit', 
                                minWidth: 120,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '10px'
                                }
                              }}
                            >
                              <MenuItem value="">-</MenuItem>
                              {ERT_ROLES.map((role) => (
                                <MenuItem key={role} value={role} sx={{ fontFamily: 'Kanit' }}>
                                  {role}
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          
                          {/* ดูแลยาเสพติด (เฉพาะพยาบาล) */}
                          <TableCell>
                            {staff.type === 'nurse' ? (
                              <Checkbox
                                checked={getStaffAssignment(staff.id, 'drugSupervision') as boolean}
                                onChange={(e) => updateStaffAssignment(staff.id, 'drugSupervision', e.target.checked)}
                                sx={{
                                  '&.Mui-checked': {
                                    color: '#ff9800'
                                  }
                                }}
                              />
                            ) : '-'}
                          </TableCell>
                          
                          {/* ทีม (เฉพาะผู้ช่วย) */}
                          <TableCell>
                            {staff.type === 'assistant' ? (
                              <Select
                                size="small"
                                value={getStaffAssignment(staff.id, 'team')}
                                onChange={(e) => updateStaffAssignment(staff.id, 'team', e.target.value)}
                                sx={{ 
                                  fontFamily: 'Kanit', 
                                  minWidth: 80,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px'
                                  }
                                }}
                              >
                                <MenuItem value="">-</MenuItem>
                                {TEAMS.map((team) => (
                                  <MenuItem key={team} value={team} sx={{ fontFamily: 'Kanit' }}>
                                    {team}
                                  </MenuItem>
                                ))}
                              </Select>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ 
              fontFamily: 'Kanit',
              fontWeight: 'bold',
              borderRadius: '15px',
              px: 3,
              py: 1.5,
              border: '2px solid #9e9e9e',
              color: '#616161',
              '&:hover': {
                border: '2px solid #757575',
                backgroundColor: 'rgba(158, 158, 158, 0.04)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={handleSaveAssignment} 
            variant="contained" 
            disabled={!editingAssignment.date || !editingAssignment.shift}
            startIcon={<SaveIcon />}
            sx={{ 
              fontFamily: 'Kanit',
              fontWeight: 'bold',
              borderRadius: '15px',
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #43a047, #4caf50)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
              },
              transition: 'all 0.3s ease',
              '&:disabled': {
                background: '#ccc',
                transform: 'none',
                boxShadow: 'none'
              }
            }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkAssignmentTable; 