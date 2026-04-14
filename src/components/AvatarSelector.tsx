import React from 'react';

const AVATARS = [
    { id: 'av1', color: 'bg-blue-500' },
    { id: 'av2', color: 'bg-zinc-900' },
    { id: 'av3', color: 'bg-indigo-600' },
    { id: 'av4', color: 'bg-slate-700' },
    { id: 'av5', color: 'bg-blue-700' },
    { id: 'av6', color: 'bg-zinc-800' },
    { id: 'av7', color: 'bg-sky-600' },
    { id: 'av8', color: 'bg-slate-900' },
    { id: 'av9', color: 'bg-blue-600' },
    { id: 'av10', color: 'bg-zinc-700' },
    { id: 'av11', color: 'bg-indigo-700' },
    { id: 'av12', color: 'bg-slate-800' },
];

interface AvatarSelectorProps {
    selectedId: string;
    onSelect: (id: string) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedId, onSelect }) => {
    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-4">
            {AVATARS.map((avatar) => (
                <button
                    key={avatar.id}
                    type="button"
                    onClick={() => onSelect(avatar.id)}
                    className={`
                        relative w-12 h-12 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95
                        ${avatar.color}
                        ${selectedId === avatar.id ? 'ring-4 ring-offset-2 ring-primary ring-opacity-50 border-2 border-white' : 'border border-transparent'}
                    `}
                >
                    <div className="absolute inset-0 flex items-center justify-center text-white/40">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                    </div>
                    {selectedId === avatar.id && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
};

export const AvatarDisplay: React.FC<{ id: string; className?: string }> = ({ id, className = "w-10 h-10" }) => {
    const avatar = AVATARS.find(a => a.id === id) || AVATARS[0];
    return (
        <div className={`${className} rounded-lg ${avatar.color} flex items-center justify-center text-white/40 overflow-hidden shadow-sm`}>
            <svg className="w-[60%] h-[60%]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
        </div>
    );
};
