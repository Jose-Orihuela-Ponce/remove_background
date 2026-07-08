'use client';

import dynamic from 'next/dynamic';

const BackgroundRemover = dynamic(() => import('../components/BackgroundRemover'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur xl:p-10">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-cyan-200">
              Procesamiento local
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Removedor de fondos de imagenes
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Sube una imagen, quita el fondo en el navegador y descarga el
              resultado en PNG. Si quieres, agrega un borde tipo halo con color
              y grosor personalizable.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-6 lg:p-8">
          <BackgroundRemover />
        </section>
      </main>

      <footer className="mx-auto mt-8 max-w-6xl pb-4 text-center text-xs text-slate-400">
        <p>Procesamiento 100% en el navegador, sin enviar archivos a un servidor.</p>
      </footer>
    </div>
  );
}
