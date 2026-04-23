import { Input } from 'antd-mobile';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, children, className }: FormFieldProps) {
  return (
    <div className={cn('rounded-2xl bg-gray-50 px-3', className)}>
      <p className="pt-2.5 text-xs text-gray-400">{label}</p>
      {children}
    </div>
  );
}

interface FormInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}

export function FormInput({ label, placeholder, value, onChange, type, className }: FormInputProps) {
  return (
    <FormField label={label} className={className}>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ '--font-size': '15px' } as React.CSSProperties}
      />
    </FormField>
  );
}

interface FormDateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FormDateInput({ label, value, onChange, className }: FormDateInputProps) {
  return (
    <FormField label={label} className={className}>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent py-2.5 text-[15px] outline-none"
      />
    </FormField>
  );
}
