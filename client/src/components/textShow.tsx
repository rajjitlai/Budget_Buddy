"use client";
import { TypewriterEffect } from "./ui/textWriter";

export function TextShow() {
    const words = [
        {
            text: "Budgeting",
        },
        {
            text: "Made",
        },
        {
            text: "Fun",
        },
        {
            text: "with",
        },
        {
            text: "BudgetBuddy.",
            className: "text-green-300 dark:text-green-200",
        },
    ];
    return (
        <div className="flex flex-col items-center justify-center h-[10rem] lg:h-[20rem]">
                <TypewriterEffect words={words} />
        </div>
    );
}
