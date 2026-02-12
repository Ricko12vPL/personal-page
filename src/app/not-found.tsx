import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-[1100px] mx-auto px-8 py-32 text-center">
      <h1 className="font-pixel text-accent text-6xl sm:text-8xl mb-6">
        404
      </h1>
      <p className="text-neutral-500 text-[15px] mb-8">
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="text-accent text-[13px] hover:opacity-70 transition-opacity"
      >
        Go home &rarr;
      </Link>
    </div>
  )
}
