'use client';

import { useState, ChangeEvent } from 'react';
import { FaUpload } from 'react-icons/fa';

interface CustomFileInputProps {
  name: string;
  label: string;
  multiple?: boolean;
  required?: boolean;
}

export default function CustomFileInput({ name, label, multiple = false, required = false }: CustomFileInputProps) {
  const [fileNames, setFileNames] = useState<string[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setFileNames(files.map(file => file.name));
    } else {
      setFileNames([]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-800">{label}</label>
      <div className="mt-1 flex items-center">
        <label
          htmlFor={name}
          className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <FaUpload />
          <span>Choose File(s)</span>
        </label>
        <input
          id={name}
          name={name}
          type="file"
          multiple={multiple}
          required={required}
          onChange={handleFileChange}
          className="sr-only" // This hides the default ugly input
        />
        <span className="ml-4 text-sm text-gray-500">
          {fileNames.length > 0 ? fileNames.join(', ') : 'No file chosen'}
        </span>
      </div>
    </div>
  );
}