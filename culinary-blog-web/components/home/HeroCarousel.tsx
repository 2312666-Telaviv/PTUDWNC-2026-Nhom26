'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface HeroSlide {
  id: string;
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  description: string;
}

const slides: HeroSlide[] = [
  {
    id: 'pho-bo',
    src: '/images/hero/pho-bo.jpg',
    alt: 'Bát phở bò Hà Nội nóng hổi, có rau thơm và chanh',
    eyebrow: 'Gợi ý hôm nay',
    title: 'Phở bò Hà Nội',
    description: 'Nước dùng trong ngọt, bánh phở mướt, rắc chút hành lá thơm lừng.',
  },
  {
    id: 'goi-cuon',
    src: '/images/hero/goi-cuon.jpg',
    alt: 'Đĩa gỏi cuốn tôm thịt với rau tươi và nước chấm',
    eyebrow: 'Món khai vị',
    title: 'Gỏi cuốn tôm thịt',
    description: 'Tôm thịt dai ngon, cuốn cùng bánh mỏng và rau sống, chấm sốt đậm đà.',
  },
  {
    id: 'banh-mi',
    src: '/images/hero/banh-mi.jpg',
    alt: 'Ổ bánh mì Sài Gòn kẹp thịt, rau và sốt',
    eyebrow: 'Street food',
    title: 'Bánh mì Sài Gòn',
    description: 'Vỏ bánh giòn, nhân thịt đậm vị, thêm chút rau tươi và sốt cay.',
  },
  {
    id: 'banh-flan',
    src: '/images/hero/banh-flan.jpg',
    alt: 'Bánh flan caramel mịn, phủ lớp caramel óng ánh',
    eyebrow: 'Tráng miệng',
    title: 'Bánh flan caramel',
    description: 'Mịn mát, ngọt vừa phải, lớp caramel óng ánh sau khi để lạnh.',
  },
];

const AUTOPLAY_DELAY = 4500;

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  }, []);

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, []);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => setIsPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isHovered || isFocused || !isPageVisible) {
      return;
    }

    const timer = window.setTimeout(showNext, AUTOPLAY_DELAY);
    return () => window.clearTimeout(timer);
  }, [activeIndex, isFocused, isHovered, isPageVisible, prefersReducedMotion, showNext]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPrevious();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNext();
    }
  };

  return (
    <div
      className="relative h-[320px] w-full overflow-hidden rounded-3xl bg-orange-100 shadow-xl shadow-orange-900/10 outline-none sm:h-[400px] lg:h-[460px]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Ảnh công thức nấu ăn nổi bật"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={() => setIsFocused(false)}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-hidden={!isActive}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`object-cover ${
                prefersReducedMotion ? '' : 'transition-transform duration-700 ease-out'
              } ${isActive && !prefersReducedMotion ? 'scale-[1.03]' : 'scale-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            <Link
              href="/recipes"
              tabIndex={isActive ? 0 : -1}
              className="absolute bottom-16 left-5 right-5 block max-w-lg text-white outline-none transition sm:bottom-20 sm:left-8 sm:right-auto focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
                {slide.eyebrow}
              </p>
              <h3 className="mt-2 text-2xl font-bold leading-tight drop-shadow-sm sm:text-3xl">
                {slide.title}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/90 drop-shadow-sm sm:text-base">
                {slide.description}
              </p>
            </Link>
          </div>
        );
      })}

      <button
        type="button"
        onClick={showPrevious}
        aria-label="Ảnh trước"
        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition hover:bg-white hover:text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:left-4 sm:h-11 sm:w-11"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={showNext}
        aria-label="Ảnh tiếp theo"
        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition hover:bg-white hover:text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:right-4 sm:h-11 sm:w-11"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Hiện ảnh ${index + 1}: ${slide.title}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            className={`h-2.5 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
              index === activeIndex ? 'w-7 bg-orange-600' : 'w-2.5 bg-white/80 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
