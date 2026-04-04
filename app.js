const SUPABASE_URL = 'https://wdtmbjfwmpvbwenemakb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkdG1iamZ3bXB2YndlbmVtYWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyODg2NTcsImV4cCI6MjA5MDg2NDY1N30.rgQGHOrY4Kc1wmWigMq0QUCBNT7JD3qOi_gYa3Q_pmk';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const SITE_URL = window.location.origin + window.location.pathname.replace(/[^/]+$/, '');

const BRANDS = [
  ['audi','Audi','foto/audi_logo.png'], ['bmw','BMW','foto/bmw_logo.png'], ['byd','BYD','foto/byd_logo.png'],
  ['changan','Changan','foto/changan_logo.png'], ['chery','Chery','foto/chery_logo.png'], ['chevrolet','Chevrolet','foto/chevrolet_logo.png'],
  ['ford','Ford','foto/ford_logo.png'], ['hyundai','Hyundai','foto/hyundai_logo.png'], ['infiniti','Infiniti','foto/infiniti_logo.png'],
  ['jeep','Jeep','foto/jeep_logo.png'], ['khazar','Khazar','foto/khazar_logo.png'], ['kia','KIA','foto/kia_logo.png'],
  ['lada-vaz','Lada / VAZ','foto/lada_vaz_logo.png'], ['land-rover','Land Rover','foto/land_Rover_logo.png'], ['lexus','Lexus','foto/lexus_logo.png'],
  ['mazda','Mazda','foto/mazda_logo.png'], ['mercedes','Mercedes-Benz','foto/mercedes_logo.png'], ['mitsubishi','Mitsubishi','foto/mitsubishi_logo.png'],
  ['nissan','Nissan','foto/nissan_logo.png'], ['opel','Opel','foto/opel_logo.png'], ['porsche','Porsche','foto/porsche_logo.png'],
  ['renault','Renault','foto/renault_logo.png'], ['toyota','Toyota','foto/toyota_logo.png'], ['volkswagen','Volkswagen','foto/volkswagen_logo.png']
].map(([slug, name, logo_url]) => ({ slug, name, logo_url }));

const state = {
  page: document.body.dataset.page,
  session: null,
  user: null,
  profile: null,
  favorites: new Set(),
  listings: [],
  models: [],
  filters: {
    brand: '', model: '', search: '', currency: '', condition: '', color: '', fuel: '', priceMin: '', priceMax: '',
    sort: 'newest', credit: false, barter: false
  },
  chat: { conversations: [], activeId: null, activeMessages: [] },
  adminChat: { conversations: [], activeId: null, activeMessages: [] }
};

