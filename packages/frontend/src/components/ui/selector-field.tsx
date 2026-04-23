import { Selector } from "antd-mobile";
import type { SelectorOption } from "antd-mobile/es/components/selector";

interface SelectorFieldProps<T extends string> {
  label: string;
  options: SelectorOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
}

export function SelectorField<T extends string>({
  label,
  options,
  value,
  onChange,
}: SelectorFieldProps<T>) {
  return (
    <div>
      <p className="mb-2 text-xs text-gray-400">{label}</p>
      <Selector
        options={options}
        value={value}
        onChange={onChange}
        style={
          {
            "--border-radius": "12px",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
