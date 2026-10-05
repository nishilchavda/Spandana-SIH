"use client";

import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-[var(--border)] pt-20 pb-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-6 inline-flex">
              <Activity className="w-5 h-5 text-[var(--text-1)]" />
              <span className="text-lg font-black tracking-tight font-display text-[var(--text-1)]">
                FLEX<span className="text-[var(--accent-primary)]">CORE</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--text-2)] mb-8 max-w-sm leading-relaxed">
              The AI-powered fitness form-correction platform. Preventing injury before it happens with absolute precision.
            </p>
            
            <div className="mb-6">
              <span className="block text-xs font-bold text-[var(--text-1)] uppercase tracking-widest mb-3">
                Subscribe to updates
              </span>
              <div className="flex items-center relative max-w-sm">
                <input 
                  type="email" 
                  placeholder="athlete@example.com" 
                  className="w-full pl-4 pr-12 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--text-1)] transition-all font-body text-sm"
                />
                <button className="absolute right-2 p-1.5 bg-[var(--text-1)] text-white rounded-md hover:bg-black transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Spacer for layout */}
          <div className="hidden lg:block lg:col-span-2"></div>

          {/* Links Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xs font-bold text-[var(--text-1)] uppercase tracking-widest mb-6">Product</h3>
              <ul className="space-y-4">
                <li><Link href="/demo" className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">Live Demo</Link></li>
                <li><Link href="/dashboard" className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">Analytics</Link></li>
                <li><Link href="/about" className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">How it works</Link></li>
                <li><Link href="#" className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors flex items-center gap-2">Hardware <span className="text-[9px] font-bold bg-[var(--surface)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text-3)]">SOON</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs font-bold text-[var(--text-1)] uppercase tracking-widest mb-6">Company</h3>
              <ul className="space-y-4">
                <li><Link href="#" className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[var(--text-1)] uppercase tracking-widest mb-6">Legal</h3>
              <ul className="space-y-4">
                <li><Link href="#" className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-[var(--text-3)]">
            &copy; {currentYear} SPANDANA · Smart India Hackathon (PS26213). All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs font-semibold text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
              Twitter
            </Link>
            <Link href="#" className="text-xs font-semibold text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
              GitHub
            </Link>
            <Link href="#" className="text-xs font-semibold text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
