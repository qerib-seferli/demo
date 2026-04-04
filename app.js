const SUPABASE_URL = 'https://wdtmbjfwmpvbwenemakb.supabase.co';
const SUPABASE_ANON_KEY = 'BURAYA_SUPABASE_ANON_PUBLIC_KEY_YAZ';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const brandLogos = [
  { name: 'BMW', file: 'foto/bmw.png' },
  { name: 'Mercedes', file: 'foto/mercedes.png' },
  { name: 'Toyota', file: 'foto/toyota.png' },
  { name: 'Kia', file: 'foto/kia.png' },
  { name: 'Hyundai', file: 'foto/hyundai.png' },
  { name: 'Lexus', file: 'foto/lexus.png' },
  { name: 'Chevrolet', file: 'foto/chevrolet.png' },
  { name: 'Audi', file: 'foto/audi.png' },
];

const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];
const getPage = () => document.body.dataset.page;
const params = new URLSearchParams(location.search);
const fmt = (n, c = 'AZN') => `${Number(n || 0).toLocaleString('az-AZ')} ${c}`;

async function getSessionUser() {
  const { data } = await supabaseClient.auth.getUser();
  return data.user || null;
}

async function getProfile(userId) {
  const { data } = await supabaseClient.from('users').select('*').eq('id', userId).maybeSingle();
  return data;
}

async function ensureProfile(user, extra = {}) {
  if (!user) return null;
  const payload = {
    id: user.id,
    name: extra.name || user.user_metadata?.name || '',
    surname: extra.surname || user.user_metadata?.surname || '',
    phone: extra.phone || user.phone || user.user_metadata?.phone || '',
    email: user.email || '',
    role: user.user_metadata?.role || 'user'
  };
  await supabaseClient.from('users').upsert(payload);
  return payload;
}

async function requireAuth(redirect = 'login.html') {
  const user = await getSessionUser();
  if (!user) { location.href = redirect; return null; }
  return user;
}

async function requireAdmin() {
  const user = await requireAuth();
  if (!user) return null;
  const profile = await getProfile(user.id);
  if (profile?.role !== 'admin') {
    document.body.innerHTML = '<main class="page"><div class="container"><div class="empty-state">Bu səhifəyə yalnız admin daxil ola bilər.</div></div></main>';
    return null;
  }
  return user;
}

