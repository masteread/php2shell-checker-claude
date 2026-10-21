# PHP2Shell Checker para Claude Code

Comprueba si un sitio web o un servidor usa una versión de PHP afectada por
**PHP2Shell**, la vulnerabilidad corregida en las versiones de seguridad de PHP
publicadas el 20–21 de octubre de 2026. No envía peticiones de explotación:
solo lee la versión que anuncia el servidor (cabeceras HTTP) o la que devuelve
`php -v`.

Es una adaptación para Claude Code de
[openai/php2shell-checker](https://github.com/openai/php2shell-checker)
(Apache 2.0), empaquetada como plugin. Usa Node.js 18 o superior y no necesita
instalar paquetes.

> *English: a Claude Code plugin port of openai/php2shell-checker. Install with
> the two `/plugin` commands below, then run `/phpcheck:url example.com` or
> `/phpcheck:server`.*

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
  `X-Powered-By`, o en `php -v`. Envía `HEAD` y solo recurre a `GET` si `HEAD`
  devuelve 405 o 501. No sigue redirecciones ni lee el cuerpo de la respuesta.
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