function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }
function params() { return new URLSearchParams(window.location.search); }
function escapeHtml(str='') { return str.replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
function formatPrice(value, currency='AZN') { return new Intl.NumberFormat('az-AZ').format(Number(value || 0)) + ' ' + currency; }
function formatDate(dt) { return new Date(dt).toLocaleString('az-AZ', { dateStyle: 'short', timeStyle: 'short' }); }
function colorToSwatch(name='') {
  const map = { ağ:'#f3f4f6', qara:'#111827', qirmizi:'#ef4444', qırmızı:'#ef4444', mavi:'#2563eb', göy:'#2563eb', gumusu:'#9ca3af', gümüşü:'#9ca3af', boz:'#6b7280', yaşıl:'#16a34a', yasil:'#16a34a', sarı:'#facc15', sari:'#facc15', narıncı:'#f97316', narinci:'#f97316', bej:'#d6b38a', qəhvəyi:'#7c4a21', qehveyi:'#7c4a21' };
  return map[name.toLowerCase()] || '#888';
}
function notice(text, ok = true) {
  const el = document.createElement('div');
  el.className = 'notice';
  el.textContent = text;
  el.style.borderColor = ok ? 'rgba(15,163,74,0.45)' : 'rgba(225,29,72,0.45)';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  state.session = session;
  state.user = session?.user || null;
  if (state.user) await loadProfile();
  updateAuthUI();
  await ensureBrandSeedVisuals();
  bindGlobalUnreadPoll();
  await routeInit();
}

async function loadProfile() {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', state.user.id).maybeSingle();
  if (!error) state.profile = data;
}

function updateAuthUI() {
  const topLoginBtn = qs('#topLoginBtn');
  if (topLoginBtn) {
    topLoginBtn.href = state.user ? 'profile.html' : 'login.html';
    topLoginBtn.innerHTML = state.user ? '<i class="fa-solid fa-user-check"></i>' : '<i class="fa-regular fa-user"></i>';
  }
  const adminShortcut = qs('#adminShortcut');
  if (adminShortcut && state.profile?.role === 'admin') adminShortcut.classList.remove('hidden');
}

async function ensureBrandSeedVisuals() {
  if (state.page !== 'home' && state.page !== 'admin') return;
  try {
    const { data } = await supabase.from('car_brands').select('slug,name,logo_url').order('sort_order');
    if (data?.length) return;
  } catch (_) {}
}

async function routeInit() {
  switch (state.page) {
    case 'home': return initHome();
    case 'login': return initLogin();
    case 'profile': return initProfile();
    case 'favorites': return initFavorites();
    case 'detail': return initDetail();
    case 'messages': return initMessages(false);
    case 'admin': return initAdmin();
  }
}

async function fetchBrands() {
  const { data } = await supabase.from('car_brands').select('*').order('sort_order', { ascending: true });
  return data?.length ? data : BRANDS;
}

async function fetchModels(brandSlug='') {
  let query = supabase.from('car_models').select('*').order('name', { ascending: true });
  if (brandSlug) query = query.eq('brand_slug', brandSlug);
  const { data } = await query;
  state.models = data || [];
  return state.models;
}

async function fetchFavorites() {
  if (!state.user) { state.favorites = new Set(); return; }
  const { data } = await supabase.from('favorites').select('listing_id').eq('user_id', state.user.id);
  state.favorites = new Set((data || []).map(x => x.listing_id));
}

function createBrandRail(brands) {
  const rail = qs('#brandRail');
  if (!rail) return;
  rail.innerHTML = brands.map(b => `
    <button class="brand-card ${state.filters.brand === b.slug ? 'active' : ''}" data-brand="${b.slug}">
      <img src="${b.logo_url}" alt="${escapeHtml(b.name)}" loading="lazy">
      <span>${escapeHtml(b.name)}</span>
    </button>`).join('');
  qsa('.brand-card', rail).forEach(btn => btn.addEventListener('click', async () => {
    state.filters.brand = btn.dataset.brand === state.filters.brand ? '' : btn.dataset.brand;
    state.filters.model = '';
    await renderModelFilter();
    createBrandRail(brands);
    await loadListings();
  }));
}

async function initHome() {
  const brands = await fetchBrands();
  createBrandRail(brands);
  fillBrandSelect(qs('#brandFilter'), brands, 'Hamısı');
  await fetchModels('');
  await renderModelFilter();
  await fetchFavorites();
  fillFilterOptions();
  bindHomeFilters();
  await loadListings();
}

function fillBrandSelect(select, brands, firstLabel='Seçin') {
  if (!select) return;
  select.innerHTML = `<option value="">${firstLabel}</option>` + brands.map(b => `<option value="${b.slug}">${b.name}</option>`).join('');
  select.value = state.filters.brand || '';
}

async function renderModelFilter() {
  const modelSelect = qs('#modelFilter') || qs('#adminBrandSelect');
  if (qs('#modelFilter')) {
    const models = await fetchModels(state.filters.brand);
    const s = qs('#modelFilter');
    s.innerHTML = `<option value="">Hamısı</option>` + models.map(m => `<option value="${escapeHtml(m.name)}">${escapeHtml(m.name)}</option>`).join('');
    s.value = state.filters.model || '';
  }
}

function fillFilterOptions() {
  const colorSelect = qs('#colorFilter');
  const fuelSelect = qs('#fuelFilter');
  if (colorSelect) colorSelect.innerHTML = ['Hamısı','Ağ','Qara','Qırmızı','Mavi','Gümüşü','Boz','Yaşıl','Sarı','Narıncı','Bej'].map(v => `<option value="${v === 'Hamısı' ? '' : v}">${v}</option>`).join('');
  if (fuelSelect) fuelSelect.innerHTML = ['Hamısı','Benzin','Dizel','Hibrid','Elektrik','Qaz'].map(v => `<option value="${v === 'Hamısı' ? '' : v}">${v}</option>`).join('');
}

function bindHomeFilters() {
  const map = [
    ['#searchInput', 'search'], ['#brandFilter', 'brand'], ['#modelFilter', 'model'], ['#currencyFilter', 'currency'], ['#conditionFilter', 'condition'],
    ['#colorFilter', 'color'], ['#fuelFilter', 'fuel'], ['#priceMinFilter', 'priceMin'], ['#priceMaxFilter', 'priceMax'], ['#sortFilter', 'sort']
  ];
  map.forEach(([sel, key]) => {
    const el = qs(sel); if (!el) return;
    el.addEventListener('input', async () => {
      state.filters[key] = el.value.trim();
      if (key === 'brand') {
        state.filters.model = '';
        createBrandRail(await fetchBrands());
        await renderModelFilter();
      }
      await loadListings();
    });
    el.addEventListener('change', async () => {
      state.filters[key] = el.value.trim();
      if (key === 'brand') {
        state.filters.model = '';
        createBrandRail(await fetchBrands());
        await renderModelFilter();
      }
      await loadListings();
    });
  });
  ['credit','barter'].forEach(key => {
    const btn = qs(`#${key}FilterBtn`);
    if (!btn) return;
    btn.addEventListener('click', async () => {
      state.filters[key] = !state.filters[key];
      btn.dataset.active = String(state.filters[key]);
      await loadListings();
    });
  });
  qs('#resetFiltersBtn')?.addEventListener('click', async () => {
    state.filters = { brand:'', model:'', search:'', currency:'', condition:'', color:'', fuel:'', priceMin:'', priceMax:'', sort:'newest', credit:false, barter:false };
    qsa('input,select').forEach(el => { if (el.id && el.type !== 'hidden') el.value = ''; });
    qs('#sortFilter') && (qs('#sortFilter').value = 'newest');
    qs('#creditFilterBtn').dataset.active = 'false';
    qs('#barterFilterBtn').dataset.active = 'false';
    createBrandRail(await fetchBrands());
    await renderModelFilter();
    fillBrandSelect(qs('#brandFilter'), await fetchBrands(), 'Hamısı');
    fillFilterOptions();
    await loadListings();
  });
}

async function loadListings(opts = {}) {
  let query = supabase.from('listings').select('*, listing_images(image_url, sort_order)').eq('status', 'active');
  const f = state.filters;
  if (opts.ids?.length) query = supabase.from('listings').select('*, listing_images(image_url, sort_order)').in('id', opts.ids).eq('status', 'active');
  else {
    if (f.brand) query = query.eq('brand_slug', f.brand);
    if (f.model) query = query.ilike('model', f.model);
    if (f.currency) query = query.eq('currency', f.currency);
    if (f.condition) query = query.eq('condition', f.condition);
    if (f.color) query = query.ilike('color', f.color);
    if (f.fuel) query = query.ilike('fuel_type', f.fuel);
    if (f.priceMin) query = query.gte('price', Number(f.priceMin));
    if (f.priceMax) query = query.lte('price', Number(f.priceMax));
    if (f.credit) query = query.eq('is_credit', true);
    if (f.barter) query = query.eq('is_barter', true);
    if (f.search) query = query.or(`model.ilike.%${f.search}%,description.ilike.%${f.search}%,note.ilike.%${f.search}%`);
  }
  switch (f.sort) {
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'mileage_asc': query = query.order('mileage', { ascending: true }); break;
    case 'year_desc': query = query.order('year', { ascending: false }); break;
    default: query = query.order('created_at', { ascending: false });
  }
  const { data, error } = await query;
  if (error) {
    renderListings([], qs('#listingGrid') || qs('#favoritesGrid'));
    qs('#resultsInfo') && (qs('#resultsInfo').textContent = 'Xəta baş verdi');
    return;
  }
  state.listings = data || [];
  if (opts.target) return renderListings(state.listings, opts.target, opts.emptyTarget);
  renderListings(state.listings, qs('#listingGrid'), qs('#emptyState'));
  qs('#resultsInfo') && (qs('#resultsInfo').textContent = `${state.listings.length} elan tapıldı`);
}

function normalizeImages(listing) {
  return (listing.listing_images || []).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map(x => x.image_url).filter(Boolean);
}

function renderListings(listings, target, emptyTarget) {
  if (!target) return;
  target.innerHTML = listings.map(cardHtml).join('');
  if (emptyTarget) emptyTarget.classList.toggle('hidden', listings.length > 0);
  bindListingCards(target, listings);
}

function cardHtml(item) {
  const images = normalizeImages(item);
  const image = images[0] || 'https://placehold.co/800x600/png?text=No+Image';
  const brandName = BRANDS.find(b => b.slug === item.brand_slug)?.name || item.brand_slug || '';
  return `
    <article class="listing-card" data-id="${item.id}">
      <div class="card-media" data-images='${JSON.stringify(images)}'>
        <img src="${image}" alt="${escapeHtml(brandName + ' ' + item.model)}" class="slide-image">
        <button class="favorite-btn ${state.favorites.has(item.id) ? 'active' : ''}" data-favorite="${item.id}"><i class="fa-${state.favorites.has(item.id) ? 'solid' : 'regular'} fa-heart"></i></button>
      </div>
      <div class="card-body">
        <div class="price-row">
          <div class="price-tag">${formatPrice(item.price, item.currency)}</div>
          <span class="status-pill">${item.condition || 'Elan'}</span>
        </div>
        <div class="badge-row">
          ${item.is_credit ? '<span class="mini-badge credit"><i class="fa-solid fa-wallet"></i>Kredit</span>' : ''}
          ${item.is_barter ? '<span class="mini-badge barter"><i class="fa-solid fa-right-left"></i>Barter</span>' : ''}
        </div>
        <h3 class="card-title">${escapeHtml(brandName)} ${escapeHtml(item.model || '')}</h3>
        <p class="card-sub">${item.year || '-'} • ${escapeHtml(item.engine || '-')} • ${new Intl.NumberFormat('az-AZ').format(item.mileage || 0)} km</p>
        <div class="card-actions">
          <a href="elan.html?id=${item.id}" class="secondary-btn">Ətraflı</a>
          <button class="primary-btn" data-chat-open="${item.id}">Mesaj</button>
        </div>
      </div>
    </article>`;
}

function bindListingCards(root, listings) {
  qsa('[data-favorite]', root).forEach(btn => btn.addEventListener('click', async (e) => {
    e.preventDefault(); e.stopPropagation();
    await toggleFavorite(btn.dataset.favorite);
    btn.classList.toggle('active', state.favorites.has(btn.dataset.favorite));
    btn.innerHTML = `<i class="fa-${state.favorites.has(btn.dataset.favorite) ? 'solid' : 'regular'} fa-heart"></i>`;
  }));
  qsa('[data-chat-open]', root).forEach(btn => btn.addEventListener('click', async () => {
    if (!state.user) return notice('Mesaj yazmaq üçün daxil olun.', false);
    window.location.href = `messages.html?listing=${btn.dataset.chatOpen}`;
  }));
  qsa('.card-media', root).forEach((box) => {
    const images = JSON.parse(box.dataset.images || '[]');
    if (images.length <= 1) return;
    let idx = 0; const img = qs('.slide-image', box);
    setInterval(() => {
      idx = (idx + 1) % images.length;
      img.style.opacity = '.35';
      setTimeout(() => { img.src = images[idx]; img.style.opacity = '1'; }, 180);
    }, 2000);
  });
}

async function toggleFavorite(listingId) {
  if (!state.user) return notice('Sevimlilərə əlavə etmək üçün daxil olun.', false);
  if (state.favorites.has(listingId)) {
    await supabase.from('favorites').delete().eq('user_id', state.user.id).eq('listing_id', listingId);
    state.favorites.delete(listingId);
  } else {
    await supabase.from('favorites').insert({ user_id: state.user.id, listing_id: listingId });
    state.favorites.add(listingId);
  }
  if (state.page === 'favorites') initFavorites();
}

async function initFavorites() {
  if (!state.user) {
    qs('#favoritesEmpty').classList.remove('hidden');
    qs('#favoritesEmpty').innerHTML = '<i class="fa-regular fa-user"></i><h3>Daxil olun</h3><p>Sevimliləri görmək üçün giriş edin.</p>';
    return;
  }
  await fetchFavorites();
  const ids = [...state.favorites];
  if (!ids.length) return renderListings([], qs('#favoritesGrid'), qs('#favoritesEmpty'));
  await loadListings({ ids, target: qs('#favoritesGrid'), emptyTarget: qs('#favoritesEmpty') });
}

function initLogin() {
  qsa('.auth-tab').forEach(btn => btn.addEventListener('click', () => {
    qsa('.auth-tab').forEach(x => x.classList.remove('active')); btn.classList.add('active');
    qsa('.auth-pane').forEach(p => p.classList.add('hidden')); qs('#' + btn.dataset.target).classList.remove('hidden');
  }));
  qs('#signinForm')?.addEventListener('submit', signIn);
  qs('#signupForm')?.addEventListener('submit', signUp);
  qs('#forgotForm')?.addEventListener('submit', forgotPassword);
  if (state.user) window.location.href = 'profile.html';
}

async function signIn(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const { error } = await supabase.auth.signInWithPassword({ email: fd.get('email'), password: fd.get('password') });
  if (error) return notice(error.message, false);
  notice('Uğurla daxil oldunuz');
  setTimeout(() => window.location.href = 'profile.html', 500);
}

async function signUp(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const email = fd.get('email');
  const password = fd.get('password');
  const full_name = fd.get('full_name');
  const phone = fd.get('phone');
  const address = fd.get('address');
  const { error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name, phone, address }, emailRedirectTo: SITE_URL + 'profile.html' }
  });
  if (error) return notice(error.message, false);
  notice('Qeydiyyat tamamlandı. Email təsdiqi tələb oluna bilər.');
  e.target.reset();
}

