<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your CRM Solutions app

This contains everything you need to run your app locally and deploy it to GitHub Pages using GitHub Actions.

View your app in AI Studio: https://ai.studio/apps/9e492875-ccf3-4611-97e8-9ce365ba2c0e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages with GitHub Actions

1. Push the project to your GitHub repository.
2. Make sure the repository name matches the Vite base path in [vite.config.ts](vite.config.ts). This project is already configured for `CRM-group-project`.
3. In GitHub, open repository Settings > Pages.
4. Set the source to `GitHub Actions`.
5. Commit and push to the `main` branch.
6. GitHub Actions will build and deploy the site automatically.

If you rename the repository, update the `base` path in [vite.config.ts](vite.config.ts).
