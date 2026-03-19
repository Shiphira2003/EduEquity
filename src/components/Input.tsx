import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    startIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, helperText, fullWidth = true, startIcon, type = 'text', id, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const inputId = id || props.name;
        const widthClass = fullWidth ? 'w-full' : '';
        const isPassword = type === 'password';

        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        const errorClass = error
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-200 focus:border-primary focus:ring-primary';

        const paddingLeft = startIcon ? 'pl-10' : 'pl-3';
        const paddingRight = isPassword ? 'pr-10' : 'px-3';

        return (
            <div className={`${widthClass} ${className}`}>
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {startIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {startIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        type={inputType}
                        className={`block w-full rounded-xl border shadow-sm py-2.5 ${paddingLeft} ${paddingRight} sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${errorClass} disabled:bg-gray-50 disabled:text-gray-500`}
                        {...props}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" aria-hidden="true" />
                            ) : (
                                <Eye className="h-5 w-5" aria-hidden="true" />
                            )}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-600 animate-slide-up" style={{ animationDuration: '0.2s' }}>{error}</p>
                )}
                {!error && helperText && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