async function forgotPassword(e) {
  e.preventDefault();
  const email = new FormData(e.target).get('email');
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: SITE_URL + 'login.html' });
  if (error) return notice(error.message, false);
  notice('Şifrə sıfırlama linki göndərildi.');
}

async function initProfile() {
  if (!state.user) return window.location.href = 'login.html';
  await loadProfile();
  const form = qs('#profileForm');
  form.full_name.value = state.profile?.full_name || '';
  form.phone.value = state.profile?.phone || '';
  form.email.value = state.user.email || '';
  form.address.value = state.profile?.address || '';
  form.avatar_url.value = state.profile?.avatar_url || '';
  qs('#profileTitle').textContent = state.profile?.full_name || 'Profil';
  if (state.profile?.avatar_url) qs('#profileAvatarPreview').src = state.profile.avatar_url;
  form.avatar_url.addEventListener('input', () => { if (form.avatar_url.value) qs('#profileAvatarPreview').src = form.avatar_url.value; });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      id: state.user.id,
      full_name: fd.get('full_name'),
      phone: fd.get('phone'),
      address: fd.get('address'),
      avatar_url: fd.get('avatar_url'),
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('profiles').upsert(payload);
    if (error) return notice(error.message, false);
    notice('Profil yeniləndi');
  });
  qs('#profileResetPasswordBtn')?.addEventListener('click', async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(state.user.email, { redirectTo: SITE_URL + 'login.html' });
    if (error) return notice(error.message, false);
    notice('Sıfırlama linki emailinizə göndərildi.');
  });
  qs('#logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
  });
}

