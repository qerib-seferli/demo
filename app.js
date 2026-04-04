const SUPABASE_URL = 'https://wdtmbjfwmpvbwenemakb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkdG1iamZ3bXB2YndlbmVtYWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyODg2NTcsImV4cCI6MjA5MDg2NDY1N30.rgQGHOrY4Kc1wmWigMq0QUCBNT7JD3qOi_gYa3Q_pmk';
const ADMIN_EMAIL_HINT = 'elit_avto_777.az';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];
const params = new URLSearchParams(location.search);

const BRAND_LOGOS = [
  ['Audi', 'audi_logo.png'],
  ['BMW', 'bmw_logo.png'],
  ['BYD', 'byd_logo.png'],
  ['Changan', 'changan_logo.png'],
  ['Chery', 'chery_logo.png'],
  ['Chevrolet', 'chevrolet_logo.png'],
  ['Ford', 'ford_logo.png'],
  ['Hyundai', 'hyundai_logo.png'],
  ['Infiniti', 'infiniti_logo.png'],
  ['Jeep', 'jeep_logo.png'],
  ['Khazar', 'khazar_logo.png'],
  ['Kia', 'kia_logo.png'],
  ['Lada/VAZ', 'lada_vaz_logo.png'],
  ['Land Rover', 'land_Rover_logo.png'],
  ['Lexus', 'lexus_logo.png'],
  ['Mazda', 'mazda_logo.png'],
  ['Mercedes', 'mercedes_logo.png'],
  ['Mitsubishi', 'mitsubishi_logo.png'],
  ['Nissan', 'nissan_logo.png'],
  ['Opel', 'opel_logo.png'],
  ['Porsche', 'porsche_logo.png'],
  ['Renault', 'renault_logo.png'],
  ['Toyota', 'toyota_logo.png'],
  ['Volkswagen', 'volkswagen_logo.png'],
];

function getPage() {
  return document.body?.dataset?.page || 'home';
}

function markActiveNav() {
  const page = getPage();
  const mapping = {
    home: 'home',
    favorites: 'favorites',
    messages: 'messages',
    profile: 'profile',
    detail: 'home',
  };
  const active = mapping[page];
  qsa('.bottom-nav [data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === active));
}

function fmt(price, currency = 'AZN') {
  if (price == null) return '-';
  return `${Number(price).toLocaleString('az-AZ')} ${currency}`;
}

async function getSessionUser() {
  const { data } = await supabaseClient.auth.getUser();
  return data?.user || null;
}

async function getProfile(userId) {
  if (!userId) return null;
  const { data } = await supabaseClient.from('users').select('*').eq('id', userId).maybeSingle();
  return data || null;
}

async function ensureProfile(user, extra = {}) {
  if (!user?.id) return null;
  const profile = await getProfile(user.id);
  const payload = {
    id: user.id,
    email: user.email || extra.email || '',
    name: extra.name ?? profile?.name ?? user.user_metadata?.name ?? '',
    surname: extra.surname ?? profile?.surname ?? user.user_metadata?.surname ?? '',
    phone: extra.phone ?? profile?.phone ?? '',
    address: extra.address ?? profile?.address ?? '',
    bio: extra.bio ?? profile?.bio ?? '',
    avatar_url: extra.avatar_url ?? profile?.avatar_url ?? '',
    role: profile?.role || 'user',
  };
  const { error } = await supabaseClient.from('users').upsert(payload);
  if (error) console.error(error.message);
  return payload;
}

async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    location.href = 'login.html';
    return null;
  }
  return user;
}

async function requireAdmin() {
  const user = await requireAuth();
  if (!user) return null;
  const profile = await getProfile(user.id);
  if (profile?.role !== 'admin') {
    alert('Bu bölmə yalnız admin üçündür.');
    location.href = 'index.html';
    return null;
  }
  return user;
}

