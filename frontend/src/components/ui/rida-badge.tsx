import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface RidaBadgeProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function RidaBadge({ className, size = "md" }: RidaBadgeProps) {
    const sizeClasses = {
        sm: {
            iconBox: "p-1.5 rounded-lg",
            icon: "h-4 w-4",
            text: "text-lg",
        },
        md: {
            iconBox: "p-2 rounded-xl",
            icon: "h-5 w-5",
            text: "text-xl",
        },
        lg: {
            iconBox: "p-3 rounded-2xl",
            icon: "h-6 w-6",
            text: "text-2xl",
        },
    };

    const { iconBox, icon, text } = sizeClasses[size];

    return (
        <div className={cn("flex items-center gap-2.5", className)}>
            <div className={cn("bg-primary text-primary-foreground flex items-center justify-center shadow-sm", iconBox)}>
                <FileText className={icon} />
            </div>
            <span className={cn("font-bold tracking-tight text-foreground", text)}>RIDA</span>
        </div>
    );
}
