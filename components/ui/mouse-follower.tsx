"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function MouseFollower() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener("mousemove", handleMouseMove);
        document.body.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <motion.div
            className="pointer-events-none fixed top-0 left-0 z-50 h-8 w-8 -ml-4 -mt-4 rounded-full border border-primary/50 bg-primary/10 backdrop-blur-sm hidden md:block"
            animate={{ x: mousePosition.x, y: mousePosition.y }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
        />
    );
}
