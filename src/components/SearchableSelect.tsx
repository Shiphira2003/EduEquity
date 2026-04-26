import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X, Loader2 } from 'lucide-react';

interface Option {
    name: string;
    category?: string;
    source?: string;
}

interface SearchableSelectProps {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onFetchOptions: (query: string) => Promise<Option[]>;
    required?: boolean;
    name?: string;
    error?: string;
    className?: string;
    footerLabel?: string;
    footerSource?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    label,
    placeholder = "Search...",
    value,
    onChange,
    onFetchOptions,
    required = false,
    name,
    error,
    className = "",
    footerLabel = "Results Found",
    footerSource = "System Registry"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch default options when first opened or when query is cleared
    useEffect(() => {
        if (isOpen && !query) {
            handleSearch("");
        }
    }, [isOpen]);

    // Update query when value changes from outside (e.g. form reset)
    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // If the query is different from current value, emit it as a custom choice
                if (query !== value) {
                    onChange(query);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value, query, onChange]);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastRequestRef = useRef<number>(0);

    const handleSearch = async (searchQuery: string) => {
        setQuery(searchQuery);
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        setLoading(true);

        searchTimeoutRef.current = setTimeout(async () => {
            const requestId = Date.now();
            lastRequestRef.current = requestId;
            
            try {
                const results = await onFetchOptions(searchQuery);
                // Only update if this is the most recent request
                if (requestId === lastRequestRef.current) {
                    setOptions(results);
                }
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                if (requestId === lastRequestRef.current) {
                    setLoading(false);
                }
            }
        }, 400); // 400ms debounce
    };

    const handleSelect = (optionName: string) => {
        onChange(optionName);
        setQuery(optionName);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2 px-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            
            <div className="relative">
                <div 
                    className={`
                        w-full flex items-center bg-zinc-50 border-2 rounded-2xl px-4 py-3.5 transition-all duration-300 cursor-text
                        ${isOpen ? 'border-primary bg-white shadow-xl shadow-primary/5' : error ? 'border-red-200' : 'border-zinc-100 hover:border-zinc-200'}
                    `}
                    onClick={() => setIsOpen(true)}
                >
                    <Search className={`w-5 h-5 mr-3 transition-colors ${isOpen ? 'text-primary' : 'text-zinc-400'}`} />
                    <input
                        type="text"
                        name={name}
                        className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-zinc-900 placeholder:text-zinc-400"
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        autoComplete="off"
                        required={required}
                    />
                    <div className="flex items-center gap-2">
                        {loading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                        {query && (
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSearch("");
                                    onChange("");
                                }}
                                className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>

                {/* Dropdown Results */}
                {isOpen && (
                    <div className="absolute z-[100] w-full mt-2 bg-white border border-zinc-100 rounded-2xl shadow-2xl overflow-hidden animate-slide-up max-h-[300px] flex flex-col">
                        <div className="overflow-y-auto flex-1 py-1 custom-scrollbar">
                            {options.length > 0 ? (
                                options.map((option, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`
                                            w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors
                                            ${value === option.name ? 'bg-primary/5 text-primary' : 'hover:bg-zinc-50 text-zinc-700'}
                                        `}
                                        onClick={() => handleSelect(option.name)}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{option.name}</span>
                                            {option.category && (
                                                <span className="text-[10px] uppercase font-black tracking-tighter opacity-40">
                                                    {option.category} • {option.source === 'external' ? 'Global Directory' : 'System Registry'}
                                                </span>
                                            )}
                                        </div>
                                        {value === option.name && <Check className="w-4 h-4" />}
                                    </button>
                                ))
                            ) : !loading && (
                                <div className="px-4 py-8 text-center text-zinc-400">
                                    <p className="text-sm font-medium italic">"{query}" not found in our directory.</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest mt-2">Try a different name or spelling</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-zinc-50 px-4 py-2 border-t border-zinc-100 text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex justify-between items-center">
                            <span>{options.length} {footerLabel}</span>
                            <span>Source: {footerSource}</span>
                        </div>
                    </div>
                )}
            </div>

            {error && touched && (
                <p className="mt-2 text-xs font-bold text-red-500 px-1 animate-shake">
                    {error}
                </p>
            )}
        </div>
    );
};
