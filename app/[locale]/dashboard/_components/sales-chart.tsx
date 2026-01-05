"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Period = "week" | "month" | "year";

const data = {
    week: [
        { label: "السبت", value: 150 },
        { label: "الأحد", value: 230 },
        { label: "الاثنين", value: 180 },
        { label: "الثلاثاء", value: 320 },
        { label: "الأربعاء", value: 290 },
        { label: "الخميس", value: 450 },
        { label: "الجمعة", value: 380 },
    ],
    month: [
        { label: "أسبوع 1", value: 1200 },
        { label: "أسبوع 2", value: 1500 },
        { label: "أسبوع 3", value: 1100 },
        { label: "أسبوع 4", value: 1800 },
    ],
    year: [
        { label: "يناير", value: 4500 },
        { label: "فبراير", value: 5200 },
        { label: "مارس", value: 4800 },
        { label: "أبريل", value: 6100 },
        { label: "مايو", value: 5500 },
        { label: "يونيو", value: 6700 },
        { label: "يوليو", value: 7200 },
        { label: "أغسطس", value: 6900 },
        { label: "سبتمبر", value: 7500 },
        { label: "أكتوبر", value: 8100 },
        { label: "نوفمبر", value: 7800 },
        { label: "ديسمبر", value: 8500 },
    ],
};

export function SalesChart() {
    const [period, setPeriod] = useState<Period>("week");
    const currentData = data[period];
    const maxValue = Math.max(...currentData.map(d => d.value));

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-end gap-2 mb-6">
                {(["week", "month", "year"] as Period[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                            period === p
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        )}
                    >
                        {p === "week" && "أسبوعي"}
                        {p === "month" && "شهري"}
                        {p === "year" && "سنوي"}
                    </button>
                ))}
            </div>

            <div className="flex-1 flex items-end justify-between gap-2 min-h-[300px] pb-2">
                {currentData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full relative flex items-end justify-center h-[250px]">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(item.value / maxValue) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="w-full max-w-[40px] bg-primary/20 rounded-t-lg group-hover:bg-primary/40 transition-colors relative"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {item.value} ر.ع
                                </div>
                            </motion.div>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium truncate w-full text-center">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
