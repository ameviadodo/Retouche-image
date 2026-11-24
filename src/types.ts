export interface ImageMetrics {
  width: number;
  height: number;
  megapixels: number;
  channels: number;
  laplacianVariance: number;
  snrDb: number;
  dynamicRange: number;
  meanBrightness: number;
  stdDev: number;
  histogram?: {
    luminance: number[];
    b: number[];
    g: number[];
    r: number[];
  };
}

export interface ProcessResult {
  success: boolean;
  downloadToken: string;
  downloadUrl: string;
  processedImageBase64: string;
  metricsBefore: ImageMetrics;
  metricsAfter: ImageMetrics;
  algorithm: string;
  durationSeconds: number;
  reportSteps: string[];
  pythonCode: string;
  command: string;
  stdout?: string;
}

export interface CommandDef {
  key: string;
  name: string;
  category: 'resolution' | 'restore' | 'lighting' | 'portrait' | 'style' | 'composition';
  description: string;
  technicalDetails: string;
  iconName: string;
  badge?: string;
  params?: {
    name: string;
    label: string;
    type: 'slider' | 'select';
    min?: number;
    max?: number;
    step?: number;
    default: any;
    options?: { label: string; value: string }[];
  }[];
}

export interface SampleItem {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
  suggestedCommands: string[];
}
