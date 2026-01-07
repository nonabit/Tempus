"use client";

import * as React from "react";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CalendarViewProps {
    /**
     * The current date focused in the calendar (determines the month displayed)
     */
    currentDate?: Date;
    /**
     * Callback when the current date changes (e.g. navigation)
     */
    onDateChange?: (date: Date) => void;
    /**
     * Custom renderer for the cell content.
     * Useful for displaying work hours or other data.
     */
    renderCell?: (date: Date) => React.ReactNode;
    className?: string;
}

export function CalendarView({
    currentDate = new Date(),
    onDateChange,
    renderCell,
    className,
}: CalendarViewProps) {
    // Use internal state if not controlled, but generally expect controlled usage for date
    const [internalDate, setInternalDate] = React.useState(dayjs(currentDate));

    React.useEffect(() => {
        setInternalDate(dayjs(currentDate).locale("zh-cn"));
    }, [currentDate]);

    const handlePrevMonth = () => {
        const newDate = internalDate.subtract(1, "month");
        setInternalDate(newDate);
        onDateChange?.(newDate.toDate());
    };

    const handleNextMonth = () => {
        const newDate = internalDate.add(1, "month");
        setInternalDate(newDate);
        onDateChange?.(newDate.toDate());
    };

    // Generate 42 grid items
    // 1. Get start of month
    const startOfMonth = internalDate.startOf("month");
    // 2. Get start of week for that start of month (Strictly Sunday start)
    // We explicitly calculate Sunday by subtracting the day index (0=Sun, 1=Mon...)
    const startOfGrid = startOfMonth.subtract(startOfMonth.day(), "day");

    const days = React.useMemo(() => {
        const grid: dayjs.Dayjs[] = [];
        let current = startOfGrid;
        // 42 cells: 6 rows * 7 columns
        for (let i = 0; i < 42; i++) {
            grid.push(current);
            current = current.add(1, "day");
        }
        return grid;
    }, [startOfGrid]);

    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

    return (
        <div className={cn("flex flex-col gap-4 p-4", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {internalDate.format("MMMM YYYY")}
                </h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrevMonth}
                        className="h-8 w-8 rounded-md"
                        aria-label="Previous month"
                    >
                        <IconChevronLeft className="h-4 w-4 text-black" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextMonth}
                        className="h-8 w-8 rounded-md"
                        aria-label="Next month"
                    >
                        <IconChevronRight className="h-4 w-4 text-black" />
                    </Button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-[auto_repeat(6,1fr)] border-l border-t border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden min-h-0">
                {/* Weekday headers */}
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="border-b border-r border-neutral-200 bg-neutral-50 py-2 text-center text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
                    >
                        {day}
                    </div>
                ))}

                {/* Days */}
                {days.map((dayItem, idx) => {
                    const isCurrentMonth = dayItem.month() === internalDate.month();
                    const isToday = dayItem.isSame(dayjs(), "day");
                    const dateObj = dayItem.toDate();
                    const dayOfWeek = dayItem.day();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                    return (
                        <div
                            key={dayItem.toString()}
                            className={cn(
                                "group relative border-b border-r border-neutral-200 p-2 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/50 flex flex-col min-h-0",
                                !isCurrentMonth && "bg-neutral-50/50 dark:bg-neutral-900/50",
                                isToday && "bg-blue-50/30 dark:bg-blue-900/10",
                                isWeekend && isCurrentMonth && "bg-neutral-50/30 dark:bg-neutral-800/20"
                            )}
                        >
                            <div className="mb-1 flex-none flex items-center justify-between">
                                <span
                                    className={cn(
                                        "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                                        isToday
                                            ? "bg-blue-600 text-white"
                                            : isCurrentMonth
                                                ? isWeekend
                                                    ? "text-red-500 dark:text-red-400"
                                                    : "text-neutral-700 dark:text-neutral-200"
                                                : "text-neutral-400 dark:text-neutral-600"
                                    )}
                                >
                                    {dayItem.date()}
                                </span>
                            </div>

                            {/* Custom Card Slot */}
                            <div className="mt-1 flex-1 min-h-0 overflow-y-auto">
                                {renderCell ? renderCell(dateObj) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
