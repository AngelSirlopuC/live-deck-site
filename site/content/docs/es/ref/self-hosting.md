<!-- source: live-deck/docs/self-hosting.md sha256:dfe0e75c45a1 -->
# Autoalojar Live Deck

Live Deck es un solo proceso de Node.js sin base de datos: todo lo que una sesión
necesita vive en memoria. Solo ejecutas un contenedor.

## Inicio rápido

Requisitos: Docker con el plugin de Compose.

```sh
git clone <this repository> live-deck && cd live-deck
cp .env.example .env
# Edita .env y define ADMIN_KEY, por ejemplo con la salida de:
openssl rand -base64 32
docker compose up -d --build
```

Abre <http://localhost:8787/>, ingresa la clave de administrador cuando te la pida (el navegador
la recuerda en el almacenamiento local), elige un deck y crea una sesión. Obtienes dos
enlaces: el enlace del presentador (mantenlo privado, está protegido con un PIN) y el
enlace del público, que también se muestra como código QR en la primera diapositiva.

Verifica que el contenedor esté saludable:

```sh
docker compose ps            # STATUS muestra (healthy)
curl -s http://127.0.0.1:8787/api/health
```

El servidor se niega a iniciar en producción sin `ADMIN_KEY`; revisa
`docker compose logs live-deck` si el contenedor se sigue reiniciando.

## Configuración

Cada variable está documentada en [`.env.example`](../.env.example):

| Variable | Propósito |
| --- | --- |
| `ADMIN_KEY` | Obligatoria. Protege la creación de sesiones y la lista de decks. |
| `PUBLIC_BASE_URL` | URL pública para los enlaces de ingreso y los códigos QR, por ejemplo `https://deck.example.com`. |
| `TRUST_PROXY` | `1` solo detrás de un proxy inverso de confianza. |
| `ALLOWED_ORIGINS` | Orígenes exactos que pueden abrir WebSockets; vacío = el mismo host. |
| `GIPHY_API_KEY` | Opcional; activa los stickers en el chat. |
| `PORT`, `HOST`, `DECKS_DIR` | Los valores por defecto de la imagen (`8787`, `0.0.0.0`, `/app/decks`) casi nunca necesitan cambios. |

Después de editar `.env`, aplícalo con `docker compose up -d` (vuelve a crear el
contenedor).

## Agregar decks

`./decks` se monta en modo solo lectura dentro del contenedor, así que agregas decks sin
reconstruir:

```text
decks/
  my-talk/
    deck.json      # format v1, see shared/deck.ts and decks/demo/deck.json
    assets/        # optional images referenced by the deck
```

El id del deck es el nombre de la carpeta (letras minúsculas, dígitos y guiones). Los decks
se leen del disco cuando se crea una sesión, así que un deck nuevo o editado está
disponible de inmediato. Las notas del presentador y las respuestas de los quizzes en `deck.json` nunca
se envían a los asistentes.

## HTTPS con Caddy

Los asistentes ingresan desde sus celulares, normalmente por internet, así que sirve Live Deck
por HTTPS. [`deploy/Caddyfile.example`](../deploy/Caddyfile.example) es una
configuración completa de proxy inverso con certificados automáticos, soporte para WebSocket
y cabeceras de seguridad (HSTS, CSP, sin referrer).

1. Apunta el DNS de tu dominio al servidor y abre los puertos 80 y 443.
2. Instala Caddy, copia el ejemplo a `/etc/caddy/Caddyfile` y reemplaza
   `deck.example.com` por tu dominio.
3. En `.env` define `PUBLIC_BASE_URL=https://your-domain` y `TRUST_PROXY=1`,
   y luego ejecuta `docker compose up -d`.
4. Recarga Caddy.

Mantén el mapeo de puertos por defecto `127.0.0.1:8787:8787` cuando uses Caddy:
`TRUST_PROXY=1` solo es seguro mientras el proxy sea la única forma de llegar a la app.
De lo contrario, cualquiera podría falsificar `X-Forwarded-For` y saltarse los límites de solicitudes por IP.

## Salas sin internet (LAN)

En un aula o una sala de reuniones, los celulares conectados al mismo Wi-Fi pueden ingresar directamente a la laptop
que ejecuta Live Deck:

1. Busca la dirección LAN de la laptop (por ejemplo `192.168.1.20`).
2. En `compose.yaml` cambia el mapeo de puertos a `"192.168.1.20:8787:8787"`.
3. En `.env` define `PUBLIC_BASE_URL=http://192.168.1.20:8787` para que el código QR apunte
   a esa dirección, y deja `TRUST_PROXY` vacío.
4. Ejecuta `docker compose up -d` y luego abre `http://192.168.1.20:8787/` en la laptop.

Notas: muchas redes Wi-Fi de invitados o corporativas aíslan a los clientes entre sí;
usa una red que controles o el punto de acceso de un celular. Sin HTTPS, todo excepto
las acciones del presentador protegidas con PIN viaja sin cifrar por esa red.
Las fuentes y los stickers se siguen cargando desde internet cuando hay conexión; sin ella, la
app usa las fuentes del sistema y los stickers no están disponibles.

## Stickers (GIPHY)

Define `GIPHY_API_KEY` (clave gratuita de <https://developers.giphy.com/>) para activar
los stickers en el chat. Las búsquedas pasan por el servidor, que solo pide contenido G/PG
y limita las solicitudes de cada asistente; la clave nunca llega a los navegadores. Sin
clave, el chat funciona solo en modo texto.

## Privacidad

- Las sesiones se guardan **solo en memoria**. No se escribe nada en el disco.
- Una sesión terminada se elimina 30 minutos después de que termina, o de inmediato cuando el
  presentador la elimina después de descargar el resumen.
- Reiniciar o actualizar el servidor **termina todas las sesiones activas**. Hazlo
  entre charlas.
- El resumen descargable contiene los resultados de los quizzes, el ranking y la cantidad
  de reacciones, nunca los mensajes del chat.
- Las imágenes de los stickers las cargan los dispositivos de los asistentes **directamente desde GIPHY**, que
  por lo tanto ve sus direcciones IP. Deja `GIPHY_API_KEY` vacío si eso no es
  aceptable para tu público.
- Las fuentes se cargan desde Google Fonts en cada navegador que abre la app.
- La clave de administrador se guarda en el almacenamiento local del navegador del presentador. Usa un
  perfil de navegador dedicado en computadoras compartidas.

## Dimensionamiento

Live Deck apunta a unos **200 asistentes por sesión**. Un VPS pequeño (1 vCPU,
1 GB de RAM) ejecuta con holgura una sesión de ese tamaño; el trabajo es repartir mensajes por WebSocket,
no hacer cálculos. Varias sesiones simultáneas más pequeñas caben en la misma
instancia. Ejecuta una sola instancia: las sesiones viven en memoria y no se comparten
entre procesos.

## Actualizar

```sh
git pull
docker compose up -d --build
docker image prune -f        # opcional: elimina la imagen anterior
```

Actualizar reinicia el contenedor y termina todas las sesiones activas; prográmalo
entre presentaciones.