function renderTicker() {
  const track = qs('#tickerTrack');
  if (!track) return;
  const doubled = [...brandLogos, ...brandLogos];
  track.innerHTML = doubled.map(item => `
    <button class="ticker-item" type="button" data-brand="${item.name}">
      <img src="${item.file}" alt="${item.name}">
      <span>${item.name}</span>
    </button>
  `).join('');
  qsa('.ticker-item', track).forEach(btn => {
    btn.addEventListener('click', () => {
      const brandSelect = qs('#filterBrand');
      if (!brandSelect) return;
      brandSelect.value = btn.dataset.brand;
      brandSelect.dispatchEvent(new Event('change'));
      qs('#applyFilters')?.click();
      window.scrollTo({ top: 260, behavior: 'smooth' });
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
  if (error) return [];
  return data || [];
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
          <button class="favorite-btn ${isFav ? 'active' : ''}" data-fav="${item.id}"><i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i></button>
        </div>
        <div class="slide-dots">${images.map((_, i) => `<span class="${i === 0 ? 'active' : ''}"></span>`).join('')}</div>
      </div>
      <div class="card-body">
        <div class="price-row">
          <div>
            <div class="price">${fmt(item.price, item.currency)}</div>
            <div class="card-title">${item.brand} ${item.model}</div>
          </div>
          <span class="badge">${item.condition}</span>
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
  const currentFavs = await getFavoriteIds();
  if (currentFavs.includes(listingId)) {
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

async function initHome() {
  renderTicker();
  const listings = await fetchListings();
  const grid = qs('#listingGrid');
  const favoriteIds = await getFavoriteIds();
  qs('#statTotal').textContent = listings.length;
  qs('#statFav').textContent = favoriteIds.length;

  const brands = [...new Set(listings.map(x => x.brand).filter(Boolean))].sort();
  qs('#filterBrand').innerHTML = '<option value="">Hamısı</option>' + brands.map(b => `<option>${b}</option>`).join('');
  updateModels(listings);

  renderListingGrid(listings, favoriteIds, grid);

  qs('#filterBrand').addEventListener('change', () => updateModels(listings));
  qs('#applyFilters').addEventListener('click', async () => {
    const filtered = await fetchListings(readFilters());
    renderListingGrid(filtered, await getFavoriteIds(), grid);
  });
  qs('#resetFilters').addEventListener('click', async () => {
    qsa('input', qs('.filter-wrap')).forEach(i => {
      if (i.type === 'checkbox' || i.type === 'radio') i.checked = false;
      else i.value = '';
    });
    qsa('select', qs('.filter-wrap')).forEach(s => s.value = '');
    const allRadio = qs('input[name="condition"][value=""]');
    if (allRadio) allRadio.checked = true;
    updateModels(listings);
    renderListingGrid(await fetchListings(), await getFavoriteIds(), grid);
  });
  refreshMessageBadge();
}

function readFilters() {
  return {
    brand: qs('#filterBrand').value,
    model: qs('#filterModel').value,
    priceMin: qs('#filterPriceMin').value,
    priceMax: qs('#filterPriceMax').value,
    currency: qs('#filterCurrency').value,
    condition: qs('input[name="condition"]:checked')?.value || '',
    credit: qs('#filterCredit').checked,
    barter: qs('#filterBarter').checked,
    fuel: qs('#filterFuel').value,
    color: qs('#filterColor').value,
  };
}

function updateModels(listings) {
  const selectedBrand = qs('#filterBrand').value;
  const models = [...new Set(listings.filter(x => !selectedBrand || x.brand === selectedBrand).map(x => x.model).filter(Boolean))].sort();
  qs('#filterModel').innerHTML = '<option value="">Hamısı</option>' + models.map(m => `<option>${m}</option>`).join('');
}

function renderListingGrid(listings, favoriteIds, grid) {
  if (!listings.length) {
    grid.innerHTML = '<div class="empty-state">Uyğun elan tapılmadı.</div>';
    return;
  }
  grid.innerHTML = listings.map(item => createCard(item, favoriteIds)).join('');
  startCardSlides(grid);
  bindFavoriteButtons(grid);
}

async function initLogin() {
  const loginForm = qs('#loginForm');
  const registerForm = qs('#registerForm');
  const phoneForm = qs('#phoneForm');
  const authMsg = qs('#authMsg');

  function showMode(name) {
    loginForm.classList.toggle('hidden', name !== 'login');
    registerForm.classList.toggle('hidden', name !== 'register');
    phoneForm.classList.add('hidden');
    qs('#tabLogin').className = name === 'login' ? 'btn' : 'btn btn-outline';
    qs('#tabRegister').className = name === 'register' ? 'btn' : 'btn btn-outline';
  }
  showMode('login');
  qs('#tabLogin').onclick = () => showMode('login');
  qs('#tabRegister').onclick = () => showMode('register');
  qs('#modeEmail').onclick = () => { showMode('login'); qs('#modeEmail').className = 'btn btn-small'; qs('#modePhone').className = 'btn btn-outline btn-small'; };
  qs('#modePhone').onclick = () => {
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    phoneForm.classList.remove('hidden');
    qs('#modeEmail').className = 'btn btn-outline btn-small';
    qs('#modePhone').className = 'btn btn-small';
  };

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: qs('#loginEmail').value,
      password: qs('#loginPassword').value,
    });
    authMsg.textContent = error ? error.message : 'Giriş uğurludur. Yönləndirilirsiniz...';
    if (!error) setTimeout(() => location.href = 'profile.html', 800);
  });

  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = qs('#regEmail').value;
    const phone = qs('#regPhone').value;
    const password = qs('#regPassword').value;
    if (!email) {
      authMsg.textContent = 'Email ilə qeydiyyat üçün email vacibdir. Telefon OTP-ni ayrıca istifadə edə bilərsiniz.';
      return;
    }
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: qs('#regName').value,
          surname: qs('#regSurname').value,
          phone
        }
      }
    });
    authMsg.textContent = error ? error.message : 'Qeydiyyat uğurludur. Email təsdiqi tələb oluna bilər.';
    if (data?.user) await ensureProfile(data.user, { name: qs('#regName').value, surname: qs('#regSurname').value, phone });
  });

  qs('#sendOtpBtn').addEventListener('click', async () => {
    const { error } = await supabaseClient.auth.signInWithOtp({ phone: qs('#otpPhone').value });
    authMsg.textContent = error ? error.message : 'OTP göndərildi.';
  });

  qs('#verifyOtpBtn').addEventListener('click', async () => {
    const { error } = await supabaseClient.auth.verifyOtp({
      phone: qs('#otpPhone').value,
      token: qs('#otpCode').value,
      type: 'sms'
    });
    authMsg.textContent = error ? error.message : 'Telefon təsdiq edildi. Profilə yönləndirilirsiniz...';
    if (!error) setTimeout(() => location.href = 'profile.html', 800);
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

  qs('#profileForm').addEventListener('submit', async e => {
    e.preventDefault();
    let avatarUrl = profile?.avatar_url || '';
    const avatarFile = qs('#avatarInput').files[0];
    if (avatarFile) avatarUrl = await uploadFile('avatars', avatarFile, `${user.id}/${Date.now()}-${avatarFile.name}`);
    const payload = {
      id: user.id,
      email: user.email || '',
      name: qs('#profileName').value,
      surname: qs('#profileSurname').value,
      phone: qs('#profilePhone').value,
      address: qs('#profileAddress').value,
      bio: qs('#profileBio').value,
      avatar_url: avatarUrl,
    };
    const { error } = await supabaseClient.from('users').upsert(payload);
    qs('#profileMsg').textContent = error ? error.message : 'Profil uğurla yeniləndi.';
    if (!error && avatarUrl) qs('#avatarPreview').src = avatarUrl;
  });

  qs('#resetPasswordBtn').addEventListener('click', async () => {
    if (!user.email) return;
    const { error } = await supabaseClient.auth.resetPasswordForEmail(user.email, { redirectTo: `${location.origin}/login.html` });
    qs('#profileMsg').textContent = error ? error.message : 'Şifrə sıfırlama emaili göndərildi.';
  });

  qs('#logoutBtn').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    location.href = 'login.html';
  });
}

