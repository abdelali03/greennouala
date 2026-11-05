/* Green Nouala — plain JavaScript; no framework, tracking or backend required. */
(() => {
  'use strict';
  const root = new URL('./', document.currentScript.src);
  const config = window.GREEN_NOUALA || {};
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const url = (pathname) => new URL(pathname, root).href;
  const isDarija = document.documentElement.lang.startsWith('ar');
  const text = (fr, ar) => isDarija ? ar : fr;
  const contactUrl = url('contact-us/index.html#contact-details');
  const digits = (value) => String(value || '').replace(/\D/g, '');

  // Initialize the original static layout without the Squarespace runtime.
  document.documentElement.classList.add('wf-active', 'gn-ready');
  document.body.classList.add('sqs-site-loaded');
  $$('img[data-src]').forEach((image) => {
    if (!image.getAttribute('src')) image.src = image.dataset.src;
    image.decoding = 'async';
    image.classList.add('loaded');
  });
  $$('.section-background img, .sqs-image-content img').forEach((image) => {
    image.style.objectFit = 'cover';
  });
  $$('.sqs-gallery-design-grid .slide, .gallery-grid-item').forEach((item) => {
    item.style.opacity = '1';
  });

  // Add the requested plant catalogue and connect the second reference site.
  $$('.header-nav-list').forEach((nav) => {
    const item = document.createElement('div');
    item.className = 'header-nav-item gn-plants-nav';
    item.innerHTML = `<a href="${url('catalogue/index.html')}">Nos plantes</a>`;
    const services = $$('div.header-nav-item', nav).find((node) => $('a', node)?.href.includes('/nos-services/'));
    if (services) services.after(item); else nav.append(item);
  });
  const mobileFolder = $('.header-menu-nav-folder-content');
  if (mobileFolder) {
    const item = document.createElement('div');
    item.className = 'header-menu-nav-item';
    item.innerHTML = `<a href="${url('catalogue/index.html')}">Nos plantes</a><a href="${url('bismarckia/index.html')}">Bismarckia nobilis</a>`;
    mobileFolder.append(item);
  }
  const burger = $('.header-burger-btn');
  const menu = $('.header-menu');
  const closeMenu = () => {
    document.body.classList.remove('header--menu-open', 'gn-menu-open');
    burger?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-hidden', 'true');
    if (menu) menu.inert = true;
  };
  if (burger && menu) {
    closeMenu();
    burger.addEventListener('click', () => {
      const open = !document.body.classList.contains('gn-menu-open');
      document.body.classList.toggle('header--menu-open', open);
      document.body.classList.toggle('gn-menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      menu.inert = !open;
      if (open) $('a', menu)?.focus();
    });
    menu.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
    menu.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const controls = $$('a[href], button', menu).filter((node) => node.getClientRects().length);
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); burger.focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); burger.focus(); }
    });
    burger.addEventListener('keydown', (event) => {
      if (event.key === 'Tab' && document.body.classList.contains('gn-menu-open')) {
        event.preventDefault();
        const controls = $$('a[href], button', menu).filter((node) => node.getClientRects().length);
        (event.shiftKey ? controls.at(-1) : controls[0])?.focus();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.body.classList.contains('gn-menu-open')) { closeMenu(); burger.focus(); }
    });
    matchMedia('(min-width: 1101px)').addEventListener('change', (event) => { if (event.matches) closeMenu(); });
  }

  const setLink = (anchor, href) => {
    anchor.href = href || contactUrl;
    if (/^https:\/\//.test(href || '') && !href.startsWith(root.href)) {
      anchor.target = '_blank'; anchor.rel = 'noopener noreferrer';
    } else { anchor.removeAttribute('target'); }
  };
  $$('[data-contact]').forEach((node) => {
    const key = node.dataset.contact;
    node.textContent = config[key] || ({phone: 'Téléphone à venir', email: 'E-mail à venir', address: 'Adresse à venir'})[key] || '';
  });
  $$('[data-contact-link]').forEach((anchor) => {
    const kind = anchor.dataset.contactLink;
    const href = kind === 'phone' ? (config.phone ? `tel:+${digits(config.phone)}` : null) :
      kind === 'email' ? (config.email ? `mailto:${config.email}` : null) :
      kind === 'whatsapp' ? (digits(config.whatsapp) ? `https://wa.me/${digits(config.whatsapp)}` : null) : config[kind];
    setLink(anchor, href);
  });
  $$('a.header-button, .header-actions-action--cta a, .nav-phone, .sticky-icon').forEach((anchor) => {
    if (config.phone) setLink(anchor, `tel:+${digits(config.phone)}`); else setLink(anchor, contactUrl);
  });
  $$('.wa-float').forEach((anchor) => {
    setLink(anchor, digits(config.whatsapp) ? `https://wa.me/${digits(config.whatsapp)}` : contactUrl);
  });
  $$('a[href="#contact-details"]').forEach((anchor) => {
    if (anchor.hasAttribute('data-contact-link')) return;
    if (/instagram|intagram/i.test(anchor.outerHTML)) setLink(anchor,config.instagram);
    else if (/facebook/i.test(anchor.outerHTML)) setLink(anchor,config.facebook);
    else if (/email-icon/.test(anchor.outerHTML)) setLink(anchor,config.email ? `mailto:${config.email}` : null);
    else if (/maps|nous trouver|rendre visite/i.test(anchor.textContent)) setLink(anchor,config.maps);
    else setLink(anchor,contactUrl);
  });
  if ($('.nav-logo')) { $('.nav-logo').href = url('index.html'); $('.nav-logo').setAttribute('aria-label','Green Nouala — Accueil'); }

  // Every page has one configured point of contact, including file:// previews.
  if (!$('#contact-details')) {
    const contact = document.createElement('section');
    contact.id = 'contact-details'; contact.className = 'gn-contact-strip';
    const title = document.createElement('h2'); title.textContent = text('Parlons de votre jardin.', 'نهضرو على الجردة ديالكم.');
    const details = document.createElement('p');
    details.textContent = [config.phone, config.email, config.address].filter(Boolean).join(' · ') || text('Nos coordonnées seront bientôt disponibles.', 'معلومات التواصل غادي تكون متوفرة قريباً.');
    const button = document.createElement('a'); button.className = 'gn-button'; button.href = url('contact-us/index.html#devis');
    button.textContent = text('Demander un devis →', 'طلب عرض ثمن ←');
    contact.append(title, details, button);
    ($('footer') || document.body).append(contact);
  }

  // The landing page's original CSS and native details elements are retained.
  const nav = $('#mainNav');
  const updateNav = () => nav?.classList.toggle('scrolled', window.scrollY > 40);
  addEventListener('scroll', updateNav, {passive: true}); updateNav();
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in', 'is-visible', 'visible'); reveal.unobserve(entry.target); }
      });
    }, {threshold: 0.06});
    $$('.reveal').forEach((node) => reveal.observe(node));
  } else $$('.reveal').forEach((node) => node.classList.add('in', 'is-visible', 'visible'));
  const sticky = $('#stickyCta');
  const lead = $('#leadForm');
  if (sticky && lead && 'IntersectionObserver' in window) {
    let formVisible = false;
    const updateSticky = () => {
      sticky.classList.toggle('visible', window.scrollY > 500);
      sticky.classList.toggle('form-open', formVisible || lead.contains(document.activeElement));
    };
    new IntersectionObserver((entries) => { formVisible = entries[0].isIntersecting; updateSticky(); }, {rootMargin:'0px 0px -10% 0px'}).observe(lead);
    addEventListener('scroll', updateSticky, {passive:true});
    lead.addEventListener('focusin', updateSticky); lead.addEventListener('focusout', () => setTimeout(updateSticky, 0));
    updateSticky();
  }
  const popup = $('#aePopupCta');
  if (popup) {
    let dismissed = false;
    try { dismissed = Date.now() - Number(localStorage.getItem('gn-popup-dismissed') || 0) < 604800000; } catch {}
    const hide = (persist) => {
      popup.classList.remove('is-visible'); popup.setAttribute('aria-hidden','true'); popup.inert = true;
      if (persist) { try { localStorage.setItem('gn-popup-dismissed', String(Date.now())); } catch {} }
    };
    hide(false);
    if (!dismissed) setTimeout(() => {
      if (!$('#leadForm')?.contains(document.activeElement) && !document.body.classList.contains('gn-dialog-open')) {
        popup.classList.add('is-visible'); popup.setAttribute('aria-hidden','false'); popup.inert = false;
      }
    }, 10000);
    $('.ae-popup-close', popup)?.addEventListener('click', () => hide(true));
    $('.ae-popup-cta-btn', popup)?.addEventListener('click', () => hide(false));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') hide(true); });
  }

  // Accessible gallery: keyboard navigation, next/previous and restored focus.
  let viewer, viewerImage, viewerCaption, viewerCount, activePhotos = [], photoIndex = 0, lastFocus;
  function displayPhoto(index) {
    photoIndex = (index + activePhotos.length) % activePhotos.length;
    const photo = activePhotos[photoIndex];
    viewerImage.src = photo.getAttribute('data-src') || photo.currentSrc || photo.src;
    viewerImage.alt = photo.alt;
    viewerCaption.textContent = photo.closest('figure')?.querySelector('figcaption')?.textContent.trim() || photo.alt;
    viewerCount.textContent = `${photoIndex + 1} / ${activePhotos.length}`;
  }
  function openPhoto(image) {
    if (!viewer) {
      viewer = document.createElement('dialog'); viewer.className = 'gn-viewer'; viewer.setAttribute('aria-label',text('Galerie photos','معرض الصور'));
      viewer.innerHTML = '<button type="button" class="gn-viewer-close" aria-label="Fermer">×</button><button type="button" class="gn-viewer-prev" aria-label="Image précédente">←</button><figure><img alt=""><figcaption></figcaption></figure><button type="button" class="gn-viewer-next" aria-label="Image suivante">→</button><span class="gn-viewer-count" aria-live="polite"></span>';
      document.body.append(viewer);
      viewerImage = $('img', viewer); viewerCaption = $('figcaption', viewer); viewerCount = $('.gn-viewer-count', viewer);
      $('.gn-viewer-close', viewer).addEventListener('click', () => viewer.close());
      $('.gn-viewer-prev', viewer).addEventListener('click', () => displayPhoto(photoIndex - 1));
      $('.gn-viewer-next', viewer).addEventListener('click', () => displayPhoto(photoIndex + 1));
      viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close(); });
      viewer.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); displayPhoto(photoIndex - 1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); displayPhoto(photoIndex + 1); }
      });
      viewer.addEventListener('close', () => { document.body.classList.remove('gn-dialog-open'); lastFocus?.focus(); });
    }
    lastFocus = document.activeElement;
    const group = image.closest('.gallery, .gal, .sqs-gallery, .gn-catalogue-grid, main');
    activePhotos = $$('img', group || document).filter((item) => !item.closest('.lbox, nav, .logos-grid, .logos-inner') && item.getAttribute('src'));
    if (!activePhotos.includes(image)) activePhotos = [image];
    displayPhoto(activePhotos.indexOf(image));
    document.body.classList.add('gn-dialog-open'); viewer.showModal();
  }
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a');
    const image = event.target.closest('img') || (anchor?.getAttribute('href')?.startsWith('#lbox-') ? $('img', anchor) : null);
    if (!image || image.closest('nav, footer, .section-background, .logos-inner, .logo-wall, .gn-viewer, .header-title-logo, .gn-catalogue-grid')) return;
    if (anchor && !anchor.getAttribute('href')?.startsWith('#lbox-') && !/\.(jpg|jpeg|webp|png|avif)(?:\?|$)/i.test(anchor.href)) return;
    event.preventDefault(); openPhoto(image);
  });
  $$('main .gal img, main .gallery-grid img, main .sqs-image-content img').forEach((image) => {
    if (image.closest('a')) return;
    image.tabIndex = 0; image.setAttribute('role','button'); image.setAttribute('aria-label', 'Agrandir : ' + (image.alt || 'photo'));
    image.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPhoto(image); } });
  });

  // Privacy opens with a native popover. No data is sent before submission.
  $$('a[href="#privacy"]').forEach((anchor) => anchor.addEventListener('click', (event) => { event.preventDefault(); $('#privacy')?.showPopover(); }));
  $$('.privacy-close').forEach((button) => button.addEventListener('click', () => $('#privacy')?.hidePopover()));

  const city = $('#city'), otherCity = $('#city_autre');
  if (city && otherCity) city.addEventListener('change', () => {
    const other = city.value === 'Autre';
    otherCity.hidden = !other; otherCity.style.display = other ? '' : 'none'; otherCity.required = other;
    if (other) otherCity.focus();
  });
  const params = new URLSearchParams(location.search);
  function bindForm(form) {
    form.removeAttribute('novalidate');
    $$('input, textarea, select',form).forEach((field) => {
      if (field.type === 'hidden' || !field.name || field.name === 'website') return;
      if (params.has(field.name)) field.value = params.get(field.name);
    });
    if (otherCity && city?.value === 'Autre') city.dispatchEvent(new Event('change'));
    const feedback = document.createElement('div'); feedback.className = 'gn-form-feedback'; feedback.setAttribute('role','status'); feedback.setAttribute('aria-live','polite');
    form.append(feedback);
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); feedback.replaceChildren();
      if (!form.reportValidity()) return;
      const values = Object.fromEntries(new FormData(form));
      if (values.website) return;
      const labels = {contact_name:'Nom',phone:'Téléphone',email:'E-mail',city:'Ville',city_autre:'Ville (autre)',quantity:'Nombre',timing:'Délai',plant:'Plante',service:'Service',description:'Projet'};
      const message = 'Demande de devis — Green Nouala\n\n' + Object.entries(labels).filter(([key]) => values[key]).map(([key,label]) => `${label} : ${values[key]}`).join('\n');
      const data = Object.fromEntries(Object.keys(labels).filter((key) => values[key]).map((key) => [key, values[key]]));
      const submit = $('[type="submit"]',form);
      if (config.formEndpoint) {
        submit.disabled = true;
        try {
          const response = await fetch(config.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,page:location.pathname})});
          if (!response.ok) throw new Error('HTTP '+response.status);
          feedback.textContent = text('Votre demande a bien été envoyée. Merci !','تصيفط الطلب ديالكم. شكراً!'); form.reset();
        } catch {
          feedback.textContent = text('L’envoi n’a pas abouti. Téléchargez votre demande pour la conserver.','ما تصيفطش الطلب. حملوه باش يبقى عندكم.');
          appendDownload(feedback,message);
        } finally { submit.disabled = false; }
        return;
      }
      if (digits(config.whatsapp)) {
        const destination = `https://wa.me/${digits(config.whatsapp)}?text=${encodeURIComponent(message)}`;
        const opened = window.open(destination,'_blank','noopener,noreferrer');
        feedback.textContent = text('Votre demande est préparée. Confirmez l’envoi dans WhatsApp.','الطلب واجد. أكّدو الإرسال فواتساب.');
        const link = document.createElement('a'); link.href = destination; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Ouvrir WhatsApp →'; feedback.append(document.createElement('br'),link);
        void opened;
      } else if (config.email) {
        const destination = `mailto:${config.email}?subject=${encodeURIComponent('Demande de devis — Green Nouala')}&body=${encodeURIComponent(message)}`;
        location.href = destination;
        feedback.textContent = 'Votre demande est préparée dans votre messagerie. Confirmez son envoi.';
        appendDownload(feedback,message);
      } else {
        feedback.textContent = text('Votre demande est prête. Nos coordonnées seront bientôt disponibles. Vous pouvez télécharger votre demande.','الطلب ديالكم واجد. معلومات التواصل غادي تكون متوفرة قريباً. تقدروا تحملوه.');
        appendDownload(feedback,message);
      }
    });
  }
  function appendDownload(container,message) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'gn-button'; button.textContent = text('Télécharger ma demande','تحميل الطلب');
    button.addEventListener('click', () => {
      const blobUrl = URL.createObjectURL(new Blob([message],{type:'text/plain;charset=utf-8'}));
      const anchor = document.createElement('a'); anchor.href = blobUrl; anchor.download = 'demande-devis-green-nouala.txt'; anchor.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl),1000);
    });
    container.append(document.createElement('br'),button);
  }
  $$('form[data-gn-form], form#leadForm').forEach(bindForm);

  const search = $('#plant-search');
  if (search) {
    let category = 'all';
    const normalize = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
    const filter = () => {
      let count = 0;
      $$('.gn-plant-card').forEach((card) => {
        const show = (category === 'all' || category === card.dataset.category) && normalize(card.textContent).includes(normalize(search.value));
        card.hidden = !show; if (show) count++;
      });
      $('#plant-count').textContent = `${count} plante${count === 1 ? '' : 's'}`;
      $('#plant-empty').hidden = count !== 0;
    };
    search.addEventListener('input',filter);
    $$('[data-plant-filter]').forEach((button) => button.addEventListener('click', () => {
      category = button.dataset.plantFilter;
      $$('[data-plant-filter]').forEach((item) => { item.setAttribute('aria-pressed',String(item === button)); }); filter();
    }));
    filter();
  }
})();
