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
          label: 'Get Started',
          items: [
            { label: 'Introduction', link: '/get-started/introduction/' },
            { label: 'Installation', link: '/get-started/installation/' },
            { label: 'Core Concepts', link: '/get-started/core-concepts/' },
            { label: 'Quickstart', link: '/tutorials/getting-started/' },
          ],
        },
        {
          label: 'Provider Guides',
          items: [
            { label: 'Claude Code', link: '/tutorials/claude-code-setup/' },
            { label: 'Cursor', link: '/tutorials/cursor-setup/' },
            { label: 'Codex', link: '/tutorials/codex-setup/' },
            { label: 'Team / Cloud', link: '/guides/team-cloud/' },
          ],
        },
        {
          label: 'CI & Automation',
          items: [
            { label: 'GitHub Actions', link: '/tutorials/ci-pipeline-setup/' },
            { label: 'GitLab CI', link: '/guides/gitlab-ci/' },
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
            { label: 'Environment Variables', link: '/reference/environment-variables/' },
            { label: 'skill.md Manifest Spec', link: '/reference/skill-manifest/' },
            { label: 'Cloud API Endpoints', link: '/reference/api-cloud/' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { label: 'Architecture & Engine', link: '/concepts/architecture/' },
            { label: 'Why Advisory Prompts Fail', link: '/concepts/advisory-vs-deterministic/' },
            { label: 'Security Model & Privacy', link: '/concepts/security-model/' },
            { label: 'Hook Execution Lifecycle', link: '/concepts/evaluation-lifecycle/' },
            { label: 'Performance & Latency', link: '/concepts/performance/' },
          ],
        },
        {
          label: 'Changelog',
          items: [{ label: 'Release History', link: '/changelog/' }],
        },
      ],
    }),
  ],
});
