# LLM Configuration

This application uses LangChain to automatically convert extracted text to workflow YAML format.

## Configuration File

The LLM configuration is stored in `public/config.json`. This file is loaded at runtime and can be updated for GitHub Pages deployments.

### File Location
- **Development**: `public/config.json`
- **Production (GitHub Pages)**: `/check-list/config.json` (accessible via the public folder)

### Configuration Format

```json
{
  "llm": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "apiKey": "your-api-key-here"
  }
}
```

### Supported Providers

1. **OpenAI** (`provider: "openai"`)
   - Models: `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo`, etc.
   - API Key: Get from https://platform.openai.com/api-keys

2. **Anthropic** (`provider: "anthropic"`)
   - Models: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, `claude-3-sonnet-20240229`, etc.
   - API Key: Get from https://console.anthropic.com/

3. **Google Gemini** (`provider: "gemini"`)
   - Models: `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-pro`, etc.
   - API Key: Get from https://aistudio.google.com/app/apikey

### Local Development Setup

1. **Copy the example config file:**
   ```bash
   cp public/config.json.example public/config.json
   ```

2. **Get your API key:**
   - **Gemini**: https://aistudio.google.com/app/apikey
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Anthropic**: https://console.anthropic.com/

3. **Update `public/config.json` with your API key:**
   ```json
   {
     "llm": {
       "provider": "gemini",
       "model": "gemini-1.5-flash",
       "apiKey": "your-actual-api-key-here"
     }
   }
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Test the LLM conversion:**
   - Navigate to the workflow import dialog
   - Upload a ZIP file
   - Click "Auto Convert" to test the LLM integration

**Note**: The `public/config.json` file is gitignored to prevent committing API keys.

### Setting Up for GitHub Pages

1. **Option 1: Commit config.json (Not Recommended for API Keys)**
   - Update `public/config.json` with your API key
   - Commit and push (⚠️ API key will be visible in repository)

2. **Option 2: Use GitHub Secrets (Recommended)**
   - Add secrets in GitHub repository settings:
     - `LLM_PROVIDER` (e.g., "openai" or "anthropic")
     - `LLM_MODEL` (e.g., "gpt-4o-mini")
     - `LLM_API_KEY` (your API key)
   - Update the GitHub Actions workflow to inject these into `config.json` during build
   - The config file will be generated at build time with the secrets

3. **Option 3: Manual Update After Deploy**
   - After deployment, manually update `config.json` in the GitHub Pages branch
   - This requires direct file editing in the repository

### Security Note

⚠️ **Important**: Never commit API keys directly to the repository. Use GitHub Secrets or environment variables that are injected during the build process.

### Example GitHub Actions Workflow Update

Add this step to your `.github/workflows/deploy.yml` before the build step:

```yaml
- name: Generate config.json
  run: |
    echo '{
      "llm": {
        "provider": "${{ secrets.LLM_PROVIDER }}",
        "model": "${{ secrets.LLM_MODEL }}",
        "apiKey": "${{ secrets.LLM_API_KEY }}"
      }
    }' > public/config.json
```

