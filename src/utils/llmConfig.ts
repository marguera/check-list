/**
 * Load LLM configuration from config.json
 * For GitHub Pages, this file can be updated via repository settings
 */
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'gemini';
  model: string;
  apiKey: string;
}

let cachedConfig: LLMConfig | null = null;

export async function loadLLMConfig(): Promise<LLMConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    // Try to load from public/config.json (for GitHub Pages with base path)
    const response = await fetch('/check-list/config.json');
    if (!response.ok) {
      // Fallback: try root path (for local development or different base paths)
      const rootResponse = await fetch('/config.json');
      if (!rootResponse.ok) {
        throw new Error(`Failed to load config: ${response.statusText}`);
      }
      const rootData = await rootResponse.json();
      cachedConfig = rootData.llm as LLMConfig;
      return cachedConfig;
    }
    const data = await response.json();
    cachedConfig = data.llm as LLMConfig;
    return cachedConfig;
  } catch (error) {
    console.error('Error loading LLM config:', error);
    // Return default config if file doesn't exist
    return {
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: '',
    };
  }
}
