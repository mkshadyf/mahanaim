# Contributing to Mahanaim Money

Thank you for considering contributing to Mahanaim Money! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue tracker to see if the problem has already been reported. If it has and the issue is still open, add a comment to the existing issue instead of opening a new one.

When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title** for the issue
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what you expected to see
- **Include screenshots or animated GIFs** if possible
- **Include details about your environment** (OS, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title** for the issue
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **Include any relevant examples or mockups**

### Pull Requests

- Fill in the required template
- Follow the TypeScript and React styleguides
- Include appropriate test cases
- Update documentation as needed
- End all files with a newline

## Development Process

### Setting Up the Development Environment

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/mahanaim-money.git`
3. Install dependencies: `pnpm install`
4. Set up environment variables (see README.md)
5. Start the development server: `pnpm dev`

### Coding Standards

- Use TypeScript for all JavaScript code
- Follow the ESLint configuration provided in the project
- Use functional components and hooks for React components
- Write meaningful commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Testing

- Write tests for all new features and bug fixes
- Run the test suite before submitting a pull request: `pnpm test`
- Ensure all tests pass

### Documentation

- Update the README.md with details of changes to the interface
- Update the JSDoc comments for any modified code
- Add or update examples as needed

## Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable
2. Update the documentation with details of changes, if applicable
3. The PR should work on the main development branch
4. Once you have the sign-off of at least one reviewer, you may merge the PR

## Additional Resources

- [Project README](README.md)
- [GitHub Issues](https://github.com/yourusername/mahanaim-money/issues)
- [GitHub Pull Requests](https://github.com/yourusername/mahanaim-money/pulls)

Thank you for contributing to Mahanaim Money! 