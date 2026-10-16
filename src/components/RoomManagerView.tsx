import React, { useState } from 'react';
import { Room, Device } from '../types';
import { RoomIcon } from './RoomIcon';
import {
  Plus,
  Trash2,
  Edit2,
  Thermometer,
  Zap,
  Power,
  Layers,
  Check,
  X,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';

interface RoomManagerViewProps {
  rooms: Room[];
  devices: Device[];
  onAddRoom: (newRoom: Room) => void;
  onUpdateRoom: (updatedRoom: Room) => void;
  onDeleteRoom: (roomId: string, fallbackRoomId?: string) => void;
  onToggleDevice: (deviceId: string) => void;
  onTurnOffRoomDevices: (roomId: string) => void;
  onTurnOnRoomLights: (roomId: string) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Sofa', label: 'Sala' },
  { name: 'UtensilsCrossed', label: 'Cozinha' },
  { name: 'BedDouble', label: 'Quarto' },
  { name: 'Briefcase', label: 'Escritório' },
  { name: 'Bath', label: 'Banheiro' },
  { name: 'DoorOpen', label: 'Entrada' },
  { name: 'SunMedium', label: 'Varanda / Quintal' },
  { name: 'Tv', label: 'Cinema / Lazer' },
  { name: 'Warehouse', label: 'Garagem' },
];

const COLOR_ACCENTS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
];

