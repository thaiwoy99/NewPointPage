// pointTypes.ts
import { Zap,ArrowRight , } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

 export type PointTypeDetails = {
  title: string;
  points: number;
  icon: LucideIcon;
  buttonText: string;
  buttonLink: string;
  buttonicon: LucideIcon;

};

export const PointTypes: PointTypeDetails[] = [
  {
    title: 'Referral Points',
    points: 21.0,
    icon: Zap,
    buttonText: 'Go to Referral Page',
    buttonLink: '/referral',
    buttonicon: ArrowRight,
  },
  {
    title: 'Swap Points',
    points: 21.0,
    icon: Zap,
    buttonText: 'Swap More Tokens',
    buttonLink: '/swap',
    buttonicon: ArrowRight,
  },
  {
    title: 'Bridge Points',
    points: 21.0,
    icon: Zap,
    buttonText: 'Bridge More Tokens',
    buttonLink: '/bridge',
    buttonicon: ArrowRight,
  },
  {
    title: 'Limit Order Points',
    points: 21.0,
    icon: Zap,
    buttonText: 'Use Limit Order',
    buttonLink: '/limit-order',
    buttonicon: ArrowRight,
  },
  {
    title: 'Partnership Points',
    points: 21.0,
    icon: Zap,
    buttonText: "Visit Partners' Tasks",
    buttonLink: '/partners',
    buttonicon: ArrowRight,
  },
];
