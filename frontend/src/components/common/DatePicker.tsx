import React, { useState, useRef, useEffect } from 'react';
import './DatePicker.css';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date and time",
  disabled = false,
  className = "",
  id,
  name
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDisplayValue = (date: Date) => {
    if (!date || isNaN(date.getTime())) return '';
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', options);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    // Set time to end of day (23:59) for due date
    const newDateTime = new Date(date);
    newDateTime.setHours(23, 59, 0, 0);
    // Send in datetime-local format (YYYY-MM-DDTHH:MM)
    onChange(newDateTime.toISOString().slice(0, 16));
  };

  const handleClear = () => {
    setSelectedDate(new Date());
    onChange('');
    setIsOpen(false);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      const isSelected = selectedDate.getDate() === day && 
                        selectedDate.getMonth() === month && 
                        selectedDate.getFullYear() === year;
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateChange(new Date(year, month, day))}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`date-picker ${className}`} ref={dropdownRef}>
      <div
        className={`date-picker-input ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <input
          type="hidden"
          id={id}
          name={name}
          value={value}
          readOnly
        />
        <span className="date-picker-value">
          {value ? formatDisplayValue(new Date(value)) : placeholder}
        </span>
        <span className="date-picker-icon">📅</span>
      </div>
      
      {isOpen && (
        <div className="date-picker-dropdown">
          <div className="date-picker-header">
            <button
              type="button"
              className="date-picker-nav"
              onClick={() => navigateMonth('prev')}
            >
              ‹
            </button>
            <span className="date-picker-month-year">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </span>
            <button
              type="button"
              className="date-picker-nav"
              onClick={() => navigateMonth('next')}
            >
              ›
            </button>
          </div>
          
          <div className="date-picker-calendar">
            <div className="calendar-header">
              {dayNames.map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}
            </div>
            <div className="calendar-days">
              {generateCalendarDays()}
            </div>
          </div>
          
          
          <div className="date-picker-actions">
            <button
              type="button"
              className="date-picker-clear"
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="button"
              className="date-picker-apply"
              onClick={() => setIsOpen(false)}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
