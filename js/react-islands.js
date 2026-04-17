import { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { html } from 'htm/react';

/* ═══════════════════════════════════════
   DATA
═══════════════════════════════════════ */

const PROJECTS = [
  {
    id: 'note-de-frais',
    title: 'Note de Frais',
    href: 'projects/note-de-frais.html',
    img: 'img/NoteDeFrais.png',
    tags: ['PHP', 'MySQL', 'HTML'],
    desc: "Application web de gestion des notes de frais professionnelles avec export PDF et authentification sécurisée.",
  },
  {
    id: 'media-stock',
    title: 'Media Stock',
    href: 'projects/media-stock.html',
    img: 'img/MediaStock.png',
    tags: ['JavaScript', 'PHP', 'Docker'],
    desc: "Application mobile-first de gestion d'inventaire informatique avec QR codes, prêts et restitutions.",
  },
  {
    id: 'learnit',
    title: 'LearnIt',
    href: 'projects/learnit.html',
    img: 'img/Learnit.png',
    tags: ['Java', 'MySQL', 'Maven'],
    desc: "Plateforme de gestion des formations, inscriptions d'étudiants et suivi de progression en mode Agile/Scrum.",
  },
  {
    id: 'coffrefort',
    title: 'CryptoVault',
    href: 'projects/coffrefort.html',
    img: 'img/coffreFort.png',
    tags: ['Java', 'MySQL', 'Maven', 'PHP'],
    desc: "Application de bureau permettant la gestion sécurisée de fichiers chiffrés avec système de versionnage, partage contrôlé et gestion de quotas.",
  },
  {
    id: 'garagemoto',
    title: 'GarageMoto',
    href: 'projects/garagemoto.html',
    img: 'img/GarageMoto.png',
    tags: ['Java', 'JavaFX', 'MySQL', 'Maven'],
    desc: "Application JavaFX de gestion complète pour garage moto — clients, rendez-vous, réparations, pièces et messagerie interne.",
  },
  {
    id: 'blog',
    title: 'Blog',
    href: 'projects/blog.html',
    img: 'img/Blog.png',
    tags: ['HTML', 'CSS', 'PHP', 'JavaScript'],
    desc: "Application web de gestion de contenu avec interface réactive et fonctionnalités avancées de publication et de modération.",
  },
  {
    id: 'appmovie',
    title: 'AppMovie',
    href: 'projects/appmovie.html',
    img: 'img/AppMovie.png',
    tags: ['Java', 'MySQL', 'Maven', 'PHP'],
    desc: "Application de bureau de gestion de films avec recherche avancée, filtrage et interface utilisateur réactive.",
  },
];

const ALL_TAGS = ['Tous', ...new Set(PROJECTS.flatMap(p => p.tags))];

const SKILLS_CODE = [
  { label: 'PHP',        pct: 90, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg' },
  { label: 'Java',       pct: 70, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { label: 'JavaScript', pct: 40, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { label: 'Python',     pct: 75, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
];

const SKILLS_PRO = [
  { label: 'Web Design',           pct: 30 },
  { label: 'Gestion de projet',    pct: 60 },
  { label: "Gestion d'incidents",  pct: 50 },
  { label: 'Base de données',      pct: 80 },
];

/* ═══════════════════════════════════════
   PROJECTS ISLAND
═══════════════════════════════════════ */

function ProjectCard({ project }) {
  return html`
    <a href=${project.href} className="project-card">
      <div className="project-card-img">
        <img src=${project.img} alt=${project.title + ' screenshot'} loading="lazy" />
        <div className="project-card-overlay"><span>Voir le projet</span></div>
      </div>
      <div className="project-card-body">
        <ul className="tech-tags">
          ${project.tags.map(t => html`<li key=${t}>${t}</li>`)}
        </ul>
        <h3>${project.title}</h3>
        <p>${project.desc}</p>
        <span className="project-cta">
          Voir le projet <i className="bx bx-right-arrow-alt" aria-hidden="true"></i>
        </span>
      </div>
    </a>
  `;
}

function ProjectsIsland() {
  const [active, setActive] = useState('Tous');

  const filtered = active === 'Tous'
    ? PROJECTS
    : PROJECTS.filter(p => p.tags.includes(active));

  const handleFilter = useCallback((tag) => setActive(tag), []);

  return html`
    <div>
      <div className="project-filters" role="group" aria-label="Filtrer par technologie">
        ${ALL_TAGS.map(tag => html`
          <button
            key=${tag}
            className=${'filter-btn' + (active === tag ? ' active' : '')}
            onClick=${() => handleFilter(tag)}
          >${tag}</button>
        `)}
      </div>
      <div className="projects-grid">
        ${filtered.map(p => html`<${ProjectCard} key=${p.id} project=${p} />`)}
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════
   SKILLS ISLAND
═══════════════════════════════════════ */

function SkillBar({ label, pct, animated }) {
  return html`
    <div className="progress">
      <h3>${label} <span>${pct}%</span></h3>
      <div className="bar">
        <span style=${{ width: animated ? pct + '%' : '0%', transition: animated ? 'width 1.1s cubic-bezier(.4,0,.2,1)' : 'none' }}></span>
      </div>
    </div>
  `;
}

function SkillBarCode({ label, pct, icon, animated }) {
  return html`
    <div className="progress progress--code">
      <div className="progress-header">
        <div className="skill-lang-icon">
          <img src=${icon} alt=${label + ' logo'} loading="lazy" />
        </div>
        <h3>${label} <span>${pct}%</span></h3>
      </div>
      <div className="bar">
        <span style=${{ width: animated ? pct + '%' : '0%', transition: animated ? 'width 1.1s cubic-bezier(.4,0,.2,1)' : 'none' }}></span>
      </div>
    </div>
  `;
}

function SkillsIsland() {
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setAnimated(true);
        observer.disconnect();
      }
    }, { threshold: 0.25 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return html`
    <div className="skills-row" ref=${ref}>
      <div className="skills-column">
        <h3 className="title">Compétences de codage</h3>
        <div className="skills-box">
          <div className="skills-content">
            ${SKILLS_CODE.map(s => html`<${SkillBarCode} key=${s.label} label=${s.label} pct=${s.pct} icon=${s.icon} animated=${animated} />`)}
          </div>
        </div>
      </div>

      <div className="skills-column">
        <h3 className="title">Compétences Professionnelles</h3>
        <div className="skills-box">
          <div className="skills-content">
            ${SKILLS_PRO.map(s => html`<${SkillBar} key=${s.label} label=${s.label} pct=${s.pct} animated=${animated} />`)}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════
   CONTACT ISLAND
═══════════════════════════════════════ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALIDATORS = {
  lastname: v => v.trim() ? null : 'Ce champ est requis.',
  email:    v => !v ? "L'adresse e-mail est requise." : !EMAIL_RE.test(v) ? "Format d'e-mail invalide." : null,
  subject:  v => v.trim() ? null : 'Ce champ est requis.',
  message:  v => v.trim() ? null : 'Ce champ est requis.',
};

function InputField({ name, type = 'text', placeholder, required, value, onChange, error }) {
  return html`
    <div className="input-field">
      <input
        name=${name}
        type=${type}
        placeholder=${placeholder}
        required=${required}
        value=${value}
        onChange=${onChange}
        className=${error ? 'field-error' : ''}
        aria-describedby=${error ? name + '-err' : undefined}
      />
      <span className="focus"></span>
      ${error && html`<span className="field-error-msg" id=${name + '-err'} role="alert">${error}</span>`}
    </div>
  `;
}

function ContactIsland({ formspreeUrl }) {
  const [fields, setFields] = useState({ lastname: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFields(f => ({ ...f, [name]: value }));
    if (VALIDATORS[name]) {
      setErrors(er => ({ ...er, [name]: VALIDATORS[name](value) }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.entries(VALIDATORS).forEach(([name, fn]) => {
      const err = fn(fields[name]);
      if (err) newErrors[name] = err;
    });
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setStatus('loading');
    try {
      const res = await fetch(formspreeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(fields),
      });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) setFields({ lastname: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const msgLen = fields.message.length;

  if (status === 'success') {
    return html`
      <div className="contact-success">
        <i className="bx bx-check-circle" aria-hidden="true"></i>
        <h3>Message envoyé !</h3>
        <p>Merci pour votre message. Je vous répondrai dans les plus brefs délais.</p>
        <button className="btn" style=${{ marginTop: '1rem' }} onClick=${() => setStatus('idle')}>
          Envoyer un autre message
        </button>
      </div>
    `;
  }

  return html`
    <form onSubmit=${handleSubmit} noValidate>
      <input type="text" name="_gotcha" style=${{ display: 'none' }} tabIndex="-1" autoComplete="off" />

      <div className="input-box">
        <${InputField} name="lastname" placeholder="Nom de famille" required value=${fields.lastname} onChange=${handleChange} error=${errors.lastname} />
        <${InputField} name="email" type="email" placeholder="Adresse e-mail" required value=${fields.email} onChange=${handleChange} error=${errors.email} />
        <span className="animate scroll" style=${{ '--i': 3 }}></span>
      </div>

      <div className="input-box" style=${{ marginTop: '1.6rem' }}>
        <${InputField} name="phone" type="tel" placeholder="Numéro de téléphone" value=${fields.phone} onChange=${handleChange} />
        <${InputField} name="subject" placeholder="Sujet de l'e-mail" required value=${fields.subject} onChange=${handleChange} error=${errors.subject} />
        <span className="animate scroll" style=${{ '--i': 5 }}></span>
      </div>

      <div className="textarea-field" style=${{ marginTop: '1.6rem' }}>
        <textarea
          name="message"
          rows="10"
          placeholder="Votre Message"
          required
          value=${fields.message}
          onChange=${handleChange}
          className=${errors.message ? 'field-error' : ''}
          aria-describedby=${errors.message ? 'message-err' : undefined}
          maxLength="1000"
          style=${{ paddingBottom: '3.2rem' }}
        ></textarea>
        <span className="focus"></span>
        ${errors.message && html`<span className="field-error-msg" id="message-err" role="alert">${errors.message}</span>`}
        <div className=${'char-count' + (msgLen > 900 ? ' char-count--warn' : '')} aria-live="polite">
          ${msgLen} / 1000
        </div>
        <span className="animate scroll" style=${{ '--i': 7 }}></span>
      </div>

      <div className="btn-box btns" style=${{ marginTop: '2rem' }}>
        <button type="submit" className="btn" disabled=${status === 'loading'}>
          ${status === 'loading'
            ? html`<i className="bx bx-loader-alt bx-spin" aria-hidden="true"></i> Envoi en cours…`
            : 'Envoyer'
          }
        </button>
        ${status === 'error' && html`
          <span className="contact-error" role="alert">
            <i className="bx bx-error-circle" aria-hidden="true"></i> Erreur d'envoi — réessayez.
          </span>
        `}
        <span className="animate scroll" style=${{ '--i': 9 }}></span>
      </div>
    </form>
  `;
}

/* ═══════════════════════════════════════
   MOUNT
═══════════════════════════════════════ */

const mount = (id, Component, props = {}) => {
  const el = document.getElementById(id);
  if (!el) return;
  createRoot(el).render(html`<${Component} ...${props} />`);
};

mount('react-projects', ProjectsIsland);
mount('react-skills',   SkillsIsland);

const contactEl = document.getElementById('react-contact');
if (contactEl) {
  createRoot(contactEl).render(
    html`<${ContactIsland} formspreeUrl=${contactEl.dataset.formspree || ''} />`
  );
}
