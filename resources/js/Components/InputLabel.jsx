export default function InputLabel({ value, className = '', required = false, children, ...props }) {
    return (
        <label {...props} className={`block font-medium text-sm text-gray-700 dark:text-gray-300 ` + className}>
            {value ? value : children}
            {required && (
                <span className="text-red-600 dark:text-red-400" aria-hidden="true"> *</span>
            )}
        </label>
    );
}
