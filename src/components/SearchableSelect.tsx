import React, { useState, useRef, useEffect, useMemo } from 'react';
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

  // Parse children options recursively unwrapping React Fragments, arrays, and multi-child options
  const options = useMemo(() => {
    const list: { value: string; label: string; disabled: boolean }[] = [];
    const toText = (c: any): string => {
      if (c === null || c === undefined) return '';
      if (Array.isArray(c)) return c.map(toText).join('');
      if (React.isValidElement(c)) return toText((c.props as any)?.children);
      return String(c);
    };

    const processChild = (child: any) => {
      if (!child && child !== 0) return;
      if (Array.isArray(child)) {
        child.forEach(processChild);
        return;
      }
      if (!React.isValidElement(child)) return;
      if (child.type === React.Fragment) {
        processChild((child.props as any)?.children);
        return;
      }
      const props = child.props as any;
      if (child.type === 'option' || (props && ('value' in props || 'children' in props))) {
        const val = props.value !== undefined ? String(props.value) : toText(props.children);
        const lbl = toText(props.children) || val;
        list.push({
          value: val,
          label: lbl,
          disabled: !!props.disabled,
        });
      }
    };

    React.Children.forEach(children, processChild);
    return list;
  }, [children]);

  // Close dropdown on click or touch outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Focus search input on desktop when opened
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(-1);
      if (typeof window !== 'undefined' && window.innerWidth >= 640) {
        const timer = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
      }
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Find currently selected option
  const currentValStr = (value === undefined || value === null) ? '' : String(value);
  const selectedOption = currentValStr !== '' 
    ? options.find(opt => opt.value === currentValStr || String(opt.value).trim().toUpperCase() === currentValStr.trim().toUpperCase())
    : options.find(opt => opt.value === '');
  
  // Find placeholder option (often value="" or first option)
  const emptyOption = options.find(opt => opt.value === '');
  const displayLabel = selectedOption 
    ? selectedOption.label 
    : (currentValStr.trim() !== ''
        ? currentValStr
        : (emptyOption ? emptyOption.label : placeholder));

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    return options.filter(opt => {
      if (opt.value === '') {
        return searchTerm === '';
      }
      return flexibleSearchMatch(opt.label, searchTerm) || flexibleSearchMatch(opt.value, searchTerm);
    });
  }, [options, searchTerm]);

  // Dynamic scrolling window: initial chunk of 300 items, smoothly loads +300 as user scrolls so all 7,000+ items are accessible
  const [displayLimit, setDisplayLimit] = useState(300);

  useEffect(() => {
    setDisplayLimit(300);
  }, [searchTerm, isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      if (displayLimit < filteredOptions.length) {
        setDisplayLimit(prev => Math.min(prev + 300, filteredOptions.length));
      }
    }
  };

  const displayedOptions = useMemo(() => {
    return filteredOptions.slice(0, displayLimit);
  }, [filteredOptions, displayLimit]);

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
      setActiveIndex(prev => (prev < displayedOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < displayedOptions.length) {
        const selected = displayedOptions[activeIndex];
        if (!selected.disabled) {
          handleSelect(selected.value);
        }
      } else if (displayedOptions.length === 1) {
        const selected = displayedOptions[0];
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

  const hasPadding = className.includes('p-') || className.includes('py-') || className.includes('px-');
  const hasBorder = className.includes('border');
  const hasBg = className.includes('bg-');
  
  const defaultStyles = `${!hasBg ? 'bg-white' : ''} ${!hasBorder ? 'border border-slate-200' : ''} ${!hasPadding ? 'px-3.5 py-2.5' : ''} text-slate-800 text-xs font-semibold rounded-xl`;
  const buttonStyle = `flex items-center justify-between text-left cursor-pointer transition-all duration-200 ${defaultStyles} ${className}`;
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

      {required && (
        <input
          tabIndex={-1}
          autoComplete="off"
          style={{
            opacity: 0,
            width: '1px',
            height: '1px',
            position: 'absolute',
            bottom: 0,
            left: 0,
            pointerEvents: 'none',
          }}
          value={value || ''}
          onChange={() => {}}
          aria-required={required}
        />
      )}

      {isOpen && (
        <div 
          className={`absolute z-[99999] ${alignClass} mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[350px] min-w-full w-max max-w-[calc(100vw-2rem)] md:max-w-[480px]`}
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
          <div 
            ref={optionsListRef} 
            className="overflow-y-auto flex-1 max-h-[280px] py-1"
            onScroll={handleScroll}
          >
            {displayedOptions.length > 0 ? (
              displayedOptions.map((opt, index) => {
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
                {options.length === 0 ? 'No options available' : `No matches found for "${searchTerm}"`}
              </div>
            )}
          </div>

          {filteredOptions.length > 0 && (
            <div className="px-3 py-1.5 text-[11px] text-slate-500 bg-slate-50 border-t border-slate-100 flex items-center justify-between font-medium">
              <span>
                {displayedOptions.length < filteredOptions.length
                  ? `Loaded ${displayedOptions.length.toLocaleString()} of ${filteredOptions.length.toLocaleString()} items`
                  : `All ${filteredOptions.length.toLocaleString()} items available`}
              </span>
              {displayedOptions.length < filteredOptions.length ? (
                <span className="text-[10px] text-indigo-600 font-bold">Scroll down for more &bull; Type to search</span>
              ) : (
                <span className="text-[10px] text-emerald-600 font-bold">✓ Complete</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
