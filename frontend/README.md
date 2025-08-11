# Next SSR Upload Starter

Public: `/`
Protected: `/upload`, `/status`, `/account`

Upload flow: per-file POST `/api/s3-upload-presign` → PUT to S3 → finalize with `/api/s3-upload-metadata-presign` (client uploads generated metadata.json)

Auth: Cognito Hosted UI (Code+PKCE), stateless JWT cookies. Middleware guards protected routes.

Run:

```
npm i
cp .env.example .env
npm run dev
```