async function initDetail() {
  await fetchFavorites();
  const id = params().get('id');
  const wrap = qs('#detailContainer');
  if (!id) return wrap.innerHTML = '<div class="loading-card">Elan tapılmadı.</div>';
  const { data, error } = await supabase.from('listings').select('*, listing_images(image_url, sort_order)').eq('id', id).maybeSingle();
  if (error || !data) return wrap.innerHTML = '<div class="loading-card">Elan tapılmadı.</div>';
  const images = normalizeImages(data);
  const brandName = BRANDS.find(b => b.slug === data.brand_slug)?.name || data.brand_slug || '';
  wrap.innerHTML = `
    <div class="detail-card">
      <img src="${images[0] || 'https://placehold.co/1000x750/png?text=No+Image'}" class="detail-gallery-main" id="detailMainImage">
      <div class="detail-thumbs">${images.map((img, i) => `<img src="${img}" class="${i===0?'active':''}" data-thumb="${img}">`).join('')}</div>
    </div>
    <div class="detail-card">
      <div class="price-row"><div class="price-tag">${formatPrice(data.price, data.currency)}</div><span class="status-pill">${data.condition || 'Elan'}</span></div>
      <h1 class="detail-title">${escapeHtml(brandName)} ${escapeHtml(data.model || '')}</h1>
      <div class="badge-row">
        <span class="color-pill" style="--swatch:${colorToSwatch(data.color || '')}">${escapeHtml(data.color || 'Rəng')}</span>
        ${data.is_credit ? '<span class="mini-badge credit"><i class="fa-solid fa-wallet"></i>Kredit mümkündür</span>' : ''}
        ${data.is_barter ? '<span class="mini-badge barter"><i class="fa-solid fa-right-left"></i>Barter mümkündür</span>' : ''}
      </div>
      <div class="detail-meta">
        <div class="meta-box"><strong>Buraxılış ili</strong>${data.year || '-'}</div>
        <div class="meta-box"><strong>Mator</strong>${escapeHtml(data.engine || '-')}</div>
        <div class="meta-box"><strong>Yürüş</strong>${new Intl.NumberFormat('az-AZ').format(data.mileage || 0)} km</div>
        <div class="meta-box"><strong>Yanacaq</strong>${escapeHtml(data.fuel_type || '-')}</div>
        <div class="meta-box"><strong>Sürətlər qutusu</strong>${escapeHtml(data.transmission || '-')}</div>
        <div class="meta-box"><strong>Ünvan</strong>${escapeHtml(data.location || 'Bərdə şəhəri')}</div>
      </div>
      <div class="danger-box"><h3>Açıqlama</h3><p class="muted">${escapeHtml(data.description || 'Açıqlama əlavə edilməyib.')}</p></div>
      <div class="danger-box"><h3>ELİT AVTO 777 qeydi</h3><p class="muted">${escapeHtml(data.note || 'Rəşad bəy ilə əlaqə saxlaya bilərsiniz.')}</p></div>
      <div class="detail-actions">
        <button class="primary-btn" id="detailMessageBtn">Mesaj yaz</button>
        <button class="ghost-btn" id="detailFavBtn"><i class="fa-${state.favorites.has(data.id) ? 'solid' : 'regular'} fa-heart"></i> Sevimli</button>
      </div>
    </div>`;
  qsa('[data-thumb]').forEach(img => img.addEventListener('click', () => {
    qs('#detailMainImage').src = img.dataset.thumb;
    qsa('[data-thumb]').forEach(x => x.classList.remove('active')); img.classList.add('active');
  }));
  qs('#detailFavBtn').addEventListener('click', async () => {
    await toggleFavorite(data.id);
    qs('#detailFavBtn').innerHTML = `<i class="fa-${state.favorites.has(data.id) ? 'solid' : 'regular'} fa-heart"></i> Sevimli`;
  });
  qs('#detailMessageBtn').addEventListener('click', () => {
    if (!state.user) return notice('Mesaj yazmaq üçün daxil olun.', false);
    window.location.href = `messages.html?listing=${data.id}`;
  });
}

