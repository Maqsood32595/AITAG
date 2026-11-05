import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash, search } = useLocation();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    const isNewPage = prevPathnameRef.current !== pathname;
    prevPathnameRef.current = pathname;

    const params = new URLSearchParams(search);
    const scrollParam = params.get('scroll');
    const targetId = scrollParam || (hash ? hash.replace('#', '') : null);

    if (targetId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const navOffset = 80;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;
          window.scrollTo({ top: offsetPosition, behavior: isNewPage ? 'auto' : 'smooth' });
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Instant reset to top on page navigation — eliminates reverse-scroll flashing through previous sections!
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, search]);

  return null;
};

export default ScrollToTop;
