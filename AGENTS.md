# Agente principal de `citas-web`

## Estado observado

Este repositorio está vacío de aplicación: no existe `package.json`, framework, código fuente, rutas, componentes, estilos/tokens ni evidencia de un diseño aprobado de Stitch/Google AI Studio. No asumir React ni Angular, ni crear o reemplazar un framework por preferencia propia.

Antes de implementar UI, debe existir un handoff aprobado de Stitch → Google AI Studio y el código exportado debe estar presente en este repositorio. La estructura, scripts y comandos de build/typecheck/tests se deducen entonces de esa evidencia real.

## Alcance

Este agente implementa exclusivamente el frontend:

- TypeScript y el stack efectivamente exportado por Google AI Studio.
- Pantallas, componentes, formularios, estados de UI, accesibilidad y pruebas/build.
- Consumo directo por REST de `citas-api`.
- Reconciliación fiel al diseño aprobado.

No modificar `citas-api`, ni añadir Express, BFF o reglas de negocio que sean autoridad del backend.

## Fuentes de verdad

Leer antes de cualquier cambio, en este orden:

1. `../PRD.md` y `../RESTRICCIONES_TECNICAS.md`.
2. La HU, criterios de aceptación y DoD aprobados en `../citas-api/docs/wiki/scrum/`.
3. `README.md`, este archivo y el `package.json`/documentación del proyecto cuando existan.
4. El diseño aprobado, sus tokens, assets, rutas y handoff de AI Studio.
5. `../citas-api/docs/wiki/llm-wiki/wiki/index.md` solo como contexto global.

Actualmente no existen HU/DoD, código exportado ni documentación de diseño en este repositorio. Si una tarea requiere cualquiera de ellos, no inventar el alcance, contrato, estética o framework: reportar el bloqueo y solicitar el insumo correspondiente.

La LLM Wiki es global y la mantiene el orquestador. Este agente puede consultarla, pero no crearla ni actualizarla.

## Integración y seguridad

- El navegador consume `citas-api` directamente por REST; no añadir Express/BFF.
- La URL de API debe configurarse mediante el mecanismo de environment del stack detectado; nunca hardcodearla.
- No hardcodear tokens, secretos ni credenciales, ni leer o mostrar `.env`.
- El backend es autoridad para reglas, validación, transiciones de estado, permisos y disponibilidad. La validación cliente solo mejora la experiencia.
- Implementar autorización de rutas y manejo de sesión únicamente contra el contrato aprobado; no inferir endpoints, payloads ni ciclo de refresh token.
- Si el contrato REST no permite una pantalla o estado requerido, comunicar el cambio cross-repo al orquestador. No editar `citas-api`.

## Fidelidad visual y accesibilidad

- Preservar componentes, layout, estilos, tokens y assets correctos del diseño aprobado al reconciliar la exportación de AI Studio.
- No rediseñar pantallas aprobadas para resolver una necesidad técnica sin aprobación de diseño.
- Para cada pantalla o flujo, mapear explícitamente estados `loading`, `empty`, `error`, `success` y `disabled` cuando apliquen.
- Mantener etiquetas, foco, navegación por teclado, mensajes de error comprensibles y semántica HTML accesible, conforme al diseño y criterios aprobados.

## Flujo de trabajo por HU

1. Localizar HU, criterios de aceptación, DoD y evidencia de diseño aprobados.
2. Identificar pantallas, rutas, componentes, servicios REST y estados UI afectados.
3. Presentar un plan con archivos afectados antes de editar.
4. Implementar el mínimo coherente sin apartarse del diseño aprobado ni duplicar negocio en cliente.
5. Ejecutar build, typecheck y pruebas disponibles en el proyecto importado.
6. Verificar comportamiento, accesibilidad y estados UI contra criterios de aceptación; declarar lo no verificado.

Mientras no exista `package.json`, no inventar comandos de Node ni herramientas de prueba.

## Git y cambios ajenos

- Trabajar en `develop`; `main` representa puntos estables.
- Mantener commits trazables y no reescribir historial.
- Preservar cambios ajenos no relacionados.
