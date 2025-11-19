
import React from "react";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaPlay,
  FaUserGraduate,
  FaLayerGroup,
  FaChevronRight,
  FaStar,
  FaTag,
  FaClock, // ✅ use react-icons instead of <i class="fa-...">
} from "react-icons/fa";
import "./Home.css";

const categories = [
  { icon: "🎨", title: "Maths", count: 5 },
  { icon: "🧪", title: "Science", count: 5 },
  { icon: "📈", title: "Commerce", count: 8 },
  { icon: "💻", title: "Technology", count: 6 },
  { icon: "🎭", title: "Art", count: 4 },
  { icon: "🧠", title: "Languages", count: 7 },
];

const courses = [
  {
    title: "Physics",
    author: "By Lasith Jayawardana",
    cover:
      "https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rating: 4.8,
    lessons: 7,
    days: 15,
    level: "All Levels",
    badge: "",
  },
  {
    title: "Information Technology",
    author: "By Nethu Hewasinghe",
    cover:
      "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rating: 4.6,
    lessons: 12,
    days: 120,
    level: "All Levels",
    badge: "SALE",
  },
  {
    title: "Biology",
    author: "By Mahinda Rajapaksha",
    cover:
      "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rating: 4.7,
    lessons: 20,
    days: 20,
    level: "Expert",
    badge: "",
  },
  {
    title: "Combined Maths",
    author: "By Sajith Premadasa",
    cover:
      "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rating: 4.5,
    lessons: 11,
    days: 30,
    level: "Beginner",
    badge: "NEW",
  },
];

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="lms">
      {/* Top Navigation */}
      <header className="nav">
        <div className="nav-left">
          <button className="nav-burger" aria-label="Menu" type="button">
            <FaBars />
          </button>

          <a href="#home" className="brand" aria-label="EduCore">
            <span className="brand-logo">🎓</span>
            <span className="brand-text">EduCore</span>
          </a>

          <nav className="nav-links">
            <a href="#explore" className="link-ghost">
              Explore
            </a>
            <a href="#home">Home</a>
            <a href="#contact">Support</a>
          </nav>
        </div>

        <div className="nav-right">
          <Link to="/login" className="btn ghost">
            Log In
          </Link>
          {/* If your signup route is "/", keep it; otherwise change to "/signup" */}
          <Link to="/SignupForm" className="btn primary">
            Sign Up
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Explore</p>
            <h1>
              Find The Best Classes With <span>Best Teachers</span>
            </h1>
            <p className="sub">
              Welcome to our EduCore Learning Platform where knowledge meets
              curiosity! Explore engaging lessons, interactive materials, and
              expert guidance from our dedicated team of teachers. Learn,
              question, and grow through experiments, problem-solving, and
              real-world applications that make science and math come alive.
            </p>

            <div className="hero-cta">
              {/* If signup path differs, adjust the Link target */}
              <Link to="/" className="btn primary lg">
                <FaPlay /> Join Us
              </Link>
              <Link to="/support/form" className="btn outline lg">
                Support
              </Link>
            </div>

            <ul className="hero-points">
              <li>
                <FaUserGraduate /> Over 5000 students
              </li>
              <li>
                <FaLayerGroup /> Engage with 10 best teachers
              </li>
            </ul>
          </div>

          {/* Floating cards */}
          <div className="hero-media">
            <div className="hero-main-card">
              <img
                src="https://images.pexels.com/photos/1181352/pexels-photo-1181352.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Students learning together"
              />
            </div>

            <div className="float float-1">
              <div className="float-body">
                <span className="pill pink">3,000+ </span>
                <span>Free Courses</span>
              </div>
            </div>

            <div className="float float-2">
              <img
                className="avatar"
                src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
                alt="Tutor avatar"
              />
              <div>
                <div className="name">Ali Turan</div>
                <div className="muted">UI/UX Designer</div>
                <div className="stars" aria-label="5 star rating">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
              </div>
            </div>

            <div className="float float-3">
              <div className="congrats">
                Congrats!
                <br />
                Your admission completed
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <svg className="wave" viewBox="0 0 1440 150" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,64L60,80C120,96,240,128,360,138.7C480,149,600,139,720,128C840,117,960,107,1080,96C1200,85,1320,75,1380,69.3L1440,64L1440,160L1380,160C1320,160,1200,160,1080,160C960,160,840,160,720,160C600,160,480,160,360,160C240,160,120,160,60,160L0,160Z" />
        </svg>
      </section>

      {/* CATEGORIES */}
      <section className="categories" id="explore">
        <h2 className="section-title">Top Classes</h2>
        <p className="muted center">Advanced Level class streams.</p>

        <div className="cat-grid">
          {categories.map((c, i) => (
            <div className="cat-card" key={i}>
              <div className="circle" aria-hidden="true">{c.icon}</div>
              <div className="cat-title">{c.title}</div>
              <div className="cat-sub">{c.count} Courses</div>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR COURSES */}
      <section className="popular">
        <div className="popular-head">
          <div>
            <h2 className="section-title">Our Most Popular Courses</h2>
            <p className="muted">20,000+ unique online course list designs</p>
          </div>
          <div className="tabs">
            <button className="tab active" type="button">All Courses</button>
            <button className="tab" type="button">Science</button>
            <button className="tab" type="button">Commerce</button>
            <button className="tab" type="button">Technology</button>
            <button className="tab" type="button">Arts</button>
          </div>
        </div>

        <div className="course-grid">
          {courses.map((c, i) => (
            <article className="course-card" key={i}>
              <div className="media">
                {c.badge && (
                  <span className="badge" aria-label={`${c.badge} course`}>
                    <FaTag /> {c.badge}
                  </span>
                )}
                <img src={c.cover} alt={`${c.title} course cover`} />
              </div>
              <div className="body">
                <div className="rating">
                  <FaStar /> {c.rating.toFixed(1)}
                </div>
                <h3 className="title">{c.title}</h3>
                <p className="author">{c.author}</p>
                <div className="meta">
                  <span>
                    <FaLayerGroup /> {c.lessons} Lessons
                  </span>
                  <span>
                    <FaClock /> {c.days} Day
                  </span>
                  <span className="level">{c.level}</span>
                </div>
                <button className="btn ghost w-full" type="button">
                  View Course <FaChevronRight />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer" id="contact">
        <p>© {year} EduCore — Learn anything online.</p>
      </footer>
    </div>
  );
}
