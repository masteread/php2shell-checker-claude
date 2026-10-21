# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí. El formato
sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto
usa [versionado semántico](https://semver.org/lang/es/).

## [1.2.0] - 2026-10-21

### Añadido

- El checker muestra un aviso en stderr cuando se ejecuta contra una URL con
  un Node.js sin los parches del 21 de octubre de 2026 (anterior a 22.23.4,
  24.22.1 o 26.12.1, o de una rama sin soporte). El resultado, el JSON y el
  código de salida no cambian, y `--local` no avisa porque no usa la red.
- Pruebas del aviso con versiones parcheadas, sin parchear y sin soporte.

## [1.1.1] - 2026-10-21

### Cambiado

- README bilingüe: instrucciones completas en inglés primero y en español al
  final, con un enlace a la sección en español en la primera línea.

## [1.1.0] - 2026-10-21

### Añadido

- Referencias a los avisos oficiales de PHP (CVE-2026-109618, CVE-2026-109619)
  y Node.js del 21 de octubre de 2026 en el README y las skills.
- `/phpcheck:url` revisa primero que Node.js esté parcheado (22.23.4, 24.22.1
  o 26.12.1 en su rama) antes de conectarse a un sitio.
- `/phpcheck:server` explica qué instalaciones están en riesgo, cómo tratar
  PHP 8.1 y anteriores y que las mitigaciones temporales no sustituyen a
  actualizar.

### Cambiado

- El checker pide respuestas sin comprimir (`Accept-Encoding: identity`).

### Verificado

- Los cortes de versiones vulnerables coinciden con las versiones corregidas
  del aviso de PHP (8.5.12, 8.4.27, 8.3.36 y 8.2.35).

## [1.0.1] - 2026-10-21

### Corregido

- `/phpcheck:url` ya no falla cuando Claude añade comandos al checker (como
  `; echo $?`): la skill indica ejecutarlo tal cual, para que siga
  preaprobado por `allowed-tools`.

## [1.0.0] - 2026-10-21

### Añadido

- Plugin `phpcheck` para Claude Code con el marketplace `php2shell`.
- Skill `/phpcheck:url`: revisa la versión de PHP que anuncia un sitio web.
- Skill `/phpcheck:server`: revisa la versión de PHP instalada con acceso al servidor.
- Checker de [openai/php2shell-checker](https://github.com/openai/php2shell-checker)
  sin cambios, con los cortes de versiones vulnerables del 20 de octubre de 2026.
- README en español, NOTICE y pruebas en `test/`.
