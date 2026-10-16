import React, { useState } from 'react';
import { Device, DeviceType, Room, TariffConfig } from '../types';
import {
  X,
  Plus,
  Lightbulb,
  Thermometer,
  Tv,
  Radio,
  Plug,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AddDeviceModalProps {
  rooms: Room[];
  initialRoomId?: string | null;
  tariff: TariffConfig;
  onClose: () => void;
  onAddDevice: (newDevice: Device) => void;
}

const DEVICE_TEMPLATES: {
  type: DeviceType;
  label: string;
  defaultWatts: number;
  icon: any;
}[] = [
  { type: 'light', label: 'Iluminação Inteligente', defaultWatts: 25, icon: Lightbulb },
  { type: 'climate', label: 'Ar-Condicionado / Clima', defaultWatts: 1200, icon: Thermometer },
  { type: 'media', label: 'Smart TV / Chromecast', defaultWatts: 120, icon: Tv },
  { type: 'media', label: 'Google Nest Caixa de Som', defaultWatts: 18, icon: Radio },
  { type: 'plug', label: 'Tomada Inteligente (Plug)', defaultWatts: 180, icon: Plug },
  { type: 'security', label: 'Fechadura / Câmera Nest', defaultWatts: 8, icon: Lock },
  { type: 'vacuum', label: 'Robô Aspirador', defaultWatts: 45, icon: Sparkles },
  { type: 'appliance', label: 'Eletrodoméstico Geral', defaultWatts: 250, icon: Zap },
];

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  rooms,
  initialRoomId,
  tariff,
  onClose,
  onAddDevice,
}) => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState(
    initialRoomId && rooms.some((r) => r.id === initialRoomId)
      ? initialRoomId
      : rooms[0]?.id || ''
  );
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [powerWatts, setPowerWatts] = useState(DEVICE_TEMPLATES[0].defaultWatts);
  const [efficiency, setEfficiency] = useState<'A+++' | 'A++' | 'A+' | 'A' | 'B'>('A+++');
  const [isOnInitial, setIsOnInitial] = useState(true);

  const handleSelectTemplate = (index: number) => {
    setSelectedTemplateIndex(index);
    const tmpl = DEVICE_TEMPLATES[index];
    setPowerWatts(tmpl.defaultWatts);
    if (!name || DEVICE_TEMPLATES.some((t) => t.label === name)) {
      setName(tmpl.label);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomId) return;

    const tmpl = DEVICE_TEMPLATES[selectedTemplateIndex];
    const newId = `dev-${Date.now()}`;

    // Generate starter telemetry
    const hourly = Array.from({ length: 24 }).map((_, idx) => {
      const isPeak = idx >= 18 && idx <= 21;
      const kwh = parseFloat((powerWatts * 0.00085).toFixed(3));
      const cost = parseFloat((kwh * tariff.ratePerKwh).toFixed(2));
      return {
        hour: `${idx.toString().padStart(2, '0')}:00`,
        kwh,
        cost,
        isPeak,
      };
    });

    const days = [
      { date: '10/10', dayName: 'Seg' },
      { date: '11/10', dayName: 'Ter' },
      { date: '12/10', dayName: 'Qua' },
      { date: '13/10', dayName: 'Qui' },
      { date: '14/10', dayName: 'Sex' },
      { date: '15/10', dayName: 'Sáb' },
      { date: '16/10', dayName: 'Hoje' },
    ];
    const daily = days.map((d) => ({
      ...d,
      kwh: parseFloat(((powerWatts * 4) / 1000).toFixed(2)),
      cost: parseFloat((((powerWatts * 4) / 1000) * tariff.ratePerKwh).toFixed(2)),
    }));

    const months = ['Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out'];
    const monthly = months.map((month) => ({
      month,
      kwh: parseFloat(((powerWatts * 120) / 1000).toFixed(1)),
      cost: parseFloat((((powerWatts * 120) / 1000) * tariff.ratePerKwh).toFixed(2)),
    }));

    const newDevice: Device = {
      id: newId,
      name: name.trim(),
      roomId,
      type: tmpl.type,
      isOn: isOnInitial,
      powerRatingWatts: powerWatts,
      currentWatts: isOnInitial ? powerWatts : 1.5,
      standbyWatts: 1.5,
      brightness: tmpl.type === 'light' ? 80 : undefined,
      colorHex: tmpl.type === 'light' ? '#fef08a' : undefined,
      targetTemperature: tmpl.type === 'climate' ? 22 : undefined,
      volume: tmpl.type === 'media' ? 35 : undefined,
      isPlaying: tmpl.type === 'media' ? false : undefined,
      isLocked: tmpl.type === 'security' ? true : undefined,
      energy: {
        hourly,
        daily,
        monthly,
        activeHoursToday: 4,
        activeHoursWeek: 28,
        activeHoursMonth: 120,
        activeHoursYear: 1400,
        efficiencyRating: efficiency,
      },
    };

    onAddDevice(newDevice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-[#092233] border border-emerald-500/30 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            Adicionar Dispositivo Google Home
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Tipo de Dispositivo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEVICE_TEMPLATES.map((tmpl, idx) => {
                const IconComponent = tmpl.icon;
                const isSelected = selectedTemplateIndex === idx;

                return (
                  <button
                    key={`${tmpl.label}-${idx}`}
                    type="button"
                    onClick={() => handleSelectTemplate(idx)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-[10px] font-medium leading-tight line-clamp-2">
                      {tmpl.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Device Name */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Nome do Dispositivo
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Lâmpada de Leitura, Ar Quarto Bebê..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* Room Selection */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Cômodo Onde Está Instalado
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-[#092231] border border-white/10 text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.floor || 'Geral'})
                </option>
              ))}
            </select>
          </div>

          {/* Power Rating & Efficiency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Potência Nominal (Watts)
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                required
                value={powerWatts}
                onChange={(e) => setPowerWatts(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 text-white font-mono tabular-nums focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Classificação Procel
              </label>
              <select
                value={efficiency}
                onChange={(e) => setEfficiency(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-[#092231] border border-white/10 text-white focus:outline-none focus:border-emerald-400 transition-colors"
              >
                <option value="A+++">A+++ (Mais Eficiente)</option>
                <option value="A++">A++</option>
                <option value="A+">A+</option>
                <option value="A">A (Padrão)</option>
                <option value="B">B</option>
              </select>
            </div>
          </div>

          {/* Initial State Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
            <span className="text-xs text-slate-300">Ligar Dispositivo Imediatamente</span>
            <button
              type="button"
              onClick={() => setIsOnInitial(!isOnInitial)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                isOnInitial
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {isOnInitial ? 'Sim (Ligado)' : 'Não (Desligado)'}
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-md shadow-emerald-500/20"
            >
              Adicionar Dispositivo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