async function initMessages(isAdmin) {
  if (!state.user) return window.location.href = 'login.html';
  if (!isAdmin) {
    await loadConversations(false);
    const listingId = params().get('listing');
    if (listingId) await ensureConversationForListing(listingId);
    bindChatUI(false);
  }
}

async function ensureConversationForListing(listingId) {
  const { data: existing } = await supabase.from('conversations').select('*').eq('user_id', state.user.id).eq('listing_id', listingId).maybeSingle();
  if (existing) {
    state.chat.activeId = existing.id;
    await loadConversationMessages(existing.id, false);
    return;
  }
  const { data, error } = await supabase.from('conversations').insert({ user_id: state.user.id, listing_id: listingId, subject: 'Elan üzrə sual' }).select().single();
  if (!error && data) {
    state.chat.activeId = data.id;
    await loadConversations(false);
    await loadConversationMessages(data.id, false);
  }
}

async function loadConversations(adminMode) {
  const listEl = qs(adminMode ? '#adminConversationList' : '#conversationList');
  const stateObj = adminMode ? state.adminChat : state.chat;
  let query = supabase.from('conversations').select('*, listings(model,brand_slug), profiles!conversations_user_id_fkey(full_name)');
  query = adminMode ? query.order('last_message_at', { ascending: false }) : query.eq('user_id', state.user.id).order('last_message_at', { ascending: false });
  const { data, error } = await query;
  if (error) return;
  stateObj.conversations = data || [];
  if (!stateObj.activeId && stateObj.conversations[0]) stateObj.activeId = stateObj.conversations[0].id;
  listEl.innerHTML = stateObj.conversations.map(c => {
    const brand = BRANDS.find(b => b.slug === c.listings?.brand_slug)?.name || '';
    const title = adminMode ? (c.profiles?.full_name || 'İstifadəçi') : `${brand} ${c.listings?.model || 'Ümumi'}`;
    const sub = adminMode ? `${brand} ${c.listings?.model || 'ümumi söhbət'}` : 'ELİT AVTO 777';
    return `<div class="chat-item ${stateObj.activeId === c.id ? 'active' : ''}" data-conv="${c.id}"><div class="chat-item-title">${escapeHtml(title)}</div><div class="chat-item-sub">${escapeHtml(sub)}</div></div>`;
  }).join('') || '<div class="muted">Hələ söhbət yoxdur.</div>';
  qsa('[data-conv]', listEl).forEach(item => item.addEventListener('click', async () => {
    stateObj.activeId = item.dataset.conv;
    await loadConversations(adminMode);
    await loadConversationMessages(stateObj.activeId, adminMode);
  }));
  if (stateObj.activeId) await loadConversationMessages(stateObj.activeId, adminMode);
}

