---
name: url
description: Check the PHP version a website advertises in its HTTP headers and report whether it is patched against PHP2Shell (October 2026 PHP security releases). Use when the user gives a URL or hostname and asks if it is vulnerable, patched or up to date.
argument-hint: "<url-or-hostname>"
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/phpcheck.js *)
---

Run the bundled checker against the target. Use HTTPS for a bare hostname:

```sh
node ${CLAUDE_SKILL_DIR}/scripts/phpcheck.js "https://example.com" --json
```

Target: $ARGUMENTS

If no target was given, ask the user for one. Check only sites the user owns
or is authorized to assess.

The checker sends one `HEAD` request (or a `GET` if `HEAD` returns 405 or 501)
and reads the `Server` and `X-Powered-By` headers. It does not follow
redirects. If the site redirects, such as from `http://` to `https://` or to
`www.`, offer to check the final URL.

Exit codes 1 and 3 mean vulnerable and unknown. They are results, not
execution failures. Exit code 2 means invalid arguments.

Report the PHP version, the patch status, and the update needed:

- `vulnerable`: the version is at or below the cutoff for its branch. Recommend
  updating to a newer patch release of that branch or a supported branch.
- `ok`: the version is newer than the cutoff. Headers can be changed, so a
  server-side check (`/phpcheck:server`) is stronger evidence.
- `unknown`: the version is hidden, the branch is not listed, or it is a
  prerelease. `unknown` does not mean patched. Suggest `/phpcheck:server` if
  the user has server access.

Vendor backports (Debian, Ubuntu, RHEL and others) may fix an older upstream
version, so a `vulnerable` result on a distribution build should be confirmed
against that vendor's advisory.

Do not run exploit probes or send any other requests to the target.
