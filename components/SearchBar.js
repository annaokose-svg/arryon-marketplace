"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function SearchBar({ placeholder = "Search products and shops..." }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // For now, redirect to products page with search query
      // In a real app, this would go to a dedicated search results page
      window.location.href = `/products?search=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className={`relative flex items-center rounded-full border bg-white transition-all duration-200 ${
        isFocused ? 'border-brand-500 shadow-lg' : 'border-slate-300 shadow-sm'
      }`}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full rounded-full px-4 py-3 pr-12 text-sm outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="absolute right-2 rounded-full bg-brand-900 p-2 text-white transition hover:bg-brand-700 disabled:opacity-50"
          disabled={!query.trim()}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
}