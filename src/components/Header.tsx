import React from 'react';
import {
  Home,
  Plus,
  Moon,
  LogOut,
  Leaf,
  Sun,
  Activity,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'devices' | 'analytics' | 'rooms';
  setCurrentTab: (tab: 'devices' | 'analytics' | 'rooms') => void;
  activeHouseName: string;
  setActiveHouseName: (name: string) => void;
  onOpenAddDevice: () => void;
  onRunRoutine: (routineId: string) => void;
  totalLiveWatts: number;
  totalDevicesCount: number;
  activeDevicesCount: number;
  onOpenTariffModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  activeHouseName,
  setActiveHouseName,
  onOpenAddDevice,
  onRunRoutine,
  totalLiveWatts,
  totalDevicesCount,
  activeDevicesCount,
  onOpenTariffModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#071928]/85 backdrop-blur-md border-b border-emerald-950/40">
      {/* Primary Top Bar: Zone 1, Zone 2, Zone 3 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
              <Home className="w-5 h-5 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                  HomeHub
                </span>
                <span className="text-[11px] font-medium text-emerald-300/80 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  Google Home
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('devices')}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'devices'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Cômodos & Dispositivos
            </button>
            <button
              onClick={() => setCurrentTab('analytics')}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentTab === 'analytics'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              Análise de Consumo
            </button>
            <button
              onClick={() => setCurrentTab('rooms')}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'rooms'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Gerenciar Cômodos
            </button>
          </nav>

          {/* Zone 3: Live Power badge + Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live wattage widget */}
            <button
              onClick={onOpenTariffModal}
              title="Configurar Tarifa de Energia"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/25 hover:border-emerald-400/50 transition-colors group text-left"
            >
              <Zap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-[10px] text-emerald-300/80 font-medium leading-none">
                  Potência Instantânea
                </div>
                <div className="text-xs font-semibold text-emerald-200 tabular-nums">
                  {(totalLiveWatts / 1000).toFixed(2)} kW{' '}
                  <span className="text-[11px] text-slate-400 font-normal">
                    ({activeDevicesCount}/{totalDevicesCount} ligados)
                  </span>
                </div>
              </div>
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300 ml-1" />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenAddDevice}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Adicionar</span> Dispositivo
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-white/5 gap-1">
          <button
            onClick={() => setCurrentTab('devices')}
            className={`flex-1 py-1 text-xs font-medium text-center rounded-md ${
              currentTab === 'devices'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-slate-400'
            }`}
          >
            Dispositivos
          </button>
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`flex-1 py-1 text-xs font-medium text-center rounded-md ${
              currentTab === 'analytics'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-slate-400'
            }`}
          >
            Consumo
          </button>
          <button
            onClick={() => setCurrentTab('rooms')}
            className={`flex-1 py-1 text-xs font-medium text-center rounded-md ${
              currentTab === 'rooms'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-slate-400'
            }`}
          >
            Cômodos
          </button>
        </div>
      </div>

      {/* Quick Google Home Routines Banner */}
      <div className="bg-[#051320]/70 border-t border-white/5 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 text-xs text-slate-300 whitespace-nowrap shrink-0">
            <span className="font-medium text-emerald-400">Rotinas Rápidas:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => onRunRoutine('night')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-200 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-200 border border-white/10 hover:border-emerald-500/30 transition-all whitespace-nowrap"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Modo Noite</span>
            </button>

            <button
              onClick={() => onRunRoutine('away')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-200 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-200 border border-white/10 hover:border-emerald-500/30 transition-all whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              <span>Sair de Casa</span>
            </button>

            <button
              onClick={() => onRunRoutine('eco')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-200 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-200 border border-white/10 hover:border-emerald-500/30 transition-all whitespace-nowrap"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Economia Eco</span>
            </button>

            <button
              onClick={() => onRunRoutine('welcome')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-200 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-200 border border-white/10 hover:border-emerald-500/30 transition-all whitespace-nowrap"
            >
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span>Chegar em Casa</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Residência: {activeHouseName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
