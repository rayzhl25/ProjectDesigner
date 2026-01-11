
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onChange, placeholder = 'Add Tag' }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      onChange([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap gap-2 items-center min-h-[30px]">
      {tags.map(tag => (
        <span key={tag} className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 px-2 py-0.5 rounded text-xs flex items-center gap-1 border border-blue-100 dark:border-blue-800">
          {tag} 
          <X 
            size={10} 
            className="cursor-pointer hover:text-blue-800 dark:hover:text-blue-300" 
            onClick={() => handleRemove(tag)} 
          />
        </span>
      ))}
      <input 
        type="text" 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)} 
        onKeyDown={handleKeyDown}
        onBlur={handleAdd}
        placeholder={tags.length === 0 ? placeholder : "+ Tag"}
        className="text-xs bg-transparent outline-none w-20 border-b border-transparent focus:border-nebula-500 transition-all placeholder-gray-400 focus:w-32"
      />
    </div>
  );
};

export default TagInput;
