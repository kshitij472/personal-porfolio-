// ===== Utils =====
const lerp = (a,b,t) => a + (b-a)*t;

// ===== Scroll progress =====
const progress = document.querySelector('.scroll-progress');
const onScroll = () => {
  const sc = window.scrollY;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = ((sc / h) * 100) + '%';
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Typing effect (your roles) =====
const roles = [
  'BCA AI & ML Student',
  'Web Developer',
  'Java • C/C++',
  'Python & SQL',
  'Creative Problem Solver'
];
const typingEl = document.getElementById('typing');
let rIdx = 0, cIdx = 0, deleting = false;
(function typeLoop(){
  const word = roles[rIdx % roles.length];
  if (!deleting) {
    cIdx++; typingEl.textContent = word.slice(0, cIdx);
    if (cIdx === word.length) { deleting = true; setTimeout(typeLoop, 1200); return; }
  } else {
    cIdx--; typingEl.textContent = word.slice(0, cIdx);
    if (cIdx === 0) { deleting = false; rIdx++; }
  }
  setTimeout(typeLoop, (deleting ? 45 : 70) + (Math.random()*50));
})();

// ===== Theme & Palette =====
const themeBtn = document.getElementById('themeBtn');
const paletteBtn = document.getElementById('paletteBtn');
const root = document.documentElement;
const THEME_KEY = 'pref-theme', PALETTE_KEY = 'pref-accent-idx', STATIC_KEY='pref-static';

function setTheme(t){ document.body.classList.toggle('dark', t === 'dark'); localStorage.setItem(THEME_KEY, t); }
function toggleTheme(){ setTheme(document.body.classList.contains('dark') ? 'light' : 'dark'); }
themeBtn.addEventListener('click', toggleTheme);
const savedTheme = localStorage.getItem(THEME_KEY); if (savedTheme) setTheme(savedTheme);

// two-color palettes (swap order)
const palettes = [
  { a: '#006989', b: '#0eabed' },
  { a: '#0eabed', b: '#006989' }
];
function setPalette(i){
  const p = palettes[i % palettes.length];
  root.style.setProperty('--accent', p.a);
  root.style.setProperty('--accent-2', p.b);
  localStorage.setItem(PALETTE_KEY, i);
}
let pi = parseInt(localStorage.getItem(PALETTE_KEY) || '0', 10); setPalette(pi);
paletteBtn.addEventListener('click', () => { pi = (pi+1) % palettes.length; setPalette(pi); });

// ===== Mobile menu =====
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn?.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

// ===== Intersection reveal =====
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target);} });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// ===== Scroll spy =====
const links = document.querySelectorAll('a[data-nav]');
const sections = Array.from(document.querySelectorAll('section[id]'));
const spy = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { threshold: 0.5 });
sections.forEach(s => spy.observe(s));

// ===== Magnetic buttons (throttled) =====
document.querySelectorAll('.magnetic').forEach(btn => {
  let frame = 0, rect;
  const move = (e) => {
    rect = rect || btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - .5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - .5) * 12;
    btn.style.transform = `translate(${x}px, ${y}px)`;
  };
  btn.addEventListener('mousemove', (e) => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => move(e)); });
  btn.addEventListener('mouseleave', () => { rect = null; btn.style.transform = 'translate(0,0)'; });
});

// ===== Tilt cards with glow =====
const tiltCards = document.querySelectorAll('.tilt');
tiltCards.forEach(card => {
  let raf = 0;
  const glow = card.querySelector('.glow');
  const thumb = card.querySelector('.thumb');
  const update = (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -8;
    const ry = (px - 0.5) * 8;
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    if (glow) { glow.style.setProperty('--mx', (px*100)+'%'); glow.style.setProperty('--my', (py*100)+'%'); }
    if (thumb) { thumb.style.setProperty('--mx', (px*100)+'%'); thumb.style.setProperty('--my', (py*100)+'%'); }
  };
  card.addEventListener('mousemove', (e) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => update(e)); });
  card.addEventListener('mouseleave', () => { card.style.transform = 'rotateX(0) rotateY(0)'; if (glow) glow.style.opacity = .0; });
});

