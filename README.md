# Removedor de fondos de imagenes

Aplicacion web para subir una imagen, eliminarle el fondo automaticamente en el navegador y descargar el resultado en PNG. Tambien permite anadir un borde tipo halo con color y grosor configurables antes de exportar la imagen final.

## Que hace

- Sube imagenes desde clic o arrastrar y soltar.
- Elimina el fondo directamente en el navegador.
- Muestra la imagen original y el resultado sin fondo.
- Permite activar un borde o halo alrededor del sujeto.
- Ofrece colores predefinidos y control de grosor para el borde.
- Descarga el resultado final como archivo PNG.

## Stack

- [Next.js 15](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [`@imgly/background-removal`](https://www.npmjs.com/package/@imgly/background-removal)

## Como funciona

1. El usuario selecciona una imagen.
2. La app genera una vista previa local de la imagen original.
3. `@imgly/background-removal` procesa la imagen en el navegador para quitar el fondo.
4. El resultado se dibuja en un canvas.
5. Si el usuario lo activa, se aplica un efecto de borde o halo con color y grosor personalizables.
6. La imagen final se exporta como PNG.

## Caracteristicas tecnicas

- Procesamiento 100% en el cliente, sin subir la imagen a un servidor.
- Uso de `canvas` para renderizar la version final.
- Soporte para limpieza de `ObjectURL` para evitar fugas de memoria.
- Interfaz con soporte para carga por drag and drop.
- Componentes separados para carga, edicion, canvas y controles de borde.

## Estructura principal

- `app/page.tsx`: pantalla principal.
- `components/BackgroundRemover.tsx`: orquesta el flujo de procesamiento.
- `components/ImageUploader.tsx`: carga y procesa la imagen.
- `components/ImageEditor.tsx`: muestra original, resultado y descarga.
- `components/ImageCanvas.tsx`: renderiza la imagen final en canvas.
- `components/BorderControls.tsx`: configura el borde o halo.

## Requisitos

- Node.js 18 o superior
- npm

## Instalacion

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000` en el navegador.

## Scripts

- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: genera la version de produccion.
- `npm run start`: ejecuta la app compilada.
- `npm run lint`: ejecuta linting.

## Notas

- El proyecto usa `use client` en los componentes principales porque depende de APIs del navegador como `File`, `URL.createObjectURL` y `canvas`.
- La exportacion final se hace como PNG para conservar la transparencia.
