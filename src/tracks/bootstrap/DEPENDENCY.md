# Vendored Dependency: Bootstrap CSS

## Metadata
- **Package:** Bootstrap
- **Version:** 5.3.3
- **Source:** Official npm package `bootstrap@5.3.3` (`dist/css/bootstrap.min.css`)
- **Licence:** MIT (see `vendor/LICENSE-bootstrap`)
- **File:** `src/tracks/bootstrap/vendor/bootstrap.min.css`
- **SHA256:** `3c8f27e6009ccfd710a905e6dcf12d0ee3c6f2ac7da05b0572d3e0d12e736fc8`

## Purpose
Self-contained framework stylesheet injected exclusively into the sandboxed learner preview iframe document for Bootstrap track exercises. This ensures the main CodeOrbit platform UI remains 100% untouched by external framework styles and enforces the offline-first zero-remote-dependency invariant.

## Update Procedure
1. Verify upstream release notes and security advisories for Bootstrap.
2. Download and unpack the release: `npm pack bootstrap@<new-version>`.
3. Extract `dist/css/bootstrap.min.css` and `LICENSE` into `src/tracks/bootstrap/vendor/`.
4. Calculate the SHA256 checksum: `Get-FileHash -Algorithm SHA256 src/tracks/bootstrap/vendor/bootstrap.min.css`.
5. Update this file (`DEPENDENCY.md`) with the new version and SHA256 hash.
6. Run `npm test` to verify the hash verification test passes.
