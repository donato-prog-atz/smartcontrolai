import React, { useState } from 'react';
import { Device, Room, TariffConfig } from '../types';
import {
  X,
  Power,
  Zap,
  Sliders,
  Activity,
  Trash2,
  Check,
  Thermometer,
  Lightbulb,
  Radio,
  Tv,
  Save,
  Volume2,
  Sparkles,
} from 'lucide-react';

interface DeviceDetailModalProps {
  device: Device;
  rooms: Room[];
  tariff: TariffConfig;
  onClose: () => void;
  onUpdateDevice: (updatedDevice: Device) => void;
  onDeleteDevice: (deviceId: string) => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({
  device,
  rooms,
  tariff,
  onClose,
  onUpdateDevice,
  onDeleteDevice,
}) => {
  const [activeTab, setActiveTab] = useState<'control' | 'energy' | 'settings'>('control');
  const [name, setName] = useState(device.name);
  const [roomId, setRoomId] = useState(device.roomId);
  const [powerRatingWatts, setPowerRatingWatts] = useState(device.powerRatingWatts);
  const [isDeleting, setIsDeleting] = useState(false);

  // Editable device controls state
  const [isOn, setIsOn] = useState(device.isOn);
  const [brightness, setBrightness] = useState(device.brightness || 80);
  const [colorHex, setColorHex] = useState(device.colorHex || '#fef08a');
  const [colorTemp, setColorTemp] = useState(device.colorTemp || 'warm');
  const [targetTemp, setTargetTemp] = useState(device.targetTemperature || 22);
  const [hvacMode, setHvacMode] = useState(device.hvacMode || 'cool');
  const [fanSpeed, setFanSpeed] = useState(device.fanSpeed || 'auto');
  const [volume, setVolume] = useState(device.volume || 40);
  const [isPlaying, setIsPlaying] = useState(device.isPlaying || false);
  const [isLocked, setIsLocked] = useState(device.isLocked ?? true);

  // Save changes
  const handleSave = () => {
    const updated: Device = {
      ...device,
      name,
      roomId,
      powerRatingWatts,
      isOn,
      currentWatts: isOn ? powerRatingWatts * (brightness / 100) : device.standbyWatts,
      brightness,
      colorHex,
      colorTemp,
      targetTemperature: targetTemp,
      hvacMode,
      fanSpeed,
      volume,
      isPlaying,
      isLocked,
    };
    onUpdateDevice(updated);
    onClose();
  };

  const currentRoom = rooms.find((r) => r.id === roomId);

  // Color presets for smart lights
  const lightColors = [
    { label: 'Branco Quente', hex: '#fef08a' },
    { label: 'Menta Suave', hex: '#34d399' },
    { label: 'Ciano Céu', hex: '#38bdf8' },
    { label: 'Azul Real', hex: '#60a5fa' },
    { label: 'Roxo Lavanda', hex: '#c084fc' },
    { label: 'Rosa Pôr do Sol', hex: '#f472b6' },
    { label: 'Âmbar Noturno', hex: '#f59e0b' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#092233] border border-emerald-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#071928]/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOn(!isOn)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isOn
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Power className="w-5 h-5 stroke-[2.2]" />
            </button>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight leading-tight">
                {name}
              </h2>
              <div className="text-xs text-slate-400 mt-0.5">
                <span>{currentRoom?.name || 'Sem cômodo'}</span> ·{' '}
                <span className={isOn ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {isOn ? 'Ligado' : 'Desligado / Standby'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subnav Tabs */}
        <div className="flex border-b border-white/10 bg-black/20 px-5 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('control')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'control'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Controles
          </button>
          <button
            onClick={() => setActiveTab('energy')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'energy'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Consumo de Energia
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Configurações
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: CONTROLS */}
          {activeTab === 'control' && (
            <div className="space-y-4">
              {/* Light Controls */}
              {device.type === 'light' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-200 mb-1.5 font-medium">
                      <span>Intensidade do Brilho</span>
                      <span className="font-mono tabular-nums text-emerald-300 font-bold">
                        {isOn ? `${brightness}%` : '0% (Desligado)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={isOn ? brightness : 0}
                      disabled={!isOn}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700 accent-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-2">
                      Paleta de Cores e Temperatura
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {lightColors.map((col) => (
                        <button
                          key={col.hex}
                          onClick={() => {
                            setColorHex(col.hex);
                            if (!isOn) setIsOn(true);
                          }}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                            colorHex === col.hex
                              ? 'border-white scale-110 shadow-md ring-2 ring-emerald-400/50'
                              : 'border-white/20 hover:scale-105'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.label}
                        >
                          {colorHex === col.hex && <Check className="w-4 h-4 text-slate-900" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-slate-400">Temperatura da Luz:</span>
                    {(['warm', 'neutral', 'cool'] as const).map((temp) => (
                      <button
                        key={temp}
                        onClick={() => setColorTemp(temp)}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                          colorTemp === temp
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {temp === 'warm' ? 'Quente' : temp === 'neutral' ? 'Neutra' : 'Fria'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Climate Controls */}
              {device.type === 'climate' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-black/25 border border-white/10 flex flex-col items-center">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Temperatura Desejada
                    </span>
                    <div className="flex items-center gap-4 my-2">
                      <button
                        onClick={() => setTargetTemp(Math.max(16, targetTemp - 1))}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center"
                      >
                        -
                      </button>
                      <div className="text-4xl font-extrabold text-sky-300 font-mono tabular-nums">
                        {targetTemp}°C
                      </div>
                      <button
                        onClick={() => setTargetTemp(Math.min(30, targetTemp + 1))}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-slate-400">
                      Ambiente atual: <span className="text-emerald-300 font-semibold">{currentRoom?.currentTemp || 23.5}°C</span>
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-2">
                      Modo de Climatização
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'cool', label: 'Frio' },
                        { id: 'heat', label: 'Calor' },
                        { id: 'eco', label: 'Eco' },
                        { id: 'auto', label: 'Automático' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setHvacMode(m.id as any)}
                          className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                            hvacMode === m.id
                              ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-2">
                      Velocidade da Ventilação
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['low', 'med', 'high', 'auto'] as const).map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setFanSpeed(speed)}
                          className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                            fanSpeed === speed
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {speed === 'low'
                            ? 'Baixa'
                            : speed === 'med'
                            ? 'Média'
                            : speed === 'high'
                            ? 'Alta'
                            : 'Auto'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Media Controls */}
              {device.type === 'media' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-black/25 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                          Reproduzindo Agora
                        </span>
                        <div className="text-sm font-semibold text-white mt-0.5">
                          {device.currentTrack || 'Nenhuma faixa selecionada'}
                        </div>
                      </div>
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isPlaying
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {isPlaying ? <Power className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                          Volume
                        </span>
                        <span className="font-mono tabular-nums text-teal-300 font-bold">
                          {volume}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700 accent-teal-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Lock Controls */}
              {device.type === 'security' && (
                <div className="p-4 rounded-xl bg-black/25 border border-white/10 text-center space-y-3">
                  <div className="text-sm font-semibold text-white">
                    Status da Tranca Digital
                  </div>
                  <div className="text-xs text-slate-400">
                    Bateria Nest x Yale: <span className="text-emerald-400 font-semibold font-mono">88%</span>
                  </div>
                  <button
                    onClick={() => setIsLocked(!isLocked)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                      isLocked
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    }`}
                  >
                    {isLocked ? 'Porta Trancada (Clique para Destrancar)' : 'Porta Destrancada (Clique para Trancar)'}
                  </button>
                </div>
              )}

              {/* General Power Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                <span className="text-xs text-slate-300">Alimentação Geral</span>
                <button
                  onClick={() => setIsOn(!isOn)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isOn
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {isOn ? 'Ligado' : 'Desligado'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ENERGY TELEMETRY */}
          {activeTab === 'energy' && (
            <div className="space-y-4">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-black/25 border border-white/10">
                  <span className="text-xs text-slate-400">Potência Nominal</span>
                  <div className="text-lg font-bold text-emerald-300 font-mono tabular-nums mt-0.5">
                    {powerRatingWatts} W
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Standby: {device.standbyWatts} W
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/25 border border-white/10">
                  <span className="text-xs text-slate-400">Eficiência Energética</span>
                  <div className="text-lg font-bold text-teal-300 font-mono mt-0.5">
                    {device.energy.efficiencyRating}
                  </div>
                  <span className="text-[11px] text-slate-500">Selo Procel A</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/25 border border-white/10">
                  <span className="text-xs text-slate-400">Consumo Hoje</span>
                  <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                    {device.energy.daily[device.energy.daily.length - 1]?.kwh || 0} kWh
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Custo:{' '}
                    <span className="text-emerald-400 font-semibold">
                      {tariff.currency}{' '}
                      {(
                        (device.energy.daily[device.energy.daily.length - 1]?.kwh || 0) *
                        tariff.ratePerKwh
                      ).toFixed(2)}
                    </span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/25 border border-white/10">
                  <span className="text-xs text-slate-400">Consumo Mensal</span>
                  <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                    {device.energy.monthly[device.energy.monthly.length - 1]?.kwh || 0} kWh
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Estimado:{' '}
                    <span className="text-emerald-400 font-semibold">
                      {tariff.currency}{' '}
                      {(
                        (device.energy.monthly[device.energy.monthly.length - 1]?.kwh || 0) *
                        tariff.ratePerKwh
                      ).toFixed(2)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Daily Energy Consumption Chart */}
              <div className="p-4 rounded-xl bg-black/25 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-200">
                    Histórico Recente (Últimos 7 Dias)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">kWh / dia</span>
                </div>

                <div className="flex items-end gap-2 h-28 pt-4">
                  {device.energy.daily.map((d) => {
                    const maxKwh = Math.max(...device.energy.daily.map((item) => item.kwh), 1);
                    const heightPercent = Math.max(12, (d.kwh / maxKwh) * 100);

                    return (
                      <div
                        key={d.date}
                        className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
                      >
                        <div className="text-[10px] font-mono text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                          {d.kwh}
                        </div>
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[10px] text-slate-400 font-medium">
                          {d.dayName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Nome do Dispositivo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Cômodo Associado
                </label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-[#092231] border border-white/10 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Potência Nominal de Consumo (Watts)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={powerRatingWatts}
                    onChange={(e) => setPowerRatingWatts(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-emerald-400 font-mono tabular-nums transition-colors"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">Watts</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Usado para o cálculo e previsão exata de consumo elétrico da fatura.
                </p>
              </div>

              {/* Danger Zone: Delete Device */}
              <div className="pt-4 border-t border-rose-500/20">
                {!isDeleting ? (
                  <button
                    onClick={() => setIsDeleting(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir este dispositivo</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                    <p className="text-xs text-rose-200">
                      Tem certeza que deseja remover este dispositivo da sua casa Google Home?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onDeleteDevice(device.id)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-500"
                      >
                        Confirmar Exclusão
                      </button>
                      <button
                        onClick={() => setIsDeleting(false)}
                        className="px-3 py-1 text-xs font-medium rounded-lg bg-white/10 text-slate-300 hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10 bg-[#071928]/90">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>
    </div>
  );
};
