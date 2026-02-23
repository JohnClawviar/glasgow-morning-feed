# gh CLI integration skill

This is a lightweight SKill.md-esque guide to help you leverage the GitHub CLI (gh) from within this OpenClaw workspace.

## Prerequisites
- gh CLI installed on your machine
- Access to a GitHub account with appropriate permissions
- GH_TOKEN environment variable if using token-based auth

## Setup
1) Install gh (example for Debian/Ubuntu)
   - sudo apt update
   - sudo apt install gh
2) Authenticate safely
   - Option A: interactive login
     - gh auth login
   - Option B: login with token (store token in env var)
     - export GH_TOKEN=YOUR_TOKEN
     - gh auth login --with-token < <(echo "$GH_TOKEN")

## Quick usage examples
- Check auth status:
  gh auth status
- Clone a repo:
  gh repo clone owner/repo
- Create a new repo:
  gh repo create owner/new-repo --private --confirm
- Create a PR:
  gh pr create --title "Draft PR" --body "PR body" --base main --head feature-branch
- List PRs:
  gh pr list

## Safety notes
- Do not paste tokens in chat. Use environment variables and local execution only.
- Use SSH URLs or HTTPS with tokens; prefer gh auth storage over per-command tokens.

## Next steps
- Tailor this to your exact owner/repo and the desired automation (e.g., auto-create repos, auto-prs).
