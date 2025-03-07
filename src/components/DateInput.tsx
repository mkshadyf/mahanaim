import { Box, Text } from '@mantine/core';
import { DatePicker } from '@mantine/dates';

interface DateInputProps {
  label?: string;
  placeholder?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  required?: boolean;
  error?: string;
  clearable?: boolean;
  maxDate?: Date;
  minDate?: Date;
}

export function DateInput({
  label,
  placeholder,
  value,
  onChange,
  required,
  error,
  clearable = true,
  maxDate,
  minDate,
  ...props
}: DateInputProps) {
  return (
    <Box>
      {label && (
        <Text size="sm" weight={500} mb={4}>
          {label}{required && <span style={{ color: 'red' }}>*</span>}
        </Text>
      )}
      <DatePicker
        value={value}
        onChange={onChange}
        clearable={clearable}
        maxDate={maxDate}
        minDate={minDate}
        inputProps={{ placeholder }}
        {...props as any}
      />
      {error && (
        <Text color="red" size="xs" mt={4}>
          {error}
        </Text>
      )}
    </Box>
  );
} 