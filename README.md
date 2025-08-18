# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)

```
task-sync
├─ .github
│  ├─ workflows
│  │  ├─ commitlint.yml
│  │  ├─ release.yml
│  │  ├─ test.yml
├─ .dockerignore
├─ .husky
│  ├─ _
│  │  ├─ applypatch-msg
│  │  ├─ commit-msg
│  │  ├─ h
│  │  ├─ husky.sh
│  │  ├─ post-applypatch
│  │  ├─ post-checkout
│  │  ├─ post-commit
│  │  ├─ post-merge
│  │  ├─ post-rewrite
│  │  ├─ pre-applypatch
│  │  ├─ pre-auto-gc
│  │  ├─ pre-commit
│  │  ├─ pre-merge-commit
│  │  ├─ pre-push
│  │  ├─ pre-rebase
│  │  └─ prepare-commit-msg
│  ├─ commit-msg
│  └─ pre-commit
├─ .npmrc
├─ .releaserc.json
├─ README.md
├─ apps
│  └─ api
│     ├─ Dockerfile
│     ├─ eslint.config.mjs
│     ├─ jest.config.ts
│     ├─ jest.e2e.config.ts
│     ├─ nest-cli.json
│     ├─ package.json
│     ├─ scripts
│     │  └─ generate-migration.ts
│     ├─ src
│     │  ├─ core
│     │  │  ├─ either.spec.ts
│     │  │  ├─ either.ts
│     │  │  ├─ entities
│     │  │  │  ├─ aggregate-root.ts
│     │  │  │  ├─ entity.spec.ts
│     │  │  │  ├─ entity.ts
│     │  │  │  └─ unique-entity-id.ts
│     │  │  ├─ errors
│     │  │  │  └─ use-case-error.ts
│     │  │  ├─ events
│     │  │  │  ├─ domain-event.ts
│     │  │  │  ├─ domain-events.spec.ts
│     │  │  │  ├─ domain-events.ts
│     │  │  │  └─ event-handler.ts
│     │  │  └─ types
│     │  │     └─ optional.ts
│     │  ├─ domain
│     │  │  ├─ auth
│     │  │  │  ├─ application
│     │  │  │  │  ├─ cryptography
│     │  │  │  │  │  ├─ encryptor.ts
│     │  │  │  │  │  └─ hasher.ts
│     │  │  │  │  ├─ repositories
│     │  │  │  │  │  ├─ auth-tokens-repository.ts
│     │  │  │  │  │  ├─ users-repository.ts
│     │  │  │  │  │  └─ verification-tokens-repository.ts
│     │  │  │  │  ├─ services
│     │  │  │  │  │  └─ auth-user-service.ts
│     │  │  │  │  ├─ storage
│     │  │  │  │  │  ├─ file-access-controller.ts
│     │  │  │  │  │  └─ file-storage.ts
│     │  │  │  │  └─ use-cases
│     │  │  │  │     ├─ authenticate-session.spec.ts
│     │  │  │  │     ├─ authenticate-session.ts
│     │  │  │  │     ├─ confirm-email.spec.ts
│     │  │  │  │     ├─ confirm-email.ts
│     │  │  │  │     ├─ enroll-identity.spec.ts
│     │  │  │  │     ├─ enroll-identity.ts
│     │  │  │  │     ├─ errors
│     │  │  │  │     │  ├─ email-already-in-use.ts
│     │  │  │  │     │  ├─ forbidden-action.ts
│     │  │  │  │     │  ├─ invalid-avatar-type.ts
│     │  │  │  │     │  ├─ invalid-credentials.ts
│     │  │  │  │     │  ├─ refresh-token-expired.ts
│     │  │  │  │     │  ├─ resource-gone.ts
│     │  │  │  │     │  ├─ resource-invalid.ts
│     │  │  │  │     │  └─ resource-not-found.ts
│     │  │  │  │     ├─ initiate-password-recovery.spec.ts
│     │  │  │  │     ├─ initiate-password-recovery.ts
│     │  │  │  │     ├─ refine-profile.spec.ts
│     │  │  │  │     ├─ refine-profile.ts
│     │  │  │  │     ├─ renew-token.spec.ts
│     │  │  │  │     ├─ renew-token.ts
│     │  │  │  │     ├─ reset-password.spec.ts
│     │  │  │  │     ├─ reset-password.ts
│     │  │  │  │     ├─ retrieve-profile.spec.ts
│     │  │  │  │     ├─ retrieve-profile.ts
│     │  │  │  │     ├─ revoke-tokens.spec.ts
│     │  │  │  │     ├─ revoke-tokens.ts
│     │  │  │  │     ├─ terminate-session.spec.ts
│     │  │  │  │     ├─ terminate-session.ts
│     │  │  │  │     ├─ upload-and-update-avatar.spec.ts
│     │  │  │  │     └─ upload-and-update-avatar.ts
│     │  │  │  └─ enterprise
│     │  │  │     ├─ entities
│     │  │  │     │  ├─ auth-token.spec.ts
│     │  │  │     │  ├─ auth-token.ts
│     │  │  │     │  ├─ user.spec.ts
│     │  │  │     │  ├─ user.ts
│     │  │  │     │  ├─ verification-token.spec.ts
│     │  │  │     │  └─ verification-token.ts
│     │  │  │     └─ events
│     │  │  │        ├─ email-update-verification-requested-event.ts
│     │  │  │        ├─ email-verification-requested-event.ts
│     │  │  │        ├─ event-classes.spec.ts
│     │  │  │        ├─ password-recovery-requested-event.ts
│     │  │  │        ├─ password-reset-event.ts
│     │  │  │        └─ user-registered-event.ts
│     │  │  └─ email
│     │  │     ├─ application
│     │  │     │  ├─ repositories
│     │  │     │  │  └─ email-requests-repository.ts
│     │  │     │  ├─ services
│     │  │     │  │  ├─ email-queue-service.ts
│     │  │     │  │  └─ email-sender-service.ts
│     │  │     │  ├─ subscribers
│     │  │     │  │  ├─ on-email-updated.spec.ts
│     │  │     │  │  ├─ on-email-updated.ts
│     │  │     │  │  ├─ on-email-verification-requested.spec.ts
│     │  │     │  │  ├─ on-email-verification-requested.ts
│     │  │     │  │  ├─ on-password-recovery-requested.spec.ts
│     │  │     │  │  ├─ on-password-recovery-requested.ts
│     │  │     │  │  ├─ on-password-reset.spec.ts
│     │  │     │  │  ├─ on-password-reset.ts
│     │  │     │  │  ├─ on-user-registered.spec.ts
│     │  │     │  │  └─ on-user-registered.ts
│     │  │     │  └─ use-cases
│     │  │     │     ├─ create-email-request.spec.ts
│     │  │     │     ├─ create-email-request.ts
│     │  │     │     ├─ get-email-request-by-id.spec.ts
│     │  │     │     ├─ get-email-request-by-id.ts
│     │  │     │     ├─ update-email-request-status.spec.ts
│     │  │     │     └─ update-email-request-status.ts
│     │  │     └─ enterprise
│     │  │        └─ entities
│     │  │           ├─ email-request.spec.ts
│     │  │           ├─ email-request.ts
│     │  │           └─ value-objects
│     │  │              ├─ email-status.spec.ts
│     │  │              └─ email-status.ts
│     │  ├─ infra
│     │  │  ├─ app.module.ts
│     │  │  ├─ auth
│     │  │  │  ├─ auth.module.ts
│     │  │  │  ├─ decorators
│     │  │  │  │  ├─ current-user.ts
│     │  │  │  │  └─ public.ts
│     │  │  │  ├─ guards
│     │  │  │  │  ├─ jwt-auth.guard.ts
│     │  │  │  │  └─ jwt-refresh-auth.guard.ts
│     │  │  │  ├─ strategies
│     │  │  │  │  ├─ jwt-refresh.strategy.ts
│     │  │  │  │  └─ jwt.strategy.ts
│     │  │  │  └─ types
│     │  │  │     └─ jwt-payload.ts
│     │  │  ├─ cryptography
│     │  │  │  ├─ bcrypt-hasher.ts
│     │  │  │  ├─ cryptography.module.ts
│     │  │  │  └─ jwt-encryptor.ts
│     │  │  ├─ database
│     │  │  │  ├─ database.module.ts
│     │  │  │  ├─ mongoose
│     │  │  │  │  ├─ mappers
│     │  │  │  │  │  └─ mongoose-email-request-mapper.ts
│     │  │  │  │  ├─ mongoose.config.ts
│     │  │  │  │  ├─ mongoose.service.ts
│     │  │  │  │  ├─ repositories
│     │  │  │  │  │  └─ mongoose-email-requests-repository.ts
│     │  │  │  │  └─ schemas
│     │  │  │  │     └─ email-request.schema.ts
│     │  │  │  └─ typeorm
│     │  │  │     ├─ data-source.ts
│     │  │  │     ├─ entities
│     │  │  │     │  └─ user.entity.ts
│     │  │  │     ├─ factories
│     │  │  │     │  └─ user.factory.ts
│     │  │  │     ├─ mappers
│     │  │  │     │  └─ typeorm-user-mapper.ts
│     │  │  │     ├─ migrations
│     │  │  │     │  └─ 1753384781835-create-users-table.ts
│     │  │  │     ├─ repositories
│     │  │  │     │  └─ typeorm-users-repository.ts
│     │  │  │     ├─ seeds
│     │  │  │     │  └─ user.seeder.ts
│     │  │  │     ├─ typeorm.config.ts
│     │  │  │     └─ typeorm.service.ts
│     │  │  ├─ email
│     │  │  │  ├─ contracts
│     │  │  │  │  └─ email-service.ts
│     │  │  │  ├─ email.module.ts
│     │  │  │  └─ nodemailer
│     │  │  │     ├─ nodemailer-email.service.spec.ts
│     │  │  │     └─ nodemailer-email.service.ts
│     │  │  ├─ env
│     │  │  │  ├─ env.module.ts
│     │  │  │  └─ env.service.ts
│     │  │  ├─ events
│     │  │  │  ├─ events.module.ts
│     │  │  │  ├─ on-email-updated.e2e-spec.ts
│     │  │  │  ├─ on-email-verification-requested.e2e-spec.ts
│     │  │  │  ├─ on-password-recovery-requested.e2e-spec.ts
│     │  │  │  ├─ on-password-reset.e2e-spec.ts
│     │  │  │  └─ on-user-registered.e2e-spec.ts
│     │  │  ├─ http
│     │  │  │  ├─ controllers
│     │  │  │  │  ├─ authenticate.controller.e2e-spec.ts
│     │  │  │  │  ├─ authenticate.controller.ts
│     │  │  │  │  ├─ confirm-email.controller.e2e-spec.ts
│     │  │  │  │  ├─ confirm-email.controller.ts
│     │  │  │  │  ├─ forgot-password.controller.e2e-spec.ts
│     │  │  │  │  ├─ forgot-password.controller.ts
│     │  │  │  │  ├─ get-avatar-url.controller.e2e-spec.ts
│     │  │  │  │  ├─ get-avatar-url.controller.ts
│     │  │  │  │  ├─ get-profile.controller.e2e-spec.ts
│     │  │  │  │  ├─ get-profile.controller.ts
│     │  │  │  │  ├─ logout.controller.e2e-spec.ts
│     │  │  │  │  ├─ logout.controller.ts
│     │  │  │  │  ├─ refresh-token.controller.e2e-spec.ts
│     │  │  │  │  ├─ refresh-token.controller.ts
│     │  │  │  │  ├─ register.controller.e2e-spec.ts
│     │  │  │  │  ├─ register.controller.ts
│     │  │  │  │  ├─ reset-password.controller.e2e-spec.ts
│     │  │  │  │  ├─ reset-password.controller.ts
│     │  │  │  │  ├─ revoke-all-sessions.controller.e2e-spec.ts
│     │  │  │  │  ├─ revoke-all-sessions.controller.ts
│     │  │  │  │  ├─ update-profile.controller.e2e-spec.ts
│     │  │  │  │  ├─ update-profile.controller.ts
│     │  │  │  │  ├─ upload-avatar.controller.e2e-spec.ts
│     │  │  │  │  └─ upload-avatar.controller.ts
│     │  │  │  ├─ decorators
│     │  │  │  │  ├─ api-union-response.ts
│     │  │  │  │  ├─ types.ts
│     │  │  │  │  └─ zod-openapi
│     │  │  │  │     ├─ api-zod-bad-response.ts
│     │  │  │  │     ├─ api-zod-body.ts
│     │  │  │  │     ├─ api-zod-conflict-response.ts
│     │  │  │  │     ├─ api-zod-gone-response.ts
│     │  │  │  │     ├─ api-zod-not-found-response.ts
│     │  │  │  │     ├─ api-zod-param.ts
│     │  │  │  │     ├─ api-zod-query.ts
│     │  │  │  │     ├─ api-zod-response.ts
│     │  │  │  │     ├─ api-zod-unauthorized-response.ts
│     │  │  │  │     ├─ api-zod-unsupported-media-type-response.ts
│     │  │  │  │     ├─ api-zod-validation-failed-response.ts
│     │  │  │  │     └─ index.ts
│     │  │  │  ├─ exceptions
│     │  │  │  │  └─ jwt-auth.ts
│     │  │  │  ├─ health
│     │  │  │  │  └─ health-checker.controller.ts
│     │  │  │  ├─ http.module.ts
│     │  │  │  ├─ pipes
│     │  │  │  │  └─ zod-validation-pipe.ts
│     │  │  │  ├─ presenters
│     │  │  │  │  └─ user-presenter.ts
│     │  │  │  ├─ responses
│     │  │  │  │  ├─ bad-response.ts
│     │  │  │  │  ├─ conflict.ts
│     │  │  │  │  ├─ gone.ts
│     │  │  │  │  ├─ jwt-unauthorized.ts
│     │  │  │  │  ├─ not-found.ts
│     │  │  │  │  ├─ unauthorized.ts
│     │  │  │  │  ├─ unsupported-media-type.ts
│     │  │  │  │  └─ validation-failed.ts
│     │  │  │  └─ validators
│     │  │  │     └─ file-upload-validators.ts
│     │  │  ├─ key-value
│     │  │  │  ├─ key-value.module.ts
│     │  │  │  ├─ key-values-repository.ts
│     │  │  │  └─ redis
│     │  │  │     ├─ mappers
│     │  │  │     │  ├─ redis-auth-token-mapper.ts
│     │  │  │     │  └─ redis-verification-token-mapper.ts
│     │  │  │     ├─ redis.service.ts
│     │  │  │     └─ repositories
│     │  │  │        ├─ redis-auth-tokens-repository.ts
│     │  │  │        ├─ redis-key-values-repository.ts
│     │  │  │        └─ redis-verification-tokens-repository.ts
│     │  │  ├─ logging
│     │  │  │  ├─ formatters
│     │  │  │  │  ├─ development.formatter.ts
│     │  │  │  │  ├─ json.formatter.ts
│     │  │  │  │  └─ production.formatter.ts
│     │  │  │  ├─ interceptors
│     │  │  │  │  ├─ error-logging.interceptor.ts
│     │  │  │  │  └─ logging.interceptor.ts
│     │  │  │  ├─ logging.module.ts
│     │  │  │  ├─ logging.types.ts
│     │  │  │  ├─ transports
│     │  │  │  │  ├─ console.transport.ts
│     │  │  │  │  ├─ external.transport.ts
│     │  │  │  │  └─ file.transport.ts
│     │  │  │  ├─ winston.config.ts
│     │  │  │  └─ winston.service.ts
│     │  │  ├─ main.ts
│     │  │  ├─ services
│     │  │  │  ├─ data
│     │  │  │  │  └─ infra-auth-user.service.ts
│     │  │  │  ├─ queue
│     │  │  │  │  ├─ redis-email-queue.service.e2e-spec.ts
│     │  │  │  │  └─ redis-email-queue.service.ts
│     │  │  │  └─ services.module.ts
│     │  │  ├─ storage
│     │  │  │  ├─ storage.module.ts
│     │  │  │  └─ supabase-storage.ts
│     │  │  └─ workers
│     │  │     ├─ queue
│     │  │     │  ├─ bull
│     │  │     │  │  ├─ services
│     │  │     │  │  │  ├─ bull-queue.service.spec.ts
│     │  │     │  │  │  └─ bull-queue.service.ts
│     │  │     │  │  └─ workers
│     │  │     │  │     ├─ bull-email-queue.worker.spec.ts
│     │  │     │  │     └─ bull-email-queue.worker.ts
│     │  │     │  └─ contracts
│     │  │     │     ├─ email-queue-worker.ts
│     │  │     │     └─ queue-service.ts
│     │  │     └─ workers.module.ts
│     │  └─ utils
│     │     ├─ bytes-to-readable.ts
│     │     ├─ zod-to-openapi.spec.ts
│     │     └─ zod-to-openapi.ts
│     ├─ test
│     │  ├─ cryptography
│     │  │  ├─ fake-encryptor.ts
│     │  │  └─ fake-hasher.ts
│     │  ├─ e2e
│     │  │  └─ sample-upload.jpg
│     │  ├─ factories
│     │  │  ├─ make-auth-token.ts
│     │  │  ├─ make-email-request.spec.ts
│     │  │  ├─ make-email-request.ts
│     │  │  ├─ make-task.ts
│     │  │  ├─ make-user.ts
│     │  │  └─ make-verification-token.ts
│     │  ├─ mocks
│     │  │  └─ @task-sync
│     │  │     └─ email-templates.ts
│     │  ├─ modules
│     │  │  ├─ auth-test.module.ts
│     │  │  └─ test-app.module.ts
│     │  ├─ repositories
│     │  │  ├─ in-memory-auth-tokens-repository.ts
│     │  │  ├─ in-memory-email-requests-repository.ts
│     │  │  ├─ in-memory-tasks-repository.ts
│     │  │  ├─ in-memory-users-repository.ts
│     │  │  └─ in-memory-verification-tokens-repository.ts
│     │  ├─ services
│     │  │  ├─ in-memory-auth-user-service.spec.ts
│     │  │  ├─ in-memory-auth-user-service.ts
│     │  │  ├─ in-memory-email-queue-service.spec.ts
│     │  │  └─ in-memory-email-queue-service.ts
│     │  ├─ setup-e2e.ts
│     │  ├─ storage
│     │  │  └─ fake-uploader.ts
│     │  └─ utils
│     │     ├─ create-isolated-workers-test-setup.ts
│     │     ├─ wait-for.spec.ts
│     │     └─ wait-for.ts
│     ├─ tsconfig.json
│     ├─ tsconfig.seed.json
│     └─ webpack.config.js
├─ commitlint.config.ts
├─ config
│  ├─ eslint
│  │  ├─ base.js
│  │  ├─ node.js
│  │  ├─ package.json
│  │  └─ react.js
│  └─ tsconfig
│     ├─ base.json
│     ├─ node.json
│     ├─ package.json
│     └─ react.json
├─ docker-compose.test.yml
├─ docker-compose.yml
├─ eslint.config.mjs
├─ package.json
├─ packages
│  ├─ api-types
│  │  ├─ package.json
│  │  ├─ src
│  │  │  ├─ email-types.ts
│  │  │  └─ index.ts
│  │  └─ tsconfig.json
│  ├─ email-templates
│  │  ├─ .babelrc
│  │  ├─ eslint.config.mjs
│  │  ├─ jest.config.js
│  │  ├─ package.json
│  │  ├─ src
│  │  │  ├─ components
│  │  │  │  ├─ content.tsx
│  │  │  │  ├─ footer.tsx
│  │  │  │  ├─ header.tsx
│  │  │  │  ├─ main.tsx
│  │  │  │  └─ title.tsx
│  │  │  ├─ constants
│  │  │  │  └─ index.ts
│  │  │  ├─ emails
│  │  │  │  ├─ email-verification.tsx
│  │  │  │  ├─ password-recovery.tsx
│  │  │  │  ├─ password-reset-confirmation.tsx
│  │  │  │  ├─ update-email-verification.tsx
│  │  │  │  └─ welcome.tsx
│  │  │  ├─ index.spec.ts
│  │  │  └─ index.ts
│  │  └─ tsconfig.json
│  └─ env
│     ├─ create-env.ts
│     ├─ index.ts
│     ├─ package.json
│     └─ tsconfig.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
└─ turbo.json

```
