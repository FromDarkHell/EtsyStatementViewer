import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ExpanderProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    className?: string;
}

export default function Expander({
    title,
    children,
    defaultExpanded = false,
    className = ""
}: ExpanderProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
                <span className="font-medium text-gray-800">{title}</span>
                <div className="text-gray-600 transition-transform duration-200">
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                    ) : (
                        <ChevronRight className="w-5 h-5" />
                    )}
                </div>
            </button>

            {/* Content */}
            <div
                className={`transition-all duration-300 ease-in-out ${isExpanded
                    ? 'max-h-screen opacity-100'
                    : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
            >
                <div className="p-4 bg-white border-t border-gray-200">
                    {children}
                </div>
            </div>
        </div>
    );
};