import { RidaBadge } from "@/components/ui/rida-badge";
import { cn } from "@/lib/utils";

interface FooterProps {
    className?: string;
}

export function Footer({ className }: FooterProps) {
    return (
        <footer className={cn("py-8 px-6 border-t bg-background/50 backdrop-blur-sm relative z-10", className)}>
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <RidaBadge size="md" />
                <p className="text-sm text-muted-foreground text-center md:text-right">
                    © 2024 RIDA – Raindrop Intelligent Document Agent. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
