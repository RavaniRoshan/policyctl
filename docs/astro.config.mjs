// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  base: '/docs',
  site: 'https://policyctl-web.pages.dev',
  integrations: [
    starlight({
      title: 'policyctl docs',
      logo: {
        src: './src/assets/logo.svg',
        replacesTitle: false,
      },
      social: {
        github: 'https://github.com/RavaniRoshan/policyctl',
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Overview',
          items: [{ label: 'Welcome to policyctl', link: '/' }],
        },
        {
          label: 'Tutorials',
          items: [
            { label: 'Getting Started (5 Min)', link: '/tutorials/getting-started/' },
            { label: 'Claude Code Setup', link: '/tutorials/claude-code-setup/' },
            { label: 'Cursor Editor Setup', link: '/tutorials/cursor-setup/' },
            { label: 'GitHub Actions CI Gate', link: '/tutorials/ci-pipeline-setup/' },
          ],
        },
        {
          label: 'How-To Guides',
          items: [
            { label: 'Protect Critical Files', link: '/how-to/protect-critical-files/' },
            { label: 'Intercept Leaked Secrets', link: '/how-to/intercept-secrets/' },
            { label: 'Require Companion Tests', link: '/how-to/require-companion-tests/' },
            { label: 'Limit Blast Radius', link: '/how-to/limit-blast-radius/' },
            { label: 'Author Rules with AI', link: '/how-to/author-rules-with-ai/' },
            { label: 'Migrate from CLAUDE.md', link: '/how-to/migrate-from-prompt-files/' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'CLI Command Reference', link: '/reference/cli-commands/' },
            { label: '.policyctl.yml Schema Spec', link: '/reference/policy-schema/' },
            { label: 'Matchers Reference', link: '/reference/matchers/' },
            { label: 'Enforcement Levels', link: '/reference/enforcement-levels/' },
            { label: 'Agent Hook Formats', link: '/reference/agent-hooks/' },
            { label: 'skill.md Manifest Spec', link: '/reference/skill-manifest/' },
            { label: 'Cloud API Endpoints', link: '/reference/api-cloud/' },
          ],
        },
        {
          label: 'Explanation',
          items: [
            { label: 'Architecture & Engine', link: '/explanation/architecture/' },
            { label: 'Why Advisory Prompts Fail', link: '/explanation/advisory-vs-deterministic/' },
            { label: 'Security Model & Privacy', link: '/explanation/security-model/' },
            { label: 'Hook Execution Lifecycle', link: '/explanation/evaluation-lifecycle/' },
          ],
        },
      ],
    }),
  ],
});
