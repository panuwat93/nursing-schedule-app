import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  Box,
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
    <Paper sx={{ 
      p: 3, 
      mb: 3,
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      border: '1px solid rgba(102, 126, 234, 0.1)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
        }}>
          📅
        </Box>
        <Typography variant="h6" sx={{ 
          fontFamily: 'Kanit',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700
        }}>
          เลือกเดือน/ปี
        </Typography>
      </Box>
      
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ 
              fontFamily: 'Kanit',
              color: '#667eea',
              fontWeight: 500
            }}>
              📆 เดือน
            </InputLabel>
            <Select
              value={month}
              label="เดือน"
              onChange={(e) => onMonthChange(e.target.value as number)}
              sx={{ 
                fontFamily: 'Kanit',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                    borderWidth: 2,
                  },
                },
              }}
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
            <InputLabel sx={{ 
              fontFamily: 'Kanit',
              color: '#667eea',
              fontWeight: 500
            }}>
              🎯 ปี
            </InputLabel>
            <Select
              value={year}
              label="ปี"
              onChange={(e) => onYearChange(e.target.value as number)}
              sx={{ 
                fontFamily: 'Kanit',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                    borderWidth: 2,
                  },
                },
              }}
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
          <Box sx={{
            p: 2,
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 2,
            border: '1px solid rgba(102, 126, 234, 0.1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <Typography variant="h4" sx={{ 
              fontFamily: 'Kanit', 
              fontWeight: 'bold',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              mb: 2
            }}>
              {format(new Date(Number(year), Number(month) - 1, 1), 'MMMM yyyy', { locale: th })}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MonthSelector; 