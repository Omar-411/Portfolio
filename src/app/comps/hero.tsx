"use client"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import LoadingButton from "./loading-button"
import LoadingScreen from "./loading-screen"
import { ModeToggle } from "./mode-toogle"

const DotIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="4" cy="4" r="4" fill="currentColor" />
  </svg>
)

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navItems = [
    { name: "About", href: "home" },
    { name: "Projects", href: "projects" },
    { name: "Skills", href: "skills" },
    { name: "Contact", href: "contact" },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const navHeight = 80 // Account for navbar height
      const elementPosition = element.offsetTop - navHeight

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      })
      setIsMenuOpen(false)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-3">
      <div className="container mx-auto max-w-5xl">
        <div
          className="flex items-center justify-between rounded-2xl px-4 sm:px-5 py-2.5
            bg-gray-950/70 dark:bg-gray-950/70 backdrop-blur-md
            border border-white/10
            shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.4)]"
        >
          {/* Logo */}
          <button
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow duration-300">
             <img src="/avatar.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="hidden sm:block text-white font-semibold text-sm tracking-wide">
              Omar<span className="text-purple-400"> Ajimi</span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-xl px-1.5 py-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="px-4 py-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ModeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 rounded-2xl overflow-hidden bg-gray-950/90 backdrop-blur-md border border-white/10 shadow-xl">
            <div className="flex flex-col p-2 gap-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 text-sm font-medium text-left"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

const coderData = {
  name: "Omar Ajimi",
  role: "Full-Stack Developer",
  seniority: "Mid-Level",
  location: "Tunisia",
  skills: ["ReactJs", "MongoDb", "Nodejs", "Expressjs", "Blockchain", "Solidity", "Web3"],
}

const CoderProfileCard = () => {
  return (
    <div className="animate-fade-in-up w-full mx-auto bg-gray-900/80 dark:bg-white/10 border border-gray-700 dark:border-gray-600 relative rounded-lg shadow-lg backdrop-blur-sm">
      <div className="flex flex-row">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-pink-500 to-violet-600"></div>
        <div className="h-[2px] w-full bg-gradient-to-r from-violet-600 to-transparent"></div>
      </div>
      <div className="px-4 lg:px-8 py-5 flex justify-between items-center bg-gray-800/50 dark:bg-black/50">
        <div className="flex flex-row space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-orange-400"></div>
          <div className="h-3 w-3 rounded-full bg-green-400"></div>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">coder.js</div>
      </div>
      <div className="overflow-hidden border-t-[2px] border-gray-700 dark:border-indigo-900 px-4 lg:px-8 py-4 lg:py-8 relative">
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-blue-600 rounded-full opacity-10 filter blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-pink-600 rounded-full opacity-10 filter blur-3xl"></div>
        <div className="relative flex">
          <div className="hidden md:flex flex-col items-end pr-4 text-gray-500 dark:text-gray-600 font-mono text-xs">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="leading-relaxed select-none opacity-70">
                {i + 1}
              </div>
            ))}
          </div>
          <code className="font-mono text-xs md:text-sm lg:text-base w-full">
            <div>
              <span className="mr-2 text-pink-500 dark:text-pink-400">const</span>
              <span className="mr-2 text-violet-500 dark:text-violet-400">coder</span>
              <span className="mr-2 text-pink-500 dark:text-pink-400">=</span>
              <span className="text-gray-400 dark:text-gray-500">{"{"}</span>
            </div>
            <div className="pl-6">
              <span className="text-gray-200 dark:text-white">name:</span>
              <span className="text-gray-400 dark:text-gray-500">&#39;</span>
              <span className="text-green-600 dark:text-green-400">{coderData.name}</span>
              <span className="text-gray-400 dark:text-gray-500">&#39;,</span>
            </div>
            <div className="pl-6">
              <span className="text-gray-200 dark:text-white">role:</span>
              <span className="text-gray-400 dark:text-gray-500">&#39;</span>
              <span className="text-green-600 dark:text-green-400">{coderData.role}</span>
              <span className="text-gray-400 dark:text-gray-500">&#39;,</span>
            </div>
            <div className="pl-6">
              <span className="text-gray-200 dark:text-white">seniority:</span>
              <span className="text-gray-400 dark:text-gray-500">&#39;</span>
              <span className="text-green-600 dark:text-green-400">{coderData.seniority}</span>
              <span className="text-gray-400 dark:text-gray-500">&#39;,</span>
            </div>
            <div className="pl-6">
              <span className="text-gray-200 dark:text-white">location:</span>
              <span className="text-gray-400 dark:text-gray-500">&#39;</span>
              <span className="text-green-600 dark:text-green-400">{coderData.location}</span>
              <span className="text-gray-400 dark:text-gray-500">&#39;,</span>
            </div>
            <div className="pl-6">
              <span className="text-gray-200 dark:text-white">skills:</span>
              <span className="text-gray-400 dark:text-gray-500">{"["}</span>
              <div className="pl-6 flex flex-wrap">
                {coderData.skills.map((skill, index) => (
                  <span
                    key={skill}
                    className="animate-typing mr-1 inline-block"
                    style={{ animationDelay: `${index * 300}ms` }}
                  >
                    <span className="text-gray-400 dark:text-gray-500">&#39;</span>
                    <span className="text-cyan-600 dark:text-cyan-400">{skill}</span>
                    <span className="text-gray-400 dark:text-gray-500">&#39;</span>
                    {index < coderData.skills.length - 1 && (
                      <span className="text-gray-400 dark:text-gray-500">, </span>
                    )}
                  </span>
                ))}
              </div>
              <span className="text-gray-400 dark:text-gray-500">{"],"}</span>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500">{"};"}</span>
            </div>
          </code>
        </div>
      </div>
      <div className="px-4 lg:px-8 pb-4 mt-4 border-t border-gray-700 dark:border-gray-800 pt-3 text-xs text-gray-400 dark:text-gray-500 flex justify-between items-center">
        <span>UTF-8</span>
        <span>JavaScript</span>
        <span>Ln 12, Col 2</span>
      </div>
    </div>
  )
}

