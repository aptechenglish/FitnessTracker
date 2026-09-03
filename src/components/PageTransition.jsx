import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";

const PageTransition = ({ children }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 24, scale: 0.995, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.5,
          ease: "power2.out",
          clearProps: "transform,filter",
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
};

export default PageTransition;
