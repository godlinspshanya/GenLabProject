
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
    GraduationCap,
    ArrowRight,
    CheckCircle2,
    CalendarDays,
    ChartNoAxesCombined,
    ClipboardList
} from "lucide-react";

import studentIllustration from "../assets/student-illustration.png.png";
import "./Landing.css";

// Stagger animation
const staggerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12
        }
    }
};

// Fade and slide-up animation
const fadeUpVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

// Header animation
const headerVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
            staggerChildren: 0.08
        }
    }
};

// Hero illustration animation
const heroVisualVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.14
        }
    }
};

const featureItems = [
    {
        icon: ClipboardList,
        title: "Task Management",
        description: "Organize and manage your academic tasks in one convenient place."
    },
    {
        icon: CalendarDays,
        title: "Deadline Tracking",
        description: "Keep track of important deadlines and never miss a task."
    },
    {
        icon: ChartNoAxesCombined,
        title: "Progress Tracking",
        description: "Monitor completed and pending tasks to understand your progress."
    }
];

function Landing() {

    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion() === true;
    const initialAnimation = prefersReducedMotion ? false : "hidden";

    return (
        <div className="landing-page">

            {/* HEADER */}
            <motion.header
                className="landing-header"
                initial={initialAnimation}
                animate="visible"
                variants={headerVariants}
            >

                <motion.div
                    className="landing-logo"
                    onClick={() => navigate("/")}
                    variants={fadeUpVariants}
                >
                    <GraduationCap size={34} />
                    <span>Student Task Manager</span>
                </motion.div>

                <motion.nav
                    className="landing-nav"
                    variants={staggerVariants}
                >
                    {["Home", "About", "Features", "Contact"].map((item) => (
                        <motion.a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            variants={fadeUpVariants}
                            whileHover={
                                prefersReducedMotion
                                    ? undefined
                                    : { y: -2 }
                            }
                        >
                            {item}
                        </motion.a>
                    ))}
                </motion.nav>

                <motion.div
                    className="landing-actions"
                    variants={staggerVariants}
                >
                    <motion.button
                        className="landing-login"
                        onClick={() => navigate("/login")}
                        variants={fadeUpVariants}
                        whileHover={
                            prefersReducedMotion
                                ? undefined
                                : { y: -2 }
                        }
                    >
                        Login
                    </motion.button>

                    <motion.button
                        className="landing-signup"
                        onClick={() => navigate("/signup")}
                        variants={fadeUpVariants}
                        whileHover={
                            prefersReducedMotion
                                ? undefined
                                : { y: -2, scale: 1.02 }
                        }
                    >
                        Get Started
                    </motion.button>
                </motion.div>

            </motion.header>


            {/* HERO SECTION */}
            <section className="landing-hero" id="home">

                {/* LEFT SIDE - HERO CONTENT */}
                <motion.div
                    className="hero-content"
                    initial={initialAnimation}
                    animate="visible"
                    variants={staggerVariants}
                >

                    <motion.span
                        className="hero-tag"
                        variants={fadeUpVariants}
                    >
                        YOUR SMARTER WAY TO STAY ORGANIZED
                    </motion.span>

                    <motion.h1 variants={fadeUpVariants}>
                        Organize Your Tasks.
                        <span> Achieve More.</span>
                    </motion.h1>

                    <motion.p variants={fadeUpVariants}>
                        Manage your academic tasks, stay on top of
                        deadlines, and track your progress with one
                        simple and organized platform.
                    </motion.p>

                    <motion.div
                        className="hero-buttons"
                        variants={fadeUpVariants}
                    >

                        <motion.button
                            className="hero-primary"
                            onClick={() => navigate("/signup")}
                            whileHover={
                                prefersReducedMotion
                                    ? undefined
                                    : { y: -3, scale: 1.02 }
                            }
                        >
                            Get Started
                            <ArrowRight size={19} />
                        </motion.button>

                        <motion.button
                            className="hero-secondary"
                            onClick={() => {
                                document.getElementById("about")
                                    ?.scrollIntoView({
                                        behavior: prefersReducedMotion
                                            ? "auto"
                                            : "smooth"
                                    });
                            }}
                            whileHover={
                                prefersReducedMotion
                                    ? undefined
                                    : { y: -3 }
                            }
                        >
                            Learn More
                        </motion.button>

                    </motion.div>

                    <motion.div
                        className="hero-trust"
                        variants={fadeUpVariants}
                    >
                        <CheckCircle2 size={18} />
                        <span>
                            Plan better. Stay focused. Achieve your goals.
                        </span>
                    </motion.div>

                </motion.div>


                {/* RIGHT SIDE - STUDENT ILLUSTRATION */}
                <motion.div
                    className="hero-visual"
                    initial={initialAnimation}
                    animate="visible"
                    variants={heroVisualVariants}
                >

                    <motion.div
                        className="hero-illustration-wrap"
                        initial={
                            prefersReducedMotion
                                ? false
                                : { opacity: 0, x: 32 }
                        }
                        animate={{
                            opacity: 1,
                            x: 0
                        }}
                        transition={{
                            duration: prefersReducedMotion ? 0 : 0.75,
                            delay: prefersReducedMotion ? 0 : 0.2,
                            ease: [0.22, 1, 0.36, 1]
                        }}
                    >

                        <motion.img
                            className="hero-illustration"
                            src={studentIllustration}
                            alt="Student organizing tasks on a laptop"
                            animate={
                                prefersReducedMotion
                                    ? undefined
                                    : {
                                        y: [0, -12, 0]
                                    }
                            }
                            transition={
                                prefersReducedMotion
                                    ? undefined
                                    : {
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }
                            }
                        />

                    </motion.div>

                </motion.div>

            </section>


            {/* ABOUT SECTION */}
            <motion.section
                className="landing-about"
                id="about"
                initial={initialAnimation}
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerVariants}
            >

                <motion.span
                    className="section-tag"
                    variants={fadeUpVariants}
                >
                    ABOUT US
                </motion.span>

                <motion.h2 variants={fadeUpVariants}>
                    Make Every Task
                    <span> Count.</span>
                </motion.h2>

                <motion.p variants={fadeUpVariants}>
                    Student Task Manager is designed to make academic
                    life easier. It provides a centralized space to
                    organize tasks, manage deadlines, and monitor
                    progress without unnecessary confusion.
                </motion.p>

            </motion.section>


            {/* FEATURES SECTION */}
            <motion.section
                className="landing-features"
                id="features"
                initial={initialAnimation}
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerVariants}
            >

                <motion.span
                    className="section-tag"
                    variants={fadeUpVariants}
                >
                    WHAT WE OFFER
                </motion.span>

                <motion.h2 variants={fadeUpVariants}>
                    Everything You Need to Stay Organized
                </motion.h2>

                <motion.div
                    className="feature-carousel"
                    variants={staggerVariants}
                >
                    <motion.div
                        className="feature-track"
                        variants={staggerVariants}
                    >
                        {[false, true].map((isDuplicate) => (
                            <motion.div
                                key={isDuplicate ? "duplicate" : "original"}
                                className="feature-set"
                                variants={staggerVariants}
                                aria-hidden={isDuplicate}
                            >
                                {featureItems.map(({ icon: Icon, title, description }) => (
                                    <motion.div
                                        key={title}
                                        className="feature-card"
                                        variants={fadeUpVariants}
                                        whileHover={
                                            prefersReducedMotion
                                                ? undefined
                                                : { y: -6 }
                                        }
                                    >
                                        <motion.div
                                            className="feature-icon"
                                            whileHover={
                                                prefersReducedMotion
                                                    ? undefined
                                                    : { rotate: -5, scale: 1.06 }
                                            }
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Icon size={30} />
                                        </motion.div>

                                        <h3>{title}</h3>
                                        <p>{description}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

            </motion.section>


            {/* CONTACT SECTION */}
            <motion.section
                className="landing-contact"
                id="contact"
                initial={initialAnimation}
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerVariants}
            >

                <motion.h2 variants={fadeUpVariants}>
                    Ready to Get Organized?
                </motion.h2>

                <motion.p variants={fadeUpVariants}>
                    Start managing your academic tasks with confidence.
                </motion.p>

                <motion.button
                    onClick={() => navigate("/signup")}
                    variants={fadeUpVariants}
                    whileHover={
                        prefersReducedMotion
                            ? undefined
                            : { y: -3, scale: 1.03 }
                    }
                >
                    Get Started Now
                    <ArrowRight size={18} />
                </motion.button>

            </motion.section>


            {/* FOOTER */}
            <motion.footer
                className="landing-footer"
                initial={initialAnimation}
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUpVariants}
            >

                <div className="landing-logo">
                    <GraduationCap size={28} />
                    <span>Student Task Manager</span>
                </div>

                <p>
                    Making student life more organized, one task at a time.
                </p>

                <span>
                    © {new Date().getFullYear()} Student Task Manager.
                    All rights reserved.
                </span>

            </motion.footer>

        </div>
    );
}

export default Landing;
