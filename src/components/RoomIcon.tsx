import React from 'react';
import {
  Sofa,
  UtensilsCrossed,
  BedDouble,
  Briefcase,
  DoorOpen,
  SunMedium,
  Bath,
  Tv,
  Warehouse,
  Sparkles,
  LucideProps,
} from 'lucide-react';

interface RoomIconProps extends LucideProps {
  name: string;
}

export const RoomIcon: React.FC<RoomIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'Sofa':
      return <Sofa {...props} />;
    case 'UtensilsCrossed':
      return <UtensilsCrossed {...props} />;
    case 'BedDouble':
      return <BedDouble {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'DoorOpen':
      return <DoorOpen {...props} />;
    case 'SunMedium':
      return <SunMedium {...props} />;
    case 'Bath':
      return <Bath {...props} />;
    case 'Tv':
      return <Tv {...props} />;
    case 'Warehouse':
      return <Warehouse {...props} />;
    default:
      return <Sparkles {...props} />;
  }
};
