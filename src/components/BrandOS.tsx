import React from "react";
import { BrandOperatingEnvironment } from "./brand/BrandOperatingEnvironment";

interface BrandOSProps {
  onNotify: (msg: string, type?: "success" | "info" | "error") => void;
  onNavigateTab?: (tab: string) => void;
  standalone?: boolean;
}

export const BrandOS: React.FC<BrandOSProps> = ({ onNotify, onNavigateTab }) => {
  return (
    <BrandOperatingEnvironment onNotify={onNotify} onNavigateTab={onNavigateTab} />
  );
};

export default BrandOS;