export const RoomManagerView: React.FC<RoomManagerViewProps> = ({
  rooms,
  devices,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onToggleDevice,
  onTurnOffRoomDevices,
  onTurnOnRoomLights,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [fallbackRoomId, setFallbackRoomId] = useState<string>('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formFloor, setFormFloor] = useState('1º Andar');
  const [formIcon, setFormIcon] = useState('Sofa');
  const [formColor, setFormColor] = useState('#10b981');
  const [formTemp, setFormTemp] = useState(22);

  const openCreateModal = () => {
    setFormName('');
    setFormFloor('1º Andar');
    setFormIcon('Sofa');
    setFormColor('#10b981');
    setFormTemp(22);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormName(room.name);
    setFormFloor(room.floor || '1º Andar');
    setFormIcon(room.iconName);
    setFormColor(room.colorAccent || '#10b981');
    setFormTemp(room.targetTemp || 22);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: formName.trim(),
      floor: formFloor,
      iconName: formIcon,
      colorAccent: formColor,
      targetTemp: formTemp,
      currentTemp: formTemp + (Math.random() > 0.5 ? 0.8 : -0.5),
    };

    onAddRoom(newRoom);
    setIsCreateModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !formName.trim()) return;

    const updated: Room = {
      ...editingRoom,
      name: formName.trim(),
      floor: formFloor,
      iconName: formIcon,
      colorAccent: formColor,
      targetTemp: formTemp,
    };

    onUpdateRoom(updated);
    setEditingRoom(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingRoomId) return;
    onDeleteRoom(deletingRoomId, fallbackRoomId || undefined);
    setDeletingRoomId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Gerenciador de Cômodos Google Home
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Crie, organize e configure os ambientes da sua casa e os aparelhos vinculados.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-md shadow-emerald-500/20 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Cômodo</span>
        </button>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((room) => {
          const roomDevices = devices.filter((d) => d.roomId === room.id);
          const activeCount = roomDevices.filter((d) => d.isOn).length;
          const totalWatts = roomDevices.reduce(
            (acc, d) => acc + (d.isOn ? d.currentWatts : d.standbyWatts),
            0
          );

          return (
            <div
              key={room.id}
              className="rounded-2xl bg-[#092231]/80 border border-white/10 backdrop-blur-sm p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-950 shadow-md shrink-0"
                      style={{ backgroundColor: room.colorAccent || '#10b981' }}
                    >
                      <RoomIcon name={room.iconName} className="w-6 h-6 text-slate-950" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">
                        {room.name}
                      </h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {room.floor || 'Geral'} · {roomDevices.length} dispositivos
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(room)}
                      title="Editar Cômodo"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {rooms.length > 1 && (
                      <button
                        onClick={() => {
                          setDeletingRoomId(room.id);
                          const otherRooms = rooms.filter((r) => r.id !== room.id);
                          setFallbackRoomId(otherRooms[0]?.id || '');
                        }}
                        title="Excluir Cômodo"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
                  <div className="p-2 rounded-xl bg-black/20">
                    <span className="text-[10px] text-slate-400 block">Temperatura</span>
                    <span className="text-xs font-bold text-sky-300 font-mono tabular-nums">
                      {room.currentTemp || 23}°C
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/20">
                    <span className="text-[10px] text-slate-400 block">Em Uso</span>
                    <span className="text-xs font-bold text-emerald-300 font-mono tabular-nums">
                      {activeCount} / {roomDevices.length}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/20">
                    <span className="text-[10px] text-slate-400 block">Potência</span>
                    <span className="text-xs font-bold text-teal-300 font-mono tabular-nums">
                      {totalWatts >= 1000
                        ? `${(totalWatts / 1000).toFixed(1)} kW`
                        : `${Math.round(totalWatts)} W`}
                    </span>
                  </div>
                </div>

                {/* Device List in this room */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Dispositivos Instalados ({roomDevices.length})
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {roomDevices.length === 0 ? (
                      <div className="text-xs text-slate-500 py-2">
                        Nenhum dispositivo neste cômodo.
                      </div>
                    ) : (
                      roomDevices.map((dev) => (
                        <div
                          key={dev.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-black/20 text-xs border border-white/5"
                        >
                          <span className="text-slate-200 truncate max-w-[170px]">
                            {dev.name}
                          </span>
                          <button
                            onClick={() => onToggleDevice(dev.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                              dev.isOn
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            {dev.isOn ? 'Ligado' : 'Desligado'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Room Quick Actions */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => onTurnOnRoomLights(room.id)}
                  className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-xs font-medium text-slate-200 hover:text-emerald-200 border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                  <span>Luzes</span>
                </button>
                <button
                  onClick={() => onTurnOffRoomDevices(room.id)}
                  className="flex-1 py-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-900/30 text-xs font-medium text-rose-300 border border-rose-500/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5 text-rose-400" />
                  <span>Desligar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE ROOM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#092233] border border-emerald-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Criar Novo Cômodo
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nome do Cômodo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Suíte Hóspedes, Jardim de Inverno..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Andar / Setor
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1º Andar, Térreo, Cobertura..."
                  value={formFloor}
                  onChange={(e) => setFormFloor(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">
                  Ícone Representativo
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => setFormIcon(icon.name)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        formIcon === icon.name
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <RoomIcon name={icon.name} className="w-5 h-5" />
                      <span className="text-[10px] truncate max-w-full">{icon.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">
                  Cor de Identificação
                </label>
                <div className="flex gap-2">
                  {COLOR_ACCENTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-8 h-8 rounded-full border transition-all ${
                        formColor === c ? 'border-white scale-110 ring-2 ring-emerald-400' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300"
                >
                  Criar Cômodo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROOM MODAL */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#092233] border border-emerald-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-400" />
                Editar Cômodo: {editingRoom.name}
              </h3>
              <button
                onClick={() => setEditingRoom(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nome do Cômodo
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Andar / Setor
                </label>
                <input
                  type="text"
                  value={formFloor}
                  onChange={(e) => setFormFloor(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">
                  Ícone
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => setFormIcon(icon.name)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        formIcon === icon.name
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <RoomIcon name={icon.name} className="w-5 h-5" />
                      <span className="text-[10px] truncate max-w-full">{icon.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">
                  Cor
                </label>
                <div className="flex gap-2">
                  {COLOR_ACCENTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-8 h-8 rounded-full border transition-all ${
                        formColor === c ? 'border-white scale-110 ring-2 ring-emerald-400' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingRoomId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#092233] border border-rose-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Excluir Cômodo</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Existem dispositivos vinculados a este cômodo. Escolha para qual cômodo deseja transferi-los:
            </p>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Transferir dispositivos para:
              </label>
              <select
                value={fallbackRoomId}
                onChange={(e) => setFallbackRoomId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-emerald-400"
              >
                {rooms
                  .filter((r) => r.id !== deletingRoomId)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setDeletingRoomId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-500"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
