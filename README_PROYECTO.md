# Control de giro con ESP32 — Simulación inicial

Proyecto de la opción 2: **web y API REST desplegadas por separado**.

## Funciones
- Panel web de distancia, modo y estado del motor.
- Control manual: izquierda, derecha y detener.
- Modo automático: **10–25 cm: derecha; 26–40 cm: izquierda; fuera de ese intervalo: detener**.
- Simulación de sensor mediante deslizador (no requiere hardware para probar).
- API REST con estado compartido mediante Cloudflare Durable Object.
- Espacios reservados para las cuatro fotos y apellidos del grupo y el escudo del FC Barcelona.

## Probar la web sin servidor
Abrir `web/index.html` en un navegador. Sin URL de API, la simulación funciona localmente.

## Desplegar la API
Desde la carpeta `api`, ejecutar `npx wrangler deploy` con una cuenta Cloudflare autenticada. Se obtiene una URL `*.workers.dev`.

## Desplegar la web
Crear un proyecto de Cloudflare Pages vinculado a este repositorio, con directorio raíz `web` (o directorio de salida `web` según la interfaz), sin comando de compilación. En la web publicada, pegar la URL del Worker en el campo «URL de API REST».

## Rutas REST
- `GET /api/status` — devuelve `{distance,mode,motor}`.
- `POST /api/distance` — `{"distance":20}`.
- `POST /api/mode` — `{"mode":"auto"}` o `{"mode":"manual"}`.
- `POST /api/motor` — `{"direction":"left"}`, `right` o `stop` (solo manual).

## Importante
Este repositorio implementa **una simulación web**, no el firmware real del ESP32 ni un circuito físico. La distancia es simulada con el deslizador. Antes de usar un motor real, se requiere un controlador/puente H y cableado adecuado. El endpoint está abierto para demostración; antes de exponer hardware a internet deben agregarse autenticación y controles de seguridad. Reemplazar fotos, apellidos y escudo antes de entregar.
