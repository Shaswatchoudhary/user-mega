import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ placeholder = 'Search...', value, onChange }) => {
  return (
    <div className="relative group w-full max-w-sm">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
      <input 
        type="text" 
        placeholder={placeholder} 
        className="bg-background border border-border rounded-xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-primary/50 w-full transition-all font-bold text-text-primary shadow-soft placeholder:text-text-muted"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBar;
