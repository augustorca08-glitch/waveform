import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[80dvh] max-w-[1400px] flex-col justify-center px-4 pt-[var(--header-h)] md:px-8">
      <p className="mono text-sm text-ink-soft">Error 404</p>
      <h1 className="display mt-4 max-w-[10ch] text-[clamp(3.2rem,12vw,10rem)]">Se la llevó la marea</h1>
      <p className="mt-6 max-w-[40ch] text-lg">La página que buscás no existe o cambió de lugar.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-ink">
          Volver al inicio
        </Link>
        <Link href="/shop" className="btn btn-outline">
          Ver todo el shop
        </Link>
      </div>
    </section>
  );
}
