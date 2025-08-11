import { useEffect, useRef } from 'react';

/**
 * Scales an element to fit within the viewport based on a base width/height.
 * Returns a ref to attach to the element you want scaled.
 */
export function useAutoScale(baseWidth: number, baseHeight: number) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateScale = () => {
      const scale = Math.min(
        window.innerWidth / baseWidth,
        window.innerHeight / baseHeight
      );
      element.style.transform = `scale(${scale})`;
      element.style.transformOrigin = 'top left';
      element.style.width = baseWidth + 'px';
      element.style.height = baseHeight + 'px';
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [baseWidth, baseHeight]);

  return ref;
}