async function uploadFile(bucket, file, path) {
  const { error } = await supabaseClient.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function createCard(item, favoriteIds = []) {
  const images = Array.isArray(item.images) && item.images.length ? item.images : ['foto/car-placeholder.jpg'];
  const isFav = favoriteIds.includes(item.id);
  return `
    <article class="card" data-id="${item.id}">
      <div class="card-media" data-slider='${JSON.stringify(images)}'>
        <img src="${images[0]}" alt="${item.brand} ${item.model}">
        <div class="card-topbadges">
          <div class="icon-row">
            ${item.is_credit ? '<span class="badge"><i class="fa-solid fa-wallet"></i> Kredit</span>' : ''}
            ${item.is_barter ? '<span class="badge"><i class="fa-solid fa-arrow-right-arrow-left"></i> Barter</span>' : ''}
          </div>
          <button class="favorite-btn ${isFav ? 'active' : ''}" data-fav="${item.id}" type="button"><i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i></button>
        </div>
        <div class="slide-dots">${images.map((_, i) => `<span class="${i === 0 ? 'active' : ''}"></span>`).join('')}</div>
      </div>
      <div class="card-body">
        <div class="price-row">
          <div>
            <div class="price">${fmt(item.price, item.currency)}</div>
            <div class="card-title">${item.brand} ${item.model}</div>
          </div>
          <span class="badge">${item.condition || '-'}</span>
        </div>
        <div class="specs">
          <div class="spec"><small>Mühərrik</small><strong>${item.engine || '-'}</strong></div>
          <div class="spec"><small>Yürüş</small><strong>${Number(item.mileage || 0).toLocaleString('az-AZ')} km</strong></div>
          <div class="spec"><small>İl</small><strong>${item.year || '-'}</strong></div>
          <div class="spec"><small>Yanacaq</small><strong>${item.fuel_type || '-'}</strong></div>
        </div>
        <div class="card-footer">
          <a class="btn btn-outline" href="elan.html?id=${item.id}">Ətraflı bax</a>
          <a class="btn btn-green" target="_blank" href="https://wa.me/994517089500?text=${encodeURIComponent(`Salam, ${item.brand} ${item.model} (${item.year}) elanıyla maraqlanıram.`)}">WhatsApp</a>
        </div>
      </div>
    </article>
  `;
}

function startCardSlides(root = document) {
  qsa('.card-media', root).forEach(media => {
    const images = JSON.parse(media.dataset.slider || '[]');
    if (images.length <= 1 || media.dataset.running) return;
    media.dataset.running = '1';
    let index = 0;
    const imgEl = qs('img', media);
    const dots = qsa('.slide-dots span', media);
    setInterval(() => {
      index = (index + 1) % images.length;
      imgEl.style.opacity = '0.35';
      setTimeout(() => {
        imgEl.src = images[index];
        imgEl.style.opacity = '1';
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
      }, 150);
    }, 2000);
  });
}


document.querySelectorAll('.brand-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    const brand = btn.dataset.brand;
    filterByBrand(brand);
  });
});

async function filterByBrand(brand) {
  const brandSelect = document.getElementById('filterBrand');
  if (!brandSelect) return;

  brandSelect.value = brand;

  if (window.__allListings) {
    updateModels(window.__allListings);
  }

  qsa('.brand-chip').forEach(x => x.classList.toggle('active', x.dataset.brand === brand));
  qsa('.brand-item').forEach(x => x.classList.toggle('active', x.dataset.brand === brand));

  const grid = qs('#listingGrid');
  if (!grid) return;

  const filtered = await fetchListings({ ...readFilters(), brand });
  renderListingGrid(filtered, await getFavoriteIds(), grid);
}


async function getFavoriteIds() {
  const user = await getSessionUser();
  if (!user) return JSON.parse(localStorage.getItem('guest_favorites') || '[]');
  const { data } = await supabaseClient.from('favorites').select('listing_id').eq('user_id', user.id);
  return (data || []).map(x => x.listing_id);
}

async function toggleFavorite(listingId) {
  const user = await getSessionUser();
  if (!user) {
    const guest = JSON.parse(localStorage.getItem('guest_favorites') || '[]');
    const next = guest.includes(listingId) ? guest.filter(x => x !== listingId) : [...guest, listingId];
    localStorage.setItem('guest_favorites', JSON.stringify(next));
    return;
  }
  const current = await getFavoriteIds();
  if (current.includes(listingId)) {
    await supabaseClient.from('favorites').delete().eq('user_id', user.id).eq('listing_id', listingId);
  } else {
    await supabaseClient.from('favorites').insert({ user_id: user.id, listing_id: listingId });
  }
}

