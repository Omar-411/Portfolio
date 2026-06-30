import Portfolio from './comps/hero';
import OrbitingSkills from './comps/orbiting';
import Divider from '@/components/ui/divider';
import Projects from './comps/projects';
import { GridBackground } from "./comps/movinv-grid"

const coderData = {
  skills: [
    'HTML5',
    'CSS3',
    'JavaScript',
    'ReactJs',
    'MongoDb',
    'Nodejs',
    'Expressjs',
    'Tailwind',
    'TypeScript',
    'Git',
    'GitHub',
    'Docker',
    'Solidity',
    'Web3',
    'WebSocket',
  ],
};

const Skills = () => (
  <section
    id="skills"
    className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 relative z-10"
    aria-label="Skills section"
  >
    <h2 className="animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
      My{' '}
      <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
        Skills
      </span>
    </h2>
    <div className="min-h-[400px] sm:min-h-[500px] flex items-center justify-center">
      <OrbitingSkills   />
    </div>
  </section>
);

const Contact = () => (
  <section
    id="contact"
    className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 relative z-10"
    aria-label="Contact section"
  >
    <h2 className="animate-fade-in-up text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">
      Get in{' '}
      <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
        Touch
      </span>
    </h2>
    <p className="text-slate-600/80 dark:text-slate-300/80 text-sm sm:text-base text-center mb-8">
      Or email me directly at{' '}
      <a
        href="mailto:ajimiomar.oa@gmail.com"
        className="text-cyan-600 dark:text-cyan-300 hover:underline"
      >
        ajimiomar.oa@gmail.com
      </a>
    </p>

    <form
      action="https://formsubmit.co/ajimiomar.oa@gmail.com"
      method="POST"
      className="max-w-xl mx-auto flex flex-col gap-4"
    >
      {/* Formsubmit config: disable captcha, set subject */}
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_subject" value="New message from your portfolio" />
      <input type="hidden" name="_template" value="table" />

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          name="name"
          required
          placeholder="Your name"
          className="flex-1 px-4 py-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 backdrop-blur-sm"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="Your email"
          className="flex-1 px-4 py-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 backdrop-blur-sm"
        />
      </div>

      <textarea
        name="message"
        required
        rows={5}
        placeholder="Your message..."
        className="px-4 py-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 backdrop-blur-sm resize-none"
      />

      <button
        type="submit"
        className="self-center px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
      >
        Send Message
      </button>
    </form>
  </section>
);

export default function Home() {
  return (
    <div className="relative w-full min-h-screen">
      <GridBackground/>
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          background: 'radial-gradient(125% 125% at 50% 100%, #ffffff 40%, #3b82f6 100%)',
        }}
      />
      <div
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          background: 'radial-gradient(125% 125% at 50% 100%, #000000 40%, #010133 100%)',
        }}
      />
      <div className="relative z-10">
        <div id="home" className="pt-16">
          <Portfolio />
        </div>
        <Divider variant="solid" className="my-8 z-10" />
        <div id="projects">
          <Projects />
        </div>
        <Divider variant="solid" className="my-8 z-10" />
        <Skills />
        <Divider variant="solid" className="my-8 z-10" />
        <Contact />
      </div>
    </div>
  );
}
