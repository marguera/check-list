# Workflow Import Format - LLM Prompt

Use this prompt to convert extracted text (from ZIP files, with image placeholders) into the structured workflow format.

## Prompt Template

```
You are a workflow conversion assistant. Convert the following text (extracted from a ZIP file) into a structured YAML workflow format.

If the text contains image placeholders like [IMAGE:image-1], preserve them exactly as they appear in the instructions field.

Output format (YAML):

```yaml
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
```

## Format Rules:

1. **Workflow**:
   - `title` (required): The workflow title
   - `description` (optional): Brief description of the workflow

2. **Tasks**:
   - Each task must have a `step` number (sequential: 1, 2, 3, ...)
   - `title` (required): Task title
   - `description` (optional): Brief task description
   - `importance` (optional): "low" or "high"
   - `image` (optional): Reference to an image placeholder (e.g., "image-1", "image-2") that exists in the instructions. This image will be displayed in the task list. Use the placeholder name that appears in the instructions (e.g., [IMAGE:image-1] means use "image-1"). If not set, no image will show in the task list.
   - `instructions` (required): HTML-formatted instructions. Use HTML tags like `<p>`, `<ul>`, `<ol>`, `<li>`, `<strong>`, `<em>`, etc.
   - If the input text contains image placeholders like `[IMAGE:image-1]`, preserve them exactly in the instructions

3. **HTML Instructions**:
   - Use proper HTML tags
   - Use semantic HTML: `<p>` for paragraphs, `<ul>`/`<ol>` for lists, `<strong>` for emphasis, etc.
   - If the input contains image placeholders like `[IMAGE:image-1]`, preserve them exactly as they appear

## Example Output:

```yaml
workflow:
  title: "Website Deployment Checklist"
  description: "Complete checklist for deploying a website to production"

tasks:
  - step: 1
    title: "Prepare Environment"
    description: "Set up the deployment environment"
    importance: "high"
    instructions: |
      <p>Before deploying, ensure all environment variables are configured.</p>
      <p>Check the configuration file: [IMAGE:image-1]</p>
      <ul>
        <li>Verify database connection</li>
        <li>Check API keys</li>
      </ul>
  - step: 2
    title: "Run Tests"
    description: "Execute test suite before deployment"
    instructions: |
      <p>Run the full test suite to ensure everything passes.</p>
      <p>Test results should look like: [IMAGE:image-2]</p>
```

## Input Text:

[PASTE THE EXTRACTED TEXT HERE (from ZIP), INCLUDING IMAGE PLACEHOLDERS]

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
```

## Usage Instructions

1. Extract text from your PDF or ZIP file using the application's import feature:
   - **PDF**: Upload a PDF file - images and text will be extracted
   - **ZIP**: Upload a ZIP archive containing HTML files and images - HTML will be converted to text and images will be extracted
2. Copy the extracted text (which includes image placeholders like `[IMAGE:image-1]`)
3. Replace `[PASTE THE PDF-EXTRACTED TEXT HERE, INCLUDING IMAGE PLACEHOLDERS]` in the prompt above with your extracted text
4. Send the complete prompt to your LLM of choice (OpenAI GPT-4, Claude, etc.)
5. Copy the YAML output from the LLM
6. Paste it into the workflow import dialog in the application

## Notes

- HTML instructions should be well-formed and use semantic tags
- Step numbers will be automatically reordered if needed during import
- Preserve any image placeholders (like [IMAGE:image-1]) exactly as they appear in the input text

