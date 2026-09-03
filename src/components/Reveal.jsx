import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Reveal = ({ children, y = 32, delay = 0, className = "", once = true }) => {
  const elRef = (node) => {
    if (!node) return;
    const wasHidden = node.dataset.revealDone !== "1";
    if (!wasHidden) return;

    gsap.fromTo(
      node,
      { opacity: 0, y, filter: "blur(4px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.85,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: node,
          start: "top 88%",
          once,
        },
      }
    );
    node.dataset.revealDone = "1";
  };

  return (
    <div ref={elRef} className={className}>
      {children}
    </div>
  );
};

export default Reveal;
