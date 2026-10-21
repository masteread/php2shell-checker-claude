# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí. El formato
sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto
usa [versionado semántico](https://semver.org/lang/es/).

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
