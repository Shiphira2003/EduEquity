import React from 'react';

export const TableContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="overflow-x-auto rounded-lg shadow ring-1 ring-black ring-opacity-5">
        <table className="min-w-full divide-y divide-gray-300 bg-white">
            {children}
        </table>
    </div>
);

export const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <thead className="bg-gray-50">
        {children}
    </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <tbody className="divide-y divide-gray-200 bg-white">
        {children}
    </tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({ children, onClick, className = '' }) => (
    <tr
        onClick={onClick}
        className={`${onClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${className}`}
    >
        {children}
    </tr>
);

export const TableHeaderCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <th scope="col" className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 ${className}`}>
        {children}
    </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
    <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6 ${className}`} {...props}>
        {children}
    </td>
);
