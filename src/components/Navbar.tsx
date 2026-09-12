import React, { useState, useRef, useEffect } from 'react';
import { Zap, ChevronDown, Sun, Moon, Server, Check } from 'lucide-react';
import { ServerNode, SpeedUnit } from '../types';

interface NavbarProps {
  servers: ServerNode[];
  selectedServer: ServerNode;
  onSelectServer: (server: ServerNode) => void;
  unit: SpeedUnit;
  onSelectUnit: (unit: SpeedUnit) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  apiLossPercent: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  servers,
  selectedServer,
  onSelectServer,
  unit,
  onSelectUnit,
  isDark,
  onToggleTheme,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="mainNavbar"
      className={`border-b sticky top-0 z-40 transition-colors duration-200 ${
        isDark
          ? 'border-slate-800/80 bg-slate-950/80 backdrop-blur-md'
          : 'border-slate-200/90 bg-white/85 backdrop-blur-md'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Minimal Brand Logo */}
        <div className="flex items-center space-x-2.5 shrink-0" id="brandLogoIcon">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span
            className={`text-lg font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            SpeedPulse
          </span>
        </div>

        {/* Center: Server Picker & Units (Desktop) */}
        <div className="hidden sm:flex items-center space-x-3">
          {/* Server Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="serverPickerBtn"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              className={`flex items-center space-x-2 px-3 py-1.5 min-h-[38px] rounded-lg border text-xs font-medium transition cursor-pointer ${
                isDark
                  ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200/80 border-slate-300 text-slate-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="truncate max-w-[140px]">{selectedServer.name}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {dropdownOpen && (
              <div
                id="serverDropdownMenu"
                className={`absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-72 rounded-xl border shadow-xl p-1.5 z-50 animate-fade-in ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Select Test Server
                </div>
                <div className="space-y-0.5 mt-1 max-h-56 overflow-y-auto">
                  {servers.map((srv) => (
                    <button
                      key={srv.id}
                      onClick={() => {
                        onSelectServer(srv);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                        selectedServer.id === srv.id
                          ? 'bg-indigo-600 text-white font-medium'
                          : isDark
                          ? 'hover:bg-slate-800 text-slate-300'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <p className="truncate font-medium">{srv.name}</p>
                        <p className={`text-[10px] truncate ${selectedServer.id === srv.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {srv.location}
                        </p>
                      </div>
                      {selectedServer.id === srv.id && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Units Selector */}
          <div
            id="unitSelectorGroup"
            className={`flex border rounded-lg p-0.5 text-xs font-mono font-medium ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {(['Mbps', 'MB/s'] as SpeedUnit[]).map((u) => (
              <button
                key={u}
                id={`unitBtn-${u}`}
                onClick={() => onSelectUnit(u)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  unit === u
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Right Section: Mobile Server Toggle & Theme Toggle */}
        <div className="flex items-center space-x-2">
          {/* Mobile Server Picker Button (< sm) */}
          <div className="sm:hidden relative">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Server selection"
              className={`flex items-center space-x-1 px-2.5 py-1.5 min-h-[38px] rounded-lg border text-xs font-medium transition cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[80px]">{selectedServer.colo}</span>
            </button>

            {mobileMenuOpen && (
              <div
                className={`absolute right-0 top-full mt-2 w-64 rounded-xl border shadow-xl p-1.5 z-50 ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Select Server
                </div>
                <div className="space-y-0.5 mt-1 max-h-48 overflow-y-auto">
                  {servers.map((srv) => (
                    <button
                      key={srv.id}
                      onClick={() => {
                        onSelectServer(srv);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                        selectedServer.id === srv.id
                          ? 'bg-indigo-600 text-white font-medium'
                          : isDark
                          ? 'hover:bg-slate-800 text-slate-300'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{srv.name}</span>
                      {selectedServer.id === srv.id && <Check className="w-3 h-3 ml-2" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Unit Toggle for Mobile (< sm) */}
          <button
            onClick={() => onSelectUnit(unit === 'Mbps' ? 'MB/s' : 'Mbps')}
            className={`sm:hidden px-2.5 py-1.5 min-h-[38px] rounded-lg border text-xs font-mono font-medium transition cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {unit}
          </button>

          {/* Dark / Light Mode Toggle Button */}
          <button
            id="themeToggleBtn"
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className={`p-2 min-h-[38px] min-w-[38px] rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