async function loadConversationMessages(conversationId, adminMode) {
  const stateObj = adminMode ? state.adminChat : state.chat;
  const msgEl = qs(adminMode ? '#adminChatMessages' : '#chatMessages');
  const headEl = qs(adminMode ? '#adminChatHead' : '#chatHead');
  const conv = stateObj.conversations.find(x => x.id === conversationId);
  headEl.textContent = conv ? (adminMode ? `${conv.profiles?.full_name || 'İstifadəçi'} • ${BRANDS.find(b => b.slug === conv.listings?.brand_slug)?.name || ''} ${conv.listings?.model || ''}` : 'ELİT AVTO 777 ilə söhbət') : 'Söhbət';
  const { data } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
  stateObj.activeMessages = data || [];
  msgEl.innerHTML = stateObj.activeMessages.map(m => `<div class="msg ${m.sender_role === 'admin' ? 'admin' : 'user'}">${escapeHtml(m.body)}<span class="msg-meta">${formatDate(m.created_at)}</span></div>`).join('');
  msgEl.scrollTop = msgEl.scrollHeight;
  if (!adminMode) {
    await supabase.from('messages').update({ is_read: true }).eq('conversation_id', conversationId).eq('sender_role', 'admin').eq('is_read', false);
    await refreshUnreadBadge();
  }
}

