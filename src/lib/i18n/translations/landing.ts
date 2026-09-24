export interface LandingTranslations {
  navbar: {
    features: string;
    preview: string;
    howItWorks: string;
    pricing: string;
    faq: string;
    signIn: string;
    getStarted: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleHighlight: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    teaserTag: string;
    teaserTitle: string;
    teaserCourse: string;
    teaserDueTomorrow: string;
    teaserOverdue: string;
    teaserProgress: string;
  };
  trustBar: {
    deadlinesTracked: string;
    deadlinesLabel: string;
    activeUsers: string;
    usersLabel: string;
    completionRate: string;
    completionLabel: string;
    rating: string;
    ratingLabel: string;
  };
  features: {
    sectionBadge: string;
    sectionTitle: string;
    sectionSubtitle: string;
    cards: {
      courses: {
        title: string;
        desc: string;
        tag: string;
      };
      deadlines: {
        title: string;
        desc: string;
        tag: string;
      };
      calendarFiles: {
        title: string;
        desc: string;
        tag: string;
      };
      analytics: {
        title: string;
        desc: string;
        tag: string;
      };
      notifications: {
        title: string;
        desc: string;
        tag: string;
      };
      sync: {
        title: string;
        desc: string;
        tag: string;
      };
    };
  };
  preview: {
    sectionBadge: string;
    sectionTitle: string;
    sectionSubtitle: string;
    tabs: {
      dashboard: string;
      calendar: string;
      courses: string;
    };
    dashboardMockup: {
      headerGreeting: string;
      headerSub: string;
      statTotal: string;
      statCompleted: string;
      statOverdue: string;
      statDueWeek: string;
      focusTitle: string;
      focusItem: string;
      dueBadge: string;
      workloadTitle: string;
      workloadStatus: string;
    };
    calendarMockup: {
      monthLabel: string;
      weekLabel: string;
      assignmentTag: string;
      task1: string;
      task2: string;
      task3: string;
    };
    coursesMockup: {
      joinCodeLabel: string;
      activeStudents: string;
      course1Title: string;
      course1Code: string;
      course2Title: string;
      course2Code: string;
      progressLabel: string;
      submissionsLabel: string;
    };
  };
  howItWorks: {
    sectionBadge: string;
    sectionTitle: string;
    sectionSubtitle: string;
    steps: {
      step1Number: string;
      step1Title: string;
      step1Desc: string;
      step2Number: string;
      step2Title: string;
      step2Desc: string;
      step3Number: string;
      step3Title: string;
      step3Desc: string;
    };
  };
  pricing: {
    sectionBadge: string;
    sectionTitle: string;
    sectionSubtitle: string;
    billingMonthly: string;
    billingAnnual: string;
    annualDiscount: string;
    freeTier: {
      name: string;
      price: string;
      period: string;
      desc: string;
      cta: string;
      features: string[];
    };
    premiumTier: {
      name: string;
      popularBadge: string;
      priceMonthly: string;
      priceAnnual: string;
      periodMonthly: string;
      periodAnnual: string;
      desc: string;
      cta: string;
      features: string[];
    };
  };
  testimonials: {
    sectionBadge: string;
    sectionTitle: string;
    sectionSubtitle: string;
    quotes: {
      quote1: string;
      author1: string;
      role1: string;
      quote2: string;
      author2: string;
      role2: string;
      quote3: string;
      author3: string;
      role3: string;
    };
  };
  faq: {
    sectionBadge: string;
    sectionTitle: string;
    sectionSubtitle: string;
    items: {
      q: string;
      a: string;
    }[];
  };
  cta: {
    badge: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    noCardNeeded: string;
  };
  footer: {
    tagline: string;
    navigationHeader: string;
    resourcesHeader: string;
    legalHeader: string;
    privacy: string;
    terms: string;
    status: string;
    rights: string;
    language: string;
  };
}

