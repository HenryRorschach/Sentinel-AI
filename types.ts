export enum ThreatLevel {
  SAFE = 'SAFE',
  SUSPICIOUS = 'SUSPICIOUS',
  MALICIOUS = 'MALICIOUS',
  UNKNOWN = 'UNKNOWN'
}

export interface AnalysisResult {
  verdict: ThreatLevel;
  confidence: number;
  threatName: string | null;
  summary: string;
  detectedPatterns: string[];
  recommendation: string;
  technicalDetails: string;
}

export interface ScanHistoryItem {
  id: string;
  filename: string;
  timestamp: number;
  result: AnalysisResult;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}