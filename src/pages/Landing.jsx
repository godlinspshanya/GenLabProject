import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronDown,
    CircleCheck,
    GraduationCap,
    LayoutGrid,
    ListChecks,
    Menu,
    Plus,
    Sparkles,
    Target,
    TimerReset,
    X
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import studentIllustration from "../assets/student-illustration.png.png";
import "./Landing.css";

const tasks = [
    { title: "Finish research outline", meta: "History · Due today", status: "In progress", tone: "blue" },
    { title: "Review lecture notes", meta: "Biology · Due tomorrow", status: "To do", tone: "amber" },
    { title: "Submit problem set", meta: "Calculus · Nov 22", status: "Done", tone: "green" }
];

const weekDays = [
    { day: "MON", date: "18", tasks: ["Research outline", "Read chapter 6"] },
    { day: "TUE", date: "19", tasks: ["Biology review", "Group meeting"] },
    { day: "WED", date: "20", tasks: ["Problem set", "Draft reflection"] },
    { day: "THU", date: "21", tasks: ["Study session"] },
    { day: "FRI", date: "22", tasks: ["Submit essay", "Plan next week"] }
];

function TaskRow({ title, meta, status, tone = "blue" }) {
    return (
        <div className="preview-task-row">
            <span className={`preview-task-check ${status === "Done" ? "is-done" : ""}`}>
                {status === "Done" && <Check size={12} strokeWidth={3} />}
            </span>
            <div className="preview-task-copy">
                <strong>{title}</strong>
                <span>{meta}</span>
            </div>
            <span className={`preview-status status-${tone}`}>{status}</span>
        </div>
    );
}

