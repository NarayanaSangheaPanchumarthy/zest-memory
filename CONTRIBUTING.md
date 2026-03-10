# Contributing to MemoGuard

Thank you for your interest in contributing to MemoGuard! This guide will help you get started and ensure a smooth collaboration experience.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Community](#community)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to making participation in MemoGuard a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors include:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community and end users
- Showing empathy toward other community members

**Unacceptable behaviors include:**

- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Any conduct that could reasonably be considered inappropriate in a professional setting

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by opening an issue or contacting the maintainers. All complaints will be reviewed and investigated promptly and fairly.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **bun** package manager
- **Git** for version control
- A code editor (VS Code recommended)

### Setting Up Your Development Environment

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/memoguard.git
cd memoguard

# 3. Add the upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/memoguard.git

# 4. Install dependencies
npm install

# 5. Create a .env file (see README for required variables)
cp .env.example .env

# 6. Start the dev server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run preview` | Preview production build |

---

## 🔄 Development Workflow

### 1. Sync Your Fork

Before starting any work, make sure your fork is up to date:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**

| Prefix | Use Case |
|--------|----------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation changes |
| `refactor/` | Code refactoring |
| `test/` | Adding or updating tests |
| `chore/` | Maintenance tasks |

### 3. Make Your Changes

- Write clean, readable code
- Follow the [Coding Standards](#coding-standards) below
- Test your changes locally

### 4. Commit and Push

```bash
git add .
git commit -m "feat: add new wellness reminder type"
git push origin feature/your-feature-name
```

### 5. Open a Pull Request

Open a PR against the `main` branch of the upstream repository.

---

## 📝 Coding Standards

### TypeScript & React

- Use **functional components** with hooks
- Use **TypeScript** for all new files — avoid `any` types
- Prefer **named exports** over default exports
- Keep components small and focused (< 200 lines)
- Extract reusable logic into custom hooks (`src/hooks/`)

### Styling

- Use **Tailwind CSS** utility classes
- **Always use semantic design tokens** from `index.css` and `tailwind.config.ts`
- ❌ Do NOT use hardcoded colors (e.g., `text-white`, `bg-blue-500`)
- ✅ Use tokens (e.g., `text-foreground`, `bg-primary`, `text-muted-foreground`)
- Ensure components work in both **light and dark modes**

### File Organization

```
src/components/
├── ui/              # Shared primitives (shadcn/ui)
├── patient/         # Patient dashboard components
├── caregiver/       # Caregiver dashboard components
└── clinical/        # Clinical panel components
```

- Place page-level components in `src/pages/`
- Place reusable components in `src/components/`
- Group domain-specific components in subdirectories

### Accessibility

- Use semantic HTML elements (`<nav>`, `<main>`, `<section>`, etc.)
- Include `alt` text on all images
- Ensure keyboard navigation works
- Maintain sufficient color contrast ratios
- Use ARIA attributes where appropriate

---

## 💬 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons, etc. |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or correcting tests |
| `chore` | Build process, tooling, or auxiliary changes |

### Examples

```
feat(patient): add weekly mood summary chart
fix(auth): resolve redirect loop on token expiry
docs: update setup instructions in README
refactor(caregiver): extract task filters into custom hook
test: add unit tests for medication reminder logic
```

---

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code compiles without errors (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (`npm run test`)
- [ ] Changes are tested locally in the browser
- [ ] No hardcoded colors — semantic tokens only
- [ ] Responsive design works on mobile and desktop

### PR Description Template

When opening a PR, please include:

```markdown
## What does this PR do?
Brief description of the change.

## Why is this change needed?
Context and motivation.

## How to test
Steps to verify the change works.

## Screenshots (if applicable)
Before/after screenshots for UI changes.
```

### Review Process

1. A maintainer will review your PR within a few days
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release 🎉

---

## 🐛 Reporting Issues

### Bug Reports

When reporting a bug, please include:

- **Description** — What happened vs. what you expected
- **Steps to reproduce** — Minimal steps to trigger the issue
- **Environment** — Browser, OS, screen size
- **Screenshots** — If applicable
- **Console errors** — Any relevant error messages

### Feature Requests

We love new ideas! When suggesting a feature:

- **Describe the problem** it would solve
- **Propose a solution** if you have one in mind
- **Consider alternatives** you've thought about
- **Add context** — Who would benefit from this?

---

## 🏥 Domain-Specific Notes

MemoGuard is a **healthcare-adjacent** application for dementia care. Please keep these considerations in mind:

- **Privacy first** — Never log or expose personal health information
- **Accessibility matters** — Many users may have cognitive or motor impairments
- **Simplicity wins** — Patient-facing features should be intuitive and calming
- **Safety critical** — Features like SOS alerts and geofencing must be reliable

---

## 🌟 Recognition

All contributors will be recognized in the project. Thank you for helping make dementia care more accessible and supportive!

---

<p align="center">Thank you for contributing to MemoGuard! ❤️</p>