function bindFavoriteButtons(root = document) {
  qsa('[data-fav]', root).forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      const id = btn.dataset.fav;
      await toggleFavorite(id);
      btn.classList.toggle('active');
      btn.innerHTML = `<i class="fa-${btn.classList.contains('active') ? 'solid' : 'regular'} fa-heart"></i>`;
    });
  });
}

async function fetchListings(filters = {}) {
  let query = supabaseClient.from('elanlar').select('*').eq('is_active', true).order('created_at', { ascending: false });
  if (filters.brand) query = query.eq('brand', filters.brand);
  if (filters.model) query = query.eq('model', filters.model);
  if (filters.currency) query = query.eq('currency', filters.currency);
  if (filters.condition) query = query.eq('condition', filters.condition);
  if (filters.fuel) query = query.eq('fuel_type', filters.fuel);
  if (filters.color) query = query.eq('color', filters.color);
  if (filters.credit) query = query.eq('is_credit', true);
  if (filters.barter) query = query.eq('is_barter', true);
  if (filters.priceMin) query = query.gte('price', Number(filters.priceMin));
  if (filters.priceMax) query = query.lte('price', Number(filters.priceMax));
  const { data, error } = await query;
  if (error) {
    console.error(error.message);
    return [];
  }
  return data || [];
}

function updateModels(listings) {
  const selectedBrand = qs('#filterBrand')?.value || '';
  const models = [...new Set(listings.filter(x => !selectedBrand || x.brand === selectedBrand).map(x => x.model).filter(Boolean))].sort();
  const el = qs('#filterModel');
  if (!el) return;
  el.innerHTML = '<option value="">Hamısı</option>' + models.map(m => `<option>${m}</option>`).join('');
}

function renderListingGrid(listings, favoriteIds, grid) {
  if (!grid) return;
  if (!listings.length) {
    grid.innerHTML = '<div class="empty-state">Uyğun elan tapılmadı.</div>';
    return;
  }
  grid.innerHTML = listings.map(item => createCard(item, favoriteIds)).join('');
  startCardSlides(grid);
  bindFavoriteButtons(grid);
}

function readFilters() {
  return {
    brand: qs('#filterBrand')?.value || '',
    model: qs('#filterModel')?.value || '',
    priceMin: qs('#filterPriceMin')?.value || '',
    priceMax: qs('#filterPriceMax')?.value || '',
    currency: qs('#filterCurrency')?.value || '',
    condition: qs('input[name="condition"]:checked')?.value || '',
    credit: qs('#filterCredit')?.checked || false,
    barter: qs('#filterBarter')?.checked || false,
    fuel: qs('#filterFuel')?.value || '',
    color: qs('#filterColor')?.value || '',
  };
}

function renderTicker(listings = []) {
  const root = qs('#tickerTrack');
  if (!root) return;
  const allBrands = [...new Set([...BRAND_LOGOS.map(([name]) => name), ...listings.map(x => x.brand).filter(Boolean)])];
  root.innerHTML = BRAND_LOGOS.filter(([name]) => allBrands.includes(name)).map(([name, logo]) => `
    <button class="brand-item" data-brand="${name}" type="button">
      <img src="foto/${logo}" alt="${name}">
      <span>${name}</span>
    </button>
  `).join('');

  qsa('.brand-item', root).forEach(btn => {
    btn.addEventListener('click', async () => {
      const brand = btn.dataset.brand;
      const select = qs('#filterBrand');
      if (!select) return;
      select.value = brand;
      qsa('.brand-item').forEach(x => x.classList.toggle('active', x === btn));
      window.__allListings = window.__allListings || [];
      updateModels(window.__allListings);
      const filtered = await fetchListings({ ...readFilters(), brand });
      renderListingGrid(filtered, await getFavoriteIds(), qs('#listingGrid'));
      const advanced = qs('#advancedFilters');
      if (advanced && advanced.classList.contains('collapsed')) advanced.classList.remove('collapsed');
    });
  });
}

