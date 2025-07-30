import Select from "react-select";

export default function Select2Field({
    name,
    label,
    placeholder,
    options = [],
    value,
    onChange,
    isMulti = false,
}) {
    // Use value directly — it's already full objects
    const selectedValue = value || (isMulti ? [] : null);

    const handleChange = (selected) => {
        // Pass full selected object(s)
        onChange(selected);
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: "45px",
            border: state.isFocused ? "1px solid #9ca3af" : "1px solid #d1d5db",
            boxShadow: state.isFocused ? "0 0 0 1px #9ca3af" : "none",
            "&:hover": {
                borderColor: "#9ca3af",
            },
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#9ca3af",
        }),
    };

    return (
        <div className="flex flex-col gap-1 mb-4">
            {label && (
                <label htmlFor={name} className="text-lg font-medium text-gray-700">
                    {label}
                </label>
            )}
            <Select
                id={name}
                name={name}
                options={options}
                value={selectedValue}
                onChange={handleChange}
                placeholder={placeholder || "Select an option"}
                isClearable={!isMulti}
                isMulti={isMulti}
                styles={customStyles}
                className="react-select-container"
                classNamePrefix="react-select"
            />
        </div>
    );
}
