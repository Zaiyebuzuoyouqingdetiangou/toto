export interface ConnectionSettings {
  independentConnectionProfileId: string;
  independentApiBaseUrl: string;
  independentApiModel: string;
  independentApiTemperature: number;
  independentApiMaxTokens: number;
  independentMaxRequestChars: number;
  independentContextMaxLayers: number;
  independentContextExcludedTags: string[];
  independentReadCharacterCardSummary: boolean;
  independentReadPersonaSummary: boolean;
  hasApiKey: boolean;
}
export interface MemorySettings {
  memoryScanEnabled: boolean;
  memoryWorldBookEnabled: boolean;
  memoryWorldBookId: string;
  memoryProviderIds: string[];
  memoryMaxChars: number;
}
export interface MemoryResult {
  enabled: boolean;
  text: string;
  sources: string[];
  errorCount: number;
}
export interface RabbitMirrorPublicAPI {
  readonly version: '1.0.0';
  getStatus(): { version: string; busy: boolean; capabilities: string[] };
  connection: {
    getSettings(): ConnectionSettings;
    updateSettings(patch: Partial<Omit<ConnectionSettings, 'hasApiKey'>> & { independentApiKey?: string }): ConnectionSettings;
    listProfiles(): Promise<{ id: string; name: string }[]>;
    listModels(): Promise<string[]>;
  };
  memory: {
    getSettings(): MemorySettings;
    updateSettings(patch: Partial<MemorySettings>): MemorySettings;
    listProviders(): Promise<{ id: string; name: string; readable: boolean; selectedAllowed: boolean }[]>;
    listWorldBooks(): Promise<{ fileId: string; displayName: string }[]>;
    read(): Promise<MemoryResult>;
  };
  generate(options: { prompt: string; systemPrompt?: string; includeMemory?: boolean; manualRetry?: boolean; timeoutMs?: number }): Promise<{ text: string; requestCount: number }>;
  stop(): boolean;
}
declare global { interface Window { RabbitMirrorAPI?: RabbitMirrorPublicAPI } }
