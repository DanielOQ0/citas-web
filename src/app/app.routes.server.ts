import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // La identidad se restaura desde localStorage en el navegador. Si esta
    // ruta se prerenderiza, el guard se ejecuta sin acceso a ese storage y
    // redirige erróneamente a /login al recargar una página protegida.
    renderMode: RenderMode.Client,
  },
];
