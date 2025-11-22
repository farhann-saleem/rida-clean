import { MeshGradient } from "@paper-design/shaders-react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface HeroSectionProps {
    onButtonClick?: () => void
    onSecondaryClick?: () => void
    colors?: string[]
    distortion?: number
    swirl?: number
    speed?: number
    offsetX?: number
    className?: string
    maxWidth?: string
    veilOpacity?: string
}

export function HeroSection({
    onButtonClick,
    onSecondaryClick,
    colors = ["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"],
    distortion = 0.8,
    swirl = 0.6,
    speed = 0.42,
    offsetX = 0.08,
    className = "",
    maxWidth = "max-w-6xl",
    veilOpacity = "bg-white/20 dark:bg-black/25",
}: HeroSectionProps) {
    const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
    const [mounted, setMounted] = useState(false)
    const [textState, setTextState] = useState<"short" | "expanding" | "full" | "collapsing">("short")

    useEffect(() => {
        setMounted(true)
        const update = () =>
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [])

    useEffect(() => {
        const loop = async () => {
            // Start short: "RIDA"
            await new Promise(r => setTimeout(r, 3000))

            // Expand to full
            setTextState("expanding")
            await new Promise(r => setTimeout(r, 600)) // Animation duration
            setTextState("full")

            // Stay full: "Raindrop Intelligent Document Agent"
            await new Promise(r => setTimeout(r, 3000))

            // Collapse back
            setTextState("collapsing")
            await new Promise(r => setTimeout(r, 600)) // Animation duration
            setTextState("short")
        }

        const interval = setInterval(loop, 8000)
        loop() // Start immediately

        return () => clearInterval(interval)
    }, [])

    return (
        <section className={`relative w-full min-h-screen overflow-hidden bg-background flex items-center justify-center ${className}`}>
            <div className="fixed inset-0 w-screen h-screen">
                {mounted && (
                    <>
                        <MeshGradient
                            width={dimensions.width}
                            height={dimensions.height}
                            colors={colors}
                            distortion={distortion}
                            swirl={swirl}
                            grainMixer={0}
                            grainOverlay={0}
                            speed={speed}
                            offsetX={offsetX}
                        />
                        <div className={`absolute inset-0 pointer-events-none ${veilOpacity}`} />
                    </>
                )}
            </div>

            <div className={`relative z-10 ${maxWidth} mx-auto px-6 w-full text-center`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="font-bold text-foreground text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6 tracking-tight min-h-[1.2em] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {textState === "short" || textState === "collapsing" ? (
                                <motion.span
                                    key="short"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300"
                                >
                                    RIDA
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="full"
                                    initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-white dark:to-purple-300"
                                >
                                    Raindrop Intelligent Document Agent
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 px-4"
                    >
                        From static files to instant answers. Upload invoices, contracts, and reports, then ask questions in plain language.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Button
                            size="lg"
                            onClick={onButtonClick}
                            className="rounded-full px-8 py-6 text-lg shadow-lg shadow-primary/25 hover:scale-105 transition-transform"
                        >
                            Get Started
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={onSecondaryClick}
                            className="rounded-full px-8 py-6 text-lg bg-white/50 dark:bg-black/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-black/80 transition-all border-primary/20"
                        >
                            View Console Demo <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
