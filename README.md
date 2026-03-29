# Welcome to my project

## Project info

**URL**: https://www.calmora.co.in/

## How can I edit this code?

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Pages & Features:

1. **Landing Page (/)** — Hero with background image, Hindi tagline "Yahan thoda halka lagta hai", feature grid (6 cards), CTA buttons, social links (Instagram, YouTube), footer.

2. **Auth Page (/auth)** — Email/password sign up & sign in with Supabase Auth, Google OAuth, anonymous sign-in, password strength indicator, forgot password flow.

3. **Mood Detector (/mood)** — Text/voice input, AI mood detection via Supabase Edge Function (Gemini API), mood-based song recommendations (Bollywood/Indian music), confidence score, quick topic buttons, "Continue with Mindo" redirect.

4. **Mindo AI Chat (/chat)** — Full chat interface with AI companion (Gemini API edge function), typing indicators, mood detection per message, chat history in localStorage, quick starters, clear chat.

5. **Journal (/journal)** — Daily journal with AI prompts, text editor, AI reflection via edge function, mood tagging, entry history.

6. **Mindfulness (/mindfulness)** — Breathing exercises (4-7-8, box breathing), guided meditation timer, calm/focus/sleep modes.

7. **Mind Puzzles (/sounds)** — Word puzzle game with difficulty levels, timer, attempts tracking, stress analysis, game sessions saved to Supabase.

8. **Soul Garden (/garden)** — Gamified virtual garden that grows based on user activities (moods, journals, meditations), animated plants/particles, growth stages.

9. **Dashboard (/dashboard)** — Stats overview (mood entries, journal entries, meditation minutes, puzzles solved), XP bar, daily quests panel, streak display, weekly digest.

10. **Sleep Zone (/sleep)** — Ambient sound player (rain, ocean, forest), sleep timer, wind-down routines.

11. **Affirmations (/affirmations)** — Daily personalized positive affirmations with categories.

12. **Analytics (/analytics)** — Mood tracking charts (recharts), trends over 7/30/90 days, activity heatmap.

13. **Assessments (/assessments)** — PHQ-9, GAD-7, WHO-5, K10, PSS, DASS-21 questionnaires with scoring, severity levels, recommendations.

14. **Crisis Support (/crisis-support)** — Always free, Indian helpline numbers, grounding exercises, emergency contacts from Supabase.

15. **Community (/community)** — Anonymous peer support forum, posts with tags, comments, likes, moderation system.

16. **Pricing (/pricing)** — Freemium model: Free (basic features) vs Premium (₹99/month, ₹899/year) with feature comparison table, mock payment.

17. **Profile (/profile)** — Avatar upload (Supabase Storage), name, bio, department, location, language preference.

18. **Settings (/settings)** — Theme toggle, language selector, notification preferences, 2FA setup (TOTP), account management.

19. **Privacy (/privacy)** — Privacy policy page.
