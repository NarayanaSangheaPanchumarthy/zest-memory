# MemoGuard 🧠🛡️

**MemoGuard** is an open-source dementia care platform designed to support patients, caregivers, and clinicians with AI-powered tools, daily routine management, and safety features.

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

🔗 **Live Demo:** [https://zest-memory.lovable.app](https://zest-memory.lovable.app)

---

## ✨ Features

- **Patient Dashboard** — Daily task checklists, medication reminders, mood diary, wellness reminders, and appointment calendar
- **Caregiver Dashboard** — Care task management, communication logs, and patient monitoring
- **Clinical Panel** — Patient management, routine planning, and AI-powered clinical insights
- **Memory Games** — Cognitive exercises to support brain health
- **AI Chatbot** — Conversational assistant for patients and caregivers
- **Safety Map** — Geofencing and location tracking for patient safety
- **Vitals Monitor** — Track and visualize patient vital signs
- **Emergency SOS** — One-tap emergency alert system
- **Privacy Settings** — Granular control over data sharing
- **Role-Based Access** — Separate experiences for patients, caregivers, and clinicians

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Animation:** Framer Motion
- **Backend:** Lovable Cloud (Supabase)
- **Maps:** Leaflet / React-Leaflet
- **Charts:** Recharts
- **Auth:** OAuth (Google, Apple) + Email/Password

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm or bun

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/memoguard.git

# 2. Navigate to the project
cd memoguard

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

> **Note:** If you fork and deploy your own instance, you'll need to set up your own backend project and configure authentication providers.

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui primitives
│   ├── patient/         # Patient-specific components
│   ├── caregiver/       # Caregiver-specific components
│   └── clinical/        # Clinician-specific components
├── pages/               # Route-level page components
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
├── lib/                 # Utility functions
└── index.css            # Global styles & design tokens
supabase/
├── functions/           # Edge functions (backend logic)
└── config.toml          # Backend configuration
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### How to Contribute

1. **Fork** the repository
2. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and commit with clear messages:
   ```bash
   git commit -m "feat: add new wellness reminder type"
   ```
4. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** against the `main` branch

### Contribution Guidelines

- Follow the existing code style (TypeScript, functional components, Tailwind CSS)
- Use semantic design tokens from `index.css` — avoid hardcoded colors
- Write descriptive commit messages using [Conventional Commits](https://www.conventionalcommits.org/)
- Keep PRs focused — one feature or fix per PR
- Test your changes locally before submitting
- Update documentation if your change affects usage

### Ideas for Contributions

- 🌍 Internationalization (i18n) support
- ♿ Accessibility improvements
- 📱 Mobile responsiveness enhancements
- 🧪 Unit and integration tests
- 📖 Documentation improvements
- 🐛 Bug fixes

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons by [Lucide](https://lucide.dev)

---

<p align="center">Made with ❤️ for dementia care</p>
