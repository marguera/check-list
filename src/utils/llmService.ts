import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { loadLLMConfig } from './llmConfig';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

/**
 * Convert extracted text to YAML workflow format using LLM
 */
export async function convertTextToWorkflowYAML(
  extractedText: string
): Promise<string> {
  const config = await loadLLMConfig();

  if (!config.apiKey) {
    throw new Error('LLM API key is not configured. Please set it in config.json');
  }

  const prompt = generateWorkflowPrompt(extractedText);

  let model;
  if (config.provider === 'openai') {
    model = new ChatOpenAI({
      modelName: config.model,
      openAIApiKey: config.apiKey,
      temperature: 0.3, // Lower temperature for more consistent output
    });
  } else if (config.provider === 'anthropic') {
    model = new ChatAnthropic({
      modelName: config.model,
      anthropicApiKey: config.apiKey,
      temperature: 0.3,
    });
  } else if (config.provider === 'gemini') {
    model = new ChatGoogleGenerativeAI({
      model: config.model,
      apiKey: config.apiKey,
      temperature: 0.3,
    });
  } else {
    throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }

  try {
    const response = await model.invoke([
      new HumanMessage(prompt),
    ]);

    const yamlText = response.content as string;
    
    // Extract YAML from markdown code blocks if present
    const yamlMatch = yamlText.match(/```yaml\n([\s\S]*?)\n```/) || 
                      yamlText.match(/```\n([\s\S]*?)\n```/);
    
    return yamlMatch ? yamlMatch[1] : yamlText.trim();
  } catch (error: any) {
    console.error('LLM conversion error:', error);
    throw new Error(`LLM conversion failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Convert extracted text to YAML workflow format using LLM with streaming
 * Yields tokens as they are generated
 */
export async function* convertTextToWorkflowYAMLStream(
  extractedText: string
): AsyncGenerator<string, void, unknown> {
  const config = await loadLLMConfig();

  if (!config.apiKey) {
    throw new Error('LLM API key is not configured. Please set it in config.json');
  }

  const prompt = generateWorkflowPrompt(extractedText);

  let model: BaseChatModel;
  if (config.provider === 'openai') {
    model = new ChatOpenAI({
      modelName: config.model,
      openAIApiKey: config.apiKey,
      temperature: 0.3,
      streaming: true,
    });
  } else if (config.provider === 'anthropic') {
    model = new ChatAnthropic({
      modelName: config.model,
      anthropicApiKey: config.apiKey,
      temperature: 0.3,
      streaming: true,
    });
  } else if (config.provider === 'gemini') {
    model = new ChatGoogleGenerativeAI({
      model: config.model,
      apiKey: config.apiKey,
      temperature: 0.3,
      streaming: true,
    });
  } else {
    throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }

  try {
    const stream = await model.stream([
      new HumanMessage(prompt),
    ]);

    for await (const chunk of stream) {
      const content = chunk.content;
      if (typeof content === 'string' && content) {
        yield content;
      }
    }
  } catch (error: any) {
    console.error('LLM streaming error:', error);
    throw new Error(`LLM streaming failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Generate the workflow conversion prompt
 */
function generateWorkflowPrompt(extractedText: string): string {
  return `You are a workflow conversion assistant. Convert the following text (extracted from a ZIP file) into a structured YAML workflow format.

If the text contains image placeholders like [IMAGE:image-1], preserve them exactly as they appear in the instructions field.

Output format (YAML):

\`\`\`yaml
workflow:
  title: "Workflow Title"
  description: "Optional workflow description"

tasks:
  - step: 1
    title: "Task Title"
    description: "Task description"
    importance: "high"  # optional: "low" | "high"
    image: "image-1"  # optional: reference to an image placeholder (e.g., "image-1", "image-2") that exists in instructions. This will be used as the task list image.
    instructions: |
      <p>HTML content for instructions</p>
      <p>Reference images using: [IMAGE:image-1] or [IMAGE:image-2]</p>
\`\`\`

## Format Rules:

1. **Workflow**:
   - \`title\` (required): The workflow title
   - \`description\` (optional): Brief description of the workflow

2. **Tasks**:
   - Each task must have a \`step\` number (sequential: 1, 2, 3, ...)
   - \`title\` (required): Task title
   - \`description\` (optional): Brief task description
   - \`importance\` (optional): "low" or "high"
   - \`image\` (optional): Reference to an image placeholder (e.g., "image-1", "image-2") that exists in the instructions. This image will be displayed in the task list. Use the placeholder name that appears in the instructions (e.g., [IMAGE:image-1] means use "image-1"). If not set, no image will show in the task list.
   - \`instructions\` (required): HTML-formatted instructions. Use HTML tags like <p>, <ul>, <ol>, <li>, <strong>, <em>, etc.
   - If the input text contains image placeholders like \`[IMAGE:image-1]\`, preserve them exactly in the instructions

3. **HTML Instructions**:
   - Use proper HTML tags
   - Use semantic HTML: <p> for paragraphs, <ul>/<ol> for lists, <strong> for emphasis, etc.
   - If the input contains image placeholders like \`[IMAGE:image-1]\`, preserve them exactly as they appear

## Instructions:

1. Analyze the input text and identify distinct tasks/steps
2. Extract workflow title and description from the content
3. For each task, create a structured entry with:
   - Step number
   - Title (concise, action-oriented)
   - Description (brief summary)
   - Instructions (detailed HTML-formatted content)
4. If the input contains image placeholders like [IMAGE:image-1], preserve them exactly in the instructions
5. Output only valid YAML, ready to be parsed

## Input Text:

${extractedText}`;
}

