import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, className = '' }) => {
  const pascalName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  const LucideIcon = (LucideIcons as any)[pascalName];
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return <LucideIcon size={size} className={className} />;
};

export default Icon;
