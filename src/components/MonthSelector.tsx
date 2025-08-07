import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface MonthSelectorProps {
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  year,
  month,
  onYearChange,
  onMonthChange,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Kanit' }}>
        เลือกเดือน/ปี
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ fontFamily: 'Kanit' }}>เดือน</InputLabel>
            <Select
              value={month}
              label="เดือน"
              onChange={(e) => onMonthChange(e.target.value as number)}
              sx={{ fontFamily: 'Kanit' }}
            >
              {months.map((m) => (
                <MenuItem key={m} value={m} sx={{ fontFamily: 'Kanit' }}>
                  {format(new Date(2024, m - 1), 'MMMM', { locale: th })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ fontFamily: 'Kanit' }}>ปี</InputLabel>
            <Select
              value={year}
              label="ปี"
              onChange={(e) => onYearChange(e.target.value as number)}
              sx={{ fontFamily: 'Kanit' }}
            >
              {years.map((y) => (
                <MenuItem key={y} value={y} sx={{ fontFamily: 'Kanit' }}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="body1" sx={{ fontFamily: 'Kanit', color: 'text.secondary' }}>
            ตารางเวรประจำเดือน {format(new Date(year, month - 1), 'MMMM yyyy', { locale: th })}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MonthSelector; 