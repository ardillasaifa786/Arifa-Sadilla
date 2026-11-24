import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverProps {
  src?: string;
  title: string;
  author: string;
  className?: string;
  aspectClass?: string;
}

export function BookCover({
  src,
  title,
  author,
  className = '',
  aspectClass = 'aspect-[3/4]',
}: BookCoverProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const showFallback = !src || !src.trim() || hasError;

  return (
    <div
      className={`relative overflow-hidden bg-[#EFE6D5] border border-[#DFD3BE] ${aspectClass} ${className}`}
    >
      {!showFallback ? (
        <img
          src={src}
          alt={`Sampul buku ${title} oleh ${author}`}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex flex-col justify-between p-4 bg-gradient-to-br from-[#F5ECDC] via-[#EAE0CE] to-[#DFD3BE] text-[#3B2F2F]">
          <div className="flex items-center justify-between border-b border-[#C8B9A0] pb-2">
            <span className="font-archive-mono text-[10px] tracking-widest uppercase text-[#7A6B5D]">
              Archive Ed.
            </span>
            <BookOpen className="w-3.5 h-3.5 text-[#9E5A47]" />
          </div>
          <div className="my-auto py-2">
            <p className="font-serif-book font-bold text-sm leading-snug line-clamp-3 text-[#3B2F2F]">
              {title}
            </p>
            <p className="text-xs text-[#7A6B5D] mt-1.5 line-clamp-1">{author}</p>
          </div>
          <div className="border-t border-[#C8B9A0] pt-2">
            <span className="font-archive-mono text-[9px] tracking-wider uppercase text-[#7A6B5D]">
              The Reading Archive
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
