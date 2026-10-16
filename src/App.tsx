import React, { useState, useEffect, useMemo } from 'react';
import { Room, Device, TariffConfig } from './types';
import { INITIAL_ROOMS, INITIAL_DEVICES, INITIAL_TARIFF } from './data/initialData';
import { Header } from './components/Header';
import { RoomSelector } from './components/RoomSelector';
import { DeviceCard } from './components/DeviceCard';
import { DeviceDetailModal } from './components/DeviceDetailModal';
import { AddDeviceModal } from './components/AddDeviceModal';
import { RoomManagerView } from './components/RoomManagerView';
import { EnergyAnalyticsView } from './components/EnergyAnalyticsView';
import { TariffModal } from './components/TariffModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Layers, Plus, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Load state from localStorage or initial dataset
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('homehub_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem('homehub_devices');
    return saved ? JSON.parse(saved) : INITIAL_DEVICES;
  });

  const [tariff, setTariff] = useState<TariffConfig>(() => {
    const saved = localStorage.getItem('homehub_tariff');
    return saved ? JSON.parse(saved) : INITIAL_TARIFF;
  });

  const [activeHouseName, setActiveHouseName] = useState('Residência Principal');
  const [currentTab, setCurrentTab] = useState<'devices' | 'analytics' | 'rooms'>('devices');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Modals & Drawers
  const [detailDevice, setDetailDevice] = useState<Device | null>(null);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'warning', title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('homehub_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('homehub_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('homehub_tariff', JSON.stringify(tariff));
  }, [tariff]);

  // Aggregate metrics
  const totalLiveWatts = useMemo(() => {
    return devices.reduce((acc, dev) => {
      return acc + (dev.isOn ? dev.currentWatts : dev.standbyWatts);
    }, 0);
  }, [devices]);

  const activeDevicesCount = useMemo(() => {
    return devices.filter((d) => d.isOn).length;
  }, [devices]);

  // Device Toggle Handler
  const handleToggleDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === deviceId) {
          const nextState = !dev.isOn;
          return {
            ...dev,
            isOn: nextState,
            currentWatts: nextState ? dev.powerRatingWatts * (dev.brightness ? dev.brightness / 100 : 1) : dev.standbyWatts,
          };
        }
        return dev;
      })
    );
  };

  // Device quick inline adjustments
  const handleQuickBrightnessChange = (deviceId: string, brightness: number) => {
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === deviceId) {
          const watts = Math.max(2, Math.round(dev.powerRatingWatts * (brightness / 100)));
          return {
            ...dev,
            brightness,
            currentWatts: watts,
          };
        }
        return dev;
      })
    );
  };

  const handleQuickTempChange = (deviceId: string, delta: number) => {
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === deviceId) {
          const current = dev.targetTemperature || 22;
          const updated = Math.min(30, Math.max(16, current + delta));
          return {
            ...dev,
            targetTemperature: updated,
          };
        }
        return dev;
      })
    );
  };

  const handleQuickVolumeChange = (deviceId: string, volume: number) => {
    setDevices((prev) =>
      prev.map((dev) => (dev.id === deviceId ? { ...dev, volume } : dev))
    );
  };

  const handleTogglePlay = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((dev) => (dev.id === deviceId ? { ...dev, isPlaying: !dev.isPlaying } : dev))
    );
  };

  const handleToggleLock = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === deviceId) {
          const nextLock = !dev.isLocked;
          addToast(
            'info',
            nextLock ? 'Porta Trancada' : 'Porta Destrancada',
            dev.name
          );
          return { ...dev, isLocked: nextLock };
        }
        return dev;
      })
    );
  };

  // Bulk room controls
  const handleTurnOffRoomDevices = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.roomId === roomId) {
          return { ...dev, isOn: false, currentWatts: dev.standbyWatts };
        }
        return dev;
      })
    );
    addToast('info', 'Cômodo Desligado', `Todos os aparelhos de ${room?.name || 'cômodo'} foram desligados.`);
  };

  const handleTurnOnRoomLights = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.roomId === roomId && dev.type === 'light') {
          return {
            ...dev,
            isOn: true,
            currentWatts: dev.powerRatingWatts * (dev.brightness ? dev.brightness / 100 : 1),
          };
        }
        return dev;
      })
    );
    addToast('success', 'Iluminação Ativada', `Luzes de ${room?.name || 'cômodo'} foram ligadas.`);
  };

  // Google Home Routines Runner
  const handleRunRoutine = (routineId: string) => {
    if (routineId === 'night') {
      // Modo Noite: desliga TVs, luzes da sala e cozinha, tranca portas, deixa ar em 22°C Eco
      setDevices((prev) =>
        prev.map((dev) => {
          if (dev.type === 'light' && dev.roomId !== 'room-master-bed') {
            return { ...dev, isOn: false, currentWatts: dev.standbyWatts };
          }
          if (dev.type === 'media') {
            return { ...dev, isOn: false, isPlaying: false, currentWatts: dev.standbyWatts };
          }
          if (dev.type === 'security') {
            return { ...dev, isLocked: true };
          }
          if (dev.type === 'climate') {
            return { ...dev, hvacMode: 'eco', targetTemperature: 22 };
          }
          return dev;
        })
      );
      addToast(
        'success',
        'Rotina: Modo Noite Executado',
        'Luzes secundárias desligadas, portas trancadas e ar-condicionado em modo Eco.'
      );
    } else if (routineId === 'away') {
      // Sair de Casa: desliga tudo menos geladeira e segurança
      setDevices((prev) =>
        prev.map((dev) => {
          if (dev.type === 'appliance' && dev.name.toLowerCase().includes('geladeira')) {
            return dev;
          }
          if (dev.type === 'security') {
            return { ...dev, isLocked: true };
          }
          return { ...dev, isOn: false, currentWatts: dev.standbyWatts };
        })
      );
      addToast(
        'warning',
        'Rotina: Sair de Casa Ativada',
        'Economia máxima ativada! Apenas a geladeira e a segurança digital permanecem ativas.'
      );
    } else if (routineId === 'eco') {
      // Economia Eco: reduz brilho de todas as lâmpadas acesas para 40%, ar condicionado em 24°C Eco
      setDevices((prev) =>
        prev.map((dev) => {
          if (dev.type === 'light' && dev.isOn) {
            return {
              ...dev,
              brightness: 40,
              currentWatts: Math.round(dev.powerRatingWatts * 0.4),
            };
          }
          if (dev.type === 'climate' && dev.isOn) {
            return {
              ...dev,
              hvacMode: 'eco',
              targetTemperature: 24,
              currentWatts: Math.round(dev.powerRatingWatts * 0.65),
            };
          }
          return dev;
        })
      );
      addToast(
        'success',
        'Modo Economia Inteligente Ativo',
        'Lâmpadas reduzidas para 40% e climatização estabilizada em 24°C Eco.'
      );
    } else if (routineId === 'welcome') {
      // Chegar em Casa: liga luz da entrada e sala, liga ar em 22°C
      setDevices((prev) =>
        prev.map((dev) => {
          if (dev.roomId === 'room-entrance' || dev.roomId === 'room-living') {
            if (dev.type === 'light') {
              return {
                ...dev,
                isOn: true,
                brightness: 80,
                currentWatts: Math.round(dev.powerRatingWatts * 0.8),
              };
            }
            if (dev.type === 'climate') {
              return {
                ...dev,
                isOn: true,
                targetTemperature: 22,
                currentWatts: Math.round(dev.powerRatingWatts * 0.75),
              };
            }
          }
          return dev;
        })
      );
      addToast(
        'success',
        'Bem-vindo de Volta!',
        'Luzes do Hall e Sala ligadas, climatização ajustada para 22°C.'
      );
    }
  };

  // Add / Edit / Delete Device
  const handleAddDevice = (newDevice: Device) => {
    setDevices((prev) => [newDevice, ...prev]);
    addToast('success', 'Dispositivo Adicionado', `${newDevice.name} foi pareado com sucesso.`);
  };

  const handleUpdateDevice = (updatedDevice: Device) => {
    setDevices((prev) => prev.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)));
    addToast('info', 'Dispositivo Atualizado', `${updatedDevice.name} salvo com sucesso.`);
  };

  const handleDeleteDevice = (deviceId: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    if (detailDevice?.id === deviceId) {
      setDetailDevice(null);
    }
    addToast('warning', 'Dispositivo Removido', `${dev?.name || 'Dispositivo'} foi removido.`);
  };

  // Room Management Handlers
  const handleAddRoom = (newRoom: Room) => {
    setRooms((prev) => [...prev, newRoom]);
    addToast('success', 'Cômodo Criado', `${newRoom.name} adicionado ao Google Home.`);
  };

  const handleUpdateRoom = (updatedRoom: Room) => {
    setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
    addToast('info', 'Cômodo Atualizado', `${updatedRoom.name} salvo.`);
  };

  const handleDeleteRoom = (roomId: string, fallbackRoomId?: string) => {
    const deletedRoom = rooms.find((r) => r.id === roomId);
    // If fallback room specified, move devices to it
    if (fallbackRoomId) {
      setDevices((prev) =>
        prev.map((d) => (d.roomId === roomId ? { ...d, roomId: fallbackRoomId } : d))
      );
    } else {
      // Remove devices or leave in first room
      const firstOtherRoom = rooms.find((r) => r.id !== roomId);
      if (firstOtherRoom) {
        setDevices((prev) =>
          prev.map((d) => (d.roomId === roomId ? { ...d, roomId: firstOtherRoom.id } : d))
        );
      }
    }

    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    if (selectedRoomId === roomId) {
      setSelectedRoomId(null);
    }
    addToast('warning', 'Cômodo Excluído', `${deletedRoom?.name || 'Cômodo'} foi removido.`);
  };

  // Filter devices by selected room
  const displayedDevices = useMemo(() => {
    if (!selectedRoomId) return devices;
    return devices.filter((d) => d.roomId === selectedRoomId);
  }, [devices, selectedRoomId]);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col bg-gradient-to-br from-[#061626] via-[#092534] via-60% to-[#115448]">
      {/* Ambient background glow accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-teal-400/10 blur-3xl"></div>
        <div className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-3xl"></div>
      </div>

      {/* Main App Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          activeHouseName={activeHouseName}
          setActiveHouseName={setActiveHouseName}
          onOpenAddDevice={() => setIsAddDeviceOpen(true)}
          onRunRoutine={handleRunRoutine}
          totalLiveWatts={totalLiveWatts}
          totalDevicesCount={devices.length}
          activeDevicesCount={activeDevicesCount}
          onOpenTariffModal={() => setIsTariffModalOpen(true)}
        />

        {/* Main Body Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* TAB 1: CÔMODOS & DISPOSITIVOS */}
          {currentTab === 'devices' && (
            <div className="space-y-6">
              {/* Room Filter Bar */}
              <RoomSelector
                rooms={rooms}
                selectedRoomId={selectedRoomId}
                onSelectRoom={setSelectedRoomId}
                devices={devices}
                onTurnOffRoomDevices={handleTurnOffRoomDevices}
                onTurnOnRoomLights={handleTurnOnRoomLights}
                onManageRoomsClick={() => setCurrentTab('rooms')}
              />

              {/* Devices Grid Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {selectedRoomId
                      ? `Dispositivos em ${rooms.find((r) => r.id === selectedRoomId)?.name}`
                      : 'Todos os Dispositivos Conectados'}
                  </h2>
                  <span className="text-xs text-slate-300">
                    {displayedDevices.length} aparelhos pareados ·{' '}
                    <span className="text-emerald-300 font-semibold">
                      {displayedDevices.filter((d) => d.isOn).length} ligados agora
                    </span>
                  </span>
                </div>

                <button
                  onClick={() => setIsAddDeviceOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Novo Dispositivo</span>
                </button>
              </div>

              {/* Devices Grid */}
              {displayedDevices.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#092231]/60 border border-white/10 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 mx-auto flex items-center justify-center text-slate-400">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    Nenhum dispositivo neste cômodo
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Adicione lâmpadas, ar-condicionado, Smart TVs ou tomadas para começar a controlar.
                  </p>
                  <button
                    onClick={() => setIsAddDeviceOpen(true)}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-md"
                  >
                    Adicionar Aparelho Agora
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedDevices.map((device) => {
                    const room = rooms.find((r) => r.id === device.roomId);
                    return (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        room={room}
                        onToggle={handleToggleDevice}
                        onOpenDetails={setDetailDevice}
                        onQuickBrightnessChange={handleQuickBrightnessChange}
                        onQuickTempChange={handleQuickTempChange}
                        onQuickVolumeChange={handleQuickVolumeChange}
                        onTogglePlay={handleTogglePlay}
                        onToggleLock={handleToggleLock}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ANÁLISE DE CONSUMO DE ENERGIA */}
          {currentTab === 'analytics' && (
            <EnergyAnalyticsView
              devices={devices}
              rooms={rooms}
              tariff={tariff}
              onOpenTariffModal={() => setIsTariffModalOpen(true)}
              onToggleDevice={handleToggleDevice}
              onSelectDevice={setDetailDevice}
            />
          )}

          {/* TAB 3: GERENCIADOR DE CÔMODOS */}
          {currentTab === 'rooms' && (
            <RoomManagerView
              rooms={rooms}
              devices={devices}
              onAddRoom={handleAddRoom}
              onUpdateRoom={handleUpdateRoom}
              onDeleteRoom={handleDeleteRoom}
              onToggleDevice={handleToggleDevice}
              onTurnOffRoomDevices={handleTurnOffRoomDevices}
              onTurnOnRoomLights={handleTurnOnRoomLights}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/10 bg-[#061726]/80 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 text-center">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              HomeHub Google Home Manager · Gerenciamento residencial e telemetria energética
            </span>
            <div className="flex items-center gap-3">
              <span>Tarifa ativa: {tariff.currency} {tariff.ratePerKwh.toFixed(2)} / kWh</span>
              <span>·</span>
              <button
                onClick={() => setIsTariffModalOpen(true)}
                className="text-emerald-400 hover:underline"
              >
                Ajustar Tarifa
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {detailDevice && (
        <DeviceDetailModal
          device={detailDevice}
          rooms={rooms}
          tariff={tariff}
          onClose={() => setDetailDevice(null)}
          onUpdateDevice={handleUpdateDevice}
          onDeleteDevice={handleDeleteDevice}
        />
      )}

      {isAddDeviceOpen && (
        <AddDeviceModal
          rooms={rooms}
          initialRoomId={selectedRoomId}
          tariff={tariff}
          onClose={() => setIsAddDeviceOpen(false)}
          onAddDevice={handleAddDevice}
        />
      )}

      {isTariffModalOpen && (
        <TariffModal
          tariff={tariff}
          onClose={() => setIsTariffModalOpen(false)}
          onSave={setTariff}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
