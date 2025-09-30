"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactTinyLink with type casting to prevent TypeScript errors
const ReactTinyLink = dynamic(
  () => import('react-tiny-link').then((mod) => {
    const { ReactTinyLink } = mod;
    return ReactTinyLink;
  }),
  { ssr: false }
) as any; // Use 'any' to avoid TypeScript errors with the props

interface UrlPreviewProps {
  url: string;
}

export function UrlPreview({ url }: UrlPreviewProps) {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Only render the component on the client side
  if (!isBrowser) {
    return <a href={url} className="text-blue-500 hover:underline break-all">{url}</a>;
  }

  return (
    <div className="mt-2">
      <ReactTinyLink
        cardSize="small"
        showGraphic={true}
        maxLine={2}
        minLine={1}
        url={url}
      />
    </div>
  );
}
