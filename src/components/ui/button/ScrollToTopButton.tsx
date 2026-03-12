import { useEffect, useState } from "react";
import { ChevronUpIcon } from "../../../icons";

export default function ScrollToTopButton() {

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-11 right-7 z-50 inline-flex items-center justify-center 
      text-white transition-colors rounded-full size-13 bg-[#3756A6] hover:bg-[#2F55B8] shadow-lg 
      ${visible ? "opacity-100" : "opacity-0 pointer-events-none"} duration-300`}
    >
      <ChevronUpIcon className="w-6 h-6" />
    </button>
  );
}
