import React, { useState, useRef, useEffect } from 'react';
import type { Scene } from '@/types/scene';
import { cn } from '@/utils/cn';

interface SceneSelectorProps {
  value: string;
  onChange: (value: string) => void;
  availableScenes: Scene[];
  error?: string;
}

export function SceneSelector({ value, onChange, availableScenes, error }: SceneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedScene = availableScenes.find(s => s.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredScenes = availableScenes.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-gray-700 block">
        Leads to scene
      </label>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery('');
        }}
        className={cn(
          "w-full h-10 px-3 border rounded-lg text-sm text-left flex items-center justify-between bg-white transition-all focus:outline-none focus:ring-2 focus:ring-accent",
          error ? "border-danger ring-1 ring-danger animate-shake" : "border-gray-300"
        )}
      >
        <span className={cn(selectedScene ? "text-gray-900" : "text-gray-400")}>
          {selectedScene ? selectedScene.title : "Select a scene..."}
        </span>
        <svg
          className={cn("w-4 h-4 text-gray-500 transition-transform duration-150", isOpen && "transform rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 flex flex-col overflow-hidden animate-fadeIn">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search scenes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 px-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 py-1">
            {filteredScenes.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-500 text-center">
                No scenes found
              </div>
            ) : (
              filteredScenes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onChange(s.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors",
                    s.id === value ? "bg-accent/10 text-accent font-semibold" : "text-gray-700"
                  )}
                >
                  {s.title}
                </button>
              ))
            )}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
