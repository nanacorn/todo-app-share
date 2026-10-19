(() => {
  'use strict';
  const STORAGE_KEY = 'todo-share.v1';
  const CLOUD_ENABLED = Boolean(window.TodoCloud) && location.pathname.startsWith('/todo');
  let cloud = null;
  const remoteImage = (value) => typeof value === 'string' && /^\/todo\/api\/images\/[a-f0-9-]{36}$/i.test(value);
  const IMAGE_KEY = 'todo-share.sidebar-image.v1';
  const PROJECT_IMAGE_PREFIX = 'todo-share.project-image.v1.';
  const LOGO_KEY = 'todo-share.logo-image.v1';
  const COLLAPSED_SECTIONS_KEY = 'todo-share.collapsed-sections.v1';
  const defaultBrandName = 'My Todo List';
  const ARCHIVE_DURATION = 30 * 24 * 60 * 60 * 1000;
  const el = (id) => document.getElementById(id);
  const uid = () => crypto.randomUUID();
  const templateASections = Object.freeze(["기획","메인 프롬프트 수정","이미지","시작 설정","단축어","키워드 북(로어 북)","위젯","테스트 플레이","상세 페이지","고정 댓글","모델 추천","유저 노트","페르소나 및 RP 추천","썸네일","한 줄 설명","해시태그"]);
  const templates = Object.freeze({ blank: ['할 일'], templateA: templateASections, templateB: templateASections.slice(1) });
  const defaultTheme = Object.freeze({ start: '#fff8cf', end: '#fffdf6', accent: '#ffda75' });
  const themePresets = Object.freeze([
    { name: '노란 계열', ...defaultTheme },
    { name: '빨간 계열', start: '#ffcccc', end: '#fff8f8', accent: '#ffc4c4', swatchStart: '#fff0f0' },
    { name: '초록 계열', start: '#cffff0', end: '#f7fffb', accent: '#baebd7', swatchStart: '#effff7' },
    { name: '핑크 계열', start: '#ffceea', end: '#fff7fb', accent: '#ffd0e8', swatchStart: '#fff0f8' },
    { name: '블루 계열', start: '#cfeaff', end: '#f7fcff', accent: '#c6e7ff', swatchStart: '#eef9ff' },
    { name: '보라 계열', start: '#e3d1ff', end: '#fcf8ff', accent: '#deceff', swatchStart: '#f5f0ff' },
    { name: '그레이 계열', start: '#d0d9e5', end: '#f7f9fc', accent: '#e6eaf0', swatchStart: '#f2f5f9' }
  ]);
  const validColor = (color) => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color);
  const makeSection = (name) => ({ id: uid(), name, tasks: [] });
  const cloneTask = (task) => ({ id: uid(), text: task.text, done: false, completedAt: null, children: (task.children || []).map(cloneTask) });
  const cloneSections = (sections) => sections.map((section) => ({ id: uid(), name: section.name, tasks: section.tasks.map(cloneTask) }));
  const defaultTemplates = () => Object.fromEntries(['templateA', 'templateB'].map((key) => [key, { sections: templates[key].map(makeSection) }]));
  function makeProject(name, template = 'blank') {
    return { id: uid(), name, archived: false, sections: template === 'blank' ? [makeSection('할 일')] : cloneSections(state.templates[template].sections) };
  }
  const makeTask = (text) => ({ id: uid(), text, done: false, completedAt: null, children: [] });
  let storageError = false;
  let needsMigration = false;
  const validTask = (task) => task && typeof task.id === 'string' && typeof task.text === 'string' && typeof task.done === 'boolean' && (task.children === undefined || Array.isArray(task.children) && task.children.every(validTask));
  function normalizeTask(task, now) {
    if (!Array.isArray(task.children)) { task.children = []; needsMigration = true; }
    const completedAt = task.done ? (Number.isFinite(task.completedAt) && task.completedAt >= 0 && task.completedAt <= now ? task.completedAt : now) : null;
    if (task.completedAt !== completedAt) { task.completedAt = completedAt; needsMigration = true; }
    task.children.forEach((child) => normalizeTask(child, now));
  }

  function initialState() {
    const project = makeProject('내 할 일');
    return { projects: [project], selectedProjectId: project.id, theme: { ...defaultTheme }, colorMode: 'light', brandName: defaultBrandName, templates: defaultTemplates() };
  }

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialState();
      const value = JSON.parse(raw);
      const valid = value && Array.isArray(value.projects) && value.projects.every((project) =>
        typeof project.id === 'string' && typeof project.name === 'string' && Array.isArray(project.sections) && project.sections.every((section) =>
          typeof section.id === 'string' && typeof section.name === 'string' && Array.isArray(section.tasks) && section.tasks.every(validTask)));
      if (!valid) throw new Error('Invalid saved data');
      value.projects.forEach((project) => {
        if (project.appearance && (!['color', 'image'].includes(project.appearance.backgroundMode) || !Object.keys(defaultTheme).every((key) => validColor(project.appearance.theme?.[key])))) { delete project.appearance; needsMigration = true; }
        if (project.colorMode !== undefined && !['light', 'dark'].includes(project.colorMode)) { delete project.colorMode; needsMigration = true; }
      });
      value.projects.forEach((project) => { if (typeof project.archived !== 'boolean') { project.archived = false; needsMigration = true; } });
      if (!value.projects.some((project) => project.id === value.selectedProjectId && !project.archived)) value.selectedProjectId = value.projects.find((project) => !project.archived)?.id || null;
      value.theme = Object.fromEntries(Object.entries(defaultTheme).map(([key, fallback]) => [key, validColor(value.theme?.[key]) ? value.theme[key] : fallback]));
      value.colorMode = value.colorMode === 'dark' ? 'dark' : 'light';
      value.brandName = typeof value.brandName === 'string' && value.brandName.trim() && value.brandName.length <= 80 ? value.brandName.trim() : defaultBrandName;
      const savedTemplates = value.templates;
      value.templates = {};
      for (const key of ['templateA', 'templateB']) {
        const saved = savedTemplates?.[key];
        if (saved && Array.isArray(saved.sections) && saved.sections.every((section) => typeof section.id === 'string' && typeof section.name === 'string' && Array.isArray(section.tasks) && section.tasks.every(validTask))) value.templates[key] = { sections: structuredClone(saved.sections) };
        else { value.templates[key] = { sections: templates[key].map(makeSection) }; needsMigration = true; }
      }
      const now = Date.now();
      value.projects.forEach((project) => project.sections.forEach((section) => section.tasks.forEach((task) => normalizeTask(task, now))));
      Object.values(value.templates).forEach((template) => template.sections.forEach((section) => section.tasks.forEach((task) => normalizeTask(task, now))));
      return value;
    } catch {
      storageError = true;
      return initialState();
    }
  }

  let state = readState();
  let sidebarImage = readSidebarImage();
  if (!['color', 'image'].includes(state.backgroundMode)) state.backgroundMode = sidebarImage ? 'image' : 'color';
  let logoImage = readLogoImage();
  let settingsProject = null;
  let imageBusy = false;
  const projectImages = new Map();
  let projectTemplate = 'blank';
  let templateEditor = null;
  let pendingDelete = null;
  let sectionDrag = null;
  let projectDrag = null;
  const composers = new Map();
  let editTarget = null;
  let editTrigger = null;
  let inlineTaskEdit = null;
  const mobileMedia = window.matchMedia('(max-width: 700px)');
  const openArchives = new Set();
  const collapsedSections = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(COLLAPSED_SECTIONS_KEY));
    if (Array.isArray(saved)) saved.slice(0, 5000).filter((id) => typeof id === 'string').forEach((id) => collapsedSections.add(id));
  } catch { /* View preferences must not prevent the workspace from opening. */ }
  function pruneArchivedTasks(now = Date.now()) {
    let changed = false;
    function prune(tasks) {
      for (let index = tasks.length - 1; index >= 0; index--) {
        const task = tasks[index];
        if (task.done && now - task.completedAt >= ARCHIVE_DURATION) { tasks.splice(index, 1); changed = true; }
        else prune(task.children);
      }
    }
    state.projects.forEach((project) => project.sections.forEach((section) => prune(section.tasks)));
    return changed;
  }
  function refreshExpiredArchives() {
    // Avoid interrupting a form while it is being edited. Run again when it closes.
    if (templateEditor || inlineTaskEdit || sectionDrag || projectDrag || document.querySelector('dialog[open]') || [...document.querySelectorAll('.task-form, .name-form')].some((form) => !form.hidden)) return;
    if (pruneArchivedTasks()) { save(); renderSections(); }
  }
  function showMobileScreen(screen, focus = true) {
    document.querySelector('.app-shell').dataset.mobileScreen = screen;
    if (!mobileMedia.matches || !focus) return;
    window.scrollTo({ top: 0 });
    if (screen === 'projects') el('projects-heading').focus({ preventScroll: true });
    else el('back-to-projects').focus({ preventScroll: true });
  }
  const pencil = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 6Z"/></svg>';
  const brandPencil = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10.5 2.5a2.12 2.12 0 0 1 3 3L6 13l-3.5.5L3 10Z"/><path d="m9.5 3.5 3 3"/></svg>';
  const brandGear = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6.649 1.642L9.351 1.642L9.545 3.245L11.346 4.284L12.83 3.651L14.182 5.991L12.891 6.96L12.891 9.04L14.182 10.009L12.83 12.349L11.346 11.716L9.545 12.755L9.351 14.358L6.649 14.358L6.455 12.755L4.654 11.716L3.17 12.349L1.818 10.009L3.109 9.04L3.109 6.96L1.818 5.991L3.17 3.651L4.654 4.284L6.455 3.245Z"/><circle cx="8" cy="8" r="2.25"/></svg>';
  const gear = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 3-1 3-3 1-2 4 2 2v3l3 2 1 3h5l1-3 3-2v-3l2-2-2-4-3-1-1-3Z"/><circle cx="11.5" cy="12" r="3"/></svg>';
  const trash = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>';
  const grip = '<svg width="14" height="18" viewBox="0 0 16 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="5" r="1.5"/><circle cx="11" cy="5" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="11" cy="12" r="1.5"/><circle cx="5" cy="19" r="1.5"/><circle cx="11" cy="19" r="1.5"/></svg>';
  const archiveIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3h18v5H3zM5 8v13h14V8M9 12h6"/></svg>';
  const restoreIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 9M4 4v6h6"/></svg>';
  function mixWhite(hex, ratio) {
    const channels = [1, 3, 5].map((index) => Math.round(parseInt(hex.slice(index, index + 2), 16) * (1 - ratio) + 255 * ratio));
    return `rgb(${channels.join(', ')})`;
  }
  function mixDark(hex, ratio) {
    return `rgb(${[1, 3, 5].map((index) => Math.round(parseInt(hex.slice(index, index + 2), 16) * (1 - ratio))).join(', ')})`;
  }
  function mixColor(hex, base, ratio) {
    return `rgb(${[1, 3, 5].map((index) => Math.round(parseInt(hex.slice(index, index + 2), 16) * (1 - ratio) + parseInt(base.slice(index, index + 2), 16) * ratio)).join(', ')})`;
  }
  function settingsAppearance() { return settingsProject?.appearance || state; }
  function imageFor(project) {
    if (!project?.appearance) return sidebarImage;
    if (!projectImages.has(project.id)) projectImages.set(project.id, readSidebarImage(PROJECT_IMAGE_PREFIX + project.id));
    return projectImages.get(project.id);
  }
  function settingsImage() { return imageFor(settingsProject); }
  function displayProject() { return el('settings-dialog').open ? settingsProject : currentProject(); }
  function displayAppearance() { return displayProject()?.appearance || state; }
  function storeAppearance(next, image, project = settingsProject) {
    const key = project ? PROJECT_IMAGE_PREFIX + project.id : IMAGE_KEY;
    const previous = project ? project.appearance : { theme: state.theme, backgroundMode: state.backgroundMode };
    const previousImage = project ? imageFor(project) : sidebarImage;
    let raw;
    let written = false;
    try {
      raw = localStorage.getItem(key);
      if (image) localStorage.setItem(key, JSON.stringify(image)); else localStorage.removeItem(key);
      written = true;
      if (project) {
        if (next) project.appearance = next; else delete project.appearance;
        projectImages.set(project.id, image);
      } else { state.theme = next.theme; state.backgroundMode = next.backgroundMode; sidebarImage = image; }
      if (!save()) throw new Error('Storage unavailable');
      return true;
    } catch {
      if (project) { if (previous) project.appearance = previous; else delete project.appearance; projectImages.set(project.id, previousImage); }
      else { state.theme = previous.theme; state.backgroundMode = previous.backgroundMode; sidebarImage = previousImage; }
      if (written) { try { if (raw === null) localStorage.removeItem(key); else localStorage.setItem(key, raw); } catch {} }
      showStorageError();
      imageMessage('설정을 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.', true);
      return false;
    }
  }
  function refreshAppearance() { applyTheme(); applySidebarImage(); syncColorInputs(); syncSettingsScope(); }
  function syncSettingsScope() {
    el('settings-title').textContent = settingsProject ? '프로젝트 설정' : '전체 설정';
    el('settings-caption').textContent = settingsProject ? `“${settingsProject.name}”의 배경·색상·화면 모드를 설정해요. 선택하면 바로 저장돼요.` : '로고와 모든 프로젝트의 기본 배경·색상·화면 모드를 설정해요.';
    el('logo-settings').hidden = Boolean(settingsProject);
    el('color-mode-inherit-option').hidden = !settingsProject;
    el('color-mode-help').textContent = settingsProject ? '이 프로젝트에만 적용되고, PC와 모바일에 함께 저장돼요. 전체 설정 따르기를 선택하면 기본 화면 모드를 사용해요.' : '별도 화면 모드를 지정하지 않은 프로젝트에 적용되고, PC와 모바일에 함께 저장돼요.';
    el('project-appearance-controls').hidden = !settingsProject;
    el('project-appearance-status').textContent = settingsProject?.appearance ? '이 프로젝트만의 배경과 테마를 사용 중이에요.' : '전체 기본 테마를 사용 중이에요.';
    el('reset-project-appearance').disabled = !settingsProject?.appearance;
  }
  function openSettings(project = null) {
    settingsProject = project;
    el('image-message').hidden = true;
    el('brand-name-setting').value = state.brandName;
    el('settings-dialog').showModal();
    refreshAppearance();
  }
  function applyTheme() {
    const theme = displayAppearance().theme;
    const style = document.documentElement.style;
    const dark = (displayProject()?.colorMode || state.colorMode) === 'dark';
    const selectedMode = settingsProject ? settingsProject.colorMode || 'inherit' : state.colorMode || 'light';
    document.documentElement.dataset.colorMode = dark ? 'dark' : 'light';
    el('color-mode-light').checked = selectedMode === 'light';
    el('color-mode-dark').checked = selectedMode === 'dark';
    el('color-mode-inherit').checked = selectedMode === 'inherit';
    style.setProperty('--gradient-start', dark ? mixColor(theme.start, '#171b22', .94) : theme.start);
    style.setProperty('--gradient-end', dark ? mixColor(theme.end, '#11151b', .97) : theme.end);
    style.setProperty('--accent', theme.accent);
    style.setProperty('--accent-soft', dark ? mixColor(theme.accent, '#1b1f26', .9) : mixWhite(theme.accent, .8));
    style.setProperty('--accent-light', dark ? mixColor(theme.accent, '#1b1f26', .78) : mixWhite(theme.accent, .45));
    style.setProperty('--skin-surface', dark ? mixColor(theme.accent, '#1c2027', .98) : mixWhite(theme.accent, .975));
    style.setProperty('--skin-workspace', dark ? '#15191f' : mixWhite(theme.accent, .965));
    style.setProperty('--skin-ink', dark ? '#edf0f4' : mixDark(theme.accent, .83));
    style.setProperty('--skin-muted', dark ? '#b2b8c2' : mixDark(theme.accent, .63));
    style.setProperty('--skin-border', dark ? '#353b46' : mixWhite(theme.accent, .8));
    const rgb = [1, 3, 5].map((index) => parseInt(theme.accent.slice(index, index + 2), 16) / 255);
    const luminance = rgb.map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
    style.setProperty('--accent-ink', luminance > .179 ? '#302c23' : '#ffffff');
    // Workspace accents are separate from the saved theme, so this polish can be reverted independently.
    style.setProperty('--workspace-accent', dark ? mixWhite(theme.accent, luminance < .2 ? .55 : .08) : mixDark(theme.accent, .56));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#15191f' : theme.start;
    syncThemePresets();
  }
  function syncThemePresets() {
    el('theme-presets-field').hidden = settingsAppearance().backgroundMode !== 'color';
    [...el('theme-presets').children].forEach((button, index) => {
      const preset = themePresets[index];
      button.setAttribute('aria-pressed', String(['start', 'end', 'accent'].every((key) => settingsAppearance().theme[key].toLowerCase() === preset[key])));
    });
  }
  function renderThemePresets() {
    el('theme-presets').replaceChildren(...themePresets.map((preset) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'theme-dot';
      button.title = preset.name;
      button.setAttribute('aria-label', `${preset.name} 테마`);
      button.style.setProperty('--preset-start', preset.swatchStart || preset.start);
      button.style.setProperty('--preset-accent', preset.accent);
      button.addEventListener('click', () => {
        const next = { theme: { start: preset.start, end: preset.end, accent: preset.accent }, backgroundMode: settingsAppearance().backgroundMode };
        if (storeAppearance(next, settingsImage())) refreshAppearance();
      });
      return button;
    }));
  }
  function readSidebarImage(key = IMAGE_KEY) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const value = JSON.parse(raw);
      if (typeof value.data !== 'string' || value.data.length > 2000000 || !(remoteImage(value.data) || /^data:image\/(webp|jpeg|png);base64,[a-z0-9+/=]+$/i.test(value.data))) throw new Error('Invalid image');
      if (!value.previousTheme || !Object.keys(defaultTheme).every((key) => validColor(value.previousTheme[key]))) throw new Error('Invalid image theme');
      return { data: value.data, name: typeof value.name === 'string' ? value.name : '배경 이미지', previousTheme: value.previousTheme };
    } catch {
      imageMessage('저장된 배경 이미지를 읽지 못했습니다. 이미지를 다시 선택해 주세요.', true);
      return null;
    }
  }
  function imageMessage(message, isError = false) {
    el('image-message').textContent = message;
    el('image-message').hidden = false;
    el('image-message').classList.toggle('is-error', isError);
  }
  function syncColorInputs() {
    const theme = settingsAppearance().theme;
    el('gradient-start').value = theme.start;
    el('gradient-end').value = theme.end;
    el('accent-color').value = theme.accent;
    syncThemePresets();
  }
  function applySidebarImage() {
    const displayImage = imageFor(displayProject());
    const active = Boolean(displayImage) && displayAppearance().backgroundMode === 'image';
    document.body.classList.toggle('has-background-image', active);
    if (active) document.documentElement.style.setProperty('--background-image', `url("${displayImage.data}")`);
    else document.documentElement.style.removeProperty('--background-image');
    const image = settingsImage();
    const settingsActive = Boolean(image) && settingsAppearance().backgroundMode === 'image';
    el('background-color-mode').checked = !settingsActive;
    el('background-image-mode').checked = settingsActive;
    el('background-image-mode').disabled = !image;
    syncThemePresets();
    el('image-preview').hidden = !image;
    el('image-name').hidden = !image;
    el('remove-image').hidden = !image;
    if (image) {
      el('image-preview').src = image.data;
      el('image-name').textContent = image.name;
    } else {
      el('image-preview').removeAttribute('src');
      el('image-name').textContent = '';
    }
  }
  function rgbToHsl(red, green, blue) {
    const [r, g, b] = [red, green, blue].map((value) => value / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
    const lightness = (max + min) / 2;
    if (!delta) return [0, 0, lightness];
    const saturation = delta / (1 - Math.abs(2 * lightness - 1));
    let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    hue = (hue * 60 + 360) % 360;
    return [hue, saturation, lightness];
  }
  function hslToHex(hue, saturation, lightness) {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
    const base = lightness - chroma / 2;
    const channels = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x] : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x];
    return '#' + channels.map((value) => Math.round((value + base) * 255).toString(16).padStart(2, '0')).join('');
  }
  function paletteFromImage(image) {
    const sample = document.createElement('canvas');
    sample.width = 96;
    sample.height = 96;
    const context = sample.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('이미지의 색을 읽을 수 없습니다.');
    context.drawImage(image, 0, 0, 96, 96);
    const pixels = context.getImageData(0, 0, 96, 96).data;
    const buckets = new Map();
    for (let i = 0; i < pixels.length; i += 4) {
      const alpha = pixels[i + 3] / 255;
      if (alpha < .1) continue;
      const [hue, saturation, lightness] = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2]);
      const key = saturation > .12 ? `h${Math.floor(hue / 20)}` : `n${Math.floor(lightness * 4)}`;
      const weight = alpha * (.15 + .85 * saturation) * (1 - Math.abs(.5 - lightness) * .7);
      const bucket = buckets.get(key) || { weight: 0, red: 0, green: 0, blue: 0 };
      bucket.weight += weight;
      bucket.red += pixels[i] * weight;
      bucket.green += pixels[i + 1] * weight;
      bucket.blue += pixels[i + 2] * weight;
      buckets.set(key, bucket);
    }
    const dominant = [...buckets.values()].sort((a, b) => b.weight - a.weight)[0];
    if (!dominant) throw new Error('투명한 이미지에서 색을 읽을 수 없습니다. 다른 이미지를 선택해 주세요.');
    const [hue, rawSaturation] = rgbToHsl(dominant.red / dominant.weight, dominant.green / dominant.weight, dominant.blue / dominant.weight);
    const saturation = rawSaturation > .12 ? Math.max(.25, Math.min(.72, rawSaturation)) : rawSaturation;
    return { start: hslToHex(hue, saturation * .7, .91), end: hslToHex(hue, saturation * .45, .97), accent: hslToHex(hue, saturation, .58) };
  }
  async function prepareImage(file, isLogo = false) {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) throw new Error('JPG, PNG, WebP 또는 GIF 이미지를 선택해 주세요.');
    if (file.size > 20 * 1024 * 1024) throw new Error('이미지가 너무 큽니다. 20MB 이하의 이미지를 선택해 주세요.');
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode().catch(() => { throw new Error('이미지를 열 수 없습니다. 다른 이미지 파일을 선택해 주세요.'); });
      const theme = isLogo ? null : paletteFromImage(image);
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, (isLogo ? 256 : 1000) / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('이 브라우저에서 이미지를 처리할 수 없습니다.');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/webp', .82);
      if (data.length > (isLogo ? 300000 : 2000000)) throw new Error('이미지를 저장하기 어렵습니다. 더 작은 이미지를 선택해 주세요.');
      return { data, theme };
    } finally { URL.revokeObjectURL(url); }
  }
  async function chooseSidebarImage(file) {
    if (imageBusy) return;
    imageBusy = true;
    const project = settingsProject;
    const previousImage = settingsImage();
    const previousTheme = { ...settingsAppearance().theme };
    const chooseButton = el('choose-image');
    el('settings-dialog').querySelectorAll('fieldset').forEach((field) => { field.disabled = true; });
    el('reset-project-appearance').disabled = true;
    el('close-settings').disabled = true;
    chooseButton.textContent = '이미지 적용 중…';
    imageMessage('이미지에서 어울리는 색을 찾고 있어요.');
    try {
      const prepared = await prepareImage(file);
      const theme = prepared.theme;
      const data = cloud ? await cloud.upload(prepared.data) : prepared.data;
      const next = { data, name: file.name, previousTheme: previousImage?.previousTheme || previousTheme };
      if (!storeAppearance({ theme, backgroundMode: 'image' }, next, project)) return;
      refreshAppearance();
      if (cloud) await cloud.flush();
      imageMessage(cloud ? '이미지와 스킨 색을 서버에 저장했어요.' : '이미지와 스킨 색을 적용했어요.');
    } catch (error) { imageMessage(error.message || '이미지를 적용하지 못했습니다.', true); }
    finally {
      imageBusy = false;
      el('settings-dialog').querySelectorAll('fieldset').forEach((field) => { field.disabled = false; });
      el('close-settings').disabled = false;
      chooseButton.textContent = '이미지 선택';
      el('sidebar-image-file').value = '';
      syncSettingsScope();
    }
  }
  async function removeSidebarImage() {
    const image = settingsImage();
    if (!image || imageBusy) return;
    if (!storeAppearance({ theme: { ...image.previousTheme }, backgroundMode: 'color' }, null)) return;
    refreshAppearance();
    imageMessage(cloud ? '서버에서도 이미지를 삭제하고 있어요…' : '이미지를 제거하고 이전 색상으로 돌아왔어요.');
    if (cloud) {
      try { await cloud.flush(); imageMessage('이미지를 서버에서도 삭제했어요.'); }
      catch { imageMessage('삭제 요청을 보관했어요. 연결되면 서버 파일도 삭제됩니다.', true); }
    }
    el('choose-image').focus();
  }
  function logoMessage(message, isError = false) {
    el('logo-message').textContent = message;
    el('logo-message').hidden = false;
    el('logo-message').classList.toggle('is-error', isError);
  }
  function readLogoImage() {
    try {
      const data = localStorage.getItem(LOGO_KEY);
      if (!data) return null;
      if (data.length > 300000 || !(remoteImage(data) || /^data:image\/(webp|jpeg|png);base64,[a-z0-9+/=]+$/i.test(data))) throw new Error('Invalid logo');
      return data;
    } catch { logoMessage('저장된 로고를 읽지 못했습니다. 다시 선택해 주세요.', true); return null; }
  }
  function applyLogo() {
    el('brand-mark').classList.toggle('has-logo', Boolean(logoImage));
    el('brand-default').hidden = Boolean(logoImage);
    for (const id of ['brand-image', 'logo-preview']) {
      el(id).hidden = !logoImage;
      if (logoImage) el(id).src = logoImage;
      else el(id).removeAttribute('src');
    }
    el('remove-logo').hidden = !logoImage;
  }
  async function chooseLogo(file) {
    el('choose-logo').disabled = true;
    el('remove-logo').disabled = true;
    logoMessage('로고를 적용하고 있어요.');
    try {
      const prepared = await prepareImage(file, true);
      const data = cloud ? await cloud.upload(prepared.data) : prepared.data;
      localStorage.setItem(LOGO_KEY, data);
      logoImage = data;
      applyLogo();
      save();
      if (cloud) await cloud.flush();
      logoMessage('로고를 저장했어요.');
    } catch (error) { logoMessage(error.message || '로고를 저장하지 못했습니다.', true); }
    finally { el('choose-logo').disabled = false; el('remove-logo').disabled = false; el('logo-image-file').value = ''; }
  }
  function openEdit(target, property, title, label, trigger) {
    editTarget = { target, property };
    editTrigger = trigger;
    el('edit-title').textContent = title;
    el('edit-label').textContent = label;
    const brand = property === 'brandName';
    const input = el(brand ? 'edit-brand-value' : 'edit-value');
    el('edit-value').hidden = brand;
    el('edit-value').disabled = brand;
    el('edit-brand-value').hidden = !brand;
    el('edit-brand-value').disabled = !brand;
    el('edit-brand-help').hidden = !brand;
    el('edit-label').htmlFor = input.id;
    input.maxLength = property === 'text' ? 500 : 80;
    input.value = target[property];
    input.setCustomValidity('');
    el('edit-dialog').showModal();
    input.focus();
    input.select();
  }
  function editButton(label, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'edit-button';
    button.setAttribute('aria-label', label);
    button.innerHTML = pencil;
    button.addEventListener('click', () => handler(button));
    return button;
  }
  function currentProject() { return templateEditor?.draft || state.projects.find((project) => project.id === state.selectedProjectId && !project.archived); }
  function ensureSelectedProject() {
    if (!state.projects.some((project) => project.id === state.selectedProjectId && !project.archived)) state.selectedProjectId = state.projects.find((project) => !project.archived)?.id || null;
  }
  function setProjectArchived(project, archived) {
    const previous = { archived: project.archived, selected: state.selectedProjectId };
    project.archived = archived;
    if (!archived) state.selectedProjectId = project.id;
    ensureSelectedProject();
    if (!save()) { project.archived = previous.archived; state.selectedProjectId = previous.selected; return; }
    hideNameForm('section');
    hideNameForm('project');
    render();
    announce(`${project.name} 프로젝트를 ${archived ? '보관했어요.' : '다시 꺼냈어요.'}`);
    el('projects-heading').focus({ preventScroll: true });
  }
  function projectAction(label, icon, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'edit-button project-action';
    button.title = label;
    button.setAttribute('aria-label', label);
    button.innerHTML = icon;
    button.disabled = Boolean(templateEditor);
    button.addEventListener('click', handler);
    return button;
  }
  function saveContent() { return templateEditor ? true : save(); }
  function announce(message) { el('action-message').textContent = message; el('action-message').hidden = false; }
  function showStorageError() {
    el('save-message').textContent = '이 브라우저에서 저장할 수 없습니다. 브라우저 저장 공간과 사이트 데이터 설정을 확인해 주세요.';
    el('save-message').hidden = false;
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (cloud) cloud.queue(sharedPayload()); else el('save-message').hidden = true;
      return true;
    } catch { showStorageError(); return false; }
  }
  function hideNameForm(kind) {
    el(`${kind}-form`).hidden = true;
    el(`${kind}-form`).reset();
  }
  function openNameForm(kind) {
    hideNameForm(kind === 'project' ? 'section' : 'project');
    el(`${kind}-form`).hidden = false;
    el(`${kind}-name`).focus();
  }
  function openProjectForm(template = 'blank') {
    projectTemplate = template;
    const label = template === 'templateA' ? '제작 프로젝트 이름' : template === 'templateB' ? '이식 프로젝트 이름' : '프로젝트 이름';
    el('project-form-label').textContent = label;
    el('project-name').placeholder = label;
    openNameForm('project');
    el('project-form').scrollIntoView({ block: 'nearest' });
  }
  function renderProjects() {
    const list = el('project-list');
    list.replaceChildren();
    state.projects.filter((project) => !project.archived).forEach((project) => {
      const entry = document.createElement('div');
      entry.className = 'project-entry';
      entry.dataset.projectId = project.id;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'project-link';
      button.disabled = Boolean(templateEditor);
      if (project.id === state.selectedProjectId) button.setAttribute('aria-current', 'page');
      const symbol = document.createElement('span');
      symbol.className = 'project-symbol';
      symbol.textContent = '#';
      symbol.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.className = 'project-label';
      label.textContent = project.name;
      button.append(symbol, label);
      button.addEventListener('click', () => {
        state.selectedProjectId = project.id;
        hideNameForm('section');
        hideNameForm('project');
        save();
        render();
        showMobileScreen('tasks');
        if (!mobileMedia.matches) el('project-list').querySelector('[aria-current="page"]').focus({ preventScroll: true });
      });
      const actions = document.createElement('div');
      actions.className = 'project-actions';
      const remove = deleteButton(`${project.name} 프로젝트 삭제`, state.projects, project, 'project');
      remove.classList.add('project-action');
      remove.disabled = Boolean(templateEditor);
      actions.append(projectAction(`${project.name} 프로젝트 보관`, archiveIcon, () => setProjectArchived(project, true)), remove);
      entry.append(projectDragHandle(project, entry), button, actions);
      list.append(entry);
    });
    const archived = state.projects.filter((project) => project.archived);
    el('project-archive').hidden = !archived.length;
    el('project-archive-summary').textContent = `보관 프로젝트 (${archived.length})`;
    el('archived-project-list').replaceChildren(...archived.map((project) => {
      const entry = document.createElement('div');
      entry.className = 'project-entry';
      const label = document.createElement('span');
      label.className = 'archived-project-label';
      label.textContent = project.name;
      const actions = document.createElement('div');
      actions.className = 'project-actions';
      const remove = deleteButton(`${project.name} 프로젝트 삭제`, state.projects, project, 'project');
      remove.classList.add('project-action');
      remove.disabled = Boolean(templateEditor);
      actions.append(projectAction(`${project.name} 프로젝트 복원`, restoreIcon, () => setProjectArchived(project, false)), remove);
      entry.append(label, actions);
      return entry;
    }));
  }
  function projectMoveBlocked() {
    if (templateEditor || sectionDrag || document.querySelector('dialog[open]')) return true;
    const draft = [...document.querySelectorAll('.task-form, .name-form')].find((form) => !form.hidden && form.querySelector('input')?.value.trim());
    if (!draft) return false;
    draft.querySelector('input').focus();
    announce('입력 중인 내용을 저장하거나 취소한 뒤 프로젝트를 이동해 주세요.');
    return true;
  }
  function saveProjectOrder(ids) {
    const active = new Map(state.projects.filter((project) => !project.archived).map((project) => [project.id, project]));
    if (ids.length !== active.size || new Set(ids).size !== active.size || ids.some((id) => !active.has(id))) return;
    let index = 0;
    // Archived projects retain their slots and all project objects retain their contents.
    const ordered = state.projects.map((project) => project.archived ? project : active.get(ids[index++]));
    if (ordered.every((project, position) => project === state.projects[position])) return;
    state.projects = ordered;
    save();
  }
  function focusProjectHandle(id) {
    [...el('project-list').querySelectorAll('.project-drag-handle')].find((handle) => handle.dataset.projectId === id)?.focus({ preventScroll: true });
  }
  function moveDraggedProject() {
    if (!projectDrag) return;
    const { entry, y } = projectDrag;
    const list = el('project-list');
    const before = [...list.children].filter((element) => element !== entry).find((element) => {
      const rect = element.getBoundingClientRect();
      return y < rect.top + rect.height / 2;
    }) || null;
    if (entry.nextElementSibling !== before) list.insertBefore(entry, before);
  }
  function scrollDraggedProject() {
    if (!projectDrag) return;
    const sidebar = document.querySelector('.sidebar');
    const { y } = projectDrag;
    const rect = mobileMedia.matches ? { top: 0, bottom: window.innerHeight } : sidebar.getBoundingClientRect();
    const speed = y < rect.top + 60 ? -10 : y > rect.bottom - 60 ? 10 : 0;
    if (speed) {
      if (mobileMedia.matches) window.scrollBy(0, speed); else sidebar.scrollTop += speed;
      moveDraggedProject();
    }
    projectDrag.frame = window.requestAnimationFrame(scrollDraggedProject);
  }
  function finishProjectDrag(commit) {
    if (!projectDrag) return;
    const { project, entry, frame } = projectDrag;
    window.cancelAnimationFrame(frame);
    entry.classList.remove('is-dragging');
    document.body.classList.remove('project-dragging');
    if (commit) {
      saveProjectOrder([...el('project-list').children].map((element) => element.dataset.projectId));
      announce(`${project.name} 프로젝트 위치를 변경했어요.`);
    }
    projectDrag = null;
    renderProjects();
    focusProjectHandle(project.id);
  }
  function projectDragHandle(project, entry) {
    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'project-drag-handle';
    handle.dataset.projectId = project.id;
    handle.disabled = Boolean(templateEditor);
    handle.setAttribute('aria-label', `${project.name} 프로젝트 위치 변경`);
    handle.title = '드래그해서 이동 · 위/아래 키로 이동';
    handle.innerHTML = grip;
    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || projectDrag || projectMoveBlocked()) return;
      event.preventDefault();
      projectDrag = { project, entry, pointerId: event.pointerId, y: event.clientY, frame: 0 };
      entry.classList.add('is-dragging');
      document.body.classList.add('project-dragging');
      scrollDraggedProject();
    });
    handle.addEventListener('keydown', (event) => {
      if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      if (projectDrag || projectMoveBlocked()) return;
      const ids = state.projects.filter((item) => !item.archived).map((item) => item.id);
      const from = ids.indexOf(project.id);
      const to = from + (event.key === 'ArrowUp' ? -1 : 1);
      if (to < 0 || to >= ids.length) return;
      ids.splice(from, 1); ids.splice(to, 0, project.id);
      saveProjectOrder(ids);
      renderProjects();
      focusProjectHandle(project.id);
      announce(`${project.name} 프로젝트 위치를 변경했어요.`);
    });
    return handle;
  }
  function createTaskComposer(tasks, key, label, isChild = false) {
    const add = document.createElement('button');
    add.className = isChild ? 'subtask-add' : 'add-task';
    add.type = 'button';
    add.dataset.addFor = key;
    add.setAttribute('aria-label', `${label}에 ${isChild ? '하위 ' : ''}할 일 추가`);
    if (isChild) add.textContent = '+ 하위';
    else {
      const plus = document.createElement('span');
      plus.className = 'add-task-icon';
      plus.setAttribute('aria-hidden', 'true');
      plus.textContent = '+';
      add.append(plus, document.createTextNode('할 일 추가'));
    }
    const form = document.createElement('form');
    form.className = 'task-form';
    form.hidden = true;
    const input = document.createElement('input');
    input.placeholder = isChild ? '하위 할 일을 입력하세요' : '할 일을 입력하세요';
    input.setAttribute('aria-label', `${label} 새 ${isChild ? '하위 ' : ''}할 일`);
    input.required = true;
    input.maxLength = 500;
    input.autocomplete = 'off';
    const actions = document.createElement('div');
    actions.className = 'form-actions';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'button quiet';
    cancel.textContent = '취소';
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'button primary';
    submit.textContent = isChild ? '하위 할 일 추가' : '할 일 추가';
    submit.disabled = true;
    input.addEventListener('input', () => { submit.disabled = !input.value.trim(); });
    const close = (focus = true) => { form.hidden = true; add.hidden = false; form.reset(); submit.disabled = true; if (focus) add.focus(); };
    composers.set(form, { input, close, add });
    cancel.addEventListener('click', () => close());
    form.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
    add.addEventListener('click', () => { add.hidden = true; form.hidden = false; input.focus(); });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) { input.focus(); return; }
      tasks.push(makeTask(text));
      saveContent();
      renderSections();
      [...el('sections').querySelectorAll('[data-add-for]')].find((button) => button.dataset.addFor === key)?.click();
    });
    actions.append(cancel, submit);
    form.append(input, actions);
    return { add, form };
  }
  function archivedEntries(project) {
    const entries = [];
    function collect(tasks, section, parents) {
      tasks.forEach((task) => {
        if (task.done) entries.push({ task, section, parents });
        else collect(task.children, section, [...parents, task.text]);
      });
    }
    project.sections.forEach((section) => collect(section.tasks, section, []));
    return entries;
  }
  function renderArchive() {
    const host = el('all-archives');
    const old = host.querySelector('details');
    const key = state.selectedProjectId;
    if (old) { if (old.open) openArchives.add(old.dataset.archiveKey); else openArchives.delete(old.dataset.archiveKey); }
    host.replaceChildren();
    if (templateEditor || !currentProject()) return;
    const entries = archivedEntries(currentProject());
    const archive = document.createElement('details');
    archive.className = 'task-archive';
    archive.dataset.archiveKey = key;
    archive.open = openArchives.has(key);
    const summary = document.createElement('summary');
    summary.textContent = `모든 할 일 보관 (${entries.length})`;
    const note = document.createElement('p');
    note.className = 'archive-note';
    note.textContent = '체크를 해제하면 원래 섹션으로 돌아옵니다. 보관 후 30일이 지나면 자동 삭제됩니다.';
    archive.append(summary, note);
    currentProject().sections.forEach((section) => {
      const selected = entries.filter((entry) => entry.section === section);
      if (!selected.length) return;
      const group = document.createElement('div');
      group.className = 'archive-group';
      const heading = document.createElement('h3');
      heading.textContent = section.name;
      const list = document.createElement('ul');
      list.className = 'task-list';
      list.setAttribute('aria-label', `${section.name} 보관된 할 일`);
      selected.forEach(({ task, parents }) => {
        const item = renderTask(task, section, true);
        if (parents.length) {
          const path = document.createElement('p');
          path.className = 'archive-path';
          path.dataset.taskId = task.id;
          path.textContent = parents.join(' › ');
          item.prepend(path);
        }
        list.append(item);
      });
      group.append(heading, list);
      archive.append(group);
    });
    host.append(archive);
  }
  function findTaskList(tasks, id) {
    if (tasks.some((task) => task.id === id)) return tasks;
    for (const task of tasks) { const found = findTaskList(task.children, id); if (found) return found; }
    return null;
  }
  function deleteButton(label, list, target, property) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'edit-button delete-button';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.innerHTML = trash;
    button.addEventListener('click', () => {
      pendingDelete = { list, target, trigger: button, kind: property };
      el('delete-title').textContent = property === 'project' ? '프로젝트 삭제' : property === 'name' ? '섹션 삭제' : '할 일 삭제';
      el('delete-description').textContent = property === 'project'
        ? `“${target.name}” 프로젝트와 모든 섹션·할 일을 삭제할까요? 삭제하면 복원할 수 없습니다.`
        : property === 'name'
          ? `“${target.name}” 섹션과 안의 모든 할 일·하위 할 일(보관된 항목 포함)을 삭제할까요? 삭제하면 복원할 수 없습니다.`
          : `“${target.text}”${target.children.length ? ' 항목과 하위 할 일' : ' 항목'}을 삭제할까요?`;
      el('delete-dialog').showModal();
      el('cancel-delete').focus();
    });
    return button;
  }
  function startInlineTaskEdit(task, text) {
    if (inlineTaskEdit && !inlineTaskEdit.finish(true, false)) return;
    const input = document.createElement('textarea');
    input.className = 'task-inline-input';
    input.rows = 1;
    input.maxLength = 500;
    input.value = task.text;
    input.setAttribute('aria-label', '할 일 내용 수정');
    const row = text.closest('.task-row');
    let finished = false;
    const finish = (commit, focus) => {
      if (finished) return true;
      const value = input.value.trim();
      if (commit && value && value !== task.text) {
        const previous = task.text;
        task.text = value;
        if (!saveContent()) { task.text = previous; input.focus(); return false; }
      }
      finished = true;
      inlineTaskEdit = null;
      text.textContent = task.text;
      text.setAttribute('aria-label', `${task.text} 내용 수정`);
      row.querySelector('.task-checkbox')?.setAttribute('aria-label', `${task.text} 완료`);
      const pencilButton = row.querySelector('.edit-button:not(.delete-button)');
      pencilButton?.setAttribute('aria-label', `${task.text} 할 일 수정`);
      const deleteControl = row.querySelector('.delete-button');
      if (deleteControl) { deleteControl.setAttribute('aria-label', `${task.text} 할 일 삭제`); deleteControl.title = `${task.text} 할 일 삭제`; }
      const subtaskControl = row.querySelector('.subtask-add');
      if (subtaskControl) {
        subtaskControl.setAttribute('aria-label', `${task.text}에 하위 할 일 추가`);
        [...composers.values()].find(({ add }) => add === subtaskControl)?.input.setAttribute('aria-label', `${task.text} 새 하위 할 일`);
      }
      const archived = archivedEntries(currentProject());
      el('all-archives').querySelectorAll('.archive-path').forEach((path) => {
        const entry = archived.find(({ task }) => task.id === path.dataset.taskId);
        if (entry) path.textContent = entry.parents.join(' › ');
      });
      input.remove();
      text.hidden = false;
      if (focus) text.focus({ preventScroll: true });
      return true;
    };
    inlineTaskEdit = { input, finish };
    text.hidden = true;
    text.after(input);
    const resize = () => { input.style.height = 'auto'; input.style.height = `${Math.max(24, input.scrollHeight)}px`; };
    input.addEventListener('input', resize);
    input.addEventListener('blur', () => finish(true, false));
    input.addEventListener('keydown', (event) => {
      if (event.isComposing || event.keyCode === 229) return;
      if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); finish(true, true); }
      else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); finish(false, true); }
    });
    resize();
    input.focus();
    input.select();
  }
  function renderTask(task, section, inArchive = false) {
    const item = document.createElement('li');
    item.className = 'task-item';
    const row = document.createElement('div');
    row.className = 'task-row';
    const label = document.createElement('div');
    label.className = 'task-label';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.dataset.taskId = task.id;
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', `${task.text} 완료`);
    const text = document.createElement('button');
    text.type = 'button';
    text.className = 'task-text';
    text.dataset.taskId = task.id;
    text.textContent = task.text;
    text.setAttribute('aria-label', `${task.text} 내용 수정`);
    text.addEventListener('click', () => startInlineTaskEdit(task, text));
    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked;
      task.completedAt = task.done ? Date.now() : null;
      saveContent();
      renderSections();
      const target = !task.done && !inArchive ? [...el('sections').querySelectorAll('.task-checkbox')].find((input) => input.dataset.taskId === task.id) : null;
      const sectionElement = [...el('sections').children].find((element) => element.dataset.sectionId === section.id);
      (target || sectionElement?.querySelector('.add-task'))?.focus({ preventScroll: true });
    });
    if (!templateEditor) label.append(checkbox);
    else label.classList.add('template-task-label');
    label.append(text);
    row.append(label, editButton(`${task.text} 할 일 수정`, () => startInlineTaskEdit(task, text)));
    row.append(deleteButton(`${task.text} 할 일 삭제`, findTaskList(section.tasks, task.id), task, 'text'));
    item.append(row);
    if (task.children.length) {
      const children = document.createElement('ul');
      children.className = 'task-list subtask-list';
      children.setAttribute('aria-label', `${task.text} 하위 할 일`);
      const active = inArchive ? task.children : task.children.filter((child) => !child.done);
      children.append(...active.map((child) => renderTask(child, section, inArchive)));
      item.append(children);
    }
    if (!inArchive) {
      const composer = createTaskComposer(task.children, task.id, task.text, true);
      row.append(composer.add);
      composer.form.classList.add('subtask-form');
      item.append(composer.form);
    }
    return item;
  }
  function renderSection(section) {
    const container = document.createElement('section');
    container.className = 'section';
    container.dataset.sectionId = section.id;
    const heading = document.createElement('div');
    heading.className = 'section-heading';
    const title = document.createElement('h2');
    title.id = `section-${section.id}`;
    title.textContent = section.name;
    container.setAttribute('aria-labelledby', title.id);
    const body = document.createElement('div');
    body.className = 'section-body';
    body.id = `section-body-${section.id}`;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'section-toggle';
    toggle.setAttribute('aria-controls', body.id);
    toggle.innerHTML = '<svg width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M11.646 5.647a.5.5 0 0 1 .708.707l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 1 1 .708-.707L8 9.294z"/></svg>';
    const updateExpanded = () => {
      const expanded = !collapsedSections.has(section.id);
      body.hidden = !expanded;
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.setAttribute('aria-label', `${section.name} 섹션 ${expanded ? '접기' : '펼치기'}`);
    };
    toggle.addEventListener('click', () => {
      if (!collapsedSections.has(section.id)) {
        const draft = [...composers.entries()].find(([form, { input }]) => body.contains(form) && !form.hidden && input.value.trim());
        if (draft) { draft[1].input.focus(); announce('입력 중인 할 일을 추가하거나 취소한 뒤 섹션을 접어 주세요.'); return; }
        composers.forEach(({ close }, form) => { if (body.contains(form) && !form.hidden) close(false); });
        collapsedSections.add(section.id);
      } else collapsedSections.delete(section.id);
      updateExpanded();
      try { localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify([...collapsedSections])); } catch { /* Content saving is independent of view preferences. */ }
    });
    updateExpanded();
    heading.append(toggle, sectionDragHandle(section, container), title, editButton(`${section.name} 섹션 이름 수정`, (button) => openEdit(section, 'name', '섹션 이름 수정', '섹션 이름', button)));
    heading.append(deleteButton(`${section.name} 섹션 삭제`, currentProject().sections, section, 'name'));
    container.append(heading);
    const tasks = document.createElement('ul');
    tasks.className = 'task-list';
    tasks.setAttribute('aria-label', `${section.name} 할 일`);
    const active = section.tasks.filter((task) => !task.done);
    tasks.append(...active.map((task) => renderTask(task, section)));
    body.append(tasks);
    const composer = createTaskComposer(section.tasks, section.id, section.name);
    body.append(composer.add, composer.form);
    container.append(body);
    return container;
  }

  function moveDraggedSection() {
    if (!sectionDrag) return;
    const { container, y } = sectionDrag;
    const others = [...el('sections').children].filter((element) => element !== container);
    const before = others.find((element) => { const rect = element.getBoundingClientRect(); return y < rect.top + rect.height / 2; }) || null;
    if (container.nextElementSibling !== before) el('sections').insertBefore(container, before);
  }
  function dragScroll() {
    if (!sectionDrag) return;
    const { y } = sectionDrag;
    const speed = y < 70 ? -12 : y > window.innerHeight - 70 ? 12 : 0;
    if (speed) { window.scrollBy(0, speed); moveDraggedSection(); }
    sectionDrag.frame = window.requestAnimationFrame(dragScroll);
  }
  function finishSectionDrag(commit) {
    if (!sectionDrag) return;
    const { container, section, frame } = sectionDrag;
    window.cancelAnimationFrame(frame);
    container.classList.remove('is-dragging');
    document.body.classList.remove('section-dragging');
    if (commit) {
      const original = currentProject().sections;
      const ordered = [...el('sections').children].map((element) => original.find((item) => item.id === element.dataset.sectionId));
      // Keep the section objects and their tasks intact; only change the order.
      original.splice(0, original.length, ...ordered);
      saveContent();
      announce(`${section.name} 섹션 위치를 변경했어요.`);
    }
    sectionDrag = null;
    renderSections();
    [...el('sections').querySelectorAll('.section-drag-handle')].find((button) => button.dataset.sectionId === section.id)?.focus({ preventScroll: true });
  }
  function sectionDragHandle(section, container) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'section-drag-handle';
    button.dataset.sectionId = section.id;
    button.setAttribute('aria-label', `${section.name} 섹션 위치 변경`);
    button.title = '드래그해서 이동 · 위/아래 키로 이동';
    button.innerHTML = grip;
    const hasDraftInput = () => {
      const draft = [...composers.entries()].find(([form, { input }]) => !form.hidden && input.value.trim());
      if (!draft) return false;
      draft[1].input.focus();
      announce('입력 중인 할 일을 추가하거나 취소한 뒤 섹션을 이동해 주세요.');
      return true;
    };
    button.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || sectionDrag || projectDrag) return;
      event.preventDefault();
      if (hasDraftInput()) return;
      sectionDrag = { section, container, pointerId: event.pointerId, y: event.clientY, frame: 0 };
      container.classList.add('is-dragging');
      document.body.classList.add('section-dragging');
      dragScroll();
    });
    button.addEventListener('keydown', (event) => {
      if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      if (hasDraftInput()) return;
      const sections = currentProject().sections;
      const from = sections.indexOf(section);
      const to = from + (event.key === 'ArrowUp' ? -1 : 1);
      if (to < 0 || to >= sections.length) return;
      sections.splice(from, 1);
      sections.splice(to, 0, section);
      saveContent();
      renderSections();
      [...el('sections').querySelectorAll('.section-drag-handle')].find((handle) => handle.dataset.sectionId === section.id)?.focus();
      announce(`${section.name} 섹션 위치를 변경했어요.`);
    });
    return button;
  }
  function openTemplateEditor(key) {
    hideNameForm('project');
    hideNameForm('section');
    templateEditor = { key, draft: { name: key === 'templateA' ? '제작 템플릿' : '이식 템플릿', sections: cloneSections(state.templates[key].sections) } };
    render();
    showMobileScreen('tasks');
    window.scrollTo({ top: 0 });
  }
  function closeTemplateEditor() {
    templateEditor = null;
    hideNameForm('section');
    render();
    showMobileScreen('tasks');
  }

  function renderSections() {
    if (inlineTaskEdit && !inlineTaskEdit.finish(true, false)) return;
    composers.clear();
    el('sections').replaceChildren(...(currentProject()?.sections || []).map(renderSection));
    renderArchive();
  }
  function render() {
    renderProjects();
    const project = currentProject();
    el('project-title').textContent = project?.name || '내 프로젝트';
    const brand = el('brand-text');
    const lines = state.brandName.split(/\r\n?|\n/);
    brand.classList.toggle('has-line-break', lines.length > 1);
    if (lines.length > 1) brand.replaceChildren(...lines.slice(0, 2).map((line) => {
      const span = document.createElement('span');
      span.className = 'brand-name-line';
      span.textContent = line;
      return span;
    }));
    else brand.textContent = state.brandName;
    brand.title = state.brandName;
    document.title = state.brandName.replace(/\r\n?|\n/g, ' ') + ' · ' + (project?.name || '내 프로젝트');
    el('edit-project').setAttribute('aria-label', `${project?.name || ''} 프로젝트 이름 수정`);
    el('edit-project').hidden = Boolean(templateEditor) || !project;
    el('project-settings').hidden = Boolean(templateEditor) || !project;
    el('project-settings').setAttribute('aria-label', `${project?.name || ''} 프로젝트 배경 및 테마 설정`);
    el('new-section').hidden = !project;
    el('empty-projects').hidden = Boolean(project);
    el('template-editor-bar').hidden = !templateEditor;
    el('back-to-projects').disabled = Boolean(templateEditor);
    for (const id of ['new-project', 'add-project', 'add-templateA-project', 'add-templateB-project', 'edit-templateA-template', 'edit-templateB-template']) el(id).disabled = Boolean(templateEditor);
    renderSections();
    applyTheme();
    applySidebarImage();
  }
  el('new-project').addEventListener('click', () => openProjectForm());
  el('add-project').addEventListener('click', () => openProjectForm());
  el('add-templateA-project').addEventListener('click', () => openProjectForm('templateA'));
  el('add-templateB-project').addEventListener('click', () => openProjectForm('templateB'));
  el('edit-templateA-template').innerHTML = pencil;
  el('edit-templateB-template').innerHTML = pencil;
  el('edit-templateA-template').addEventListener('click', () => openTemplateEditor('templateA'));
  el('edit-templateB-template').addEventListener('click', () => openTemplateEditor('templateB'));
  el('cancel-template').addEventListener('click', closeTemplateEditor);
  el('save-template').addEventListener('click', () => {
    const { key, draft } = templateEditor;
    const previous = state.templates[key];
    state.templates[key] = { sections: cloneSections(draft.sections) };
    if (!save()) { state.templates[key] = previous; return; }
    closeTemplateEditor();
    announce(`${key === 'templateA' ? '제작' : '이식'} 템플릿을 저장했어요.`);
  });
  el('new-section').addEventListener('click', () => openNameForm('section'));
  el('back-to-projects').addEventListener('click', () => { hideNameForm('section'); showMobileScreen('projects'); });
  el('mobile-settings').addEventListener('click', () => el('open-settings').click());
  el('project-list-settings').addEventListener('click', () => el('open-settings').click());
  for (const id of ['open-settings', 'mobile-settings', 'project-list-settings', 'project-settings']) el(id).innerHTML = id === 'open-settings' ? brandGear : gear;
  document.addEventListener('pointerdown', (event) => {
    if (inlineTaskEdit && event.target !== inlineTaskEdit.input) inlineTaskEdit.finish(true, false);
  }, true);
  window.addEventListener('pagehide', () => inlineTaskEdit?.finish(true, false));
  document.addEventListener('click', (event) => {
    if (!event.target.isConnected) return;
    composers.forEach(({ input, close, add }, form) => {
      if (!form.hidden && !form.contains(event.target) && !add.contains(event.target) && !input.value.trim()) close(false);
    });
  });
  document.addEventListener('pointermove', (event) => {
    if (projectDrag?.pointerId === event.pointerId) {
      event.preventDefault();
      projectDrag.y = event.clientY;
      moveDraggedProject();
      return;
    }
    if (!sectionDrag || sectionDrag.pointerId !== event.pointerId) return;
    event.preventDefault();
    sectionDrag.y = event.clientY;
    moveDraggedSection();
  }, { passive: false });
  document.addEventListener('pointerup', (event) => { if (sectionDrag?.pointerId === event.pointerId) finishSectionDrag(true); if (projectDrag?.pointerId === event.pointerId) finishProjectDrag(true); });
  document.addEventListener('pointercancel', (event) => { if (sectionDrag?.pointerId === event.pointerId) finishSectionDrag(false); if (projectDrag?.pointerId === event.pointerId) finishProjectDrag(false); });
  window.addEventListener('blur', () => { finishSectionDrag(false); finishProjectDrag(false); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { finishSectionDrag(false); finishProjectDrag(false); } });
  mobileMedia.addEventListener('change', () => showMobileScreen('tasks', false));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshExpiredArchives(); });
  window.setInterval(refreshExpiredArchives, 60000);
  el('edit-project').innerHTML = pencil;
  el('edit-brand').innerHTML = brandPencil;
  el('edit-brand').addEventListener('click', () => openEdit(state, 'brandName', '로고 문구 수정', '로고 문구', el('edit-brand')));
  el('edit-project').addEventListener('click', () => openEdit(currentProject(), 'name', '프로젝트 이름 수정', '프로젝트 이름', el('edit-project')));
  el('cancel-edit').addEventListener('click', () => el('edit-dialog').close());
  el('edit-dialog').addEventListener('close', () => { editTarget = null; if (editTrigger?.isConnected) editTrigger.focus({ preventScroll: true }); });
  el('edit-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!editTarget) return;
    const { target, property } = editTarget;
    const input = el(property === 'brandName' ? 'edit-brand-value' : 'edit-value');
    const value = input.value.trim();
    if (property === 'brandName' && !validateBrandInput(input)) { input.reportValidity(); return; }
    if (!value) { input.focus(); return; }
    target[property] = value;
    if (target === state) save(); else saveContent();
    el('edit-dialog').close();
    render();
    if (property === 'brandName') { el('brand-name-setting').value = state.brandName; el('edit-brand').focus({ preventScroll: true }); return; }
    const label = property === 'text' ? `${value} 할 일 수정` : target === currentProject() ? `${value} 프로젝트 이름 수정` : `${value} 섹션 이름 수정`;
    [...document.querySelectorAll('.edit-button')].find((button) => button.getAttribute('aria-label') === label)?.focus({ preventScroll: true });
  });
  el('open-settings').addEventListener('click', () => openSettings());
  ['color-mode-light', 'color-mode-dark', 'color-mode-inherit'].forEach((id) => {
    el(id).addEventListener('change', (event) => {
      if (!event.target.checked) return;
      const target = settingsProject || state;
      const previous = target.colorMode;
      if (event.target.value === 'inherit') {
        if (!settingsProject) return;
        delete target.colorMode;
      } else target.colorMode = event.target.value;
      if (!save()) { if (previous === undefined) delete target.colorMode; else target.colorMode = previous; }
      refreshAppearance();
    });
  });
  el('project-settings').addEventListener('click', () => { if (!templateEditor && currentProject()) openSettings(currentProject()); });
  el('reset-project-appearance').addEventListener('click', async () => {
    if (!settingsProject || imageBusy || !storeAppearance(null, null)) return;
    refreshAppearance();
    if (cloud) { try { await cloud.flush(); } catch { imageMessage('초기화 요청을 보관했어요. 연결되면 서버에도 반영됩니다.', true); return; } }
    imageMessage('전체 기본 테마로 돌아왔어요.');
  });
  el('settings-dialog').addEventListener('cancel', (event) => { if (imageBusy) event.preventDefault(); });
  el('settings-dialog').addEventListener('close', () => {
    settingsProject = null;
    applyTheme();
    applySidebarImage();
  });
  el('cancel-delete').addEventListener('click', () => el('delete-dialog').close());
  el('delete-dialog').addEventListener('close', () => { pendingDelete?.trigger?.focus({ preventScroll: true }); pendingDelete = null; });
  el('confirm-delete').addEventListener('click', () => {
    if (!pendingDelete) return;
    const { list, target, kind } = pendingDelete;
    const selected = state.selectedProjectId;
    const index = list.indexOf(target);
    if (index !== -1) list.splice(index, 1);
    if (kind === 'project') ensureSelectedProject();
    if (!saveContent()) { if (index !== -1) list.splice(index, 0, target); state.selectedProjectId = selected; return; }
    if (kind === 'project') {
      try { localStorage.removeItem(PROJECT_IMAGE_PREFIX + target.id); } catch { /* The project is already removed; unused image data can be reclaimed later. */ }
      projectImages.delete(target.id);
    }
    el('delete-dialog').close();
    if (kind === 'project') {
      hideNameForm('section');
      hideNameForm('project');
      render();
      el('projects-heading').focus({ preventScroll: true });
    } else {
      renderSections();
      if (kind === 'name') {
        const next = el('sections').children[index] || el('sections').lastElementChild;
        (next?.querySelector('.section-toggle') || el('new-section')).focus({ preventScroll: true });
      }
    }
  });
  el('choose-logo').addEventListener('click', () => el('logo-image-file').click());
  el('logo-image-file').addEventListener('change', (event) => { if (event.target.files[0]) chooseLogo(event.target.files[0]); });
  el('remove-logo').addEventListener('click', async () => {
    try { localStorage.removeItem(LOGO_KEY); logoImage = null; applyLogo(); save(); if (cloud) await cloud.flush(); logoMessage('기본 로고로 돌아왔어요.'); el('choose-logo').focus(); }
    catch { logoMessage('로고를 제거하지 못했습니다. 다시 시도해 주세요.', true); }
  });
  function validateBrandInput(input) {
    input.setCustomValidity(input.value.split(/\r\n?|\n/).length > 2 ? '로고 문구는 두 줄까지 입력할 수 있어요.' : '');
    return input.checkValidity();
  }
  for (const id of ['edit-brand-value', 'brand-name-setting']) {
    const input = el(id);
    input.addEventListener('input', () => validateBrandInput(input));
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' || event.isComposing || event.keyCode === 229) return;
      const remaining = input.value.slice(0, input.selectionStart) + input.value.slice(input.selectionEnd);
      if (remaining.includes('\n')) {
        event.preventDefault();
        announce('로고 문구는 두 줄까지 입력할 수 있어요.');
      }
    });
  }
  el('save-brand-name').addEventListener('click', () => {
    const input = el('brand-name-setting');
    if (!validateBrandInput(input)) { input.reportValidity(); return; }
    const value = input.value.trim();
    if (!value) { el('brand-name-setting').focus(); return; }
    state.brandName = value;
    if (save()) { render(); logoMessage('로고 문구를 저장했어요.'); }
  });
  ['background-color-mode', 'background-image-mode'].forEach((id) => {
    el(id).addEventListener('change', (event) => {
      const image = settingsImage();
      if (!event.target.checked || event.target.value === 'image' && !image) return;
      const next = { theme: { ...settingsAppearance().theme }, backgroundMode: event.target.value };
      if (storeAppearance(next, image)) refreshAppearance();
    });
  });
  el('choose-image').addEventListener('click', () => el('sidebar-image-file').click());
  el('sidebar-image-file').addEventListener('change', (event) => { if (event.target.files[0]) chooseSidebarImage(event.target.files[0]); });
  el('remove-image').addEventListener('click', removeSidebarImage);
  el('close-settings').addEventListener('click', () => { if (!imageBusy) el('settings-dialog').close(); });
  [['gradient-start', 'start'], ['gradient-end', 'end'], ['accent-color', 'accent']].forEach(([id, key]) => {
    el(id).addEventListener('input', (event) => {
      if (!validColor(event.target.value)) return;
      const next = { theme: { ...settingsAppearance().theme, [key]: event.target.value }, backgroundMode: settingsAppearance().backgroundMode };
      if (storeAppearance(next, settingsImage())) refreshAppearance();
    });
  });
  ['project', 'section'].forEach((kind) => {
    el(`cancel-${kind}`).addEventListener('click', () => { hideNameForm(kind); el(`new-${kind}`).focus(); });
    el(`${kind}-form`).addEventListener('keydown', (event) => { if (event.key === 'Escape') { hideNameForm(kind); el(`new-${kind}`).focus(); } });
    el(`${kind}-form`).addEventListener('submit', (event) => {
      event.preventDefault();
      const enteredName = el(`${kind}-name`).value.trim();
      const name = enteredName || (kind === 'project' && projectTemplate !== 'blank' ? projectTemplate === 'templateA' ? '제작 프로젝트' : '이식 프로젝트' : '');
      if (!name) { el(`${kind}-name`).focus(); return; }
      if (kind === 'project') {
        const project = makeProject(name, projectTemplate);
        state.projects.push(project);
        state.selectedProjectId = project.id;
        hideNameForm('section');
      } else currentProject().sections.push(makeSection(name));
      hideNameForm(kind);
      saveContent();
      render();
      if (kind === 'project') { showMobileScreen('tasks'); if (!mobileMedia.matches) el('new-project').focus(); }
      else el('sections').lastElementChild.querySelector('.add-task').focus();
    });
  });
  renderThemePresets();
  applyTheme();
  applySidebarImage();
  applyLogo();
  const pruned = pruneArchivedTasks();
  if (needsMigration || pruned) save();
  render();
  showMobileScreen('tasks', false);
  if (storageError) showStorageError();
  function sharedPayload() {
    const shared = structuredClone(state);
    delete shared.selectedProjectId;
    const images = {};
    if (sidebarImage) images.global = sidebarImage;
    state.projects.forEach((project) => { if (project.appearance && imageFor(project)) images[project.id] = imageFor(project); });
    return structuredClone({ state: shared, images, logo: logoImage });
  }
  function applySharedPayload(payload) {
    const selected = state.selectedProjectId;
    const previousProjects = state.projects.map((project) => project.id);
    state = structuredClone(payload.state);
    state.selectedProjectId = selected;
    ensureSelectedProject();
    sidebarImage = payload.images.global || null;
    logoImage = payload.logo;
    projectImages.clear();
    state.projects.forEach((project) => projectImages.set(project.id, payload.images[project.id] || null));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (sidebarImage) localStorage.setItem(IMAGE_KEY, JSON.stringify(sidebarImage)); else localStorage.removeItem(IMAGE_KEY);
      if (logoImage) localStorage.setItem(LOGO_KEY, logoImage); else localStorage.removeItem(LOGO_KEY);
      for (const id of new Set([...previousProjects, ...state.projects.map((project) => project.id)])) {
        if (payload.images[id]) localStorage.setItem(PROJECT_IMAGE_PREFIX + id, JSON.stringify(payload.images[id])); else localStorage.removeItem(PROJECT_IMAGE_PREFIX + id);
      }
    } catch { /* Server data is authoritative; a full local cache must not stop syncing. */ }
    render();
    applyLogo();
  }
  if (CLOUD_ENABLED) {
    const shell = document.querySelector('.app-shell');
    shell.inert = true;
    cloud = new window.TodoCloud.CloudSync({
      getPayload: sharedPayload,
      applyPayload: applySharedPayload,
      canApply: () => !templateEditor && !inlineTaskEdit && !sectionDrag && !projectDrag && !imageBusy && !document.querySelector('dialog[open]') && ![...document.querySelectorAll('.task-form, .name-form')].some((form) => !form.hidden),
      status: (message, error = false) => { el('save-message').textContent = message; el('save-message').hidden = false; el('save-message').classList.toggle('is-error', error); }
    });
    cloud.start().finally(() => { shell.inert = false; });
  }
})();
