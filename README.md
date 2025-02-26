# 🚀 Full-Stack Cloudflare SaaS Kit with Remix

**_Build and deploy scalable products on Cloudflare with ease._**

An opinionated, batteries-included starter kit for quickly building and deploying SaaS products on Cloudflare using Remix. This template provides everything you need for a modern, secure web application.

This is the same stack used to build [Supermemory.ai](https://Supermemory.ai) which is open source at [git.new/memory](https://git.new/memory)

Supermemory now has 20k+ users and it runs on $5/month - safe to say, it's _very_ effective.

## The Stack

- [Remix](https://remix.run/) for full-stack development
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Drizzle ORM](https://orm.drizzle.team/) for database access
- [Better-Auth](https://better-auth.pages.dev) for authentication
- [Cloudflare D1](https://www.cloudflare.com/developer-platform/d1/) for serverless databases
- [Cloudflare Workers](https://workers.cloudflare.com/) for hosting
- [ShadcnUI](https://shadcn.com/) as the component library

## Getting Started

1. Make sure you have [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/#installupdate-wrangler) installed and are logged in with `wrangler login`

2. Clone and install dependencies:
   ```bash
   git clone <your-repo>
   cd <your-repo>
   npm install
   npm run setup
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Cloudflare Integration

The template includes several scripts for Cloudflare Workers integration:
- `build`: Build the application for Workers using Remix
- `preview`: Locally preview your Workers application using Wrangler
- `deploy`: Deploy your Workers application using Wrangler
- `typegen`: Generate typescript types for Cloudflare env

> __Note:__ While the `dev` script is optimal for local development, you should preview your Workers application periodically to ensure it works properly in the Workers environment.

## Bindings

Cloudflare [Bindings](https://developers.cloudflare.com/pages/functions/bindings/) allow you to interact with Cloudflare Platform resources. You can use bindings during development, local preview, and in the deployed application.

For detailed instructions on setting up bindings, refer to the Cloudflare documentation.

## Database Migrations
Quick explanation of D1 setup:
- D1 is a serverless database that follows SQLite convention
- Within Cloudflare Workers, you can directly query D1 with [client api](https://developers.cloudflare.com/d1/build-with-d1/d1-client-api/) exposed by bindings (eg. `env.DB`)
- You can also query D1 via [rest api](https://developers.cloudflare.com/api/operations/cloudflare-d1-create-database)
- Locally, Wrangler auto-generates sqlite files at `.wrangler/state/v3/d1` after `npm run dev`
- Local dev environment interacts with [local D1 session](https://developers.cloudflare.com/d1/build-with-d1/local-development/#start-a-local-development-session)

To manage your database:
1. Create a new migration:
   ```bash
   npm run db:generate
   ```

2. Apply migrations to local D1:
   ```bash
   npm run db:push
   ```

3. Apply migrations to production D1:
   ```bash
   npm run db:deploy
   ```

The template uses [Drizzle ORM](https://orm.drizzle.team/) to manage database schema and migrations:
- Schema is defined in `app/db/schema.ts`
- Migrations are stored in `drizzle` directory
- Configuration is in `drizzle.config.ts`
