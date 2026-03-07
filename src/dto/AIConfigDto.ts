export class UpdateAIConfigDto {
  enabled?: boolean;
  prompt?: string;
}

export class CreateAIConfigDto {
  fieldName!: string;
  displayName!: string;
  enabled?: boolean;
  prompt?: string;
}

export class AIConfigGlobalSettingsDto {
  apiKey?: string;
  apiEndpoint?: string;
  updateFrequency?: number; // в часах
  defaultPrompt?: string; // Общий промпт для всех запросов
}
