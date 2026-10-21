'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Send, CheckCircle, XCircle } from 'lucide-react';
import MatrixRain from './matrix-rain';
import AuroraBackground from './aurora-bg';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formSubmitData = new FormData();
      formSubmitData.append('name', formData.name);
      formSubmitData.append('email', formData.email);
      formSubmitData.append('message', formData.message);
      formSubmitData.append('_captcha', 'false');
      formSubmitData.append('_subject', 'New message from portfolio');
      formSubmitData.append('_template', 'table');

      const response = await fetch('https://formsubmit.co/ajax/ajimiomar.oa@gmail.com', {
        method: 'POST',
        body: formSubmitData,
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Message Sent!',
          text: 'Thanks for reaching out. I\'ll get back to you soon.',
          background: '#020b06',
          color: '#f0fff4',
          confirmButtonColor: '#00ff6a',
          confirmButtonText: 'Awesome',
          customClass: {
            popup: 'rounded-2xl border border-emerald-500/30',
            confirmButton: 'rounded-xl font-semibold px-6 py-2',
          },
          showClass: { popup: 'animate__animated animate__fadeInUp animate__faster' },
          hideClass: { popup: 'animate__animated animate__fadeOutDown animate__faster' },
        });
        setFormData({ name: '', email: '', message: '' });
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error('Failed to send');
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong. Please try again or email me directly.',
        background: '#020b06',
        color: '#f0fff4',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Got it',
        customClass: {
          popup: 'rounded-2xl border border-red-500/30',
          confirmButton: 'rounded-xl font-semibold px-6 py-2',
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="snap-section relative flex items-center justify-center overflow-hidden"
    >
      <AuroraBackground className="absolute inset-0 z-0" />
      <MatrixRain opacity={0.025} className="absolute inset-0 z-[1]" />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 flex flex-col items-center text-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <p className="font-mono text-xs text-[#00c87a] tracking-widest uppercase">
            {"/ / contact"}
          </p>
          <h2
            className="text-5xl md:text-6xl font-extrabold text-white leading-tight"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            LET&apos;S BUILD
            <br />
            <span className="text-aurora">SOMETHING</span>
            <br />
            GREAT
          </h2>
          <p className="text-white/40 text-base mt-2">
            Open to freelance, collaborations, and full-time roles.
          </p>
        </div>

        <motion.div
          className="glass-card w-full p-6 md:p-8 rounded-2xl
            border border-[rgba(0,255,100,0.12)]
            bg-[rgba(0,255,100,0.03)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <a
            href="mailto:ajimiomar.oa@gmail.com"
            className="inline-flex items-center gap-2 text-[#00ff6a] text-sm hover:underline mb-4"
          >
            <Mail size={14} />
            ajimiomar.oa@gmail.com
          </a>

          <div className="border-t border-white/10 my-4" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                  text-white placeholder-white/20 text-sm
                  focus:outline-none focus:border-emerald-500/60 focus:bg-white/[0.08]
                  focus:ring-1 focus:ring-emerald-500/30 transition-all"
                style={{ fontFamily: 'var(--font-jetbrains)' }}
                disabled={submitting}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Your email"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                  text-white placeholder-white/20 text-sm
                  focus:outline-none focus:border-emerald-500/60 focus:bg-white/[0.08]
                  focus:ring-1 focus:ring-emerald-500/30 transition-all"
                style={{ fontFamily: 'var(--font-jetbrains)' }}
                disabled={submitting}
              />
            </div>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Your message..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                text-white placeholder-white/20 text-sm resize-none
                focus:outline-none focus:border-emerald-500/60 focus:bg-white/[0.08]
                focus:ring-1 focus:ring-emerald-500/30 transition-all"
              style={{ fontFamily: 'var(--font-jetbrains)' }}
              disabled={submitting}
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm
                flex items-center justify-center gap-2
                bg-gradient-to-r from-emerald-500 to-teal-600
                hover:shadow-[0_0_30px_rgba(0,255,106,0.4)] hover:scale-[1.02]
                active:scale-[0.98] transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send size={15} />
              {submitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </motion.div>

        <div className="flex items-center gap-6 justify-center">
          <a
            href="https://github.com/Omar-411"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-white/30 hover:text-[#00ff6a] transition-colors duration-200"
          >
            <Github size={16} />
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/omar-ajimi-7a5341118"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-white/30 hover:text-[#00ff6a] transition-colors duration-200"
          >
            <Linkedin size={16} />
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}