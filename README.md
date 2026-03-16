# Psychology Quiz - Web Version

SOSC1960 Spaced Repetition Learning Tool

## 🎯 Features

- 📚 20 questions per quiz session
- 🔄 Smart problem selection (prioritizes previously incorrect answers)
- ✅ Immediate feedback with explanations
- 📊 Detailed statistics and progress tracking
- 💾 LocalStorage-based state persistence
- ⌨️ Keyboard navigation (Arrow keys + Enter)
- 🎨 Terminal-style UI (black background, green text)
- 🔁 Iteration system (resets after 100 problems solved)

## 🚀 Development

### Prerequisites

- Node.js 20.19+ or 22.12+ (recommended)
- npm 10+

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📦 Deployment to GitHub Pages

### 1. Initialize Git Repository (if not already done)

```bash
cd web-quiz
git init
git add .
git commit -m "Initial commit"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `psychology-quiz`)
3. **Do not** initialize with README, .gitignore, or license

### 3. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 4. Update vite.config.ts (if needed)

If your GitHub Pages URL will be `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`, 
update `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/YOUR_REPO_NAME/',  // Change this
})
```

If your URL is `https://YOUR_USERNAME.github.io/`, use:

```typescript
base: '/',
```

### 5. Deploy

```bash
npm run deploy
```

This will:
1. Build the production version
2. Push the `dist/` folder to the `gh-pages` branch
3. GitHub will automatically serve it

### 6. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

Your site will be available at:
- `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## 📁 Project Structure

```
web-quiz/
├── public/
│   └── problems/          # JSON files with quiz questions
│       ├── chapter2.json
│       ├── chapter4.json
│       ├── chapter5.json
│       ├── exam1-methods.json
│       ├── exam1-module1.json
│       └── exam1-module2.json
├── src/
│   ├── components/        # React components
│   │   ├── Loading.tsx
│   │   ├── Welcome.tsx
│   │   ├── Question.tsx
│   │   ├── Feedback.tsx
│   │   └── Statistics.tsx
│   ├── types.ts          # TypeScript type definitions
│   ├── quizLogic.ts      # Core quiz logic
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Terminal-style CSS
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies and scripts
```

## 🎮 How to Use

### Navigation

- **Arrow Keys (↑/↓)**: Navigate through answer options
- **Enter**: Select answer / Continue
- **Mouse Click**: Also supported

### Quiz Flow

1. **Welcome Screen**: Shows current progress and statistics
2. **Question Phase**: Answer 20 questions
3. **Feedback**: View correct answer and explanation after each question
4. **Retry Phase**: Incorrectly answered questions are retested
5. **Statistics**: View detailed results and progress

### Data Persistence

- All progress is saved in browser's localStorage
- Clear localStorage to reset: Open DevTools → Application → Local Storage → Delete

## 🔧 Customization

### Add More Problems

Add more JSON files to `public/problems/` with the following format:

```json
[
  {
    "question": "Your question here",
    "options": {
      "A": "Option A",
      "B": "Option B",
      "C": "Option C",
      "D": "Option D"
    },
    "answer": "A",
    "chapter": "Chapter X: Title",
    "related_info": "Explanation and related information",
    "incorrect_count": 0
  }
]
```

Update `src/quizLogic.ts` to include the new file:

```typescript
const problemFiles = [
  'chapter2.json',
  'chapter4.json',
  'your-new-file.json',  // Add here
];
```

### Change Number of Questions

Edit `src/quizLogic.ts`:

```typescript
const QUESTIONS_PER_QUIZ = 20;  // Change this
```

### Modify Terminal Colors

Edit `src/index.css`:

```css
:root {
  --bg-primary: #0a0a0a;        /* Background */
  --text-primary: #00ff00;      /* Primary text (green) */
  --text-secondary: #ffffff;    /* Secondary text (white) */
  /* ... more colors */
}
```

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

### Deployment Issues

1. Check if `gh-pages` branch exists in your repository
2. Verify GitHub Pages settings (Settings → Pages)
3. Wait a few minutes after deployment
4. Check browser console for errors

### LocalStorage Issues

- Check if cookies/storage are enabled in browser
- Try incognito/private mode
- Clear browser cache

## 📝 License

This project is for educational purposes.

## 🙏 Credits

Based on the Python terminal version of Psychology Quiz Application.
