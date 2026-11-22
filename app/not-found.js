import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-white">
      <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Error 404</span>
      <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight mb-4">Page Not Found</h1>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
        The collection, product, or page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-8 py-3.5 bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-widest transition-colors shadow"
      >
        Return to Home
      </Link>
    </div>
  );
}
