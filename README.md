# Run and deploy your CRM Solutions app

This contains everything you need to run your app locally and deploy it to Vercel.


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel (without GitHub)

You can deploy directly from your local folder without connecting a Git repository.

1. Build check locally:
   `npm run build`
2. Deploy using Vercel CLI:
   `npx vercel --prod`
3. When prompted:
   - Set up and deploy: `Y`
   - Link to existing project: `N` (or choose your existing one)
   - Project name: choose any name you want
   - Directory: `.`

Vercel will use `vercel.json` and deploy the `dist` output.
