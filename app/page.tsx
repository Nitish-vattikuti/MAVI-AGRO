'use client';

import Image from 'next/image';
import Link from 'next/link';
import { User, ShieldCheck, ArrowRight, Leaf } from 'lucide-react';
import FibreArc from '@/components/ui/FibreArc';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-brand-accent/30">
      {/* Interactive WebGL Botanical Fibre Arc Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <FibreArc
          background="#0F2A22"
          baseColor="#15803D"
          accentColor="#34D399"
          highlight="#FDE047"
          density={26}
          speed={50}
          hover={180}
          reach={32}
          intensity={0.82}
          apex={[0.22, 0.38]}
          bundle={{
            curve: 35,
            spread: 110,
            thickness: 95,
            comb: 175
          }}
        />
      </div>

      {/* Subtle organic depth blend & soft ambient vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_40%,rgba(15,42,34,0.25)_75%,rgba(15,42,34,0.5)_100%)] pointer-events-none z-0"></div>

      {/* College Logo */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 transition-transform duration-300 hover:scale-105">
          <Image
            src="/mvgr-logo.png"
            alt="MVGR College of Engineering"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl px-6 grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Content */}
        <div className="text-left space-y-8 animate-in slide-in-from-left-4 duration-1000 pt-24 md:pt-32 lg:pt-0">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-panel text-brand-secondary/90 text-sm font-medium tracking-wide">
            <Leaf size={14} className="text-brand-accent" />
            <span>Future of Farm Management</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.9]">
              MAVI<span className="text-brand-primary animate-dot-fall">.</span>
            </h1>
            <div className="hidden md:block">
              <p className="text-lg md:text-xl lg:text-2xl text-brand-secondary/90 font-bold uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-100">
                Maharaja Agro Vegetable Inventory
              </p>
            </div>
            <p className="text-xl md:text-2xl text-white/60 font-medium max-w-lg leading-relaxed pt-2">
              Cultivating connections between <span className="text-white">fresh harvest</span> and <span className="text-white">smart dining</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/kiosk" className="group relative overflow-hidden px-8 py-4 rounded-full bg-brand-primary text-white font-bold text-lg hover:bg-brand-primary/90 transition-all shadow-glow hover:scale-105 active:scale-95 flex items-center justify-center space-x-2">
              <span className="relative z-10">Start Ordering</span>
              <ArrowRight className="relative z-10 transition-transform group-hover:translate-x-1" size={20} />
            </Link>
            <Link href="/admin/login" className="px-8 py-4 rounded-full glass-panel text-white font-bold text-lg hover:bg-white/10 transition-all hover:scale-105 active:scale-95 flex items-center justify-center">
              Admin Access
            </Link>
          </div>
        </div>

        {/* Right Content - Cards with Balanced Contrast */}
        <div className="relative grid gap-6 perspective-1000 animate-in slide-in-from-right-4 duration-1000 delay-200">
          {/* Subtle Soft Diffuser behind cards (lightened) */}
          <div className="absolute -inset-4 bg-[#091b15]/25 rounded-[2.5rem] blur-xl -z-10 pointer-events-none"></div>

          {/* Student Card */}
          <Link
            href="/kiosk"
            className="group relative bg-[#0C241D]/80 hover:bg-[#0E2C23]/90 backdrop-blur-xl rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-2 border border-white/15 hover:border-brand-primary/50 shadow-xl shadow-black/20 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-start justify-between relative z-10">
              <div className="p-4 bg-brand-primary text-white rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-brand-primary/30 border border-white/10">
                <User size={32} />
              </div>
              <div className="p-2.5 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                <ArrowRight size={20} className="text-white" />
              </div>
            </div>
            <div className="mt-8 relative z-10">
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight drop-shadow-md">Student & Guest</h3>
              <p className="text-white/85 font-medium text-sm leading-relaxed drop-shadow-xs">Experience farm-to-table freshness. Browse our daily harvest.</p>
            </div>
          </Link>

          {/* Admin Card */}
          <Link
            href="/admin/login"
            className="group relative bg-[#0C241D]/80 hover:bg-[#0E2C23]/90 backdrop-blur-xl rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-2 border border-white/15 hover:border-brand-accent/50 shadow-xl shadow-black/20 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-start justify-between relative z-10">
              <div className="p-4 bg-brand-accent/20 text-brand-accent rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-brand-accent/20 border border-brand-accent/20">
                <ShieldCheck size={32} />
              </div>
              <div className="p-2.5 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                <ArrowRight size={20} className="text-white" />
              </div>
            </div>
            <div className="mt-8 relative z-10">
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight drop-shadow-md">Management</h3>
              <p className="text-white/85 font-medium text-sm leading-relaxed drop-shadow-xs">Control inventory, track analytics, and manage the farm.</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
