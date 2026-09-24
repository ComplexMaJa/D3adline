"use client";

import { useRef, useEffect, useState, useCallback, CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { gsap } from 'gsap';

export interface AccordionGalleryItem {
  image?: string;
  content?: ReactNode;
  label?: string;
  tag?: string;
  description?: string;
  accentColor?: string;
  link?: string;
  alt?: string;
}

export interface AccordionGalleryProps {
  items?: AccordionGalleryItem[];
  defaultIndex?: number;
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: 'horizontal' | 'vertical';
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: 'hover' | 'click';
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
}

export const AccordionGallery = ({
  items = [],
  defaultIndex = 0,
  activeIndex: controlledIndex,
  onActiveChange,
  accentColor = '#8b5cf6',
  overlayColor = '#05020a',
  textColor = '#ffffff',
  height = 540,
  gap = 12,
  radius = 20,
  expandRatio = 0.58,
  orientation = 'horizontal',
  duration = 0.55,
  ease = 'power3.out',
  parallax = 0.45,
  tilt = 6,
  stagger = 0.05,
  trigger = 'hover',
  showLabels = true,
  grayscale = true,
  className = ''
}: AccordionGalleryProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLElement | null)[]>([]);
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);

  const vertical = orientation === 'vertical';
  const count = items.length;
  const [internalActive, setInternalActive] = useState(
    Math.min(Math.max(defaultIndex, 0), Math.max(0, count - 1))
  );

  const active = controlledIndex !== undefined ? controlledIndex : internalActive;

  const setActive = useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(index, 0), Math.max(0, count - 1));
      if (controlledIndex === undefined) {
        setInternalActive(clamped);
      }
      onActiveChange?.(clamped);
    },
    [controlledIndex, count, onActiveChange]
  );

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const overlayBg = `linear-gradient(180deg, transparent 40%, color-mix(in srgb, ${overlayColor} 82%, transparent) 100%), color-mix(in srgb, ${overlayColor} calc(var(--ag-dim, 0.35) * 100%), transparent)`;

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
      const mediaSize = mediaSizeRef.current;

      tlRef.current?.kill();
      const dur = animate && !prefersReduced ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const bar = barRefs.current[i];
        const text = textRefs.current[i];

        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        tl.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * parallax * mediaSize * 0.05;
          const gray = grayscale ? (isActive ? 0 : 0.85) : 0;
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              '--ag-gray': gray,
              '--ag-dim': isActive ? 0 : 0.45,
              duration: dur,
              ease
            },
            0
          );
        }

        if (showLabels && bar && text) {
          if (isActive) {
            tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
          } else {
            tl.to([bar, text], { opacity: 0, x: -12, duration: dur * 0.5, ease }, 0);
          }
        }
      });

      tlRef.current = tl;
    },
    [
      active,
      count,
      expandRatio,
      duration,
      ease,
      vertical,
      tilt,
      parallax,
      grayscale,
      showLabels,
      stagger,
      prefersReduced
    ]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.25);
      mediaSizeRef.current = size;
      el.style.setProperty('--ag-media-size', `${size}px`);
      applyLayout(!firstRunRef.current);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyLayout, gap, count, expandRatio, vertical]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    []
  );

  const handleEnter = (i: number) => {
    if (trigger === 'hover') setActive(i);
  };

  const handleClick = (i: number, e: MouseEvent) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i + 1) % count);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i - 1 + count) % count);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`flex ${vertical ? 'flex-col' : 'flex-row'} w-full max-w-full [perspective:1400px] max-[640px]:!flex-col max-[640px]:[perspective:none] select-none ${className}`}
      style={{ gap: `${gap}px`, height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px` }}
      role="list"
      aria-label="Interactive AMOLED command center gallery"
    >
      {items.map((item, i) => {
        const isActive = i === active;
        const currentAccent = item.accentColor || accentColor;
        const Tag = (item.link ? 'a' : 'div') as 'a';

        return (
          <Tag
            key={i}
            ref={(el: HTMLElement | null) => {
              panelRefs.current[i] = el;
            }}
            className={`group relative block min-w-0 min-h-0 flex-[1_1_0] cursor-pointer overflow-hidden bg-[#07060A] no-underline outline-none [transform-style:preserve-3d] [transform-origin:center] max-[640px]:min-h-[140px] max-[640px]:!transform-none transition-all duration-300 ${
              isActive
                ? 'border border-white/15 shadow-[0_15px_40px_-10px_rgba(139,92,246,0.3)] ring-1 ring-purple-500/30'
                : 'border border-white/[0.05] hover:border-white/10 opacity-75 hover:opacity-95'
            }`}
            style={
              {
                borderRadius: `${radius}px`,
                '--ag-accent': currentAccent,
                willChange: 'flex-grow, transform'
              } as CSSProperties
            }
            href={item.link || undefined}
            onClick={e => handleClick(i, e)}
            onMouseEnter={() => handleEnter(i)}
            onFocus={() => setActive(i)}
            onKeyDown={e => handleKeyDown(i, e)}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={item.label}
          >
            {/* Visual Media / Custom UI Viewport */}
            <span className="absolute inset-0 overflow-hidden [border-radius:inherit]">
              <span
                ref={(el: HTMLElement | null) => {
                  mediaRefs.current[i] = el;
                }}
                className="absolute top-1/2 left-1/2 [filter:grayscale(var(--ag-gray,1))]"
                style={{
                  width: vertical ? '100%' : 'var(--ag-media-size, 320px)',
                  height: vertical ? 'var(--ag-media-size, 320px)' : '100%',
                  willChange: 'transform, filter'
                }}
              >
                {item.content ? (
                  item.content
                ) : item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.alt || item.label || ''}
                    draggable={false}
                    className="block h-full w-full select-none object-cover [-webkit-user-drag:none]"
                  />
                ) : null}
              </span>
              <span
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{ background: overlayBg }}
                aria-hidden="true"
              />
            </span>

            {/* Glowing active indicator dot on collapsed tab */}
            {!isActive && (
              <span className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: currentAccent }}
                />
              </span>
            )}

            {/* Panel Bottom Label & Accent Indicator */}
            {showLabels && (
              <span
                className="pointer-events-none absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-[10] flex items-center justify-between gap-3"
                aria-hidden="true"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    ref={(el: HTMLElement | null) => {
                      barRefs.current[i] = el;
                    }}
                    className="h-[28px] w-[3.5px] flex-none rounded-[3px] opacity-0"
                    style={{
                      background: currentAccent,
                      boxShadow: `0 0 14px color-mix(in srgb, ${currentAccent} 80%, transparent)`
                    }}
                  />
                  <div
                    ref={(el: HTMLElement | null) => {
                      textRefs.current[i] = el;
                    }}
                    className="flex flex-col min-w-0 opacity-0"
                  >
                    {item.tag && (
                      <span
                        className="text-[10px] font-mono uppercase tracking-wider font-semibold"
                        style={{ color: currentAccent }}
                      >
                        {item.tag}
                      </span>
                    )}
                    <span
                      className="overflow-hidden text-ellipsis whitespace-nowrap text-sm sm:text-base lg:text-lg font-display font-bold tracking-[0.01em] [text-shadow:0_2px_14px_rgba(0,0,0,0.85)]"
                      style={{ color: textColor }}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>

                {item.description && (
                  <span className="hidden md:inline-flex text-[11px] text-zinc-400 font-medium px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                    {item.description}
                  </span>
                )}
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
};

export default AccordionGallery;