function HeroDashboard() {
    return (
        <div className="hero-dashboard" aria-label="Preview of the Task Manager dashboard">
            <div className="dashboard-window-bar">
                <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
                <span>taskmanager.app</span>
                <span className="window-bar-mark"><span /></span>
            </div>
            <div className="dashboard-app">
                <aside className="dashboard-sidebar">
                    <div className="dashboard-brand-mark"><ListChecks size={17} /></div>
                    <span className="dashboard-workspace">WORKSPACE</span>
                    <div className="dashboard-side-link active"><LayoutGrid size={15} /> Overview</div>
                    <div className="dashboard-side-link"><ListChecks size={15} /> My tasks <span>8</span></div>
                    <div className="dashboard-side-link"><CalendarDays size={15} /> Calendar</div>
                    <div className="dashboard-side-link"><Target size={15} /> My progress</div>
                    <div className="dashboard-sidebar-bottom">
                        <div className="dashboard-avatar">JD</div>
                        <span>Jamie Davis<small>Student plan</small></span>
                        <ChevronDown size={13} />
                    </div>
                </aside>
                <div className="dashboard-main">
                    <div className="dashboard-topbar">
                        <span>Tuesday, November 19</span>
                        <div className="dashboard-top-actions">
                            <span className="dashboard-avatar tiny">JD</span>
                            <button type="button" aria-label="Add task preview"><Plus size={15} /></button>
                        </div>
                    </div>
                    <div className="dashboard-greeting">
                        <div>
                            <span className="dashboard-eyebrow">YOUR OVERVIEW</span>
                            <h3>A good day to make progress.</h3>
                        </div>
                        <span className="dashboard-focus-pill"><Sparkles size={12} /> On track</span>
                    </div>
                    <div className="dashboard-stats">
                        <div><span>Open tasks</span><strong>08</strong><small><span className="stat-up">↑ 2</span> from last week</small></div>
                        <div><span>Due this week</span><strong>05</strong><small>Across 3 subjects</small></div>
                        <div><span>Completed</span><strong>12</strong><small>Great momentum</small></div>
                    </div>
                    <div className="dashboard-task-heading">
                        <strong>Today’s focus</strong><span>View all <ArrowUpRight size={12} /></span>
                    </div>
                    <div className="dashboard-task-list">
                        <TaskRow {...tasks[0]} />
                        <TaskRow {...tasks[1]} />
                    </div>
                    <div className="dashboard-week-note">
                        <span className="week-note-icon"><CalendarDays size={14} /></span>
                        <span><strong>One deadline coming up</strong><small>Biology review · Tomorrow, 4:00 PM</small></span>
                        <ArrowRight size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShowcaseView({ view }) {
    if (view === "calendar") {
        return (
            <div className="showcase-calendar">
                <div className="showcase-calendar-head">
                    <div><span className="preview-kicker">YOUR WEEK, AT A GLANCE</span><h3>A little structure goes a long way.</h3></div>
                    <span className="calendar-month">Nov 18 – 22 <ChevronDown size={14} /></span>
                </div>
                <div className="week-grid">
                    {weekDays.map((day, index) => (
                        <div className={`week-column ${index === 1 ? "is-today" : ""}`} key={day.day}>
                            <span className="week-day">{day.day}</span>
                            <strong className="week-date">{day.date}</strong>
                            <div className="week-items">
                                {day.tasks.map((task, taskIndex) => (
                                    <div className={`week-task week-task-${(index + taskIndex) % 3}`} key={task}>{task}</div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="calendar-footnote"><span className="calendar-legend-dot" /> Coursework <span className="calendar-legend-dot soft" /> Personal</div>
            </div>
        );
    }

    if (view === "progress") {
        return (
            <div className="showcase-progress">
                <div className="progress-intro">
                    <span className="preview-kicker">YOUR MOMENTUM</span>
                    <h3>Small steps add up.</h3>
                    <p>A clear view of what you’ve finished and what’s next.</p>
                    <div className="progress-total"><strong>24</strong><span>tasks completed<br />this month</span></div>
                </div>
                <div className="progress-chart-area">
                    <div className="chart-caption"><span>Weekly activity</span><span className="chart-period">This month <ChevronDown size={13} /></span></div>
                    <div className="progress-chart" aria-label="Weekly task completion trend">
                        {[38, 58, 46, 75, 55, 88, 66, 94, 70, 82, 61, 100].map((height, index) => (
                            <div className="chart-column" key={index}><span style={{ height: `${height}%` }} /></div>
                        ))}
                    </div>
                    <div className="chart-labels"><span>WEEK 1</span><span>WEEK 2</span><span>WEEK 3</span><span>WEEK 4</span></div>
                    <div className="progress-insight"><Sparkles size={15} /><span><strong>You’re building a rhythm.</strong> You finished 6 more tasks than last month.</span></div>
                </div>
            </div>
        );
    }

    return (
        <div className="showcase-tasks">
            <div className="showcase-list-head">
                <div><span className="preview-kicker">YOUR TASKS</span><h3>Everything in its right place.</h3></div>
                <button className="showcase-add-button" type="button"><Plus size={15} /> New task</button>
            </div>
            <div className="showcase-filter-row"><span className="selected-filter">All tasks <b>8</b></span><span>In progress <b>3</b></span><span>Completed <b>12</b></span><span className="filter-spacer" /><span className="filter-control"><TimerReset size={14} /> Due date <ChevronDown size={12} /></span></div>
            <div className="showcase-task-list">
                {tasks.map((task) => <TaskRow key={task.title} {...task} />)}
                <TaskRow title="Prepare seminar questions" meta="Literature · Nov 25" status="To do" tone="blue" />
            </div>
            <div className="showcase-list-footer"><CircleCheck size={15} /> You’ve got a handle on it. Keep going.</div>
        </div>
    );
}

function Landing() {
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion() === true;
    const [activeView, setActiveView] = useState("tasks");
    const [activeSection, setActiveSection] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const landingRef = useRef(null);

    useEffect(() => {
        const updateScrollState = () => setIsScrolled(window.scrollY > 18);
        updateScrollState();
        window.addEventListener("scroll", updateScrollState, { passive: true });
        return () => window.removeEventListener("scroll", updateScrollState);
    }, []);

    useEffect(() => {
        const sectionIds = ["about", "features", "product", "how-it-works"];
        const visibility = new Map();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => visibility.set(entry.target.id, entry.isIntersecting));
            const visibleIds = Array.from(visibility)
                .filter(([, isVisible]) => isVisible)
                .map(([id]) => id);
            setActiveSection(visibleIds[visibleIds.length - 1] ?? null);
        }, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });

        sectionIds.forEach((id) => {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!mobileMenuOpen) return undefined;
        const closeOnEscape = (event) => {
            if (event.key === "Escape") setMobileMenuOpen(false);
        };
        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [mobileMenuOpen]);

    useEffect(() => {
        const desktopViewport = window.matchMedia("(min-width: 621px)");
        const closeOnDesktop = (event) => {
            if (event.matches) setMobileMenuOpen(false);
        };
        desktopViewport.addEventListener("change", closeOnDesktop);
        return () => desktopViewport.removeEventListener("change", closeOnDesktop);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth"
        });
    };

    const handleSectionNavigation = (event) => {
        const id = event.currentTarget.getAttribute("href")?.slice(1);
        if (!id) return;
        event.preventDefault();
        setActiveSection(id);
        setMobileMenuOpen(false);
        scrollTo(id);
    };

    useLayoutEffect(() => {
        const root = landingRef.current;
        if (!root) return undefined;

        let disposed = false;
        let cleanup = () => {};
        const textRestorers = [];
        const restoreText = () => {
            textRestorers.splice(0).reverse().forEach((restore) => restore());
        };

        const initializeAnimations = async () => {
            const [{ gsap }, { ScrollTrigger }] = await Promise.all([
                import("gsap"),
                import("gsap/ScrollTrigger")
            ]);
            if (disposed) return;
            gsap.registerPlugin(ScrollTrigger);

            const media = gsap.matchMedia(root);
            const refresh = () => ScrollTrigger.refresh();
            const images = Array.from(root.querySelectorAll("img"));
            const videos = Array.from(root.querySelectorAll("video"));
            let refreshFrame = requestAnimationFrame(refresh);

            const scheduleRefresh = () => {
                cancelAnimationFrame(refreshFrame);
                refreshFrame = requestAnimationFrame(refresh);
            };

            window.addEventListener("load", scheduleRefresh);
            images.forEach((image) => {
                if (!image.complete) image.addEventListener("load", scheduleRefresh);
            });
            videos.forEach((video) => {
                if (video.readyState < 1) video.addEventListener("loadedmetadata", scheduleRefresh);
            });

            media.add("(prefers-reduced-motion: no-preference)", () => {
                const cleanupMagnetic = [];
                const textTargets = [
                    ".hero-title-line > span",
                    ".hero-description",
                    ".video-showcase-heading h2",
                    ".video-showcase-heading > p",
                    ".about-heading h2",
                    ".about-lead",
                    ".about-detail",
                    ".features-intro h2",
                    ".features-intro > p",
                    ".feature-card-copy h3",
                    ".feature-card-copy p",
                    ".feature-focus h3",
                    ".feature-focus p",
                    ".feature-progress h3",
                    ".showcase-heading h2",
                    ".showcase-heading > p",
                    ".how-heading h2",
                    ".how-heading > p",
                    ".how-step h3",
                    ".how-step p",
                    ".benefits-statement h2",
                    ".benefits-statement > p",
                    ".benefit-line h3",
                    ".benefit-line p",
                    ".contact-panel h2",
                    ".contact-panel > p"
                ].join(",");

                root.querySelectorAll(textTargets).forEach((element) => {
                    const originalChildren = Array.from(element.childNodes);
                    textRestorers.push(() => element.replaceChildren(...originalChildren));

                    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
                    const textNodes = [];
                    while (walker.nextNode()) {
                        if (walker.currentNode.nodeValue.trim()) textNodes.push(walker.currentNode);
                    }

                    textNodes.forEach((textNode) => {
                        const fragment = document.createDocumentFragment();
                        const parts = textNode.nodeValue.match(/\s+|[^\s]+/g) || [];
                        parts.forEach((part) => {
                            if (/^\s+$/.test(part)) {
                                fragment.append(document.createTextNode(part));
                            } else {
                                const mask = document.createElement("span");
                                const word = document.createElement("span");
                                mask.className = "text-mask-word";
                                word.className = "text-word";
                                word.textContent = part;
                                mask.append(word);
                                fragment.append(mask);
                            }
                        });
                        textNode.replaceWith(fragment);
                    });
                });

                const context = gsap.context(() => {
                const hero = gsap.timeline({
                    defaults: { ease: "power3.out" },
                    scrollTrigger: {
                        trigger: ".landing-hero",
                        start: "top bottom",
                        end: "bottom top",
                        toggleActions: "play reverse play reverse",
                        invalidateOnRefresh: true
                    }
                });
                hero
                    .from(".hero-overline", { autoAlpha: 0, y: 14, duration: 0.6 }, 0)
                    .from(".hero-title-line .text-word", {
                        yPercent: 115,
                        autoAlpha: 0,
                        clipPath: "inset(0 0 100% 0)",
                        duration: 1,
                        stagger: 0.06
                    }, 0.08)
                    .fromTo(".hero-copy h1 em", {
                        textDecorationColor: "transparent"
                    }, {
                        textDecorationColor: "rgba(81, 173, 232, 0.42)",
                        duration: 0.65,
                        ease: "power2.out"
                    }, 0.82)
                    .from(".hero-description .text-word", {
                        yPercent: 32,
                        autoAlpha: 0,
                        duration: 0.68,
                        stagger: 0.012,
                        ease: "power2.out"
                    }, 0.58)
                    .from(".hero-buttons > *", { autoAlpha: 0, y: 12, duration: 0.55, stagger: 0.1 }, 1.08)
                    .from(".hero-reassurance", { autoAlpha: 0, y: 9, duration: 0.65 }, 1.35)
                    .from(".hero-dashboard-wrap", { autoAlpha: 0, x: 34, y: 20, scale: 0.95, duration: 1.05 }, 0.2)
                    .from(".hero-float-card", { autoAlpha: 0, scale: 0.86, y: 12, duration: 0.65, stagger: 0.14 }, 0.8);

                gsap.to(".float-deadline", {
                    y: -7,
                    duration: 4.2,
                    delay: 1.4,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    scrollTrigger: {
                        trigger: ".landing-hero",
                        start: "top bottom",
                        end: "bottom top",
                        toggleActions: "play pause resume pause",
                        invalidateOnRefresh: true
                    }
                });
                gsap.to(".float-done", {
                    y: 6,
                    duration: 4.8,
                    delay: 1.55,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    scrollTrigger: {
                        trigger: ".landing-hero",
                        start: "top bottom",
                        end: "bottom top",
                        toggleActions: "play pause resume pause",
                        invalidateOnRefresh: true
                    }
                });

                const reveal = (targets, trigger, from, start = "top 82%") => {
                    gsap.from(targets, {
                        ...from,
                        duration: from.duration ?? 0.8,
                        ease: from.ease ?? "power3.out",
                        stagger: from.stagger ?? 0,
                        scrollTrigger: {
                            trigger,
                            start,
                            toggleActions: "play reverse play reverse",
                            invalidateOnRefresh: true
                        }
                    });
                };

                const revealText = (selector, trigger, {
                    heading = false,
                    start = "top 84%",
                    duration = heading ? 1 : 0.68,
                    stagger = heading ? 0.055 : 0.01
                } = {}) => {
                    const words = Array.from(root.querySelectorAll(selector))
                        .flatMap((element) => Array.from(element.querySelectorAll(".text-word")));
                    if (!words.length) return;

                    const timeline = gsap.timeline({
                        scrollTrigger: {
                            trigger,
                            start,
                            toggleActions: "play reverse play reverse",
                            invalidateOnRefresh: true
                        }
                    });
                    const from = {
                        yPercent: heading ? 112 : 30,
                        autoAlpha: 0,
                        duration,
                        stagger,
                        ease: heading ? "power3.out" : "power2.out",
                        immediateRender: false
                    };
                    if (heading) from.clipPath = "inset(0 0 100% 0)";
                    timeline.from(words, from, 0);

                    if (heading) {
                        const highlights = Array.from(root.querySelectorAll(selector))
                            .flatMap((element) => Array.from(element.querySelectorAll("h1 em, h2 em")));
                        if (highlights.length) {
                            timeline.fromTo(highlights, {
                                textDecorationColor: "transparent"
                            }, {
                                textDecorationColor: "rgba(81, 173, 232, 0.42)",
                                duration: 0.75,
                                ease: "power2.out"
                            }, 0.24);
                        }
                    }
                };

                const parallaxText = (target, trigger, y) => {
                    gsap.to(target, {
                        y,
                        ease: "none",
                        scrollTrigger: {
                            trigger,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: 0.7,
                            invalidateOnRefresh: true
                        }
                    });
                };

                revealText(".video-showcase-heading h2", ".landing-video", { heading: true, start: "top 80%" });
                revealText(".video-showcase-heading > p", ".landing-video", { start: "top 86%", stagger: 0.008 });
                reveal(".video-showcase-frame", ".landing-video", {
                    y: 36,
                    scale: 0.98,
                    autoAlpha: 0,
                    duration: 1.05
                }, "top 82%");

                reveal(".about-heading > .section-eyebrow", ".landing-about", { y: 20, autoAlpha: 0 }, "top 78%");
                revealText(".about-heading h2", ".landing-about", { heading: true, start: "top 78%" });
                reveal(".about-image-wrap", ".about-story", {
                    clipPath: "inset(0 100% 0 0)",
                    scale: 1.035,
                    duration: 1.15
                }, "top 78%");
                reveal(".about-copy > .about-mark, .about-copy > .text-link", ".about-copy", { x: 20, autoAlpha: 0, stagger: 0.12 }, "top 78%");
                revealText(".about-copy p", ".about-copy", { start: "top 86%", stagger: 0.008 });
                parallaxText(".about-detail", ".about-story", -7);

                reveal(".features-intro .section-eyebrow", ".landing-features", { y: 20, autoAlpha: 0 }, "top 78%");
                revealText(".features-intro h2", ".landing-features", { heading: true, start: "top 78%" });
                revealText(".features-intro > p", ".landing-features", { start: "top 86%", stagger: 0.008 });
                reveal(".feature-deadlines", ".feature-layout", { x: -42, autoAlpha: 0, duration: 0.9 }, "top 78%");
                reveal(".feature-side > article", ".feature-layout", { x: 38, autoAlpha: 0, stagger: 0.16, duration: 0.85 }, "top 78%");
                revealText(".feature-card-copy h3, .feature-focus h3, .feature-progress h3", ".feature-layout", {
                    heading: true,
                    start: "top 78%"
                });
                revealText(".feature-card-copy p, .feature-focus p", ".feature-layout", { start: "top 86%", stagger: 0.008 });
                gsap.to(".mini-agenda", {
                    y: -17,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".feature-deadlines",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 0.8,
                        invalidateOnRefresh: true
                    }
                });
                gsap.to(".focus-graphic", {
                    rotate: 12,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".feature-focus",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1,
                        invalidateOnRefresh: true
                    }
                });

                reveal(".showcase-heading .section-eyebrow", ".landing-showcase", { y: 20, autoAlpha: 0 }, "top 78%");
                revealText(".showcase-heading h2", ".landing-showcase", { heading: true, start: "top 78%" });
                revealText(".showcase-heading > p", ".landing-showcase", { start: "top 86%", stagger: 0.008 });
                parallaxText(".showcase-heading > p", ".landing-showcase", -8);
                reveal(".showcase-board", ".showcase-board", { y: 42, scale: 0.975, autoAlpha: 0, duration: 1 }, "top 84%");

                reveal(".how-heading .section-eyebrow", ".landing-how", { x: -22, autoAlpha: 0 }, "top 78%");
                revealText(".how-heading h2", ".landing-how", { heading: true, start: "top 78%" });
                revealText(".how-heading > p", ".landing-how", { start: "top 86%", stagger: 0.008 });
                reveal(".how-step", ".how-steps", { x: 34, autoAlpha: 0, stagger: 0.14, duration: 0.75 }, "top 80%");
                revealText(".how-step h3", ".how-steps", { heading: true, start: "top 82%", duration: 0.9, stagger: 0.05 });
                revealText(".how-step p", ".how-steps", { start: "top 86%", duration: 0.66, stagger: 0.009 });

                reveal(".benefits-statement .section-eyebrow", ".landing-benefits", { x: -22, autoAlpha: 0 }, "top 78%");
                revealText(".benefits-statement h2", ".landing-benefits", { heading: true, start: "top 78%" });
                revealText(".benefits-statement > p", ".landing-benefits", { start: "top 86%", stagger: 0.008 });
                parallaxText(".benefits-statement > p", ".landing-benefits", -7);
                reveal(".benefit-line", ".benefit-list", { x: 30, autoAlpha: 0, stagger: 0.13, duration: 0.7 }, "top 82%");
                revealText(".benefit-line h3", ".benefit-list", { heading: true, start: "top 84%", duration: 0.9, stagger: 0.05 });
                revealText(".benefit-line p", ".benefit-list", { start: "top 88%", duration: 0.65, stagger: 0.009 });

                reveal(".contact-panel", ".landing-contact", {
                    clipPath: "inset(0 0 100% 0)",
                    duration: 1
                }, "top 84%");
                reveal(".contact-panel > .section-eyebrow, .contact-button, .contact-note", ".contact-panel", {
                    y: 20,
                    autoAlpha: 0,
                    stagger: 0.1,
                    duration: 0.65
                }, "top 78%");
                revealText(".contact-panel h2", ".landing-contact", { heading: true, start: "top 80%" });
                revealText(".contact-panel > p", ".landing-contact", { start: "top 88%", stagger: 0.008 });

                gsap.to(".contact-orb", {
                    yPercent: 8,
                    rotate: 8,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".landing-contact",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1,
                        invalidateOnRefresh: true
                    }
                });

                const footerReveal = gsap.timeline({
                    scrollTrigger: {
                        trigger: ".landing-footer",
                        start: "top 88%",
                        toggleActions: "play reverse play reverse",
                        invalidateOnRefresh: true
                    }
                });
                footerReveal
                    .from(".footer-columns > *", { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.68 }, 0)
                    .from(".footer-divider", { scaleX: 0, duration: 0.8, ease: "power3.inOut" }, 0.32)
                    .from(".footer-bottom > *", { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.62 }, 0.48);

                if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                    gsap.utils.toArray(".landing-signup, .hero-primary, .contact-button", root).forEach((button) => {
                        const moveX = gsap.quickTo(button, "x", { duration: 0.35, ease: "power3.out" });
                        const moveY = gsap.quickTo(button, "y", { duration: 0.35, ease: "power3.out" });
                        const onMove = (event) => {
                            const bounds = button.getBoundingClientRect();
                            moveX(gsap.utils.clamp(-5, 5, (event.clientX - bounds.left - bounds.width / 2) * 0.12));
                            moveY(gsap.utils.clamp(-4, 4, (event.clientY - bounds.top - bounds.height / 2) * 0.1));
                        };
                        const onLeave = () => {
                            moveX(0);
                            moveY(0);
                        };
                        button.addEventListener("pointermove", onMove);
                        button.addEventListener("pointerleave", onLeave);
                        cleanupMagnetic.push(() => {
                            button.removeEventListener("pointermove", onMove);
                            button.removeEventListener("pointerleave", onLeave);
                        });
                    });
                }

                scheduleRefresh();
                }, root);

                return () => {
                    cleanupMagnetic.forEach((removeListeners) => removeListeners());
                    context.revert();
                    restoreText();
                };
            });

            cleanup = () => {
                cancelAnimationFrame(refreshFrame);
                window.removeEventListener("load", scheduleRefresh);
                images.forEach((image) => image.removeEventListener("load", scheduleRefresh));
                videos.forEach((video) => video.removeEventListener("loadedmetadata", scheduleRefresh));
                media.revert();
                restoreText();
            };
        };

        initializeAnimations().catch((error) => {
            restoreText();
            if (!disposed) console.error("Could not initialize landing page animations.", error);
        });

        return () => {
            disposed = true;
            cleanup();
            restoreText();
        };
    }, []);

    return (
        <div className="landing-page" ref={landingRef}>
            <header className={`landing-header ${isScrolled ? "is-scrolled" : ""}`}>
                <Link className="landing-logo" to="/" aria-label="Student Task Manager home" onClick={() => setMobileMenuOpen(false)}>
                    <span className="logo-symbol"><GraduationCap size={20} /></span>
                    <span>task<span className="logo-light">manager</span></span>
                </Link>
                <button
                    className="landing-menu-toggle"
                    type="button"
                    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="landing-navigation"
                    onClick={() => setMobileMenuOpen((open) => !open)}
                >
                    {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
                </button>
                <nav className={`landing-nav ${mobileMenuOpen ? "is-open" : ""}`} id="landing-navigation" aria-label="Main navigation">
                    <a className={activeSection === "about" ? "is-active" : ""} aria-current={activeSection === "about" ? "location" : undefined} href="#about" onClick={handleSectionNavigation}>Why Task Manager</a>
                    <a className={activeSection === "features" ? "is-active" : ""} aria-current={activeSection === "features" ? "location" : undefined} href="#features" onClick={handleSectionNavigation}>Features</a>
                    <a className={activeSection === "product" ? "is-active" : ""} aria-current={activeSection === "product" ? "location" : undefined} href="#product" onClick={handleSectionNavigation}>Product</a>
                    <a className={activeSection === "how-it-works" ? "is-active" : ""} aria-current={activeSection === "how-it-works" ? "location" : undefined} href="#how-it-works" onClick={handleSectionNavigation}>How it works</a>
                    <Link className="landing-nav-login" to="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                </nav>
                <div className="landing-actions">
                    <button className="landing-login" onClick={() => navigate("/login")}>Log in</button>
                    <button className="landing-signup" onClick={() => navigate("/signup")}>Get started <ArrowUpRight size={15} /></button>
                </div>
            </header>

            <main>
                <section className="landing-hero" id="home">
                    <div className="hero-copy">
                        <motion.div className="hero-copy-inner">
                            <span className="hero-overline"><span /> A little more focus. A lot more you.</span>
                            <h1>
                                <span className="hero-title-line"><span>Make room for</span></span>
                                <span className="hero-title-line"><span>the work that <em>matters.</em></span></span>
                            </h1>
                            <p className="hero-description">A calmer way to manage your studies. Bring tasks, deadlines, and your next big idea into one clear view.</p>
                            <div className="hero-buttons">
                                <button className="hero-primary" onClick={() => navigate("/signup")}>Get started <ArrowRight size={17} /></button>
                                <button className="hero-secondary" onClick={() => scrollTo("about")}>Explore more <span className="secondary-arrow"><ArrowRight size={15} /></span></button>
                            </div>
                            <div className="hero-reassurance"><CheckCircle2 size={16} /><span>Less catching up. More moving forward.</span></div>
                        </motion.div>
                    </div>
                    <motion.div className="hero-visual">
                        <div className="hero-orbit orbit-one" />
                        <div className="hero-orbit orbit-two" />
                        <div className="hero-dashboard-wrap"><HeroDashboard /></div>
                        <motion.div className="hero-float-card float-deadline">
                            <span className="float-icon"><CalendarDays size={16} /></span>
                            <span><strong>One thing at a time</strong><small>Your next deadline is tomorrow</small></span>
                        </motion.div>
                        <motion.div className="hero-float-card float-done">
                            <span className="done-check"><Check size={14} /></span><span><strong>Nice work!</strong><small>Task completed</small></span>
                        </motion.div>
                    </motion.div>
                    <div className="hero-bottom-note"><span>01 / 06</span><span>YOUR SEMESTER, IN BETTER RHYTHM</span><span className="hero-note-line" /></div>
                </section>

                <section className="landing-video" aria-labelledby="video-showcase-title">
                    <div className="video-showcase-inner section-shell">
                        <div className="video-showcase-heading">
                            <h2 id="video-showcase-title">Less chaos. <em>More progress.</em></h2>
                            <p>Bring your tasks together, stay organised and make every day more productive.</p>
                        </div>
                        <div className="video-showcase-frame">
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                aria-label="Animated Task Manager product preview"
                            >
                                <source src="/videos/task-manager-intro.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>
                </section>

                <section className="landing-about section-shell" id="about">
                    <div className="about-heading">
                        <span className="section-eyebrow">A CLEARER WAY FORWARD <span>—</span> 01</span>
                        <h2>Get it out of your head.<br /><em>Get on with your day.</em></h2>
                    </div>
                    <div className="about-story">
                        <div className="about-image-wrap">
                            <img src={studentIllustration} alt="Student working through a focused study session" />
                            <span className="image-caption"><span /> MADE FOR YOUR EVERYDAY WINS</span>
                            <div className="about-image-stamp"><span>PLAN</span><span>·</span><span>FOCUS</span><span>·</span><span>GROW</span></div>
                        </div>
                        <div className="about-copy">
                            <span className="about-mark"><Sparkles size={18} /></span>
                            <p className="about-lead">Your studies have enough moving parts. Staying organized shouldn’t be one of them.</p>
                            <p className="about-detail">Task Manager gives every assignment, deadline, and small win a place to land—so you can see what matters, make a plan, and get back to doing your best work.</p>
                            <a className="text-link" href="#how-it-works" onClick={handleSectionNavigation}>A simpler way to study <ArrowUpRight size={15} /></a>
                        </div>
                    </div>
                </section>

                <section className="landing-features section-shell" id="features">
                    <div className="features-intro">
                        <div><span className="section-eyebrow">THOUGHTFULLY IN SYNC <span>—</span> 02</span><h2>Everything has<br />its <em>place.</em></h2></div>
                        <p>From the first idea to the final checkmark, keep the moving parts of student life working together.</p>
                    </div>
                    <div className="feature-layout">
                        <article className="feature-deadlines">
                            <div className="feature-card-copy"><span className="feature-number">01 / STAY AHEAD</span><h3>Deadlines,<br />without the<br /><em>last-minute.</em></h3><p>See what’s coming and give every important thing the space it deserves.</p></div>
                            <div className="mini-agenda">
                                <div className="mini-agenda-heading"><span>UP NEXT</span><span>THIS WEEK</span></div>
                                <div className="agenda-item"><span className="agenda-date"><b>20</b><small>NOV</small></span><span><strong>Biology review</strong><small>Tomorrow · 4:00 PM</small></span><span className="agenda-dot blue-dot" /></div>
                                <div className="agenda-item"><span className="agenda-date"><b>22</b><small>NOV</small></span><span><strong>Submit problem set</strong><small>Friday · Calculus</small></span><span className="agenda-dot amber-dot" /></div>
                                <div className="agenda-item"><span className="agenda-date"><b>25</b><small>NOV</small></span><span><strong>Seminar questions</strong><small>Monday · Literature</small></span><span className="agenda-dot green-dot" /></div>
                            </div>
                        </article>
                        <div className="feature-side">
                            <article className="feature-focus">
                                <span className="feature-number">02 / FIND YOUR FOCUS</span>
                                <div className="focus-graphic"><span className="focus-ring ring-one" /><span className="focus-ring ring-two" /><span className="focus-core"><Target size={22} /></span></div>
                                <h3>Know what<br />comes <em>next.</em></h3>
                                <p>A simple, clear view helps you spend your energy where it counts.</p>
                            </article>
                            <article className="feature-progress">
                                <span className="feature-number">03 / NOTICE YOUR PROGRESS</span>
                                <div className="progress-feature-top"><span className="progress-feature-icon"><Check size={16} /></span><span>THIS WEEK <strong>+18%</strong></span></div>
                                <h3>Progress worth<br />feeling good <em>about.</em></h3>
                                <div className="feature-progress-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="landing-showcase" id="product">
                    <div className="showcase-heading section-shell">
                        <div>
                            <span className="section-eyebrow light-eyebrow">MADE TO MAKE SENSE <span>—</span> 03</span>
                            <h2>See your semester<br />come <em>together.</em></h2>
                        </div>
                        <p>The right perspective changes everything. Switch between your tasks, your week, and the progress you’re making.</p>
                    </div>
                    <div className="showcase-board">
                        <div className="showcase-board-top">
                            <div className="showcase-tabs" role="tablist" aria-label="Product preview views">
                                {[
                                    { id: "tasks", label: "My tasks", icon: ListChecks },
                                    { id: "calendar", label: "Calendar", icon: CalendarDays },
                                    { id: "progress", label: "Progress", icon: Target }
                                ].map(({ id, label, icon: Icon }) => (
                                    <button
                                        className={`showcase-tab ${activeView === id ? "active" : ""}`}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeView === id}
                                        aria-controls="showcase-view"
                                        key={id}
                                        onClick={() => setActiveView(id)}
                                    ><Icon size={15} />{label}</button>
                                ))}
                            </div>
                            <span className="showcase-board-label"><span /> LIVE PREVIEW</span>
                        </div>
                        <div className="showcase-view-wrap" id="showcase-view" role="tabpanel" aria-live="polite">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    className="showcase-view"
                                    key={activeView}
                                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                                    transition={{ duration: prefersReducedMotion ? 0 : 0.55, ease: "easeOut" }}
                                >
                                    <ShowcaseView view={activeView} />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                    <div className="showcase-footnote"><span>LESS TO JUGGLE, MORE TO BUILD ON.</span><span>THOUGHTFUL TOOLS FOR REAL STUDENT LIFE <ArrowUpRight size={13} /></span></div>
                </section>

                <section className="landing-how section-shell" id="how-it-works">
                    <div className="how-heading">
                        <span className="section-eyebrow">A BETTER KIND OF ROUTINE <span>—</span> 04</span>
                        <h2>Three small steps.<br /><em>A lot more headspace.</em></h2>
                        <p>No complicated setup. Just a place to begin, a plan you can trust, and room to keep going.</p>
                    </div>
                    <div className="how-steps">
                        {[
                            { number: "01", icon: ListChecks, title: "Get it down", text: "Add the assignment, idea, or reminder before it slips away." },
                            { number: "02", icon: CalendarDays, title: "Make a plan", text: "Give it a due date and see how it fits into your week." },
                            { number: "03", icon: CheckCircle2, title: "Keep it moving", text: "Work through your list and see every finished step add up." }
                        ].map(({ number, icon: Icon, title, text }) => (
                            <article className="how-step" key={number}>
                                <div className="how-step-top"><span>{number}</span><Icon size={19} /></div>
                                <h3>{title}</h3><p>{text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="landing-benefits">
                    <div className="benefits-inner section-shell">
                        <div className="benefits-statement">
                            <span className="section-eyebrow light-eyebrow">MORE THAN A CHECKLIST <span>—</span> 05</span>
                            <h2>Make space<br />for your <em>best work.</em></h2>
                            <p>Good organization isn’t about doing more. It’s about feeling clear enough to do what matters.</p>
                        </div>
                        <div className="benefit-list">
                            <div className="benefit-line"><span>01</span><div><h3>A quieter mind</h3><p>Put the mental reminders somewhere you can trust.</p></div><ArrowUpRight size={17} /></div>
                            <div className="benefit-line"><span>02</span><div><h3>More intentional days</h3><p>Know what needs your attention without losing sight of the big picture.</p></div><ArrowUpRight size={17} /></div>
                            <div className="benefit-line"><span>03</span><div><h3>Momentum you can see</h3><p>Recognize the progress that’s easy to overlook while you’re in it.</p></div><ArrowUpRight size={17} /></div>
                        </div>
                    </div>
                    <div className="benefits-watermark" aria-hidden="true">FOCUS</div>
                </section>

                <section className="landing-contact" id="contact">
                    <div className="contact-panel">
                        <div className="contact-orb" aria-hidden="true" />
                        <span className="section-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
                        <h2>A little more organized.<br /><em>A lot more possible.</em></h2>
                        <p>Give your goals a place to grow—and make today a good place to start.</p>
                        <button className="contact-button" onClick={() => navigate("/signup")}>Get started <ArrowRight size={17} /></button>
                        <span className="contact-note"><CheckCircle2 size={14} /> Your next clear day is one step away.</span>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <svg className="footer-doodle-art" viewBox="0 0 1600 440" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
                    <g className="footer-doodle footer-doodle-book" transform="translate(125 0) scale(1.18)">
                        <path d="M75 41c-22-17-48-20-72-13v89c27-9 51-4 72 14 21-18 46-23 73-14V28c-25-7-51-4-73 13Z" />
                        <path d="M75 41v90M23 45c16-3 31 1 43 9M23 66c16-3 31 1 43 9M23 87c16-3 31 1 43 9M126 45c-16-3-31 1-43 9M126 66c-16-3-31 1-43 9M126 87c-16-3-31 1-43 9" />
                    </g>
                    <g className="footer-doodle footer-doodle-ruler" transform="translate(0 145)">
                        <path d="m31 16 117 67-14 25L17 41Z" />
                        <path d="m42 31 9 10m7-2 8 11m6-3 9 11m7-3 8 11m7-3 9 11" />
                    </g>
                    <g className="footer-doodle footer-doodle-cap" transform="translate(55 0)">
                        <path d="m438 72 74-43 79 31-74 47-79-35Z" />
                        <path d="m457 81 6 36c29 17 64 19 94 0l6-36M589 60v54m0 0c-9 8-7 17 1 23 8-7 10-16 1-23" />
                    </g>
                    <g className="footer-doodle footer-doodle-plane">
                        <path d="m924 45 104-31-54 89-18-36-32-22Zm32 22 72-53" />
                        <path className="footer-flight-path" d="M886 105c-49 14-50 47-13 43 33-4 6-37-15-13-24 27 2 44-27 53-19 6-31-2-44-11" />
                    </g>
                    <g className="footer-doodle footer-doodle-globe" transform="translate(-55 0)">
                        <circle cx="1303" cy="72" r="51" />
                        <path d="M1262 50c15 6 26 1 34-10 8-10 17-11 25-6l-4 14 13 9-9 15-17-3-9 12 3 19-16 9-7-14-17-6m42-65c-3 12 0 19 11 23m-44 42c17-3 27 3 33 19m6-112c-13 28-13 68 2 101m17-96c16 26 19 57 7 87" />
                        <path d="M1297 124v15m-22 8h46m-37-8h28" />
                    </g>
                    <g className="footer-doodle footer-doodle-pencil">
                        <path d="m1480 102 82-87 19 18-82 87-27 8 8-26Z" />
                        <path d="m1488 96 19 18m45-87 19 18" />
                    </g>
                    <g className="footer-doodle footer-doodle-sidebook">
                        <path d="M-23 335c21-15 43-16 64-5v76c-21-9-43-8-64 4Zm64-5c20-11 43-10 64 5v75c-21-12-43-13-64-4Zm-49 14 31-3m-31 20 31-3m-31 20 31-3m23-14 31-3m-31 20 31-3" />
                    </g>
                    <g className="footer-doodle footer-doodle-sidebook right">
                        <path d="M1525 342c20-15 42-16 63-5v76c-21-9-43-8-63 4Zm63-5c21-11 43-10 64 5v75c-21-12-43-13-64-4Zm-49 14 31-3m-31 20 31-3m-31 20 31-3m23-14 31-3m-31 20 31-3" />
                    </g>
                    <g className="footer-doodle footer-doodle-lower-pencil">
                        <path d="m292 250 76-81 17 16-76 81-25 9 8-25Z" />
                        <path d="m300 243 17 16m42-75 17 16" />
                    </g>
                    <g className="footer-doodle footer-doodle-lower-book">
                        <path d="M1070 213c24-18 50-19 77-3v67c-26-13-52-12-77 3Zm77-3c25-16 52-15 78 3v67c-26-15-52-16-78-3Zm-62 11c17-4 31-1 45 7m-45 12c17-4 31-1 45 7m33-19c17-8 32-10 49-7m-49 19c17-8 32-10 49-7" />
                    </g>
                    <g className="footer-doodle footer-doodle-stars">
                        <path d="m197 93 4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12Zm260 83 3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Zm699-140 4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12Zm390 160 4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12Z" />
                        <circle cx="364" cy="124" r="3" /><circle cx="814" cy="37" r="3" /><circle cx="1160" cy="160" r="3" /><circle cx="1434" cy="59" r="3" />
                    </g>
                </svg>
                <div className="footer-panel">
                    <div className="footer-main">
                        <div className="footer-columns">
                            <section className="footer-column footer-brand-column">
                                <svg className="footer-emblem" viewBox="0 0 200 130" aria-hidden="true">
                                    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5">
                                        <path d="M100 74c-19-16-39-22-65-20v39c27-2 47 5 65 21 18-16 38-23 65-21V54c-26-2-46 4-65 20Z" />
                                        <path d="M100 74v40M48 66v21m104-21v21M89 51c-10-12-5-23 4-34 0 10 14 15 13 27 0 8-6 13-13 13-7 0-12-4-12-11 0-4 2-7 5-10" />
                                        <path d="M26 86c-13-8-20-21-19-37 10 5 16 13 18 23m2 8c-13-2-23-10-28-23 12 1 21 6 27 17m-3 8c-11 5-22 4-32-4 10-5 20-5 29 1m155 7c13-8 20-21 19-37-10 5-16 13-18 23m-2 8c13-2 23-10 28-23-12 1-21 6-27 17m3 8c11 5 22 4 32-4-10-5-20-5-29 1" />
                                        <path d="M18 45c2 5 3 9 4 14m-13-5c5 1 9 3 13 6m-2 18c-5 1-9 1-13 0m173-33c-2 5-3 9-4 14m13-5c-5 1-9 3-13 6m2 18c5 1 9 1 13 0" />
                                    </g>
                                </svg>
                                <span className="footer-edition">STUDENT EDITION</span>
                                <h2 className="footer-heading">Dream big.<br />Study smart.<br /><em>Stay organised.</em></h2>
                                <p className="footer-description">From classroom assignments to personal goals, make every deadline count.</p>
                                <div className="footer-learning-steps">LEARN <span>•</span> PLAN <span>•</span> ACHIEVE</div>
                            </section>
                            <nav className="footer-column footer-links-column" aria-label="Quick links">
                                <h3>QUICK LINKS</h3>
                                <a href="#home">Home</a>
                                <a href="#about">About</a>
                                <a href="#features">Features</a>
                                <a href="#product">Product</a>
                                <a href="#how-it-works">How it works</a>
                                <a href="#contact">Contact</a>
                            </nav>
                            <nav className="footer-column footer-links-column" aria-label="Student resources">
                                <h3>STUDENT RESOURCES</h3>
                                <Link to="/home">Dashboard</Link>
                                <Link to="/my-tasks">My Tasks</Link>
                                <a href="#features">Task features</a>
                                <a href="#product">Study workflow</a>
                                <Link to="/login">Log in</Link>
                                <Link to="/signup">Get started</Link>
                            </nav>
                            <section className="footer-column footer-connect">
                                <h3>LET’S CONNECT</h3>
                                <p>Stay organised, keep learning, and make every next step count.</p>
                                <div className="footer-social-links" aria-label="Task Manager links">
                                    <Link to="/home" aria-label="Open dashboard"><LayoutGrid size={18} /></Link>
                                    <Link to="/my-tasks" aria-label="Open my tasks"><ListChecks size={18} /></Link>
                                    <a href="#contact" aria-label="Go to contact section"><ArrowUpRight size={19} /></a>
                                </div>
                            </section>
                        </div>
                    </div>
                    <div className="footer-divider" aria-hidden="true" />
                    <div className="footer-bottom">
                        <Link className="landing-logo footer-logo" to="/" aria-label="Task Manager home">
                            <span className="logo-symbol"><GraduationCap size={18} /></span>
                            <span>task<span className="logo-light">manager</span></span>
                        </Link>
                        <span className="footer-tagline">Small steps. Big achievements.</span>
                        <div className="footer-copyright">
                            <span>© {new Date().getFullYear()} Task Manager. All rights reserved.</span>
                            <span>Made for doers &amp; dreamers.</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;