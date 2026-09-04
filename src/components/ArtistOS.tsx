import React from 'react';
import { ArtistOperatingEnvironment } from './artist/ArtistOperatingEnvironment';
import { ActiveTab } from '../types';

interface ArtistOSProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onNotify?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ArtistOS: React.FC<ArtistOSProps> = ({ onNavigateTab, onNotify }) => {
  return (
    <ArtistOperatingEnvironment onNavigateTab={onNavigateTab} onNotify={onNotify} />
  );
};

export default ArtistOS;