const Portfolio = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)

  const handleLoadingComplete = () => {
    setIsLoading(false)
    setTimeout(() => setShowContent(true), 300)
  }

  return (
    <div className="min-h-screen w-full relative">
      {isLoading && (
        <div
          className={`fixed inset-0 z-[9999] transition-opacity duration-500 ${
            isLoading ? "opacity-100" : "opacity-0"
          }`}
        >
          <LoadingScreen onLoadingComplete={handleLoadingComplete} />
        </div>
      )}
      <div className={`transition-opacity duration-500 ${showContent ? "opacity-100" : "opacity-0"}`}>
        <Navbar />
        <div className="min-h-screen w-full relative flex items-center justify-center font-sans p-4 sm:p-6 lg:p-8 pt-24">
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 xl:gap-16 items-center">
              <div className="flex flex-col gap-4 sm:gap-6 items-start text-left order-2 lg:order-1 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900/80 dark:bg-white/10 border border-gray-700 dark:border-gray-600 rounded-full text-xs sm:text-sm text-gray-200 dark:text-gray-300 backdrop-blur-sm hover:bg-gray-800 dark:hover:bg-white/20 transition-all duration-300">
                  <DotIcon />
                  Welcome to my universe
                </div>
                <div className="relative">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
                    Hello <br />
                    I&apos;m{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Omar Ajimi
                    </span>
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 my-2 sm:my-4">
                  <span className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-900/80 dark:bg-white/10 border border-gray-700 dark:border-gray-600 rounded-full text-gray-200 dark:text-gray-300 text-sm sm:text-base backdrop-blur-sm hover:bg-gray-800 dark:hover:bg-white/20 transition-all duration-300 cursor-default">
                     MERN Stack
                  </span>
                  <span className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-900/80 dark:bg-white/10 border border-gray-700 dark:border-gray-600 rounded-full text-gray-200 dark:text-gray-300 text-sm sm:text-base backdrop-blur-sm hover:bg-gray-800 dark:hover:bg-white/20 transition-all duration-300 cursor-default">
                    Clean Code
                  </span>
                  <span className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-900/80 dark:bg-white/10 border border-gray-700 dark:border-gray-600 rounded-full text-gray-200 dark:text-gray-300 text-sm sm:text-base backdrop-blur-sm hover:bg-gray-800 dark:hover:bg-white/20 transition-all duration-300 cursor-default">
                    Innovation
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg lg:text-xl max-w-lg leading-relaxed">
                  JavaScript lover 🖋️ | Blockchain enthusiast ⚡ | Crafting frameworks and coding the future ✨
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 w-full sm:w-auto">
                  <LoadingButton
                    variant="primary"
                    onClick={async () => {
                      await new Promise((resolve) => setTimeout(resolve, 2000))
                      console.log("Learn More clicked!")
                    }}
                    loadingText="Loading..."
                  >
                    Learn More
                  </LoadingButton>
                  <LoadingButton
                    variant="secondary"
                    onClick={async () => {
                      await new Promise((resolve) => setTimeout(resolve, 1500))
                      const link = document.createElement("a")
                      link.href = "/Omar_Ajimi_Resume.pdf"
                      link.download = "resume.pdf"
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      console.log("Resume downloaded!")
                    }}
                    loadingText="Downloading..."
                  >
                    Get Resume
                  </LoadingButton>
                </div>
              </div>
              <div className="order-1 lg:order-2 animate-fade-in-up">
                <CoderProfileCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Portfolio

// Add custom CSS for animations
const styles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
  }
  @keyframes typing {
    0% {
      opacity: 0;
      transform: translateX(-10px);
    }
    50% {
      opacity: 1;
      transform: translateX(0);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .animate-typing {
    opacity: 0;
    animation: typing 0.5s ease-out forwards;
  }
  .hover\\:shadow-3xl:hover {
    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
  }
`

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
