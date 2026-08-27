import React from "react";
import { BrandBusinessDashboard } from "./brand/BrandBusinessDashboard";

interface BrandOSProps {
  onNotify: (msg: string, type?: "success" | "info" | "error") => void;
  onNavigateTab?: (tab: string) => void;
}

export const BrandOS: React.FC<BrandOSProps> = ({ onNotify, onNavigateTab }) => {
  return (
    <BrandBusinessDashboard onNotify={onNotify} onNavigateTab={onNavigateTab} />
  );
};
