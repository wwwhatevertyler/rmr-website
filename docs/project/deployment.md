# Deployment

_Production hosting, domains, and deploy workflow._

## Netlify

- Netlify app domain: `https://rollmyretirement.netlify.app`
- Production host: Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Netlify configuration: `netlify.toml`

## GitHub

- Repository: `https://github.com/wwwhatevertyler/rmr-website`
- Netlify is connected to the GitHub project. Pushing to the production branch should trigger a Netlify build.

## Domain Targets

- Current Netlify app domain: `https://rollmyretirement.netlify.app`
- Production custom domains: `https://www.rollmyretirement.com` and `https://rollmyretirement.com`
- Preferred primary host: `www.rollmyretirement.com`

## Notes

- Do not publish the repo root directly. The root contains project docs, tasks, stale Framer exports, and local experiments.
- If using Netlify CLI, deploy the generated `dist/` folder to the Netlify app domain above.
