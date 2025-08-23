# Pimsleur Platform

A monorepo containing the backend and frontend components for the Pimsleur platform.

## Project Structure

- `backend/` – Serverless backend implemented with TypeScript and the AWS SDK.
- `frontend/` – Next.js application providing the web interface.
- `scripts/` – Utility scripts for development and deployment.

## Prerequisites

- Node.js **24.3.0** (managed via ASDF and `.tool-versions`)

## Setup

Install dependencies and configure helpers:

```bash
bash scripts/setup-dev.sh
```

## Git Helpers

The setup script installs `git mono`. Run Git commands from any subdirectory and have them execute at the repository root.

```bash
git mono status
git mono add .
```

## Development

### Running Tests

Run tests for each package as needed:

```bash
npm test --prefix backend
npm test --prefix frontend
```

### Formatting

```bash
npm run format --prefix backend
```

## Node Version

Ensure Node.js 24.3.0 is installed:

```bash
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
asdf install
```

## Contributing

1. Fork the repository and create a feature branch.
2. Commit your changes with clear messages.
3. Open a pull request for review.

---

Happy hacking!
