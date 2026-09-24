"use client";

import { useEffect, useState, useRef, useCallback, type RefObject } from "react";

// ================================================
// useReducedMotion — Detect prefers-reduced-motion
// ================================================
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}

// ================================================
// useInView — IntersectionObserver with threshold
// ================================================
export function useInView(
  ref: RefObject<HTMLElement | null>,
  options?: { threshold?: number; rootMargin?: string; once?: boolean }
): boolean {
  const [isInView, setIsInView] = useState(false);
  const { threshold = 0.15, rootMargin = "0px", once = true } = options || {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, once]);

  return isInView;
}

// ================================================
// useCountUp — Animated counter from 0 to target
// ================================================
export function useCountUp(
  target: number,
  isInView: boolean,
  duration: number = 2000
): number {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isInView || startedRef.current) return;
    startedRef.current = true;

    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(target * eased);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return count;
}

// ================================================
// useTilt — 3D tilt based on mouse position
// ================================================
export function useTilt(
  ref: RefObject<HTMLElement | null>,
  options?: { maxDeg?: number; scale?: number }
) {
  const { maxDeg = 8, scale = 1.02 } = options || {};
  const [style, setStyle] = useState({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
    transition: "transform 0.15s ease-out",
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      setStyle({
        transform: `perspective(1000px) rotateX(${y * -maxDeg}deg) rotateY(${x * maxDeg}deg) scale(${scale})`,
        transition: "transform 0.1s ease-out",
      });

      // Update card shine CSS variable
      el.style.setProperty("--mouse-x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty("--mouse-y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
    },
    [ref, maxDeg, scale]
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    });
  }, []);

  return { style, handleMouseMove, handleMouseLeave };
}

// ================================================
// useMagnetic — Magnetic button attraction effect
// ================================================
export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  strength: number = 0.3
) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      setOffset({ x: distX * strength, y: distY * strength });
    },
    [ref, strength]
  );

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return {
    style: {
      transform: `translate(${offset.x}px, ${offset.y}px)`,
      transition: offset.x === 0 && offset.y === 0
        ? "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        : "transform 0.15s ease-out",
    },
    handleMouseMove,
    handleMouseLeave,
  };
}

// ================================================
// useMousePosition — Track global cursor position
// ================================================
export function useMousePosition() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch(checkTouch);

    if (checkTouch) return;

    const handler = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return { ...pos, isTouch };
}
