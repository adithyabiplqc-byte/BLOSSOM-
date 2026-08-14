import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import { flexibleSearchMatch } from '../utils/search';

interface SearchableSelectProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  children: React.ReactNode;
  id?: string;
  align?: 'left' | 'right';
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Select...',
  disabled = false,
  required = false,
  children,
  id,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsListRef = useRef<HTMLDivElement>(null);

  // Parse children options
  const options = React.Children.toArray(children)
    .map(child => {
      if (React.isValidElement(child) && child.type === 'option') {
        return {
          value: child.props.value !== undefined ? String(child.props.value) : String(child.props.children || ''),
          label: String(child.props.children || ''),
          disabled: !!child.props.disabled,
        };
      }
      return null;
    })
    .filter((opt): opt is { value: string; label: string; disabled: boolean } => opt !== null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input and reset active index when opened
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(-1);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Find currently selected option
  const selectedOption = options.find(opt => opt.value === String(value));
  
  // Find placeholder option (often value="" or first option)
  const emptyOption = options.find(opt => opt.value === '');
  const displayLabel = selectedOption 
    ? selectedOption.label 
    : (emptyOption ? emptyOption.label : placeholder);

  // Filter options based on search query
  const filteredOptions = options.filter(opt => {
    if (opt.value === '') {
      return searchTerm === '';
    }
    return flexibleSearchMatch(opt.label, searchTerm) || flexibleSearchMatch(opt.value, searchTerm);
  });

  const handleSelect = (optValue: string) => {
    if (disabled) return;
    
    const mockEvent = {
      target: {
        value: optValue,
        name: id || '',
      },
      currentTarget: {
        value: optValue,
        name: id || '',
      }
    } as unknown as React.ChangeEvent<HTMLSelectElement>;

    onChange(mockEvent);
    setIsOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Space') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
        const selected = filteredOptions[activeIndex];
        if (!selected.disabled) {
          handleSelect(selected.value);
        }
      } else if (filteredOptions.length === 1) {
        // Fallback: If only one item matched, enter selects it
        const selected = filteredOptions[0];
        if (!selected.disabled) {
          handleSelect(selected.value);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && optionsListRef.current) {
      const activeEl = optionsListRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const buttonStyle = `flex items-center justify-between text-left cursor-pointer transition-all duration-200 ${className}`;
  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={containerRef} className="relative w-full" id={id} onKeyDown={handleKeyDown}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={buttonStyle}
        style={{ minHeight: '38px' }}
        title={displayLabel}
      >
        <span className="truncate pr-4">{displayLabel}</span>
        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          <Icon name="search" size={13} className="text-slate-300 hover:text-indigo-500 transition-colors" title="Click to search items" />
          <Icon name="chevron-down" size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div 
          className={`absolute z-50 ${alignClass} mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[350px] min-w-full w-max max-w-[calc(100vw-2rem)] md:max-w-[480px]`}
        >
          {/* Search bar header */}
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <Icon name="search" size={14} className="text-slate-400 ml-1.5 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setActiveIndex(-1);
              }}
              placeholder="Type to search..."
              className="w-full bg-transparent text-xs text-slate-700 font-semibold focus:outline-none placeholder-slate-400 py-1"
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => {
                  setSearchTerm('');
                  setActiveIndex(-1);
                }} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <Icon name="x" size={12} />
              </button>
            )}
          </div>

          {/* Options list */}
          <div ref={optionsListRef} className="overflow-y-auto flex-1 max-h-[260px] py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === String(value);
                const isActive = index === activeIndex;
                const isPlaceholderItem = opt.value === '';
                return (
                  <button
                    key={`${opt.value}-${index}`}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors
                      ${opt.disabled ? 'text-slate-300 cursor-not-allowed bg-slate-50' : 'text-slate-700 cursor-pointer'}
                      ${isSelected ? 'bg-indigo-50/70 text-indigo-600 hover:bg-indigo-50 font-bold' : ''}
                      ${isActive ? 'bg-slate-100/90 text-slate-900 font-bold' : 'hover:bg-slate-50'}
                      ${isPlaceholderItem ? 'text-slate-400 border-b border-slate-50' : ''}
                    `}
                    title={opt.label}
                  >
                    <span className="whitespace-normal break-words text-left pr-3 flex-1 leading-relaxed">
                      {opt.label}
                    </span>
                    {isSelected && <Icon name="check" size={14} className="text-indigo-600 shrink-0 ml-1" />}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-4 text-xs text-slate-400 text-center font-medium">
                No matches found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