async function initHome() {
  await renderHomeHeaderAuth();
  
  const grid = qs('#listingGrid');
  const listings = await fetchListings();
  window.__allListings = listings;
  renderTicker(listings);
  const favoriteIds = await getFavoriteIds();
  if (qs('#statTotal')) qs('#statTotal').textContent = listings.length;
  if (qs('#statFav')) qs('#statFav').textContent = favoriteIds.length;
  const brands = [...new Set(listings.map(x => x.brand).filter(Boolean))].sort();
  const brandSelect = qs('#filterBrand');
  if (brandSelect) brandSelect.innerHTML = '<option value="">Hamısı</option>' + brands.map(b => `<option>${b}</option>`).join('');
  updateModels(listings);
  renderListingGrid(listings, favoriteIds, grid);

  qs('#filterBrand')?.addEventListener('change', () => {
    updateModels(listings);
    qsa('.brand-item').forEach(x => x.classList.toggle('active', x.dataset.brand === qs('#filterBrand').value));
  });

  qs('#applyFilters')?.addEventListener('click', async () => {
    const filtered = await fetchListings(readFilters());
    renderListingGrid(filtered, await getFavoriteIds(), grid);
  });

  qs('#resetFilters')?.addEventListener('click', async () => {
    qsa('.filter-wrap input').forEach(input => {
      if (input.type === 'checkbox' || input.type === 'radio') input.checked = false;
      else input.value = '';
    });
    qsa('.filter-wrap select').forEach(select => select.value = '');
    const all = qs('input[name="condition"][value=""]');
    if (all) all.checked = true;
    qsa('.brand-item').forEach(x => x.classList.remove('active'));
    updateModels(listings);
    renderListingGrid(listings, await getFavoriteIds(), grid);
  });

  qs('#toggleAdvancedFilters')?.addEventListener('click', () => {
    qs('#advancedFilters')?.classList.toggle('collapsed');
  });

  refreshMessageBadge();
}

async function initLogin() {
  const loginForm = qs('#loginForm');
  const registerForm = qs('#registerForm');
  const authMsg = qs('#authMsg');

  function showMode(name) {
    loginForm.classList.toggle('hidden', name !== 'login');
    registerForm.classList.toggle('hidden', name !== 'register');
    qs('#tabLogin').className = name === 'login' ? 'btn' : 'btn btn-outline';
    qs('#tabRegister').className = name === 'register' ? 'btn' : 'btn btn-outline';
  }

  showMode('login');
  qs('#tabLogin').onclick = () => showMode('login');
  qs('#tabRegister').onclick = () => showMode('register');

  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: qs('#loginEmail').value.trim(),
      password: qs('#loginPassword').value,
    });
    authMsg.textContent = error ? error.message : 'Giriş uğurludur. Yönləndirilirsiniz...';
    if (!error) setTimeout(() => location.href = 'profile.html', 700);
  });

  registerForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const name = qs('#regName').value.trim();
    const surname = qs('#regSurname').value.trim();
    const email = qs('#regEmail').value.trim();
    const password = qs('#regPassword').value;
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { name, surname } }
    });
    authMsg.textContent = error ? error.message : 'Qeydiyyat uğurludur. Email təsdiqi tələb oluna bilər.';
    if (data?.user) await ensureProfile(data.user, { name, surname, email });
  });
}

