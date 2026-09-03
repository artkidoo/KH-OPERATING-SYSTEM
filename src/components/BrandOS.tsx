import React from "react";
import { BrandBusinessDashboard } from "./brand/BrandBusinessDashboard";

interface BrandOSProps {
  onNotify: (msg: string, type?: "success" | "info" | "error") => void;
  onNavigateTab?: (tab: string) => void;
  standalone?: boolean;
}

export const BrandOS: React.FC<BrandOSProps> = ({ onNotify, onNavigateTab, standalone = false }) => {
  return (
    <BrandBusinessDashboard onNotify={onNotify} onNavigateTab={onNavigateTab} standalone={standalone} />
  );
};