async function uploadFile(bucket, file, path) {
  const { error } = await supabaseClient.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function initDetail() {
  const id = params.get('id');
  const root = qs('#detailRoot');
  if (!id) { root.innerHTML = '<div class="empty-state">Elan tapılmadı.</div>'; return; }
  const { data } = await supabaseClient.from('elanlar').select('*').eq('id', id).maybeSingle();
  if (!data) { root.innerHTML = '<div class="empty-state">Elan tapılmadı.</div>'; return; }

  const images = Array.isArray(data.images) && data.images.length ? data.images : ['foto/car-placeholder.jpg'];
  root.innerHTML = `
    <section class="detail-card">
      <div class="gallery">
        <div class="main-photo"><img id="detailMainImage" src="${images[0]}" alt="${data.brand} ${data.model}"></div>
        <div class="thumbs">${images.map(src => `<button type="button"><img src="${src}" alt="thumb"></button>`).join('')}</div>
      </div>
      <div class="detail-meta">
        <div class="spec"><small>Marka / Model</small><strong>${data.brand} ${data.model}</strong></div>
        <div class="spec"><small>Qiymət</small><strong>${fmt(data.price, data.currency)}</strong></div>
        <div class="spec"><small>İl</small><strong>${data.year}</strong></div>
        <div class="spec"><small>Yürüş</small><strong>${Number(data.mileage || 0).toLocaleString('az-AZ')} km</strong></div>
        <div class="spec"><small>Mühərrik</small><strong>${data.engine || '-'}</strong></div>
        <div class="spec"><small>Yanacaq</small><strong>${data.fuel_type || '-'}</strong></div>
        <div class="spec"><small>Qutu</small><strong>${data.transmission || '-'}</strong></div>
        <div class="spec"><small>Rəng</small><strong>${data.color || '-'}</strong></div>
      </div>
    </section>
    <section class="sidebar-card">
      <h3>${data.brand} ${data.model}</h3>
      <p class="price" style="margin:10px 0 12px;">${fmt(data.price, data.currency)}</p>
      <div class="icon-row">
        ${data.is_credit ? '<span class="badge"><i class="fa-solid fa-wallet"></i> Kredit var</span>' : ''}
        ${data.is_barter ? '<span class="badge"><i class="fa-solid fa-arrow-right-arrow-left"></i> Barter var</span>' : ''}
      </div>
      <div class="detail-text" style="margin-top:14px;">${data.description || 'Təsvir əlavə edilməyib.'}</div>
      <div class="panel" style="padding:14px;margin-top:14px;">
        <strong>ELİT AVTO 777 qeydi</strong>
        <p class="detail-text" style="margin-top:8px;">${data.salon_note || 'Salon qeydi əlavə edilməyib.'}</p>
      </div>
      <div class="filter-actions" style="padding:14px 0 0;">
        <button class="btn" id="detailFavBtn">Sevimlilərə əlavə et</button>
        <a class="btn btn-green" target="_blank" href="https://wa.me/994517089500?text=${encodeURIComponent(`Salam, ${data.brand} ${data.model} elanına baxdım, ətraflı məlumat istəyirəm.`)}">WhatsApp</a>
      </div>
    </section>
  `;
  qsa('.thumbs button').forEach((btn, i) => btn.addEventListener('click', () => qs('#detailMainImage').src = images[i]));
  qs('#detailFavBtn').addEventListener('click', async () => {
    await toggleFavorite(data.id);
    qs('#detailFavBtn').textContent = 'Yadda saxlanıldı';
  });
}

async function initFavorites() {
  const grid = qs('#favoritesGrid');
  const favoriteIds = await getFavoriteIds();
  if (!favoriteIds.length) {
    grid.innerHTML = '<div class="empty-state">Hələ sevimli elan yoxdur.</div>';
    return;
  }
  const { data } = await supabaseClient.from('elanlar').select('*').in('id', favoriteIds).order('created_at', { ascending: false });
  renderListingGrid(data || [], favoriteIds, grid);
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

  async function loadMessages() {
    let query = supabaseClient.from('messages').select('*, users(name,surname)').order('created_at', { ascending: true });
    if (!isAdmin) query = query.eq('user_id', user.id);
    const { data } = await query;
    const messages = data || [];
    qs('#chatUserCount').textContent = messages.length;
    chatList.innerHTML = messages.length ? messages.map(msg => `
      <div class="msg ${msg.sender_role === 'admin' ? 'admin' : 'user'}">
        <strong>${msg.sender_role === 'admin' ? 'Admin' : 'Siz'}</strong><br>${msg.message}
      </div>
    `).join('') : '<div class="empty-state">Hələ mesaj yoxdur.</div>';
    chatList.scrollTop = chatList.scrollHeight;
  }

  sendBtn.addEventListener('click', async () => {
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

  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendBtn.click(); });
  await loadMessages();

  supabaseClient.channel('room-messages').on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'messages' },
    async () => {
      await loadMessages();
      refreshMessageBadge();
    }
  ).subscribe();
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
  el.textContent = count || 0;
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
        <td>${item.year}</td>
        <td>
          <button class="btn btn-outline btn-small edit-listing" data-id="${item.id}">Redaktə</button>
          <button class="btn btn-danger btn-small delete-listing" data-id="${item.id}">Sil</button>
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
        const paths = data.images.filter(x => x.includes('/object/public/')).map(url => {
          const part = url.split('/object/public/elan-images/')[1];
          return part || null;
        }).filter(Boolean);
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
        <td>
          <button class="btn btn-outline btn-small user-role" data-id="${u.id}" data-role="${u.role === 'admin' ? 'user' : 'admin'}">${u.role === 'admin' ? 'User et' : 'Admin et'}</button>
        </td>
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
        <td>${m.users?.name || ''} ${m.users?.surname || ''} <br><span class="muted">${m.sender_role}</span></td>
        <td>${m.message}</td>
        <td>${new Date(m.created_at).toLocaleString('az-AZ')}</td>
      </tr>
    `).join('');
  }

  qs('#listingForm').addEventListener('submit', async e => {
    e.preventDefault();
    try {
      const id = qs('#listingId').value;
      const files = [...qs('#carImages').files];
      let imageUrls = [];
      if (files.length) {
        for (const file of files) {
          const url = await uploadFile('elan-images', file, `${user.id}/${Date.now()}-${file.name}`);
          imageUrls.push(url);
        }
      }
      const payload = {
        brand: qs('#carBrand').value,
        model: qs('#carModel').value,
        price: Number(qs('#carPrice').value),
        currency: qs('#carCurrency').value,
        year: Number(qs('#carYear').value),
        mileage: Number(qs('#carMileage').value || 0),
        engine: qs('#carEngine').value,
        fuel_type: qs('#carFuel').value,
        transmission: qs('#carTransmission').value,
        color: qs('#carColor').value,
        condition: qs('#carCondition').value,
        body_type: qs('#carBodyType').value,
        is_credit: qs('#carCredit').value === 'true',
        is_barter: qs('#carBarter').value === 'true',
        description: qs('#carDescription').value,
        salon_note: qs('#carNote').value,
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

  qs('#clearListingForm').addEventListener('click', () => {
    qs('#listingForm').reset();
    qs('#listingId').value = '';
  });

  await Promise.all([loadStats(), loadListings(), loadUsers(), loadMessages()]);
}

async function init() {
  const page = getPage();
  if (page === 'home') await initHome();
  if (page === 'login') await initLogin();
  if (page === 'profile') await initProfile();
  if (page === 'detail') await initDetail();
  if (page === 'favorites') await initFavorites();
  if (page === 'messages') await initMessages();
  if (page === 'admin') await initAdmin();
}

document.addEventListener('DOMContentLoaded', init);