// ===== Command palette =====
const cmdk = document.getElementById('cmdk');
const cmdkBtn = document.getElementById('cmdkBtn');
const cmdkInput = document.getElementById('cmdkInput');
const cmdkList = document.getElementById('cmdkList');
let items = sections.map(s => ({ id: s.id, title: s.dataset.title || s.querySelector('h2')?.textContent || s.id }));
function renderCmdk(filter = '', selectedIdx = 0) {
  const q = filter.trim().toLowerCase();
  const filtered = items.filter(it => it.title.toLowerCase().includes(q));
  cmdkList.innerHTML = filtered.map((it, i) =>
    `<div class="cmdk__item" role="option" data-id="${it.id}" aria-selected="${i===selectedIdx}"># ${it.title}</div>`
  ).join('') || `<div class="cmdk__item">No matches for “${filter}”</div>`;
}
function openCmdk(){ cmdk.classList.add('open'); renderCmdk(''); cmdkInput.value = ''; setTimeout(() => cmdkInput.focus(), 10); }
function closeCmdk(){ cmdk.classList.remove('open'); }
cmdkBtn.addEventListener('click', openCmdk);
document.addEventListener('keydown', (e) => {
  const inInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
  if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !inInput)) { e.preventDefault(); openCmdk(); }
  else if (e.key === 'Escape' && cmdk.classList.contains('open')) { closeCmdk(); }
});
cmdkInput.addEventListener('input', () => renderCmdk(cmdkInput.value));
cmdkList.addEventListener('click', (e) => {
  const id = e.target.closest('.cmdk__item')?.dataset?.id;
  if (id) { location.hash = '#' + id; closeCmdk(); }
});
// Keyboard nav
let selIdx = 0;
cmdkInput.addEventListener('keydown', (e) => {
  const options = [...cmdkList.querySelectorAll('.cmdk__item[data-id]')];
  if (!options.length) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); selIdx = (selIdx + 1) % options.length; }
  if (e.key === 'ArrowUp') { e.preventDefault(); selIdx = (selIdx - 1 + options.length) % options.length; }
  if (e.key === 'Enter') {
    e.preventDefault();
    const id = options[selIdx]?.dataset?.id;
    if (id) { location.hash = '#' + id; closeCmdk(); }
  }
  options.forEach((el, i) => el.setAttribute('aria-selected', i === selIdx));
});
cmdk.addEventListener('click', (e) => { if (e.target === cmdk) closeCmdk(); });

// ===== Lazy-load project thumbs =====
const thumbs = document.querySelectorAll('.project .thumb[data-bg]');
const thumbIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target; const url = el.dataset.bg;
      if (url) el.style.background = `url('${url}') center/cover no-repeat, linear-gradient(120deg, rgba(255,255,255,.06), rgba(255,255,255,.02))`;
      thumbIO.unobserve(el);
    }
  });
}, { rootMargin: '500px' });
thumbs.forEach(el => thumbIO.observe(el));

// ===== Contact form (mailto) =====
const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(contactForm);
  const name = encodeURIComponent(fd.get('name'));
  const email = encodeURIComponent(fd.get('email'));
  const subject = encodeURIComponent(fd.get('subject') || 'Portfolio inquiry');
  const message = encodeURIComponent(fd.get('message'));
  const body = `Hi Kshitij,%0D%0A%0D%0A${message}%0D%0A%0D%0A— ${name} (${email})`;
  window.location.href = `mailto:chouhankshitij85@gmail.com?subject=${subject}&body=${body}`;
});

// ===== Copy email =====
document.getElementById('copyEmail')?.addEventListener('click', async () => {
  const email = document.getElementById('myEmail').textContent.trim();
  try { await navigator.clipboard.writeText(email); alert('Email copied to clipboard!'); }
  catch { prompt('Press Ctrl/Cmd+C to copy:', email); }
});

// ===== Custom cursor follow =====
const cursor = document.getElementById('cursor');
let cx = window.innerWidth/2, cy = window.innerHeight/2;
let tx = cx, ty = cy;
document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
(function cursorUpdate(){
  cx = lerp(cx, tx, 0.2); cy = lerp(cy, ty, 0.2);
  cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
  requestAnimationFrame(cursorUpdate);
})();
const hoverables = 'a, button, .magnetic, .tilt';
const setHover = (v) => cursor.classList.toggle('hover', v);
document.addEventListener('mouseover', (e) => { if (e.target.closest(hoverables)) setHover(true); });
document.addEventListener('mouseout', (e) => { if (e.target.closest(hoverables)) setHover(false); });

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Animation toggle (keep ring fixed by default) =====
const animBtn = document.getElementById('animBtn');
if (localStorage.getItem(STATIC_KEY) === '0') document.body.classList.remove('static');
animBtn?.addEventListener('click', () => {
  const nowStatic = document.body.classList.toggle('static');
  localStorage.setItem(STATIC_KEY, nowStatic ? '1' : '0');
});

// ===== Perf mode (press 'P') =====
document.addEventListener('keydown', (e)=>{ if(e.key.toLowerCase()==='p') document.body.classList.toggle('perf'); });