function bindChatUI(adminMode) {
  const form = qs(adminMode ? '#adminChatForm' : '#chatForm');
  const input = qs(adminMode ? '#adminChatInput' : '#chatInput');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const stateObj = adminMode ? state.adminChat : state.chat;
    if (!stateObj.activeId || !input.value.trim()) return;
    const payload = { conversation_id: stateObj.activeId, body: input.value.trim(), sender_role: adminMode ? 'admin' : 'user', sender_id: state.user.id };
    const { error } = await supabase.from('messages').insert(payload);
    if (error) return notice(error.message, false);
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', stateObj.activeId);
    input.value = '';
    await loadConversationMessages(stateObj.activeId, adminMode);
    await loadConversations(adminMode);
    if (!adminMode) await refreshUnreadBadge();
  });
  setInterval(() => {
    const activeId = (adminMode ? state.adminChat : state.chat).activeId;
    if (activeId) loadConversationMessages(activeId, adminMode);
  }, 6000);
}

async function initAdmin() {
  if (!state.user) return window.location.href = 'login.html';
  await loadProfile();
  if (state.profile?.role !== 'admin') {
    document.querySelector('main').innerHTML = '<section class="container"><div class="loading-card">Bu səhifəyə giriş icazəniz yoxdur.</div></section>';
    return;
  }
  const brands = await fetchBrands();
  fillBrandSelect(qs('#adminBrandSelect'), brands, 'Marka seçin');
  bindAdminForm();
  await loadAdminListings();
  await loadAdminUsers();
  await loadConversations(true);
  bindChatUI(true);
  qs('#adminResetPasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = new FormData(e.target).get('email');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: SITE_URL + 'login.html' });
    if (error) return notice(error.message, false);
    notice('Sıfırlama emaili göndərildi.');
    e.target.reset();
  });
}

