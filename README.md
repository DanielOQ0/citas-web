# citas-web

Frontend Angular 21 (SPA, TypeScript) del sistema ficticio de agendamiento de citas FCV. Consume `citas-api` por REST directo, sin BFF ni Express.

## Ejecutar

Desde la raíz del workspace, `docker compose up -d` levanta MySQL, la API y este frontend en `http://localhost:4200`.
En local: `npm ci` y luego `npm start`. La URL de la API se define en `src/environments/environment.ts` (override de laboratorio: `localStorage.fcv_api_url`).

## Verificar

```text
npm run build                 # build de producción con presupuestos
npm test -- --watch=false     # pruebas unitarias (Vitest)
npm run lint                  # angular-eslint, incluidas las reglas de accesibilidad de plantillas
```

La evidencia E2E por HU (`playwright-cli`) está en `citas-api/docs/wiki/scrum/evidencias/2026-10/`.

## Estructura

- `services/session.service.ts`: usuario y rol solo desde el login o `GET /api/me` (también tras F5). No hay cambio manual de vista.
- `auth.guard.ts` + `pages/*/*.routes.ts`: un grupo de rutas lazy por rol con `canMatch` (paciente, profesional, administrador); cada rol descarga solo su vista.
- `services/scheduling-api.service.ts`: cliente del contrato oficial (`citas-api/docs/wiki/llm-wiki/wiki/contratos-rest.md`); el token lo agrega `auth.interceptor.ts`.
- `shared/`: formato de fechas y estados, mensajes de error del contrato, diálogo de motivo e historial de estados.
- `src/styles.css`: tokens del diseño aprobado y patrones `fcv-*` reutilizables.
