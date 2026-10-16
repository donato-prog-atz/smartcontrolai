export type DeviceType = 
  | 'light'
  | 'climate'
  | 'media'
  | 'plug'
  | 'security'
  | 'vacuum'
  | 'appliance';

export type TimePeriod = '24h' | '7d' | '30d' | '12m';

export interface Room {
  id: string;
  name: string;
  iconName: string;
  floor?: string;
  targetTemp?: number;
  currentTemp?: number;
  colorAccent?: string;
}

export interface DeviceEnergyData {
  hourly: { hour: string; kwh: number; cost: number; isPeak?: boolean }[];
  daily: { date: string; dayName: string; kwh: number; cost: number }[];
  monthly: { month: string; kwh: number; cost: number }[];
  activeHoursToday: number;
  activeHoursWeek: number;
  activeHoursMonth: number;
  activeHoursYear: number;
  efficiencyRating: 'A+++' | 'A++' | 'A+' | 'A' | 'B' | 'C';
}

export interface Device {
  id: string;
  name: string;
  roomId: string;
  type: DeviceType;
  isOn: boolean;
  powerRatingWatts: number; // Nominal power rating when active
  currentWatts: number; // Real-time consumption
  standbyWatts: number; // Consumption when off/standby
  
  // Specific device attributes
  brightness?: number; // 0 - 100
  colorHex?: string;
  colorTemp?: 'warm' | 'neutral' | 'cool';
  targetTemperature?: number; // e.g. 21°C
  currentTemperature?: number;
  hvacMode?: 'cool' | 'heat' | 'eco' | 'auto' | 'off';
  fanSpeed?: 'low' | 'med' | 'high' | 'auto';
  volume?: number; // 0 - 100
  isPlaying?: boolean;
  currentTrack?: string;
  isLocked?: boolean;
  cleaningStatus?: 'cleaning' | 'docked' | 'paused';
  batteryPercent?: number;

  energy: DeviceEnergyData;
}

export interface TariffConfig {
  ratePerKwh: number; // e.g. 0.85 (R$ / kWh)
  currency: string;   // 'R$'
  peakRateMultiplier: number; // 1.35
}

export interface Routine {
  id: string;
  name: string;
  iconName: string;
  description: string;
  color: string;
  action: () => void;
}
