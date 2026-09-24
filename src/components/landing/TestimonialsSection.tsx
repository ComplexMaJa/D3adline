"use client";

import * as React from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";
import { DriftWall } from "@/components/ui/DriftWall";

export function TestimonialsSection() {
  const { language } = useLanguage();
  const t = landingTranslations[language].testimonials;

  // Responsive column configuration
  const [responsiveConfig, setResponsiveConfig] = React.useState({
    columns: 4,
    tileWidth: 340,
    tileHeight: 210,
    gap: 18,
  });

  React.useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setResponsiveConfig({ columns: 2, tileWidth: 260, tileHeight: 185, gap: 12 });
      } else if (w < 1024) {
        setResponsiveConfig({ columns: 3, tileWidth: 300, tileHeight: 195, gap: 16 });
      } else {
        setResponsiveConfig({ columns: 4, tileWidth: 340, tileHeight: 210, gap: 18 });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const reviews = React.useMemo(() => [
    {
      id: "rev-1",
      quote: t.quotes.quote1,
      author: t.quotes.author1,
      role: t.quotes.role1,
      university: "Stanford University",
      rating: 5,
      initials: "AR",
      gradient: "from-purple-600 to-indigo-600",
      tag: language === "id" ? "Mahasiswa Terverifikasi" : "Verified Student",
    },
    {
      id: "rev-2",
      quote: t.quotes.quote2,
      author: t.quotes.author2,
      role: t.quotes.role2,
      university: "MIT",
      rating: 5,
      initials: "ML",
      gradient: "from-emerald-600 to-teal-600",
      tag: language === "id" ? "Mahasiswa Terverifikasi" : "Verified Student",
    },
    {
      id: "rev-3",
      quote: t.quotes.quote3,
      author: t.quotes.author3,
      role: t.quotes.role3,
      university: "UC Berkeley",
      rating: 5,
      initials: "RH",
      gradient: "from-indigo-600 to-blue-600",
      tag: language === "id" ? "Dosen Terverifikasi" : "Verified Instructor",
    },
    {
      id: "rev-4",
      quote: language === "id"
        ? "Mode AMOLED gelap dengan aksen ungu kontras tinggi membuat belajar larut malam untuk persiapan ujian tidak melelahkan mata sama sekali."
        : "The high-contrast dark theme makes late-night problem set marathons completely strain-free. Best academic tool I've used in 4 years.",
      author: "Sarah Chen",
      role: language === "id" ? "Jurusan Ilmu Komputer, Harvard" : "Computer Science, Harvard",
      university: "Harvard University",
      rating: 5,
      initials: "SC",
      gradient: "from-fuchsia-600 to-purple-600",
      tag: language === "id" ? "Mahasiswa Terverifikasi" : "Verified Student",
    },
    {
      id: "rev-5",
      quote: language === "id"
        ? "Memecah milestone proyek teknik berskala besar menjadi subtugas interaktif mengembalikan akhir pekan saya yang tenang. Sangat memotivasi!"
        : "Having subtask checklists synchronized with real-time countdown alerts keeps our entire engineering lab group accountable and aligned.",
      author: "Marcus Vance",
      role: language === "id" ? "Teknik Mesin & Robotika, ETH Zürich" : "Robotics & Mechatronics, ETH Zürich",
      university: "ETH Zürich",
      rating: 5,
      initials: "MV",
      gradient: "from-cyan-600 to-blue-600",
      tag: language === "id" ? "Asisten Peneliti" : "Research Assistant",
    },
    {
      id: "rev-6",
      quote: language === "id"
        ? "Fitur kode gabung 6-digit dan pelacakan tenggatnya sangat membantu kami di ITB selama pekan UTS dan UAS yang padat."
        : "The 6-digit course code sync and urgency countdowns have completely transformed study group collaboration before midterms.",
      author: "Jessica Pratama",
      role: language === "id" ? "Teknik Informatika, ITB" : "Informatics, ITB",
      university: "Institut Teknologi Bandung",
      rating: 5,
      initials: "JP",
      gradient: "from-amber-600 to-orange-600",
      tag: language === "id" ? "Mahasiswa Terverifikasi" : "Verified Student",
    },
    {
      id: "rev-7",
      quote: language === "id"
        ? "Antarmuka paling bersih dan responsif. Tanpa bloatware, hanya efisiensi alur kerja akademik murni dengan pintasan keyboard instan."
        : "Cleanest UI on the web. No bloated feature creep, just pure academic workflow efficiency with instant keyboard shortcuts.",
      author: "Liam O'Connor",
      role: language === "id" ? "Teknik Perangkat Lunak, Cambridge" : "Software Engineering, Cambridge",
      university: "University of Cambridge",
      rating: 5,
      initials: "LO",
      gradient: "from-violet-600 to-purple-600",
      tag: language === "id" ? "Mahasiswa Terverifikasi" : "Verified Student",
    },
    {
      id: "rev-8",
      quote: language === "id"
        ? "Peringatan tenggat waktu cerdas dan status urgensi visual memastikan saya tidak pernah terlambat mengumpulkan tugas semester ini."
        : "The countdown alerts and visual urgency states made sure I never turned in an assignment late this entire semester.",
      author: "Chloe Tanaka",
      role: language === "id" ? "Sains Data & AI, NUS" : "Data Science & AI, NUS",
      university: "NUS Singapore",
      rating: 5,
      initials: "CT",
      gradient: "from-pink-600 to-rose-600",
      tag: language === "id" ? "Mahasiswa Terverifikasi" : "Verified Student",
    },
    {
      id: "rev-9",
      quote: language === "id"
        ? "Dari lembar soal kuliah harian hingga tenggat makalah akhir, semua terpusat rapi dalam satu dashboard berkecepatan tinggi."
        : "From lecture problem sets to term paper deadlines, everything lives in one unified high-contrast command dashboard.",
      author: "Elena Rostova",
      role: language === "id" ? "Matematika Terapan, Oxford" : "Applied Mathematics, Oxford",
      university: "University of Oxford",
      rating: 5,
      initials: "ER",
      gradient: "from-blue-600 to-indigo-600",
      tag: language === "id" ? "Mahasiswa Terverifikasi" : "Verified Student",
    },
  ], [t, language]);

  const renderReviewTile = React.useCallback((item: typeof reviews[0]) => {
    return (
      <div className="w-full h-full flex flex-col justify-between p-5 sm:p-6 bg-[#080710]/95 backdrop-blur-xl rounded-[inherit] select-none text-left">
        <div>
          {/* Top Bar: Stars + Verified Badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(item.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0"
                />
              ))}
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-mono text-purple-300 shrink-0">
              <CheckCircle2 className="h-3 w-3 text-purple-400" />
              <span>{item.tag}</span>
            </div>
          </div>

          {/* Quote */}
          <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-sans line-clamp-4">
            &ldquo;{item.quote}&rdquo;
          </p>
        </div>

        {/* Author Footer */}
        <div className="flex items-center gap-3 pt-3.5 border-t border-white/[0.06] mt-3">
          <div
            className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs text-white bg-gradient-to-br ${item.gradient} shadow-sm shrink-0`}
          >
            {item.initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-display font-bold text-white tracking-tight truncate">
              {item.author}
            </span>
            <span className="text-[11px] text-zinc-400 truncate">
              {item.role}
            </span>
          </div>
        </div>
      </div>
    );
  }, []);

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full pointer-events-none blur-[140px] opacity-25"
        style={{
          background: "radial-gradient(ellipse at center, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.12) 50%, transparent 75%)",
        }}
      />

      {/* Header — left-aligned */}
      <div className="max-w-2xl mb-10 sm:mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono font-semibold uppercase tracking-widest mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>{t.sectionBadge}</span>
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white mb-4 leading-[1.1]">
          {t.sectionTitle}
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          {t.sectionSubtitle}
        </p>
      </div>

      {/* 3D Perspective Drift Wall Container */}
      <div className="relative w-full h-[540px] sm:h-[620px] lg:h-[680px] rounded-3xl overflow-hidden border border-white/[0.06] bg-[#05030A]/60 backdrop-blur-xl shadow-2xl">
        <DriftWall
          items={reviews}
          renderItem={renderReviewTile}
          columns={responsiveConfig.columns}
          tileWidth={responsiveConfig.tileWidth}
          tileHeight={responsiveConfig.tileHeight}
          gap={responsiveConfig.gap}
          radius={18}
          tilt={14}
          turn={-12}
          roll={0}
          depth={90}
          perspective={1350}
          speed={24}
          direction="up"
          variance={0.4}
          parallax={0.5}
          pauseOnHover={true}
          lift={44}
          fade={0.55}
          dim={0.82}
          overlayColor="rgba(5, 3, 10, 0.4)"
          className="w-full h-full"
        />

        {/* Soft edge vertical fade gradients */}
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[#05030A] to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#05030A] via-[#05030A]/70 to-transparent pointer-events-none z-10" />
      </div>

      {/* Bottom Interactive Guide Pill */}
      <div className="flex items-center justify-center gap-2 mt-6 text-xs text-zinc-500 font-mono">
        <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
        <span>
          {language === "id"
            ? "Arahkan kursor pada ulasan untuk menghentikan animasi & membaca detail"
            : "Hover over any review card to pause animation & inspect"}
        </span>
      </div>
    </section>
  );
}

