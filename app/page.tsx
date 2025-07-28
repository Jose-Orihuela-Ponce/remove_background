'use client';

import dynamic from 'next/dynamic';

// Importar el componente dinámicamente para evitar errores de hidratación
const BackgroundRemover = dynamic(
  () => import('../components/BackgroundRemover'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <main className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Removedor de Fondos de Imágenes
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Sube una imagen y elimina el fondo automáticamente
          </p>
        </div>
        <BackgroundRemover />
      </main>
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Procesamiento 100% en el navegador - Sin envío de datos al servidor</p>
      </footer>
    </div>
  );
}
