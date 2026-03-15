'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// 드롭다운 옵션 타입
export interface SelectOption {
  value: string;
  label: string;
  icon?: string; // 이모지 또는 아이콘 텍스트
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md'; // sm: 편집 모드 인라인용, md: 폼 등
  disabled?: boolean;
  // 이모지 모드: 선택 버튼에 이모지만 크게 표시
  emojiMode?: boolean;
}

// 커스텀 셀렉트 컴포넌트 — OS 기본 드롭다운 대신 디자인 시스템에 맞는 팝오버 사용
export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = '선택',
  className,
  size = 'md',
  disabled = false,
  emojiMode = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 현재 선택된 옵션
  const selectedOption = options.find((o) => o.value === value);

  // 외부 클릭 시 닫기
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  // 드롭다운이 화면 밖으로 넘어가지 않도록 위치 조정
  useEffect(() => {
    if (isOpen && dropdownRef.current && containerRef.current) {
      const dropdown = dropdownRef.current;
      const rect = dropdown.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // 아래로 넘어가면 위로 표시
      if (rect.bottom > viewportHeight - 8) {
        dropdown.style.bottom = '100%';
        dropdown.style.top = 'auto';
        dropdown.style.marginBottom = '4px';
        dropdown.style.marginTop = '0';
      } else {
        dropdown.style.top = '100%';
        dropdown.style.bottom = 'auto';
        dropdown.style.marginTop = '4px';
        dropdown.style.marginBottom = '0';
      }
    }
  }, [isOpen]);

  // 옵션 선택
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // 사이즈별 스타일
  const sizeStyles = {
    sm: 'text-xs px-2 py-1 rounded-md',
    md: 'text-sm px-3 py-2.5 rounded-md',
  };

  // 이모지 모드: 버튼 스타일
  const triggerStyles = emojiMode
    ? 'w-full h-8 text-center text-lg bg-bg-secondary border border-border rounded-md cursor-pointer'
    : cn(
        sizeStyles[size],
        'w-full bg-bg-secondary border border-border text-text-primary cursor-pointer',
      );

  // 선택 버튼에 표시할 텍스트
  const displayText = emojiMode
    ? selectedOption?.icon ?? selectedOption?.label ?? value
    : selectedOption
      ? selectedOption.icon
        ? `${selectedOption.icon} ${selectedOption.label}`
        : selectedOption.label
      : placeholder;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={cn(
          triggerStyles,
          'flex items-center justify-between gap-1 outline-none transition-colors',
          'focus:border-primary focus:ring-2 focus:ring-primary-500/20',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className={cn('truncate', emojiMode && 'flex-1 text-center')}>
          {displayText}
        </span>
        {!emojiMode && (
          <ChevronDown
            className={cn(
              'size-3.5 shrink-0 text-text-tertiary transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        )}
      </button>

      {/* 드롭다운 팝오버 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute left-0 z-50 min-w-full',
            'bg-surface border border-border-light rounded-xl shadow-lg',
            'py-1 overflow-auto max-h-60',
            // 이모지 모드에서는 드롭다운이 더 넓을 수 있음
            emojiMode && 'min-w-[140px]',
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors',
                  size === 'sm' ? 'text-xs' : 'text-sm',
                  isSelected
                    ? 'text-primary bg-primary-50'
                    : 'text-text-primary hover:bg-bg-secondary',
                )}
              >
                {/* 체크 표시 (선택됨) */}
                <span className="w-4 shrink-0">
                  {isSelected && <Check className="size-3.5 text-primary" />}
                </span>
                {/* 아이콘 + 라벨 */}
                {option.icon && <span>{option.icon}</span>}
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
