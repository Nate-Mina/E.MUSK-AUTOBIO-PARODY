# ELON MUSK: The End Justifies the Means

An immersive, satirical fictional autobiography and dark tech comedy experience.

## Deployment to GitHub Pages

This app is configured for automatic deployment to GitHub Pages.

### Setup Instructions

1.  **Repository Secrets**:
    *   To keep the "Elon AI Chat" functional on static hosting, you need a Gemini API Key.
    *   Go to your GitHub Repository **Settings > Secrets and variables > Actions**.
    *   Add a **New repository secret** named `VITE_GEMINI_API_KEY` with your key from [Google AI Studio](https://aistudio.google.com/app/apikey).

2.  **Deployment**:
    *   Push your code to the `main` branch.
    *   The GitHub Action in `.github/workflows/deploy.yml` will automatically build and deploy the app.
    *   Once finished, go to **Settings > Pages** and set the source to **GitHub Actions**.

### Note on TTS Narration
*   The "Elon Voice Narration" (TTS) requires a backend server and will not function on static GitHub Pages. The text-based chat, however, will work if the `VITE_GEMINI_API_KEY` is provided.
