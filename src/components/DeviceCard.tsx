import React from 'react';
import { Device, Room } from '../types';
import {
  Lightbulb,
  Thermometer,
  Tv,
  Radio,
  Plug,
  Lock,
  Unlock,
  Play,
  Pause,
  Sliders,
  Zap,
  Sparkles,
  Minus,
  Plus,
  Volume2,
} from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  room?: Room;
  onToggle: (deviceId: string) => void;
  onOpenDetails: (device: Device) => void;
  onQuickBrightnessChange?: (deviceId: string, brightness: number) => void;
  onQuickTempChange?: (deviceId: string, delta: number) => void;
  onQuickVolumeChange?: (deviceId: string, volume: number) => void;
  onTogglePlay?: (deviceId: string) => void;
  onToggleLock?: (deviceId: string) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  room,
  onToggle,
  onOpenDetails,
  onQuickBrightnessChange,
  onQuickTempChange,
  onQuickVolumeChange,
  onTogglePlay,
  onToggleLock,
}) => {
  // Render icon for device type
  const renderDeviceIcon = () => {
    switch (device.type) {
      case 'light':
        return <Lightbulb className="w-5 h-5 text-amber-300" />;
      case 'climate':
        return <Thermometer className="w-5 h-5 text-sky-300" />;
      case 'media':
        return device.name.toLowerCase().includes('tv') ? (
          <Tv className="w-5 h-5 text-indigo-300" />
        ) : (
          <Radio className="w-5 h-5 text-teal-300" />
        );
      case 'plug':
        return <Plug className="w-5 h-5 text-emerald-300" />;
      case 'security':
        return device.isLocked ? (
          <Lock className="w-5 h-5 text-rose-300" />
        ) : (
          <Unlock className="w-5 h-5 text-amber-300" />
        );
      case 'vacuum':
        return <Sparkles className="w-5 h-5 text-purple-300" />;
      default:
        return <Zap className="w-5 h-5 text-emerald-300" />;
    }
  };

  const currentPowerWatts = device.isOn ? device.currentWatts : device.standbyWatts;

  return (
    <div
      className={`group relative rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
        device.isOn
          ? 'bg-[#0a2736]/80 border-emerald-500/35 shadow-lg shadow-emerald-950/20'
          : 'bg-[#071d2b]/60 border-white/10 hover:border-white/20'
      }`}
    >
      {/* Top row: Icon, Name, Power Switch */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggle(device.id)}
              title={device.isOn ? 'Desligar dispositivo' : 'Ligar dispositivo'}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                device.isOn
                  ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 shadow-sm shadow-emerald-500/20'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {renderDeviceIcon()}
            </button>

            <div>
              <h3 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-200 transition-colors line-clamp-1">
                {device.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <span>{room?.name || 'Sem cômodo'}</span>
                <span>·</span>
                <span className="font-mono tabular-nums text-[11px] text-emerald-300/90 font-medium">
                  {currentPowerWatts >= 1000
                    ? `${(currentPowerWatts / 1000).toFixed(2)} kW`
                    : `${Math.round(currentPowerWatts)} W`}
                </span>
              </div>
            </div>
          </div>

          {/* Master Toggle Switch */}
          <button
            onClick={() => onToggle(device.id)}
            role="switch"
            aria-checked={device.isOn}
            title={device.isOn ? 'Desligar' : 'Ligar'}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
              device.isOn ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                device.isOn ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Dynamic Controls based on device type */}
        <div className="mt-4 pt-3 border-t border-white/5 space-y-2.5">
          {/* Light Controls */}
          {device.type === 'light' && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Brilho</span>
                <span className="font-mono tabular-nums text-emerald-300">
                  {device.isOn ? `${device.brightness || 80}%` : '0%'}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={device.isOn ? device.brightness || 80 : 0}
                disabled={!device.isOn}
                onChange={(e) =>
                  onQuickBrightnessChange &&
                  onQuickBrightnessChange(device.id, Number(e.target.value))
                }
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-400 ${
                  device.isOn ? 'bg-slate-700' : 'bg-slate-800 opacity-50 cursor-not-allowed'
                }`}
              />
            </div>
          )}

          {/* Climate Controls */}
          {device.type === 'climate' && (
            <div className="flex items-center justify-between bg-black/20 p-2 rounded-xl border border-white/5">
              <div className="text-xs text-slate-300">
                <div className="text-[10px] text-slate-400">Temp. Alvo</div>
                <div className="font-bold text-sm text-sky-300 font-mono tabular-nums">
                  {device.targetTemperature || 22}°C
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={!device.isOn}
                  onClick={() => onQuickTempChange && onQuickTempChange(device.id, -1)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 flex items-center justify-center text-slate-200 text-xs font-bold transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={!device.isOn}
                  onClick={() => onQuickTempChange && onQuickTempChange(device.id, 1)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 flex items-center justify-center text-slate-200 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] font-medium text-slate-300 bg-white/5 px-2 py-0.5 rounded-md uppercase">
                {device.hvacMode || 'Eco'}
              </div>
            </div>
          )}

          {/* Media Controls */}
          {device.type === 'media' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate max-w-[170px]">
                  {device.currentTrack || 'Nenhuma mídia tocando'}
                </span>
                <button
                  disabled={!device.isOn}
                  onClick={() => onTogglePlay && onTogglePlay(device.id)}
                  className="p-1 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-40 text-emerald-300 transition-colors"
                >
                  {device.isPlaying ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={device.isOn ? device.volume || 30 : 0}
                  disabled={!device.isOn}
                  onChange={(e) =>
                    onQuickVolumeChange &&
                    onQuickVolumeChange(device.id, Number(e.target.value))
                  }
                  className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-teal-400 ${
                    device.isOn ? 'bg-slate-700' : 'bg-slate-800 opacity-50 cursor-not-allowed'
                  }`}
                />
                <span className="text-[11px] font-mono tabular-nums text-slate-400 w-6 text-right">
                  {device.isOn ? `${device.volume || 30}%` : '0%'}
                </span>
              </div>
            </div>
          )}

          {/* Security (Lock) Controls */}
          {device.type === 'security' && (
            <div className="flex items-center justify-between bg-black/20 p-2 rounded-xl border border-white/5">
              <span className="text-xs text-slate-300">
                {device.isLocked ? 'Porta Trancada' : 'Porta Destrancada'}
              </span>
              <button
                onClick={() => onToggleLock && onToggleLock(device.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  device.isLocked
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                }`}
              >
                {device.isLocked ? 'Destrancar' : 'Trancar'}
              </button>
            </div>
          )}

          {/* Smart Plug / Appliance Controls */}
          {(device.type === 'plug' || device.type === 'appliance' || device.type === 'vacuum') && (
            <div className="flex items-center justify-between text-xs text-slate-300 bg-black/20 px-2.5 py-1.5 rounded-xl border border-white/5">
              <span className="text-slate-400">Classificação:</span>
              <span className="font-semibold text-emerald-400 font-mono">
                {device.energy.efficiencyRating} Procel
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Details & Adjust button */}
      <div className="mt-4 pt-2 flex items-center justify-between border-t border-white/5">
        <span className="text-[11px] text-slate-400">
          Potência Nominal: <span className="font-mono tabular-nums">{device.powerRatingWatts}W</span>
        </span>

        <button
          onClick={() => onOpenDetails(device)}
          className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors p-1 rounded-md hover:bg-white/5"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Configurar</span>
        </button>
      </div>
    </div>
  );
};
