---
name: server
description: Check whether the PHP serving a site on this machine or server is patched against PHP2Shell (October 2026 PHP security releases). Use when the user has local or SSH access and asks if their PHP install is vulnerable or patched.
allowed-tools: Bash(php -v) Bash(php -i *) Bash(php-fpm* -v) Bash(which php*)
---

PHP2Shell refers to CVE-2026-109618 (RCE via OOM corruption) and
CVE-2026-109619 (RCE via stale global state), fixed in PHP 8.5.12, 8.4.27,
8.3.36 and 8.2.35 on October 21, 2026
(https://www.php.net/archive/2026.php#2026-10-21-5). They affect every PHP
installation serving web requests: PHP-FPM, Apache with mod_php (highest
risk), php-cgi, FrankenPHP and LiteSpeed.

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

PHP 8.1 and older received no upstream release. They are fixed only by a
distribution or LTS vendor backport, or by a build from the PHP security
team's source backport branches for 7.4, 8.0 and 8.1. These builds keep the
old version number, so confirm the build source before reporting them as
patched. Packages from `rpms.remirepo.net` were not updated on release day.

If the user cannot update immediately, the advisory lists measures that reduce
exposure but do not make an installation safe, such as
`session.upload_progress.enabled=0` and a low `post_max_size` set in
`php.ini` or the FPM pool, followed by a restart of every worker. Point the
user to the advisory for the full list, and always say that updating is the
only complete fix.

The running PHP build and the vendor's package advisory are the useful checks.
Configuration settings alone do not establish that PHP is patched.
Report the version, patch status, and any required update. If you cannot
verify the serving version, report unknown. Do not run exploit probes.
