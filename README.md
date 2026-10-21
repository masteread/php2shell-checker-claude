**[Instrucciones en español al final](#espanol)**

# PHP2Shell Checker for Claude Code

Check whether a website or server runs a PHP version affected by **PHP2Shell**:
the two critical remote code execution vulnerabilities (CVE-2026-109618 and
CVE-2026-109619) fixed in the PHP security releases of October 21, 2026. It
sends no exploit requests: it only reads the version the server advertises in
its HTTP headers, or the one `php -v` reports.

This is a Claude Code port of
[openai/php2shell-checker](https://github.com/openai/php2shell-checker)
(Apache 2.0), packaged as a plugin. It needs Node.js (a patched version, see
below) and no packages.

## Official advisories

**PHP** ([October 21, 2026 advisory](https://www.php.net/archive/2026.php#2026-10-21-5)):

| CVE | Description | Advisory |
| --- | --- | --- |
| CVE-2026-109618 | RCE via OOM corruption | [GHSA-w8hw-w9fx-j79w](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w) |
| CVE-2026-109619 | RCE via stale global state | [GHSA-6wmf-4rv5-p3rp](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp) |

- Fixed versions: **8.5.12, 8.4.27, 8.3.36 and 8.2.35**.
- Affects every installation serving web requests: PHP-FPM, Apache with
  mod_php (highest risk), php-cgi, FrankenPHP and LiteSpeed.
- PHP 8.1 and older have no official fixed release. They are fixed only by
  your distribution or LTS vendor's backport, or by building from the source
  backport branches the PHP team published for 7.4, 8.0 and 8.1.
- The advisory's temporary mitigations reduce exposure but do **not** make an
  installation safe. Updating is the only complete fix.

**Node.js** ([October 21, 2026 security releases](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)):
the checker connects to servers you do not control, and these releases fix,
among others, a Brotli decoder RCE (CVE-2026-111497) and several TLS
certificate validation bypasses. Use **Node 22.23.4, 24.22.1, 26.12.1 or
later** on your release line. The `/phpcheck:url` skill checks your Node
version before running the checker, and the checker itself prints a warning on
stderr when you run it on an unpatched Node (the result and exit code do not
change).

## Installation

Inside Claude Code:

```text
/plugin marketplace add masteread/php2shell-checker-claude
/plugin install phpcheck@php2shell
```

Or from a terminal:

```sh
claude plugin marketplace add masteread/php2shell-checker-claude
claude plugin install phpcheck@php2shell
```

If you prefer not to install a plugin, copy the folders in `skills/` to
`~/.claude/skills/` (they are then invoked as `/url` and `/server`).

## Usage

There are two skills. Claude picks them on its own when you ask about your PHP
version or PHP2Shell, and you can also invoke them directly:

| Skill | When to use it | Example |
| --- | --- | --- |
| `/phpcheck:url` | You only have the site's URL | `/phpcheck:url example.com` |
| `/phpcheck:server` | You have local or SSH access to the server | `/phpcheck:server check the PHP serving my site` |

Or in plain language:

```text
Is https://example.com still vulnerable to PHP2Shell?
```

Only check sites and servers you own or are authorized to assess.

## Run directly (without Claude)

```sh
node phpcheck.js "https://example.com"
node phpcheck.js "https://example.com" --json
node phpcheck.js --local            # command-line PHP
node phpcheck.js --local --php /usr/sbin/php-fpm8.3
```

## Results

| Result | Exit code | Meaning |
| --- | --- | --- |
| `OK` | `0` | Stable version newer than the cutoff for its branch. |
| `VULNERABLE` | `1` | Version at or below the cutoff for its branch. |
| `UNKNOWN` | `3` | No version or response found, an unlisted branch, or a prerelease build (RC, beta…). |

With `--json`, `patch_status` is `ok`, `vulnerable` or `unknown`. Invalid
arguments exit with code `2`.

### Vulnerable versions (October 20, 2026 cutoffs)

| Branch | Vulnerable through (inclusive) | Branch | Vulnerable through (inclusive) |
| --- | --- | --- | --- |
| 5.4 | 5.4.45 | 8.0 | 8.0.30 |
| 5.5 | 5.5.38 | 8.1 | 8.1.34 |
| 5.6 | 5.6.40 | 8.2 | 8.2.34 |
| 7.0 | 7.0.33 | 8.3 | 8.3.35 |
| 7.1 | 7.1.33 | 8.4 | 8.4.26 |
| 7.2 | 7.2.34 | 8.5 | 8.5.11 |
| 7.3 | 7.3.33 | | |
| 7.4 | 7.4.33 | | |

## Limitations

- Only evaluates the version shown in the `Server` and `X-Powered-By` headers,
  or by `php -v`. Sends `HEAD` (asking for an uncompressed response) and falls
  back to `GET` only when `HEAD` returns 405 or 501. Does not follow redirects
  or read the response body.
- `OK` is a version comparison against the embedded cutoffs. It assumes later
  stable patches in each branch contain the fix; it does not verify the fix
  itself. Compare the cutoffs with the official PHP security advisory.
- Headers can be hidden or changed, and distribution patches (Debian, Ubuntu,
  RHEL…) can fix an older version without changing its number. Check your
  distribution's advisory.
- `UNKNOWN` does **not** mean patched.

## Tests

```sh
npm test
claude plugin validate . --strict
```

The tests start local HTTP servers that simulate PHP headers; no PHP install
or internet access is needed.

## License

[Apache License 2.0](LICENSE). See [NOTICE](NOTICE) for the code's origin and
the changes made.

---

<a id="espanol"></a>

# Español — PHP2Shell Checker para Claude Code

Comprueba si un sitio web o un servidor usa una versión de PHP afectada por
**PHP2Shell**: las dos vulnerabilidades críticas de ejecución remota de código
(CVE-2026-109618 y CVE-2026-109619) corregidas en las versiones de seguridad
de PHP publicadas el 21 de octubre de 2026. No envía peticiones de explotación:
solo lee la versión que anuncia el servidor (cabeceras HTTP) o la que devuelve
`php -v`.

Es una adaptación para Claude Code de
[openai/php2shell-checker](https://github.com/openai/php2shell-checker)
(Apache 2.0), empaquetada como plugin. Usa Node.js (versión parcheada, ver
abajo) y no necesita instalar paquetes.

## Avisos oficiales

**PHP** ([aviso del 21 de octubre de 2026](https://www.php.net/archive/2026.php#2026-10-21-5)):

| CVE | Descripción | Aviso |
| --- | --- | --- |
| CVE-2026-109618 | RCE por corrupción tras falta de memoria (OOM) | [GHSA-w8hw-w9fx-j79w](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w) |
| CVE-2026-109619 | RCE por estado global obsoleto entre peticiones | [GHSA-6wmf-4rv5-p3rp](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp) |

- Versiones corregidas: **8.5.12, 8.4.27, 8.3.36 y 8.2.35**.
- Afecta a toda instalación que sirva peticiones web: PHP-FPM, Apache con
  mod_php (el riesgo más alto), php-cgi, FrankenPHP y LiteSpeed.
- PHP 8.1 y anteriores no tienen versión oficial corregida: solo backports de
  tu distribución o proveedor LTS, o las ramas de código fuente que publicó el
  equipo de PHP para 7.4, 8.0 y 8.1.
- Las mitigaciones temporales del aviso reducen la exposición, pero **no**
  hacen segura la instalación. Actualizar es la única solución completa.

**Node.js** ([avisos del 21 de octubre de 2026](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)):
el checker se conecta a servidores que no controlas, y estas versiones
corrigen, entre otros fallos, una RCE en el descompresor Brotli
(CVE-2026-111497) y varios saltos de validación de certificados TLS. Usa
**Node 22.23.4, 24.22.1, 26.12.1 o posterior** en su rama. La skill
`/phpcheck:url` revisa tu versión de Node antes de ejecutar el checker, y el
propio checker muestra un aviso en stderr si lo ejecutas con un Node sin
parchear (el resultado y el código de salida no cambian).

## Instalación

Dentro de Claude Code:

```text
/plugin marketplace add masteread/php2shell-checker-claude
/plugin install phpcheck@php2shell
```

O desde la terminal:

```sh
claude plugin marketplace add masteread/php2shell-checker-claude
claude plugin install phpcheck@php2shell
```

Si prefieres no instalar un plugin, copia las carpetas de `skills/` a
`~/.claude/skills/` (en ese caso se invocan como `/url` y `/server`).

## Uso

Hay dos skills. Claude las elige solo cuando preguntas por la versión de PHP o
por PHP2Shell, y también puedes invocarlas directamente:

| Skill | Cuándo usarla | Ejemplo |
| --- | --- | --- |
| `/phpcheck:url` | Solo tienes la URL del sitio | `/phpcheck:url ejemplo.com` |
| `/phpcheck:server` | Tienes acceso local o por SSH al servidor | `/phpcheck:server revisa el PHP que sirve mi sitio` |

También en lenguaje natural:

```text
¿Mi sitio https://ejemplo.com sigue vulnerable a PHP2Shell?
```

Usa estas herramientas solo en sitios y servidores tuyos o que tengas
autorización para revisar.

## Ejecución directa (sin Claude)

```sh
node phpcheck.js "https://ejemplo.com"
node phpcheck.js "https://ejemplo.com" --json
node phpcheck.js --local            # PHP de la línea de comandos
node phpcheck.js --local --php /usr/sbin/php-fpm8.3
```

## Resultados

| Resultado | Código de salida | Significado |
| --- | --- | --- |
| `OK` | `0` | Versión estable posterior al corte de su rama. |
| `VULNERABLE` | `1` | Versión igual o anterior al corte de su rama. |
| `UNKNOWN` | `3` | No se encontró versión o respuesta, la rama no está en la tabla, o es una versión de prueba (RC, beta…). |

Con `--json`, `patch_status` vale `ok`, `vulnerable` o `unknown`. Los
argumentos inválidos salen con código `2`.

### Versiones vulnerables (corte del 20 de octubre de 2026)

| Rama | Vulnerable hasta (inclusive) | Rama | Vulnerable hasta (inclusive) |
| --- | --- | --- | --- |
| 5.4 | 5.4.45 | 8.0 | 8.0.30 |
| 5.5 | 5.5.38 | 8.1 | 8.1.34 |
| 5.6 | 5.6.40 | 8.2 | 8.2.34 |
| 7.0 | 7.0.33 | 8.3 | 8.3.35 |
| 7.1 | 7.1.33 | 8.4 | 8.4.26 |
| 7.2 | 7.2.34 | 8.5 | 8.5.11 |
| 7.3 | 7.3.33 | | |
| 7.4 | 7.4.33 | | |

## Limitaciones

- Solo evalúa la versión que aparece en las cabeceras `Server` y
  `X-Powered-By`, o en `php -v`. Envía `HEAD` (pidiendo respuesta sin
  comprimir) y solo recurre a `GET` si `HEAD` devuelve 405 o 501. No sigue
  redirecciones ni lee el cuerpo de la respuesta.
- `OK` es una comparación de versiones contra los cortes incluidos. Supone que
  los parches estables posteriores de cada rama incluyen la corrección; no
  verifica la corrección por sí mismo. Contrasta los cortes con el aviso de
  seguridad oficial de PHP.
- Las cabeceras se pueden ocultar o modificar, y los parches que aplican las
  distribuciones (Debian, Ubuntu, RHEL…) pueden corregir una versión antigua
  sin cambiar su número. Revisa el aviso de tu distribución.
- `UNKNOWN` **no** significa que esté parcheado.

## Pruebas

```sh
npm test
claude plugin validate . --strict
```

Las pruebas levantan servidores HTTP locales que simulan cabeceras de PHP; no
hace falta tener PHP instalado ni acceso a internet.

## Licencia

[Apache License 2.0](LICENSE). Ver [NOTICE](NOTICE) para el origen del código
y los cambios realizados.
