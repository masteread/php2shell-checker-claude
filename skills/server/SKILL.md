---
name: server
description: Check whether the PHP serving a site on this machine or server is patched against PHP2Shell (October 2026 PHP security releases). Use when the user has local or SSH access and asks if their PHP install is vulnerable or patched.
allowed-tools: Bash(php -v) Bash(php -i *) Bash(php-fpm* -v) Bash(which php*)
---

Check the PHP version serving the site. Start with `php -v`, but verify that
it matches the site's PHP-FPM or Apache installation. The CLI binary is often
a different version from the one that serves web requests. Look for
`php-fpm*` binaries, the web server's PHP handler, or a `phpinfo()` page the
user already has.

Vulnerable ranges used by the checker as of October 20, 2026:

| PHP branch | Vulnerable range (inclusive) |
| --- | --- |
| 5.4 | 5.4.0 to 5.4.45 |
| 5.5 | 5.5.0 to 5.5.38 |
| 5.6 | 5.6.0 to 5.6.40 |
| 7.0 | 7.0.0 to 7.0.33 |
| 7.1 | 7.1.0 to 7.1.33 |
| 7.2 | 7.2.0 to 7.2.34 |
| 7.3 | 7.3.0 to 7.3.33 |
| 7.4 | 7.4.0 to 7.4.33 |
| 8.0 | 8.0.0 to 8.0.30 |
| 8.1 | 8.1.0 to 8.1.34 |
| 8.2 | 8.2.0 to 8.2.34 |
| 8.3 | 8.3.0 to 8.3.35 |
| 8.4 | 8.4.0 to 8.4.26 |
| 8.5 | 8.5.0 to 8.5.11 |

Compare the version and full package revision with current PHP or vendor
security advisories. Vendor backports may fix an older version. For a
distribution package, check the installed package revision (for example with
`dpkg -l 'php*'` or `rpm -qa 'php*'`) against the vendor's advisory. Treat
unlisted branches as unknown until an advisory confirms their status.

The running PHP build and the vendor's package advisory are the useful checks.
Configuration settings alone do not establish that PHP is patched.
Report the version, patch status, and any required update. If you cannot
verify the serving version, report unknown. Do not run exploit probes.
