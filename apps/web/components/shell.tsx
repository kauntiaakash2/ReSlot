"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  CalendarDays,
  LayoutDashboard,
  SlidersHorizontal,
  Users,
  DoorOpen,
  BookOpen,
  GraduationCap,
  History,
  ArrowUpRight,
  Command,
} from "lucide-react";
import type { ReactNode } from "react";
const items = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/schedule", "Timetable", CalendarDays],
  ["/history", "Version history", History],
  ["/setup", "Institution setup", Command],
  ["/teachers", "Faculty", Users],
  ["/rooms", "Rooms & labs", DoorOpen],
  ["/courses", "Courses", BookOpen],
  ["/cohorts", "Cohorts", GraduationCap],
  ["/constraints", "Constraints", SlidersHorizontal],
] as const;
export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          <span className="brand-icon">
            <Image
              src="/brand/reslot-symbol.png"
              alt=""
              width={30}
              height={30}
              priority
            />
          </span>
          ReSlot<span className="brand-dot">.</span>
        </Link>
        <p className="sidebar-caption">ACADEMIC OPERATIONS</p>
        <nav aria-label="Main navigation">
          {items.map(([href, label, Icon], i) => (
            <Link
              key={href}
              href={href}
              className={`${path.startsWith(href) ? "active" : ""} ${i === 3 ? "nav-divider" : ""}`}
            >
              <Icon size={18} />
              {label}
              {path.startsWith(href) && <span className="nav-active-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="avatar">RS</span>
          <div>
            <strong>Scheduling workspace</strong>
            <small>Minimum change. Maximum continuity.</small>
          </div>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <span>
            <span className="online-dot" /> ReSlot /{" "}
            <strong>Timetable recovery</strong>
          </span>
          <Link href="/setup">
            Workspace settings <ArrowUpRight size={14} />
          </Link>
        </header>
        <main id="main">{children}</main>
        <footer>
          ReSlot <span>Built for the unexpected.</span>
          <span>Constraint-driven scheduling</span>
        </footer>
      </div>
    </div>
  );
}