async function initProfile() {
  const user = await requireAuth();
  if (!user) return;
  await ensureProfile(user);
  const profile = await getProfile(user.id);
  qs('#profileEmail').value = user.email || '';
  qs('#profileName').value = profile?.name || '';
  qs('#profileSurname').value = profile?.surname || '';
  qs('#profilePhone').value = profile?.phone || '';
  qs('#profileAddress').value = profile?.address || '';
  qs('#profileBio').value = profile?.bio || '';
  qs('#avatarPreview').src = profile?.avatar_url || 'foto/user-placeholder.png';

  qs('#avatarInput')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (file) qs('#avatarPreview').src = URL.createObjectURL(file);
  });

  qs('#profileForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      let avatarUrl = profile?.avatar_url || '';
      const avatarFile = qs('#avatarInput').files?.[0];
      if (avatarFile) avatarUrl = await uploadFile('avatars', avatarFile, `${user.id}/${Date.now()}-${avatarFile.name}`);
      const payload = {
        id: user.id,
        email: user.email || '',
        name: qs('#profileName').value.trim(),
        surname: qs('#profileSurname').value.trim(),
        phone: qs('#profilePhone').value.trim(),
        address: qs('#profileAddress').value.trim(),
        bio: qs('#profileBio').value.trim(),
        avatar_url: avatarUrl,
        role: profile?.role || 'user',
      };
      const { error } = await supabaseClient.from('users').upsert(payload);
      qs('#profileMsg').textContent = error ? error.message : 'Profil uğurla yeniləndi.';
      if (!error && avatarUrl) qs('#avatarPreview').src = avatarUrl;
    } catch (err) {
      qs('#profileMsg').textContent = err.message;
    }
  });

  qs('#resetPasswordBtn')?.addEventListener('click', async () => {
    if (!user.email) return;
    const { error } = await supabaseClient.auth.resetPasswordForEmail(user.email, { redirectTo: `${location.origin}/login.html` });
    qs('#profileMsg').textContent = error ? error.message : 'Şifrə yeniləmə linki emailinizə göndərildi.';
  });

  qs('#logoutBtn')?.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    location.href = 'login.html';
  });

  refreshMessageBadge();
}

async function initDetail() {
  const id = params.get('id');
  const root = qs('#detailRoot');
  if (!root) return;

  if (!id) {
    root.innerHTML = '<div class="empty-state">Elan tapılmadı.</div>';
    return;
  }

  const { data } = await supabaseClient.from('elanlar').select('*').eq('id', id).maybeSingle();

  if (!data) {
    root.innerHTML = '<div class="empty-state">Elan tapılmadı.</div>';
    return;
  }

  const images = Array.isArray(data.images) && data.images.length ? data.images : ['foto/car-placeholder.jpg'];
  const favoriteIds = await getFavoriteIds();
  const isFav = favoriteIds.includes(data.id);

  root.innerHTML = `
    <section class="detail-card">
      <div class="gallery">
        <div class="main-photo">
          <img id="detailMainImage" src="${images[0]}" alt="${data.brand} ${data.model}">
        </div>
        <div class="thumbs">
          ${images.map(src => `<button type="button"><img src="${src}" alt="thumb"></button>`).join('')}
        </div>
      </div>

      <div class="sidebar-card">
        <h3>${data.brand} ${data.model}</h3>
        <p class="price" style="margin:10px 0 12px;">${fmt(data.price, data.currency)}</p>

        <div class="icon-row">
          ${data.is_credit ? '<span class="badge"><i class="fa-solid fa-wallet"></i> Kredit var</span>' : ''}
          ${data.is_barter ? '<span class="badge"><i class="fa-solid fa-arrow-right-arrow-left"></i> Barter var</span>' : ''}
        </div>

        <div class="detail-meta" style="margin-top:14px;">
          <div class="spec"><small>İl</small><strong>${data.year || '-'}</strong></div>
          <div class="spec"><small>Yürüş</small><strong>${Number(data.mileage || 0).toLocaleString('az-AZ')} km</strong></div>
          <div class="spec"><small>Mühərrik</small><strong>${data.engine || '-'}</strong></div>
          <div class="spec"><small>Yanacaq</small><strong>${data.fuel_type || '-'}</strong></div>
          <div class="spec"><small>Qutu</small><strong>${data.transmission || '-'}</strong></div>
          <div class="spec"><small>Rəng</small><strong>${data.color || '-'}</strong></div>
          <div class="spec"><small>Ban növü</small><strong>${data.body_type || '-'}</strong></div>
          <div class="spec"><small>Vəziyyət</small><strong>${data.condition || '-'}</strong></div>
        </div>

        <div class="detail-text" style="margin-top:14px;">
          ${data.description || 'Təsvir əlavə edilməyib.'}
        </div>

        <div class="panel" style="padding:14px;margin-top:14px;">
          <strong>ELİT AVTO 777 qeydi</strong>
          <p class="detail-text" style="margin-top:8px;">
            ${data.salon_note || 'Salon qeydi əlavə edilməyib.'}
          </p>
        </div>

        <div class="filter-actions" style="padding-top:14px;">
          <button class="btn ${isFav ? 'btn-outline' : ''}" id="detailFavBtn" type="button">
            ${isFav ? 'Sevimlilərdən çıxart' : 'Sevimlilərə əlavə et'}
          </button>
          <a class="btn btn-green" target="_blank" href="https://wa.me/994517089500?text=${encodeURIComponent(`Salam, ${data.brand} ${data.model} elanına baxdım, ətraflı məlumat istəyirəm.`)}">
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  `;

  qsa('.thumbs button').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      qs('#detailMainImage').src = images[i];
    });
  });

  qs('#detailFavBtn')?.addEventListener('click', async () => {
    await toggleFavorite(data.id);
    const currentFavs = await getFavoriteIds();
    const nowFav = currentFavs.includes(data.id);

    const favBtn = qs('#detailFavBtn');
    favBtn.textContent = nowFav ? 'Sevimlilərdən çıxart' : 'Sevimlilərə əlavə et';
    favBtn.classList.toggle('btn-outline', nowFav);
  });

  refreshMessageBadge();
}


