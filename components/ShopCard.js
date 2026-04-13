import Link from 'next/link';

export default function ShopCard({ shop }) {
  return (
    <article className="card hover-lift group cursor-pointer overflow-hidden">
      <div className="h-52 w-full overflow-hidden rounded-3xl bg-slate-100">
        {shop.media?.bannerUrl ? (
          <img
            src={shop.media.bannerUrl}
            alt={`${shop.businessName} banner`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">No banner yet</div>
        )}
      </div>
      <div className="mt-5">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-700">{shop.category || 'Featured Shop'}</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">
          {shop.businessName}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3">{shop.description}</p>
      </div>
      <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
        <span>{shop.location || 'Global'}</span>
        <Link
          href={`/shop/${shop.id}`}
          className="rounded-full bg-brand-900 px-4 py-2 text-white transition hover:bg-brand-700 hover:shadow-md"
        >
          Visit Shop
        </Link>
      </div>
    </article>
  );
}
