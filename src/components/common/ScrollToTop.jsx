import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Ye line magic karegi: Har baar URL badalte hi screen top par jayegi
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]); // Jab bhi pathname change hoga, ye chalega

  return null; // Iska koi UI nahi hai
};

export default ScrollToTop;