import React from "react";

const Checkbox: React.FC<{
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => {
  return (
    <label className="inline-flex items-center">
      <input
        type="checkbox"
        className="form-checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label && <span className="ml-2">{label}</span>}
    </label>
  );
};

export default Checkbox;
