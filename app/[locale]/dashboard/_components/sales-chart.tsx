"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Period = "week" | "month" | "year";

// Default fallback data (in case API data is missing or loading)
const defaultData = {
    week: [
        { label: "السبت", value: 0 },
        { label: "الأحد", value: 0 },
        { label: "الاثنين", value: 0 },
        { label: "الثلاثاء", value: 0 },
        { label: "الأربعاء", value: 0 },
        { label: "الخميس", value: 0 },
        { label: "الجمعة", value: 0 },
    ],
    month: [
        { label: "أسبوع 1", value: 0 },
        { label: "أسبوع 2", value: 0 },
        { label: "أسبوع 3", value: 0 },
        { label: "أسبوع 4", value: 0 },
    ],
    year: [
        { label: "يناير", value: 0 },
        { label: "فبراير", value: 0 },
        { label: "مارس", value: 0 },
        { label: "أبريل", value: 0 },
        { label: "مايو", value: 0 },
        { label: "يونيو", value: 0 },
        { label: "يوليو", value: 0 },
        { label: "أغسطس", value: 0 },
        { label: "سبتمبر", value: 0 },
        { label: "أكتوبر", value: 0 },
        { label: "نوفمبر", value: 0 },
        { label: "ديسمبر", value: 0 },
    ],
};

// ✅ Fix: Define the interface to accept 'data'
interface SalesChartProps {
    data?: any;
}

export function SalesChart({ data }: SalesChartProps) {
    const [period, setPeriod] = useState<Period>("week");
    
    // ✅ Use passed data if available, otherwise use defaultData
    const chartData = data || defaultData;
    
    // Safety check: ensure the period key exists, otherwise empty array
    const currentData = chartData[period] || [];
    
    // Calculate max value for bar height scaling (avoid division by zero)
    const maxValue = Math.max(...currentData.map((d: any) => d.value)) || 100;

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
                {currentData.length > 0 ? (
                    currentData.map((item: any, index: number) => (
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
                    ))
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        لا توجد بيانات لهذه الفترة
                    </div>
                )}
            </div>
        </div>
    );
}