async function initFavorites() {
  const grid = qs('#favoritesGrid');
  if (!grid) return;
  const favoriteIds = await getFavoriteIds();
  if (!favoriteIds.length) {
    grid.innerHTML = '<div class="empty-state">Hələ sevimli elan yoxdur.</div>';
    return;
  }
  const { data } = await supabaseClient.from('elanlar').select('*').in('id', favoriteIds).order('created_at', { ascending: false });
  renderListingGrid(data || [], favoriteIds, grid);
  refreshMessageBadge();
}

async function loadChatMessages(isAdmin, userId) {
  let query = supabaseClient.from('messages').select('*').order('created_at', { ascending: true });
  if (!isAdmin) query = query.eq('user_id', userId);
  const { data } = await query;
  return data || [];
}

async function initMessages() {
  const user = await requireAuth();
  if (!user) return;
  await ensureProfile(user);
  const profile = await getProfile(user.id);
  const isAdmin = profile?.role === 'admin';
  const chatList = qs('#chatList');
  const input = qs('#chatInput');
  const sendBtn = qs('#sendChatBtn');
  const countEl = qs('#chatUserCount');

  async function render() {
    const messages = await loadChatMessages(isAdmin, user.id);
    if (countEl) countEl.textContent = messages.length;
    chatList.innerHTML = messages.length ? messages.map(msg => `
      <div class="msg ${msg.sender_role === 'admin' ? 'admin' : 'user'}">
        <strong>${msg.sender_role === 'admin' ? 'Admin' : 'Siz'}</strong><br>${msg.message}
      </div>
    `).join('') : '<div class="empty-state">Hələ mesaj yoxdur.</div>';
    chatList.scrollTop = chatList.scrollHeight;
    await refreshMessageBadge();
  }

  sendBtn?.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) return;
    const payload = {
      user_id: user.id,
      sender_role: isAdmin ? 'admin' : 'user',
      message: text,
      is_read: false,
    };
    const { error } = await supabaseClient.from('messages').insert(payload);
    if (!error) input.value = '';
  });

  input?.addEventListener('keydown', e => { if (e.key === 'Enter') sendBtn?.click(); });
  await render();
  supabaseClient.channel(`room-messages-${isAdmin ? 'admin' : user.id}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, render)
    .subscribe();
}

async function refreshMessageBadge() {
  const el = qs('#bottomMsgCount');
  if (!el) return;
  const user = await getSessionUser();
  if (!user) { el.textContent = '0'; return; }
  const profile = await getProfile(user.id);
  let query = supabaseClient.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false);
  if (profile?.role !== 'admin') query = query.eq('user_id', user.id).eq('sender_role', 'admin');
  const { count } = await query;
  el.textContent = count ? String(count) : '0';
}

async function initAdmin() {
  const user = await requireAdmin();
  if (!user) return;
  const msg = qs('#adminMsg');
  const listingTable = qs('#adminListingTable');
  const usersTable = qs('#adminUsersTable');
  const messagesTable = qs('#adminMessagesTable');

  async function loadStats() {
    const [{ count: c1 }, { count: c2 }, { count: c3 }] = await Promise.all([
      supabaseClient.from('elanlar').select('*', { count: 'exact', head: true }),
      supabaseClient.from('users').select('*', { count: 'exact', head: true }),
      supabaseClient.from('messages').select('*', { count: 'exact', head: true }),
    ]);
    qs('#adminTotalListings').textContent = c1 || 0;
    qs('#adminTotalUsers').textContent = c2 || 0;
    qs('#adminTotalMessages').textContent = c3 || 0;
  }

  async function loadListings() {
    const { data } = await supabaseClient.from('elanlar').select('*').order('created_at', { ascending: false });
    listingTable.innerHTML = (data || []).map(item => `
      <tr>
        <td>${item.brand} ${item.model}</td>
        <td>${fmt(item.price, item.currency)}</td>
        <td>${item.year || '-'}</td>
        <td>
          <button class="btn btn-outline btn-small edit-listing" data-id="${item.id}" type="button">Redaktə</button>
          <button class="btn btn-danger btn-small delete-listing" data-id="${item.id}" type="button">Sil</button>
        </td>
      </tr>
    `).join('');

    qsa('.edit-listing').forEach(btn => btn.addEventListener('click', async () => {
      const { data } = await supabaseClient.from('elanlar').select('*').eq('id', btn.dataset.id).maybeSingle();
      if (!data) return;
      qs('#listingId').value = data.id;
      qs('#carBrand').value = data.brand || '';
      qs('#carModel').value = data.model || '';
      qs('#carPrice').value = data.price || '';
      qs('#carCurrency').value = data.currency || 'AZN';
      qs('#carYear').value = data.year || '';
      qs('#carMileage').value = data.mileage || '';
      qs('#carEngine').value = data.engine || '';
      qs('#carFuel').value = data.fuel_type || 'Benzin';
      qs('#carTransmission').value = data.transmission || '';
      qs('#carColor').value = data.color || '';
      qs('#carCondition').value = data.condition || 'Sürülmüş';
      qs('#carBodyType').value = data.body_type || '';
      qs('#carCredit').value = String(data.is_credit);
      qs('#carBarter').value = String(data.is_barter);
      qs('#carDescription').value = data.description || '';
      qs('#carNote').value = data.salon_note || '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));

    qsa('.delete-listing').forEach(btn => btn.addEventListener('click', async () => {
      if (!confirm('Bu elan silinsin?')) return;
      const id = btn.dataset.id;
      const { data } = await supabaseClient.from('elanlar').select('images').eq('id', id).maybeSingle();
      if (data?.images?.length) {
        const paths = data.images.filter(x => x.includes('/object/public/')).map(url => url.split('/object/public/elan-images/')[1]).filter(Boolean);
        if (paths.length) await supabaseClient.storage.from('elan-images').remove(paths);
      }
      await supabaseClient.from('elanlar').delete().eq('id', id);
      await Promise.all([loadListings(), loadStats()]);
    }));
  }

  async function loadUsers() {
    const { data } = await supabaseClient.from('users').select('*').order('created_at', { ascending: false });
    usersTable.innerHTML = (data || []).map(u => `
      <tr>
        <td>${u.name || ''} ${u.surname || ''}</td>
        <td>${u.phone || '-'}</td>
        <td>${u.email || '-'}</td>
        <td>${u.role || 'user'}</td>
        <td><button class="btn btn-outline btn-small user-role" data-id="${u.id}" data-role="${u.role === 'admin' ? 'user' : 'admin'}" type="button">${u.role === 'admin' ? 'User et' : 'Admin et'}</button></td>
      </tr>
    `).join('');

    qsa('.user-role').forEach(btn => btn.addEventListener('click', async () => {
      await supabaseClient.from('users').update({ role: btn.dataset.role }).eq('id', btn.dataset.id);
      await loadUsers();
    }));
  }

  async function loadMessages() {
    const { data } = await supabaseClient.from('messages').select('*, users(name,surname,email)').order('created_at', { ascending: false }).limit(50);
    messagesTable.innerHTML = (data || []).map(m => `
      <tr>
        <td>${m.users?.name || ''} ${m.users?.surname || ''}<br><span class="muted">${m.users?.email || ''} / ${m.sender_role}</span></td>
        <td>${m.message}</td>
        <td>${new Date(m.created_at).toLocaleString('az-AZ')}</td>
      </tr>
    `).join('');
  }

  qs('#listingForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      const id = qs('#listingId').value;
      const files = [...(qs('#carImages').files || [])];
      const imageUrls = [];
      for (const file of files) {
        const url = await uploadFile('elan-images', file, `${user.id}/${Date.now()}-${file.name}`);
        imageUrls.push(url);
      }
      const payload = {
        brand: qs('#carBrand').value.trim(),
        model: qs('#carModel').value.trim(),
        price: Number(qs('#carPrice').value),
        currency: qs('#carCurrency').value,
        year: Number(qs('#carYear').value),
        mileage: Number(qs('#carMileage').value || 0),
        engine: qs('#carEngine').value.trim(),
        fuel_type: qs('#carFuel').value,
        transmission: qs('#carTransmission').value.trim(),
        color: qs('#carColor').value.trim(),
        condition: qs('#carCondition').value,
        body_type: qs('#carBodyType').value.trim(),
        is_credit: qs('#carCredit').value === 'true',
        is_barter: qs('#carBarter').value === 'true',
        description: qs('#carDescription').value.trim(),
        salon_note: qs('#carNote').value.trim(),
        is_active: true,
      };
      if (id) {
        if (imageUrls.length) payload.images = imageUrls;
        const { error } = await supabaseClient.from('elanlar').update(payload).eq('id', id);
        msg.textContent = error ? error.message : 'Elan yeniləndi.';
      } else {
        payload.images = imageUrls;
        const { error } = await supabaseClient.from('elanlar').insert(payload);
        msg.textContent = error ? error.message : 'Yeni elan əlavə edildi.';
      }
      qs('#clearListingForm').click();
      await Promise.all([loadListings(), loadStats()]);
    } catch (err) {
      msg.textContent = err.message;
    }
  });

  qs('#clearListingForm')?.addEventListener('click', () => {
    qs('#listingForm').reset();
    qs('#listingId').value = '';
  });

  await Promise.all([loadStats(), loadListings(), loadUsers(), loadMessages()]);
}



async function init() {
  markActiveNav();
  await renderHomeHeaderAuth();

  const page = getPage();

  if (page === 'home') await initHome();
  if (page === 'login') await initLogin();
  if (page === 'profile') await initProfile();
  if (page === 'detail') await initDetail();
  if (page === 'favorites') await initFavorites();
  if (page === 'messages') await initMessages();
  if (page === 'admin') await initAdmin();
}



const brandsMarquee = document.querySelector('.brands-marquee');

if (brandsMarquee) {
  let isDown = false;
  let startX;
  let scrollLeft;

  brandsMarquee.addEventListener('mousedown', (e) => {
    isDown = true;
    brandsMarquee.classList.add('dragging');
    startX = e.pageX - brandsMarquee.offsetLeft;
    scrollLeft = brandsMarquee.scrollLeft;
  });

  brandsMarquee.addEventListener('mouseleave', () => {
    isDown = false;
    brandsMarquee.classList.remove('dragging');
  });

  brandsMarquee.addEventListener('mouseup', () => {
    isDown = false;
    brandsMarquee.classList.remove('dragging');
  });

  brandsMarquee.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - brandsMarquee.offsetLeft;
    const walk = (x - startX) * 1.2;
    brandsMarquee.scrollLeft = scrollLeft - walk;
  });

  brandsMarquee.addEventListener('touchstart', () => {
    brandsMarquee.classList.add('dragging');
  }, { passive: true });

  brandsMarquee.addEventListener('touchend', () => {
    brandsMarquee.classList.remove('dragging');
  }, { passive: true });
}





document.addEventListener('DOMContentLoaded', init);
