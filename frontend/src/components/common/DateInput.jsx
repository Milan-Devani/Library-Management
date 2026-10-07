import React from 'react';
import Input from './Input';
import { FiCalendar } from 'react-icons/fi';

const DateInput = ({
  label,
  id,
  name,
  value,
  onChange,
  error,
  required = false,
  min,
  max,
  className = '',
  ...props
}) => {
  return (
    <Input
      type="date"
      label={label}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      error={error}
      required={required}
      min={min}
      max={max}
      icon={FiCalendar}
      className={className}
      {...props}
    />
  );
};

export default DateInput;
