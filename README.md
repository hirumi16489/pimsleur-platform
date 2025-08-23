# Pimsleur Platform Codebase Overview

## Repository Layout
- **`backend/`** – Node/TypeScript services following a domain‑driven structure  
  - `domain/` – core business logic (e.g., `FileService` for S3 uploads, `LessonProcessingService` for step tracking).  
  - `application/` – AWS Lambda handlers wrapping domain services (presigned URLs, SQS triggers, Step Function starters).  
  - `infrastructure/` – adapters for S3, DynamoDB, MIME types, plus SAM templates in `infra/`.  
  - `shared/` – configuration and cross‑cutting type definitions.
- **`frontend/`** – Next.js 14 (App Router) UI  
  - `app/` – routes, API endpoints, and middleware.  
  - `components/` – shared React/Tailwind UI building blocks.  
  - `lib/` – helpers for auth, API proxying, and environment detection.  
  - `infra/` – CloudFormation template for CloudFront + Lambda + S3 deployment.
- **`scripts/`** – development helpers (`setup-dev.sh`, Cognito helpers, etc.).

## Scripts Overview
| Purpose | Command |
|---------|---------|
| **Backend build** | `bash ./scripts/backend/build.sh` |
| **Backend deploy** | `bash ./scripts/backend/deploy.sh [--stage dev] [--region ap-northeast-1] …` |
| **Lambda code sync** | `bash ./scripts/backend/sync.sh --lambda LessonProcessingStack/StartProcessingFunction` |
| **Frontend build** | `bash ./scripts/frontend/build.sh` |
| **Frontend deploy** | `bash ./scripts/frontend/deploy.sh [--stack pimsleur-next-ssr] …` |

*Backend scripts* install dependencies, validate the SAM template, build the Lambda package, and deploy via `sam deploy`. `sync.sh` skips CloudFormation, zips a single handler, and updates a Lambda function in-place.

*Frontend scripts* use OpenNext to build the Next.js app and deploy the CloudFront/S3/Lambda@Edge stack; `deploy.sh` expects existing buckets and optional custom-domain parameters.

## Key Concepts & Practices
- **Monorepo structure** with minimal root `package.json` plus separate packages for front/back ends.
- **Domain‑driven layering** in backend (`domain` → `application` → `infrastructure`) using ports/adapters.
- **Serverless backend**: AWS SAM templates orchestrate S3, DynamoDB, SQS, and Step Functions.
- **Next.js front‑end**: App Router, Tailwind styling, serverless functions for auth, and edge middleware guarding protected routes.
- **Auth**: OAuth 2.0 Code+PKCE against Amazon Cognito; tokens stored in secure cookies and proxied to the backend.
- **Testing**: Jest across backend services and handlers; unit tests colocated beside implementations.

## Tips for Getting Started
1. **Set up tooling**  
   Run `bash scripts/setup-dev.sh` to install dependencies and enable the `git mono` helper for working from subdirectories.
2. **Explore backend services**  
   Start with `src/domain/file/FileService.ts` and `src/domain/lessonProcessing/LessonProcessingService.ts` to see core business rules, then inspect their adapters in `src/infrastructure/`.
3. **Understand deployment templates**  
   Review `backend/infra/template.yaml` and `frontend/infra/template.yaml` to grasp how AWS resources are wired together.
4. **Run tests**  
   Each package has its own `npm test`; examine tests like `backend/src/domain/file/FileService.test.ts` for usage patterns.
5. **Study auth flow**  
   Frontend routes in `app/api/auth/` demonstrate PKCE, cookie handling, and token storage; middleware enforces login on protected pages.
6. **Learn the tech stack**  
   If any pieces are unfamiliar, focus on:
   - AWS SAM & CloudFormation
   - Step Functions and SQS
   - Next.js App Router & Middleware
   - Domain‑Driven Design principles

## What to Explore Next
- Implementing new step functions or processing steps by extending `LessonProcessingService` and its repository.
- Integrating real data into placeholder frontend pages (`status`, `account`).
- Expanding authentication/authorization logic and front‑end state management.
- Reviewing build/deploy scripts in `scripts/backend` and `scripts/frontend` for CI/CD nuances.

This overview should give you enough context to navigate the codebase, understand the major components, and identify areas for deeper study or contribution. Happy hacking!
