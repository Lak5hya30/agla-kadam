import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page space-y-4 py-10 text-center">
      <p className="text-4xl" aria-hidden="true">🧭</p>
      <h1 className="text-2xl font-extrabold text-ink">Page not found</h1>
      <p className="text-ink-soft">
        That page doesn’t exist in this prototype.
      </p>
      <Link href="/" className="btn-primary inline-flex">
        Go home
      </Link>
    </div>
  );
}
