import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

import "./Preloader.css";

function Preloader({ onComplete }) {
    const rootRef = useRef(null);
    const counterRef = useRef(null);
    const progressTrackRef = useRef(null);
    const progressFillRef = useRef(null);
    const prefersReducedMotion = useReducedMotion() === true;

    useLayoutEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const previousOverscroll = document.body.style.overscrollBehavior;
        document.body.style.overflow = "hidden";
        document.body.style.overscrollBehavior = "none";

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.overscrollBehavior = previousOverscroll;
        };
    }, []);

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;

        let disposed = false;
        let animationContext;

        const finishWithoutMotion = () => {
            if (counterRef.current) counterRef.current.textContent = "100%";
            progressTrackRef.current?.setAttribute("aria-valuenow", "100");
            if (progressFillRef.current) progressFillRef.current.style.transform = "scaleX(1)";

            const frame = requestAnimationFrame(onComplete);
            return () => cancelAnimationFrame(frame);
        };

        if (prefersReducedMotion) return finishWithoutMotion();

        const startIntro = async () => {
            try {
                const { gsap } = await import("gsap");
                if (disposed) return;

                animationContext = gsap.context(() => {
                    const progress = { value: 0 };
                    const updateProgress = () => {
                        const value = Math.round(progress.value);
                        if (counterRef.current) counterRef.current.textContent = `${value}%`;
                        progressTrackRef.current?.setAttribute("aria-valuenow", String(value));
                    };

                    const timeline = gsap.timeline({ onComplete });
                    timeline
                        .fromTo(".preloader-kicker", {
                            autoAlpha: 0,
                            y: 10
                        }, {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.5,
                            ease: "power2.out"
                        }, 0)
                        .fromTo(".preloader-title-word", {
                            autoAlpha: 0,
                            yPercent: 112
                        }, {
                            autoAlpha: 1,
                            yPercent: 0,
                            duration: 0.95,
                            stagger: 0.13,
                            ease: "power3.out"
                        }, 0.12)
                        .fromTo(".preloader-progress-meta", {
                            autoAlpha: 0,
                            y: 8
                        }, {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.48,
                            ease: "power2.out"
                        }, 0.4)
                        .fromTo(".preloader-progress-fill", {
                            scaleX: 0
                        }, {
                            scaleX: 1,
                            duration: 1.4,
                            ease: "power2.inOut"
                        }, 0.5)
                        .to(progress, {
                            value: 100,
                            duration: 1.4,
                            ease: "power2.inOut",
                            onUpdate: updateProgress
                        }, 0.5)
                        .to(root, {
                            yPercent: -100,
                            duration: 0.78,
                            ease: "power4.inOut"
                        }, 1.92);
                }, root);
            } catch (error) {
                if (!disposed) {
                    console.error("Could not initialize the Task Manager intro animation.", error);
                    onComplete();
                }
            }
        };

        startIntro();

        return () => {
            disposed = true;
            animationContext?.revert();
        };
    }, [onComplete, prefersReducedMotion]);

    return (
        <div
            className={`preloader${prefersReducedMotion ? " preloader-reduced-motion" : ""}`}
            ref={rootRef}
            role="status"
            aria-label="Loading Task Manager"
        >
            <div className="preloader-orbit preloader-orbit-outer" aria-hidden="true" />
            <div className="preloader-orbit preloader-orbit-inner" aria-hidden="true" />
            <div className="preloader-content">
                <span className="preloader-kicker"><span /> STUDENT TASK MANAGER</span>
                <h1 className="preloader-title" aria-label="Task Manager">
                    <span className="preloader-title-mask"><span className="preloader-title-word">TASK</span></span>
                    <span className="preloader-title-mask"><span className="preloader-title-word">MANAGER</span></span>
                </h1>
                <div className="preloader-progress">
                    <div className="preloader-progress-meta">
                        <span>PREPARING YOUR WORKSPACE</span>
                        <span className="preloader-counter" ref={counterRef}>0%</span>
                    </div>
                    <div
                        className="preloader-progress-track"
                        ref={progressTrackRef}
                        role="progressbar"
                        aria-label="Loading Task Manager"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow="0"
                    >
                        <span className="preloader-progress-fill" ref={progressFillRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Preloader;
