# How to publish a release

The release flow is one command, run by whoever is doing the release:

```bash
git tag v0.1.0
git push origin v0.1.0
```

That triggers `.github/workflows/publish.yml`, which:
1. Runs the full test + build matrix.
2. Calls `npm publish --provenance --access public` for `@policyctl/cli`.
3. Creates a GitHub release with the tarball attached.

The publish step needs `secrets.NPM_TOKEN` set in the repo
(https://github.com/RavaniRoshan/policyctl/settings/secrets/actions). The token needs
`automation` scope on npmjs.com.
