# Contributing to PoliceBrutalityTracker

Thank you for your interest in contributing. This guide explains how to get started and submit changes.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Setup

```bash
# Fork the repository
git clone https://github.com/YOUR_USERNAME/PoliceBrutalityTracker.git
cd PoliceBrutalityTracker

# Install dependencies
npm install

# Start development server
npm run dev
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Follow the code standards below. Test thoroughly.

### 3. Run Checks

```bash
npm run lint
npm run build
npm test
```

### 4. Commit with Clear Messages

```bash
git commit -m "Add feature description"
```

### 5. Push and Open a Pull Request

```bash
git push origin feature/your-feature-name
```

Open a PR on GitHub with a clear description of your changes.

## Code Standards

### TypeScript

- Use strict typing
- Avoid `any` types
- Use interfaces for object shapes
- Prefer functional components

### React

- Use hooks over class components
- Implement proper error boundaries
- Optimize with React.memo when needed
- Follow the existing component structure

### CSS/Styling

- Use Tailwind CSS classes
- Follow mobile-first approach
- Maintain consistent spacing
- Use semantic color names

### Performance

- Lazy load heavy components
- Optimize images
- Minimize bundle size
- Test Core Web Vitals

## What to Contribute

### Good Contributions

- Bug fixes
- New features
- Performance improvements
- Documentation updates
- Accessibility improvements
- Test coverage

### What Not to Contribute

- Code that compromises user privacy
- Features that could be used for harassment
- Changes that break existing functionality
- Code without proper testing

## Bug Reports

Use [GitHub Issues](https://github.com/SK3CHI3/PoliceBrutalityTracker/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser and device information

## Feature Requests

- Check existing issues first
- Describe the feature clearly
- Explain how it benefits the platform
- Consider performance and accessibility impact

## Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Build check
npm run build
```

## Documentation

- Update README.md for new features
- Add JSDoc comments for complex functions
- Update type definitions
- Include usage examples

## Community Guidelines

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the code of conduct

## Need Help?

- Check existing [GitHub Discussions](https://github.com/SK3CHI3/PoliceBrutalityTracker/discussions)
- Open an issue with your question
- Email: support@policebrutalitytracker.co.ke

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation
