'use client';

import { useState, useCallback } from 'react';

interface FileUploadProps {
    onFilesLoaded: (files: string[]) => void;
}

export default function FileUpload({ onFilesLoaded }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [fileNames, setFileNames] = useState<string[]>([]);

    const handleFiles = useCallback((files: FileList) => {
        const csvFiles = Array.from(files).filter(file =>
            file.name.endsWith('.csv') || file.type === 'text/csv'
        );

        if (csvFiles.length === 0) {
            alert('Please upload CSV files only');
            return;
        }

        setFileNames(csvFiles.map(f => f.name));

        Promise.all(
            csvFiles.map(file =>
                new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsText(file);
                })
            )
        ).then(contents => {
            onFilesLoaded(contents);
        });
    }, [onFilesLoaded]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    }, [handleFiles]);

    return (
        <div className="w-full">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all
          ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                    }
        `}
            >
                <input
                    type="file"
                    multiple
                    accept=".csv"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="space-y-4">
                    <div className="flex justify-center">
                        <svg
                            className="w-16 h-16 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>

                    <div>
                        <p className="text-lg font-medium text-gray-700">
                            {fileNames.length > 0
                                ? `${fileNames.length} file(s) loaded`
                                : 'Drop your Etsy CSV files here'
                            }
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            or click to browse
                        </p>
                    </div>

                    {fileNames.length > 0 && (
                        <div className="mt-4 space-y-1">
                            {fileNames.map((name, i) => (
                                <p key={i} className="text-sm text-gray-600 font-mono">
                                    {name}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}