function bindAdminForm() {
  const form = qs('#listingForm');
  qs('#resetListingFormBtn')?.addEventListener('click', () => form.reset());
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const id = fd.get('id');
    const listing = {
      brand_slug: fd.get('brand_slug'), model: fd.get('model'), year: Number(fd.get('year')), engine: fd.get('engine'), mileage: Number(fd.get('mileage')),
      price: Number(fd.get('price')), currency: fd.get('currency'), condition: fd.get('condition'), color: fd.get('color'), fuel_type: fd.get('fuel_type'), transmission: fd.get('transmission'),
      description: fd.get('description'), note: fd.get('note'), is_credit: fd.get('is_credit') === 'on', is_barter: fd.get('is_barter') === 'on',
      status: fd.get('status_active') === 'on' ? 'active' : 'inactive', location: 'Bərdə şəhəri', created_by: state.user.id
    };
    let listingId = id;
    if (id) {
      const { error } = await supabase.from('listings').update(listing).eq('id', id);
      if (error) return notice(error.message, false);
    } else {
      const { data, error } = await supabase.from('listings').insert(listing).select().single();
      if (error) return notice(error.message, false);
      listingId = data.id;
    }
    const images = String(fd.get('images') || '').split('\n').map(x => x.trim()).filter(Boolean);
    await supabase.from('listing_images').delete().eq('listing_id', listingId);
    if (images.length) {
      await supabase.from('listing_images').insert(images.map((url, index) => ({ listing_id: listingId, image_url: url, sort_order: index + 1 })));
    }
    notice('Elan yadda saxlandı');
    form.reset();
    await loadAdminListings();
  });
}

async function loadAdminListings() {
  const box = qs('#adminListings');
  const { data } = await supabase.from('listings').select('*, listing_images(image_url)').order('created_at', { ascending: false });
  box.innerHTML = (data || []).map(item => {
    const brandName = BRANDS.find(b => b.slug === item.brand_slug)?.name || item.brand_slug;
    return `<div class="admin-row">
      <div class="admin-row-title">${escapeHtml(brandName)} ${escapeHtml(item.model || '')}</div>
      <div class="admin-row-sub">${formatPrice(item.price, item.currency)} • ${item.year || '-'} • ${item.mileage || 0} km</div>
      <div class="admin-row-actions">
        <button class="ghost-btn" data-edit-listing="${item.id}">Redaktə et</button>
        <button class="danger-btn" data-delete-listing="${item.id}">Sil</button>
      </div>
    </div>`;
  }).join('') || '<div class="muted">Hələ elan yoxdur.</div>';
  qsa('[data-edit-listing]').forEach(btn => btn.addEventListener('click', () => editListing(btn.dataset.editListing, data)));
  qsa('[data-delete-listing]').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('Elanı silmək istədiyinizə əminsiniz?')) return;
    await supabase.from('listings').delete().eq('id', btn.dataset.deleteListing);
    notice('Elan silindi');
    await loadAdminListings();
  }));
}

function editListing(id, all) {
  const item = (all || []).find(x => x.id === id); if (!item) return;
  const form = qs('#listingForm');
  form.id.value = item.id;
  form.brand_slug.value = item.brand_slug || '';
  form.model.value = item.model || '';
  form.year.value = item.year || '';
  form.engine.value = item.engine || '';
  form.mileage.value = item.mileage || '';
  form.price.value = item.price || '';
  form.currency.value = item.currency || 'AZN';
  form.condition.value = item.condition || 'Sürülmüş';
  form.color.value = item.color || '';
  form.fuel_type.value = item.fuel_type || '';
  form.transmission.value = item.transmission || '';
  form.description.value = item.description || '';
  form.note.value = item.note || '';
  form.is_credit.checked = !!item.is_credit;
  form.is_barter.checked = !!item.is_barter;
  form.status_active.checked = item.status === 'active';
  form.images.value = normalizeImages(item).join('\n');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadAdminUsers() {
  const box = qs('#adminUsers');
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  box.innerHTML = (data || []).map(u => `<div class="admin-row"><div class="admin-row-title">${escapeHtml(u.full_name || 'Adsız istifadəçi')}</div><div class="admin-row-sub">${escapeHtml(u.phone || '')}<br>${escapeHtml(u.address || '')}<br>${escapeHtml(u.email || '')}</div></div>`).join('') || '<div class="muted">İstifadəçi tapılmadı.</div>';
}

async function refreshUnreadBadge() {
  if (!state.user) return updateUnreadBadges(0);
  const { data: convs } = await supabase.from('conversations').select('id').eq('user_id', state.user.id);
  const ids = (convs || []).map(x => x.id);
  if (!ids.length) return updateUnreadBadges(0);
  const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).in('conversation_id', ids).eq('sender_role', 'admin').eq('is_read', false);
  updateUnreadBadges(count || 0);
}

function updateUnreadBadges(count) {
  qsa('#globalUnreadBadge').forEach(el => {
    el.textContent = count;
    el.classList.toggle('hidden', !count);
  });
}

function bindGlobalUnreadPoll() {
  refreshUnreadBadge();
  setInterval(refreshUnreadBadge, 12000);
}

init();
