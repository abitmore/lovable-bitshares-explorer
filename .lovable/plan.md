

## Bump Vite to ^7.3.2

### Steps

1. **Edit `package.json` line 86**: Change `"vite": "^7.3.1"` to `"vite": "^7.3.2"`
2. **Wait for automatic lock file regeneration** — the system should detect the `package.json` change and update `bun.lock` and `package-lock.json` automatically
3. **If lock files are not regenerated**, investigate why and report back before taking further action

No dependency cycling will be performed.

