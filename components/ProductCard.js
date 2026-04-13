import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product, isFavorite, onToggleFavorite, onOrder, showAddToCart = true }) {
  const router = useRouter();
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const mediaItems = [
    ...(product.imageUrls?.map((url) => ({ type: 'image', url })) || []),
    ...(product.videoUrls?.map((url) => ({ type: 'video', url })) || [])
  ];

  if (!mediaItems.length) {
    if (product.imageUrl) mediaItems.push({ type: 'image', url: product.imageUrl });
    if (product.videoUrl) mediaItems.push({ type: 'video', url: product.videoUrl });
  }

  const selectedMedia = mediaItems[selectedMediaIndex] || mediaItems[0] || null;
  const firstImageUrl = product.imageUrls?.[0] ?? product.imageUrl ?? null;

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('arryona_cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price || 0,
        quantity: 1,
        imageUrl: firstImageUrl
      });
    }

    localStorage.setItem('arryona_cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart.length }));
    alert(`${product.name} added to cart!`);
  };

  const isSoldOut = product.stock <= 0;

  return (
    <div
      className="relative card hover-lift group cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/products/${product.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          router.push(`/products/${product.id}`);
        }
      }}
    >
      {typeof onToggleFavorite === 'function' ? (
        <button
          type="button"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          className={`absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg transition ${
            isFavorite ? 'bg-red-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      ) : null}

      <div className="h-52 w-full overflow-hidden rounded-3xl bg-slate-100 relative">
        {selectedMedia ? (
          selectedMedia.type === 'video' ? (
            <video
              src={selectedMedia.url}
              controls
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <img
              src={selectedMedia.url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">No media</div>
        )}

        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl">
            <div className="text-white text-center">
              <p className="text-2xl font-bold">SOLD OUT</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">
          {product.name}
        </h3>
        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{product.description}</p>
      </div>

      {mediaItems.length > 1 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {mediaItems.map((media, index) => (
            <button
              key={`${media.type}-${media.url}-${index}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMediaIndex(index);
              }}
              className={`h-16 w-16 overflow-hidden rounded-2xl border ${selectedMediaIndex === index ? 'border-brand-700' : 'border-slate-200'} bg-white p-1 transition`}
            >
              {media.type === 'video' ? (
                <div className="relative h-full w-full bg-slate-100 text-center text-xs leading-[3.4rem] text-slate-500">Video</div>
              ) : (
                <img src={media.url} alt={`${product.name} thumbnail`} className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <span className="text-xl font-bold text-brand-900">${product.price?.toFixed(2) || '0.00'}</span>
          <p className="text-xs text-slate-500">{product.stock !== undefined ? `${product.stock} left` : 'No stock info'}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-600">
          {product.category || 'General'}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        {showAddToCart && (
          <>
            {isSoldOut ? (
              <button
                type="button"
                disabled
                className="flex-1 rounded-3xl bg-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart();
                }}
                className="flex-1 rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Add to Cart
              </button>
            )}
          </>
        )}
        {typeof onOrder === 'function' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOrder(product);
            }}
            disabled={isSoldOut}
            className="flex-1 rounded-3xl bg-brand-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSoldOut ? 'Sold Out' : 'Buy now'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
