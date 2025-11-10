import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../lib';
export default function Button({ children, className, variant = 'primary', size = 'md', ...props }) {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-sm',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 shadow-sm',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900 focus:ring-gray-500'
    };
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm rounded',
        md: 'px-4 py-2 text-sm rounded',
        lg: 'px-6 py-3 text-base rounded'
    };
    return (_jsx("button", { className: cn(baseClasses, variantClasses[variant], sizeClasses[size], className), ...props, children: children }));
}
