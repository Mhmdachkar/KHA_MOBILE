import { useId } from "react";
import { Input } from "@/components/ui/input";

interface AdminBrandComboboxProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}

/** Brand field with datalist suggestions from the live catalog. */
export function AdminBrandCombobox({
  value,
  onChange,
  suggestions,
  placeholder = "e.g. Apple, Samsung…",
  className,
}: AdminBrandComboboxProps) {
  const listId = useId();

  return (
    <>
      <Input
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <datalist id={listId}>
        {suggestions.map((brand) => (
          <option key={brand} value={brand} />
        ))}
      </datalist>
    </>
  );
}