export const landingTranslations: Record<'en' | 'id', LandingTranslations> = {
  en: {
    navbar: {
      features: "Features",
      preview: "Preview",
      howItWorks: "How It Works",
      pricing: "Pricing",
      faq: "FAQ",
      signIn: "Sign In",
      getStarted: "Get Started Free",
    },
    hero: {
      badge: "Academic Workload & Deadline Hub",
      titleLine1: "Never miss an assignment",
      titleHighlight: "deadline again.",
      subtitle:
        "Deadline organizes your university courses, problem sets, exams, and projects into a high-contrast AMOLED dashboard with intelligent deadline alerts.",
      primaryCta: "Start Managing Deadlines",
      secondaryCta: "Sign In to Account",
      teaserTag: "Live Workspace Teaser",
      teaserTitle: "Distributed Systems Raft Consensus",
      teaserCourse: "CS-405 · Distributed Systems",
      teaserDueTomorrow: "Due tomorrow · 11:59 PM",
      teaserOverdue: "Overdue · 1 day ago",
      teaserProgress: "75% Completed (3 of 4 Subtasks)",
    },
    trustBar: {
      deadlinesTracked: "10,000+",
      deadlinesLabel: "Deadlines tracked on schedule",
      activeUsers: "500+",
      usersLabel: "Students & university instructors",
      completionRate: "99.4%",
      completionLabel: "On-time deliverable rate",
      rating: "4.9 / 5.0",
      ratingLabel: "Student community satisfaction",
    },
    features: {
      sectionBadge: "Core Architecture",
      sectionTitle: "Built strictly for academic excellence",
      sectionSubtitle:
        "Designed to remove friction from coursework tracking, problem sets, and submission milestones with maximum clarity.",
      cards: {
        courses: {
          title: "Courses & Subjects Hub",
          desc: "Group assignments by university subject with customizable accent colors, instructor linkages, and real-time completion percentages.",
          tag: "Structure",
        },
        deadlines: {
          title: "Intelligent Deadlines",
          desc: "Dynamic urgency badges, countdown alerts, and overdue tracking ensure high-priority coursework is never pushed aside.",
          tag: "Smart Alerts",
        },
        calendarFiles: {
          title: "Interactive Calendar & Files",
          desc: "Monthly and weekly deadline schedules with interactive subtask checklists and direct file deliverable uploads via Supabase.",
          tag: "Cloud Storage",
        },
        analytics: {
          title: "Progress Analytics",
          desc: "Deep insights into your completion trajectory, upcoming weekly workloads, and pacing metrics to prevent late-night cramming.",
          tag: "Performance",
        },
        notifications: {
          title: "Smart Notifications",
          desc: "Timely alerts for approaching milestone checkpoints, urgent problem sets, and instructor grades as soon as they are published.",
          tag: "Reminders",
        },
        sync: {
          title: "Cross-Device Sync",
          desc: "Instant real-time cloud synchronization between mobile and desktop with offline resilience and lightning-fast load times.",
          tag: "Anywhere",
        },
      },
    },
    preview: {
      sectionBadge: "Product Showcase",
      sectionTitle: "Experience the AMOLED Command Center",
      sectionSubtitle:
        "Switch between the core views of Deadline to see how coursework stays organized, trackable, and stress-free.",
      tabs: {
        dashboard: "Dashboard Command Center",
        calendar: "Interactive Calendar",
        courses: "Courses & Submissions",
      },
      dashboardMockup: {
        headerGreeting: "Welcome back, Alex",
        headerSub: "You have 3 assignments due this week. Stay focused!",
        statTotal: "Total Tasks",
        statCompleted: "Completed",
        statOverdue: "Overdue",
        statDueWeek: "Due This Week",
        focusTitle: "Today's Academic Focus",
        focusItem: "Red-Black Tree Balancing Rotations",
        dueBadge: "Due today · 11:59 PM",
        workloadTitle: "Weekly Workload Intensity",
        workloadStatus: "Optimal Pacing",
      },
      calendarMockup: {
        monthLabel: "October 2026",
        weekLabel: "Mon — Sun Schedule",
        assignmentTag: "Exam Milestone",
        task1: "CS-301 Algorithm Problem Set",
        task2: "MATH-202 Linear Algebra Quiz",
        task3: "SE-201 Architecture Report",
      },
      coursesMockup: {
        joinCodeLabel: "Course Join Code",
        activeStudents: "Enrolled Students",
        course1Title: "Data Structures & Algorithms",
        course1Code: "CS-301",
        course2Title: "Distributed Systems",
        course2Code: "CS-405",
        progressLabel: "Class Completion",
        submissionsLabel: "Verified Deliverables",
      },
    },
    howItWorks: {
      sectionBadge: "Simple Workflow",
      sectionTitle: "Master your semester in 3 easy steps",
      sectionSubtitle:
        "From syllabus distribution to final exams, stay in total control of your academic schedule without friction.",
      steps: {
        step1Number: "01",
        step1Title: "Add your courses & subjects",
        step1Desc:
          "Create your semester classes with custom neon accents or join an instructor's course instantly using a 6-character code.",
        step2Number: "02",
        step2Title: "Set deadlines & break down subtasks",
        step2Desc:
          "Log assignments, exams, and labs with exact due dates and step-by-step checklists so big projects become manageable bites.",
        step3Number: "03",
        step3Title: "Get reminded & turn in real work",
        step3Desc:
          "Rely on dynamic urgency countdowns, upload verified deliverables, and celebrate completed milestones with confetti.",
      },
    },
    pricing: {
      sectionBadge: "Clear & Transparent",
      sectionTitle: "Invest in your academic success",
      sectionSubtitle: "Start completely free. Upgrade when you need unlimited power, AI scheduling, and extra storage.",
      billingMonthly: "Monthly",
      billingAnnual: "Annually",
      annualDiscount: "Save 25%",
      freeTier: {
        name: "Student Free",
        price: "$0",
        period: "Free forever",
        desc: "Essential deadline tracking for individual university students.",
        cta: "Get Started Free",
        features: [
          "Up to 5 active courses",
          "Core intelligent deadline timers",
          "Interactive monthly & weekly calendar",
          "Subtask progress breakdown",
          "Standard file attachments (5MB per file)",
          "Community support",
        ],
      },
      premiumTier: {
        name: "Student Premium",
        popularBadge: "Most Popular",
        priceMonthly: "$4",
        priceAnnual: "$3",
        periodMonthly: "per month, billed monthly",
        periodAnnual: "per month, billed annually ($36/yr)",
        desc: "Advanced workload power, AI pacing suggestions, and unlimited storage.",
        cta: "Upgrade to Premium",
        features: [
          "Unlimited courses & archived classes",
          "AI-suggested study schedules & pacing",
          "Priority reminder push & email notifications",
          "Advanced completion & workload analytics",
          "Increased file storage (100MB per file)",
          "External Google Calendar & iCal sync export",
          "Early access to beta study hub tools",
        ],
      },
    },
    testimonials: {
      sectionBadge: "Student Stories",
      sectionTitle: "Loved by students and instructors alike",
      sectionSubtitle: "See how Deadline transformed study routines across leading universities.",
      quotes: {
        quote1:
          "Deadline completely eliminated my finals week panic. The urgency badges make daily prioritization effortless, and the AMOLED theme is so easy on the eyes.",
        author1: "Alex Rivera",
        role1: "Computer Science Major, Stanford",
        quote2:
          "Breaking down massive engineering project milestones into tracked subtasks gave me back my weekends. The confetti celebration is strangely motivating!",
        author2: "Maya Lin",
        role2: "Biomedical Engineering, MIT",
        quote3:
          "Distributing a 6-digit join code to my students and reviewing verified file deliverables with integrated grading has saved me hours of admin overhead each week.",
        author3: "Prof. Robert Hoffman",
        role3: "Computer Systems Instructor",
      },
    },
    faq: {
      sectionBadge: "Got Questions?",
      sectionTitle: "Frequently Asked Questions",
      sectionSubtitle: "Everything you need to know about Deadline, account roles, and coursework tracking.",
      items: [
        {
          q: "Is Deadline really free to use for students?",
          a: "Yes! Our Student Free plan is completely free forever. You can track up to 5 courses, set unlimited assignment deadlines, use interactive subtask checklists, and access the calendar without paying a cent.",
        },
        {
          q: "How do course join codes work?",
          a: "Instructors or study group leaders can generate a secure 6-character code (e.g. CS301A). Students simply enter this code under 'Join Class with Code' to instantly enroll and synchronize all assignments.",
        },
        {
          q: "Can university instructors use Deadline for grading?",
          a: "Yes. Teacher and Instructor accounts have access to a dedicated Submissions & Grading console, allowing them to review student deliverables, assign numeric grades, and leave feedback securely.",
        },
        {
          q: "What counts as a valid assignment submission?",
          a: "To ensure real academic deliverables, student submissions require either a written response text or at least one uploaded document file before the system allows turning in the assignment.",
        },
        {
          q: "Does Deadline work across mobile, tablet, and desktop?",
          a: "Yes. Deadline is fully responsive and optimized for mobile screens, tablets, and desktop displays. Your data syncs in real-time across all your devices via our secure Supabase cloud backend.",
        },
        {
          q: "Can I export my deadlines to Google Calendar or Apple Calendar?",
          a: "Yes! Premium tier members can export their deadlines directly into standard iCal and Google Calendar feeds for seamless integration with personal scheduling apps.",
        },
      ],
    },
    cta: {
      badge: "Get Organized Today",
      title: "Ready to conquer your academic deadlines?",
      subtitle:
        "Join hundreds of students staying ahead of exams, problem sets, and coursework with zero stress.",
      primaryCta: "Start Managing Deadlines",
      secondaryCta: "Sign In to Account",
      noCardNeeded: "No credit card required · Free account in under 60 seconds",
    },
    footer: {
      tagline: "The high-contrast AMOLED academic workload & deadline command center.",
      navigationHeader: "Platform",
      resourcesHeader: "Resources",
      legalHeader: "Legal & Trust",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      status: "System Status",
      rights: "All rights reserved. Built for student academic excellence.",
      language: "Language",
    },
  },
  id: {
    navbar: {
      features: "Fitur",
      preview: "Pratinjau",
      howItWorks: "Cara Kerja",
      pricing: "Harga",
      faq: "Tanya Jawab",
      signIn: "Masuk",
      getStarted: "Mulai Gratis",
    },
    hero: {
      badge: "Pusat Beban Akademik & Tenggat Waktu",
      titleLine1: "Jangan pernah melewatkan",
      titleHighlight: "tenggat tugas lagi.",
      subtitle:
        "Deadline merapikan mata kuliah, soal latihan, ujian, dan proyek ke dalam dasbor AMOLED kontras tinggi dengan peringatan tenggat waktu cerdas.",
      primaryCta: "Mulai Kelola Tenggat",
      secondaryCta: "Masuk ke Akun",
      teaserTag: "Cuplikan Ruang Kerja Langsung",
      teaserTitle: "Konsensus Raft Sistem Terdistribusi",
      teaserCourse: "CS-405 · Sistem Terdistribusi",
      teaserDueTomorrow: "Jatuh tempo besok · 23:59",
      teaserOverdue: "Terlambat · 1 hari lalu",
      teaserProgress: "75% Selesai (3 dari 4 Subtugas)",
    },
    trustBar: {
      deadlinesTracked: "10.000+",
      deadlinesLabel: "Tenggat terselesaikan tepat waktu",
      activeUsers: "500+",
      usersLabel: "Mahasiswa & dosen universitas",
      completionRate: "99,4%",
      completionLabel: "Tingkat pengumpulan tepat waktu",
      rating: "4,9 / 5,0",
      ratingLabel: "Kepuasan komunitas mahasiswa",
    },
    features: {
      sectionBadge: "Arsitektur Utama",
      sectionTitle: "Dibangun khusus untuk keunggulan akademik",
      sectionSubtitle:
        "Dirancang untuk melenyapkan kerumitan pencatatan tugas kuliah, problem set, dan capaian proyek dengan kejelasan optimal.",
      cards: {
        courses: {
          title: "Pusat Mata Kuliah",
          desc: "Kelompokkan tugas berdasarkan mata kuliah dengan aksen warna kustom, nama dosen pengampu, dan persentase penyelesaian seketika.",
          tag: "Struktur",
        },
        deadlines: {
          title: "Tenggat Cerdas",
          desc: "Lencana urgensi dinamis, hitung mundur langsung, dan pelacakan keterlambatan agar prioritas tugas penting tidak pernah terabaikan.",
          tag: "Peringatan",
        },
        calendarFiles: {
          title: "Kalender & Berkas Interaktif",
          desc: "Jadwal tenggat bulanan dan mingguan dengan daftar periksa subtugas interaktif serta unggahan berkas tugas terintegrasi Supabase.",
          tag: "Berkas Cloud",
        },
        analytics: {
          title: "Analisis Progres",
          desc: "Wawasan mendalam terhadap kecepatan penyelesaian tugas, sebaran beban kerja mingguan, dan ritme belajar untuk mencegah begadang.",
          tag: "Performa",
        },
        notifications: {
          title: "Notifikasi Cerdas",
          desc: "Peringatan tepat waktu saat mendekati tenggat, pemberitahuan tugas mendesak, dan nilai dari dosen saat baru dipublikasikan.",
          tag: "Pengingat",
        },
        sync: {
          title: "Sinkronisasi Lintas Perangkat",
          desc: "Sinkronisasi cloud seketika antara ponsel dan komputer dengan ketahanan luring dan kecepatan akses sangat gegas.",
          tag: "Di Mana Saja",
        },
      },
    },
    preview: {
      sectionBadge: "Pameran Produk",
      sectionTitle: "Rasakan Pusat Kendali AMOLED",
      sectionSubtitle:
        "Beralih antara tampilan utama Deadline untuk melihat bagaimana tugas kuliah tetap teratur, terukur, dan bebas stres.",
      tabs: {
        dashboard: "Dasbor Pusat Kendali",
        calendar: "Kalender Interaktif",
        courses: "Kelas & Pengumpulan",
      },
      dashboardMockup: {
        headerGreeting: "Selamat datang kembali, Alex",
        headerSub: "Kamu memiliki 3 tugas yang jatuh tempo minggu ini. Tetap fokus!",
        statTotal: "Total Tugas",
        statCompleted: "Selesai",
        statOverdue: "Terlambat",
        statDueWeek: "Tenggat Minggu Ini",
        focusTitle: "Fokus Akademik Hari Ini",
        focusItem: "Rotasi Penyeimbangan Red-Black Tree",
        dueBadge: "Jatuh tempo besok · 23:59",
        workloadTitle: "Intensitas Beban Kerja Mingguan",
        workloadStatus: "Ritme Optimal",
      },
      calendarMockup: {
        monthLabel: "Oktober 2026",
        weekLabel: "Jadwal Sen — Min",
        assignmentTag: "Jadwal Ujian",
        task1: "Problem Set Algoritma CS-301",
        task2: "Kuis Aljabar Linier MATH-202",
        task3: "Laporan Arsitektur SE-201",
      },
      coursesMockup: {
        joinCodeLabel: "Kode Gabung Kelas",
        activeStudents: "Mahasiswa Terdaftar",
        course1Title: "Struktur Data & Algoritma",
        course1Code: "CS-301",
        course2Title: "Sistem Terdistribusi",
        course2Code: "CS-405",
        progressLabel: "Penyelesaian Kelas",
        submissionsLabel: "Keluaran Terverifikasi",
      },
    },
    howItWorks: {
      sectionBadge: "Alur Sederhana",
      sectionTitle: "Kuasai semestermu dalam 3 langkah mudah",
      sectionSubtitle:
        "Dari silabus awal kuliah hingga ujian akhir, kendalikan jadwal perkuliahanmu dengan percaya diri tanpa repot.",
      steps: {
        step1Number: "01",
        step1Title: "Tambahkan kelas & mata kuliah",
        step1Desc:
          "Buat kelas perkuliahan dengan aksen neon pilihan atau langsung bergabung ke kelas dosen menggunakan kode 6 karakter.",
        step2Number: "02",
        step2Title: "Atur tenggat & rincian subtugas",
        step2Desc:
          "Catat tugas, kuis, dan praktikum dengan tanggal jatuh tempo serta daftar cek per langkah agar proyek besar terasa ringan.",
        step3Number: "03",
        step3Title: "Dapatkan pengingat & kumpulkan tugas nyata",
        step3Desc:
          "Pantau hitung mundur urgensi, unggah berkas tugas yang valid, dan rayakan pencapaian tugas selesai dengan pesta konfeti.",
      },
    },
    pricing: {
      sectionBadge: "Jelas & Transparan",
      sectionTitle: "Investasikan untuk kesuksesan akademikmu",
      sectionSubtitle: "Mulai sepenuhnya gratis. Tingkatkan kapan pun membutuhkan fitur AI, kelas tanpa batas, dan kapasitas penyimpanan ekstra.",
      billingMonthly: "Bulanan",
      billingAnnual: "Tahunan",
      annualDiscount: "Hemat 25%",
      freeTier: {
        name: "Student Free",
        price: "Rp 0",
        period: "Gratis selamanya",
        desc: "Manajemen tenggat penting untuk kebutuhan mahasiswa secara mandiri.",
        cta: "Mulai Gratis",
        features: [
          "Hingga 5 mata kuliah aktif",
          "Penghitung waktu tenggat cerdas utama",
          "Kalender interaktif bulanan & mingguan",
          "Pembagian progres dengan subtugas",
          "Unggahan berkas tugas standar (5MB per berkas)",
          "Dukungan komunitas",
        ],
      },
      premiumTier: {
        name: "Student Premium",
        popularBadge: "Paling Populer",
        priceMonthly: "Rp 45.000",
        priceAnnual: "Rp 35.000",
        periodMonthly: "per bulan, ditagih bulanan",
        periodAnnual: "per bulan, ditagih tahunan (Rp 420.000/th)",
        desc: "Kekuatan manajemen beban kerja tingkat lanjut, saran ritme AI, dan penyimpanan ekstra.",
        cta: "Tingkatkan ke Premium",
        features: [
          "Mata kuliah & arsip kelas tanpa batas",
          "Saran jadwal belajar cerdas bertenaga AI",
          "Notifikasi push & email prioritas",
          "Analisis penyelesaian & ritme belajar mendalam",
          "Penyimpanan berkas lebih besar (100MB per berkas)",
          "Ekspor sinkronisasi ke Google Calendar & iCal",
          "Akses awal ke alat belajar beta terbaru",
        ],
      },
    },
    testimonials: {
      sectionBadge: "Cerita Mahasiswa",
      sectionTitle: "Dipercaya oleh mahasiswa dan dosen pengampu",
      sectionSubtitle: "Kisah nyata bagaimana Deadline meningkatkan kebiasaan belajar di berbagai perguruan tinggi.",
      quotes: {
        quote1:
          "Deadline benar-benar menghilangkan kepanikan minggu ujian akhir saya. Lencana urgensinya membuat urutan prioritas harian sangat jelas, dan tema AMOLED-nya sangat ramah di mata saat begadang.",
        author1: "Alex Rivera",
        role1: "Mahasiswa Ilmu Komputer, Stanford",
        quote2:
          "Membagi tugas besar praktikum menjadi subtugas terukur mengembalikan waktu akhir pekan saya. Efek pesta konfetinya anehnya memberi motivasi luar biasa!",
        author2: "Maya Lin",
        role2: "Teknik Biomedis, MIT",
        quote3:
          "Membagikan kode gabung 6 digit kepada mahasiswa dan memeriksa berkas tugas terverifikasi langsung dengan penilaian terintegrasi menghemat jam kerja saya setiap minggu.",
        author3: "Prof. Robert Hoffman",
        role3: "Dosen Sistem Komputer",
      },
    },
    faq: {
      sectionBadge: "Pertanyaan Populer",
      sectionTitle: "Pertanyaan yang Sering Diajukan",
      sectionSubtitle: "Segala hal yang perlu kamu ketahui tentang Deadline, peran akun, dan pelacakan tugas perkuliahan.",
      items: [
        {
          q: "Apakah Deadline benar-benar gratis untuk mahasiswa?",
          a: "Ya! Paket Student Free gratis selamanya. Anda dapat melacak hingga 5 mata kuliah, membuat tenggat tugas tanpa batas, menggunakan daftar periksa subtugas interaktif, dan mengakses kalender tanpa biaya apa pun.",
        },
        {
          q: "Bagaimana cara kerja kode gabung kelas?",
          a: "Dosen atau ketua kelompok studi dapat membuat kode 6 karakter yang aman (contoh: CS301A). Mahasiswa cukup memasukkan kode ini pada menu 'Gabung Kelas dengan Kode' untuk langsung terdaftar dan menyelaraskan seluruh tugas.",
        },
        {
          q: "Dapatkah dosen menggunakan Deadline untuk menilai tugas?",
          a: "Ya. Akun Dosen memiliki akses ke konsol Pengumpulan & Nilai khusus untuk memeriksa berkas kiriman mahasiswa, memberikan nilai angka, serta menuliskan catatan umpan balik secara aman.",
        },
        {
          q: "Apa yang dimaksud dengan pengumpulan tugas yang valid?",
          a: "Untuk menjamin keaslian pengerjaan tugas akademik, pengumpulan tugas mewajibkan adanya teks jawaban tertulis atau setidaknya satu berkas dokumen terlampir sebelum sistem memperbolehkan status tugas dikumpulkan.",
        },
        {
          q: "Apakah Deadline dapat digunakan di ponsel, tablet, dan laptop?",
          a: "Ya. Deadline sepenuhnya responsif dan dirancang optimal untuk layar ponsel, tablet, maupun monitor desktop. Seluruh data tersinkronisasi langsung melalui cloud Supabase yang aman.",
        },
        {
          q: "Dapatkah saya mengekspor tenggat ke Google Calendar atau Apple Calendar?",
          a: "Tentu! Pengguna paket Premium dapat mengekspor jadwal tenggat langsung ke umpan iCal dan Google Calendar agar sinkron dengan aplikasi kalender pribadi Anda.",
        },
      ],
    },
    cta: {
      badge: "Mulai Lebih Teratur",
      title: "Siap taklukkan setiap tenggat kuliahmu?",
      subtitle:
        "Bergabunglah dengan ratusan mahasiswa yang selalu selangkah lebih maju menyelesaikan ujian, tugas latihan, dan proyek tanpa stres.",
      primaryCta: "Mulai Kelola Tenggat",
      secondaryCta: "Masuk ke Akun",
      noCardNeeded: "Tanpa kartu kredit · Akun gratis siap dalam waktu kurang dari 60 detik",
    },
    footer: {
      tagline: "Pusat kendali beban akademik dan tenggat waktu dengan kontras tinggi AMOLED.",
      navigationHeader: "Platform",
      resourcesHeader: "Sumber Daya",
      legalHeader: "Hukum & Privasi",
      privacy: "Kebijakan Privasi",
      terms: "Ketentuan Layanan",
      status: "Status Sistem",
      rights: "Hak cipta dilindungi undang-undang. Dirancang untuk keunggulan akademik.",
      language: "Bahasa",
    },
  },
};
