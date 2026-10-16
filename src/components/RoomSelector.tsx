import React from 'react';
import { Room, Device } from '../types';
import { RoomIcon } from './RoomIcon';
import { Power, Lightbulb, Thermometer, Zap, Layers } from 'lucide-react';

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string | null) => void;
  devices: Device[];
  onTurnOffRoomDevices: (roomId: string) => void;
  onTurnOnRoomLights: (roomId: string) => void;
  onManageRoomsClick: () => void;
}

export const RoomSelector: React.FC<RoomSelectorProps> = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  devices,
  onTurnOffRoomDevices,
  onTurnOnRoomLights,
  onManageRoomsClick,
}) => {
  // Compute room stats
  const getRoomStats = (roomId: string) => {
    const roomDevices = devices.filter((d) => d.roomId === roomId);
    const activeCount = roomDevices.filter((d) => d.isOn).length;
    const totalWatts = roomDevices.reduce(
      (acc, d) => acc + (d.isOn ? d.currentWatts : d.standbyWatts),
      0
    );
    return {
      total: roomDevices.length,
      active: activeCount,
      watts: totalWatts,
    };
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const selectedRoomStats = selectedRoomId ? getRoomStats(selectedRoomId) : null;

  return (
    <div className="space-y-4">
      {/* Horizontal Scrollable Room Chips */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {/* All rooms button */}
          <button
            onClick={() => onSelectRoom(null)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedRoomId === null
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-[#092231]/60 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Todos os Cômodos</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-200 tabular-nums">
              {devices.length}
            </span>
          </button>

          {/* Each Room Chip */}
          {rooms.map((room) => {
            const stats = getRoomStats(room.id);
            const isSelected = selectedRoomId === room.id;

            return (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                    : 'bg-[#092231]/60 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${room.colorAccent || '#10b981'}25` }}
                >
                  <RoomIcon
                    name={room.iconName}
                    className="w-3.5 h-3.5"
                    style={{ color: room.colorAccent || '#10b981' }}
                  />
                </div>
                <span>{room.name}</span>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 tabular-nums">
                  <span className={stats.active > 0 ? 'text-emerald-300 font-semibold' : ''}>
                    {stats.active}/{stats.total}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Manage rooms link */}
        <button
          onClick={onManageRoomsClick}
          className="hidden sm:flex text-xs font-medium text-emerald-400 hover:text-emerald-300 whitespace-nowrap shrink-0 transition-colors"
        >
          Editar Cômodos →
        </button>
      </div>

      {/* Selected Room Context & Bulk Controls Banner */}
      {selectedRoom && selectedRoomStats && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#092231]/70 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-900 shadow-sm"
              style={{ backgroundColor: selectedRoom.colorAccent || '#10b981' }}
            >
              <RoomIcon name={selectedRoom.iconName} className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {selectedRoom.name}
                </h2>
                {selectedRoom.floor && (
                  <span className="text-[11px] text-slate-400 font-medium">
                    · {selectedRoom.floor}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span className="tabular-nums">{selectedRoom.currentTemp || 23}°C</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="tabular-nums font-medium text-emerald-300">
                    {selectedRoomStats.watts >= 1000
                      ? `${(selectedRoomStats.watts / 1000).toFixed(2)} kW`
                      : `${Math.round(selectedRoomStats.watts)} W`}
                  </span>
                </span>
                <span>·</span>
                <span>
                  {selectedRoomStats.active} de {selectedRoomStats.total} ligados
                </span>
              </div>
            </div>
          </div>

          {/* Quick Room Bulk Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTurnOnRoomLights(selectedRoom.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-200 border border-white/10 hover:border-emerald-500/30 transition-all"
              title="Ligar todas as luzes deste cômodo"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              <span>Ligar Luzes</span>
            </button>
            <button
              onClick={() => onTurnOffRoomDevices(selectedRoom.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 hover:border-rose-500/40 transition-all"
              title="Desligar todos os aparelhos deste cômodo"
            >
              <Power className="w-3.5 h-3.5 text-rose-400" />
              <span>Desligar Tudo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
