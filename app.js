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



const ADMIN_BODY_TYPES = [
  'Avtobus','Avtokran','Dartqı','Fastbek','Fayton','Furqon','Hetçbek (3 qapı)','Hetçbek (4 qapı)','Hetçbek (5 qapı)',
  'Kabriolet','Karvan','Kompakt-Van','Kupe','Kvadrosikl','Liftbek','Limuzin','Mikroavtobus','Mikrovan','Minivan',
  'Moped','Motosiklet','Offroader / SUV (3 qapı)','Offroader / SUV (5 qapı)','Offroader / SUV (açıq)',
  'Pikap (bir yarım kabin)','Pikap (ikiqat kabin)','Pikap (tək kabin)','Qolfkar','Rodster','Sedan','Skuter',
  'Spidster','SUV Kupe','Tarqa','Trisikl','Universal (3 qapı)','Universal (5 qapı)','Van','Yük maşını'
];

const ADMIN_DRIVETRAINS = ['Arxa', 'Ön', 'Tam'];

const ADMIN_TRANSMISSIONS = [
  'Avtomat (DHT)',
  'Avtomat (AT)',
  'Avtomat (Robot)',
  'Avtomat (Reduktor)',
  'Mexaniki (MT)',
  'Avtomat (Variator)'
];

const ADMIN_FUELS = [
  'Benzin', 'Dizel', 'Qaz', 'Elektro', 'Hibrid', 'Plug-in Hibrid', 'Hidrogen', 'Dizel-Hibrid'
];

const ADMIN_COLORS = [
  { name: 'Qara', hex: '#000000' },
  { name: 'Yaş Asfalt', hex: '#505050' },
  { name: 'Boz', hex: '#808080' },
  { name: 'Gümüşü', hex: '#c0c0c0' },
  { name: 'Ağ', hex: '#ffffff' },
  { name: 'Bej', hex: '#f5f5dc' },
  { name: 'Tünd qırmızı', hex: '#9b2d30' },
  { name: 'Qırmızı', hex: '#ff0000' },
  { name: 'Çəhrayı', hex: '#ffc0cb' },
  { name: 'Narıncı', hex: '#ffa500' },
  { name: 'Qızılı', hex: '#ffd700' },
  { name: 'Sarı', hex: '#ffff00' },
  { name: 'Xaki', hex: '#4E5720' },
  { name: 'Tünd yaşıl', hex: '#2D4936' },
  { name: 'Yaşıl', hex: '#16D114' },
  { name: 'Açıq yaşıl', hex: '#AFD3AF' },
  { name: 'Mavi', hex: '#42aaff' },
  { name: 'Göy', hex: '#0000ff' },
  { name: 'Bənövşəyi', hex: '#8b00ff' },
  { name: 'Qəhvəyi', hex: '#964b00' }
];

const ADMIN_EQUIPMENT = [
  'Yüngül lehimli disklər', 'ABS', 'Lyuk', 'Yağış sensoru', 'Mərkəzi qapanma', 'Park radarı', 'Kondisioner',
  'Oturacaqların isidilməsi', 'Dəri salon', 'Ksenon lampalar', '360º kamera', 'Arxa görüntü kamerası',
  'Yan pərdələr', 'Oturacaqların ventilyasiyası', 'Hava yastıqları', 'Kruiz-kontrol', 'Klimat-kontrol',
  'Naviqasiya sistemi', 'Monitor (Multimediya)', 'Multi-sükan', 'İşıq sensoru', 'Ölü zona köməkçisi',
  'Zolaqda qalma yardımı', 'Simsiz şarj', 'Apple CarPlay / Android Auto', 'Start-stop sistemi',
  'Açarsız giriş', 'Baqajın avtomatik açılması', 'Güzgülərin qatlanması', 'Yoxuşda dəstək sistemi'
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

async function renderHomeHeaderAuth() {
  const btn = qs('#homeAuthBtn');
  if (!btn) return;

  const user = await getSessionUser();

  if (!user) {
    btn.href = 'login.html';
    btn.innerHTML = `<i class="fa-regular fa-user"></i><span>Giriş</span>`;
    return;
  }

  const profile = await getProfile(user.id);
  const displayName =
    [profile?.name, profile?.surname].filter(Boolean).join(' ').trim() ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Profil';

  if (profile?.role === 'admin') {
    btn.href = 'admin.html';
    btn.innerHTML = `<i class="fa-solid fa-shield-halved"></i><span>${displayName}</span>`;
  } else {
    btn.href = 'profile.html';
    btn.innerHTML = `<i class="fa-regular fa-user"></i><span>${displayName}</span>`;
  }
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



let liveMessageChannel = null;
let liveAdminChannel = null;

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}




function fillSelectOptions(selectEl, items, withEmpty = false) {
  if (!selectEl) return;
  const start = withEmpty ? `<option value="">Seçin</option>` : '';
  selectEl.innerHTML = start + items.map(item => `<option value="${item}">${item}</option>`).join('');
}

function fillColorOptions(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = ADMIN_COLORS.map(c => `<option value="${c.name}" data-hex="${c.hex}">${c.name}</option>`).join('');
}

function renderEquipmentOptions(container, selected = []) {
  if (!container) return;
  container.innerHTML = ADMIN_EQUIPMENT.map(item => `
    <label class="equipment-chip">
      <input type="checkbox" value="${item}" ${selected.includes(item) ? 'checked' : ''}>
      <span class="dot-radio"></span>
      <span>${item}</span>
    </label>
  `).join('');
}

function getSelectedEquipment() {
  return qsa('#carEquipment input:checked').map(x => x.value);
}

function getColorHexByName(name) {
  return ADMIN_COLORS.find(c => c.name === name)?.hex || '';
}

function populateAdminListingFormOptions() {
  fillSelectOptions(qs('#carFuel'), ADMIN_FUELS);
  fillSelectOptions(qs('#carDrivetrain'), ADMIN_DRIVETRAINS, true);
  fillSelectOptions(qs('#carTransmission'), ADMIN_TRANSMISSIONS, true);
  fillSelectOptions(qs('#carBodyType'), ADMIN_BODY_TYPES, true);
  fillColorOptions(qs('#carColor'));
  renderEquipmentOptions(qs('#carEquipment'));
}

function clearAdminListingForm() {
  qs('#listingId').value = '';
  qs('#listingForm')?.reset();
  populateAdminListingFormOptions();
  qs('#carCondition').value = 'Sürülmüş';
  qs('#carCurrency').value = 'AZN';
  qs('#carCredit').value = 'false';
  qs('#carBarter').value = 'false';
  qs('#carDamage').value = 'false';
  qs('#carPainted').value = 'false';
  qs('#carVip').value = 'false';
}

function fillAdminListingForm(item) {
  qs('#listingId').value = item.id || '';
  qs('#carBrand').value = item.brand || '';
  qs('#carModel').value = item.model || '';
  qs('#carPrice').value = item.price || '';
  qs('#carCurrency').value = item.currency || 'AZN';
  qs('#carYear').value = item.year || '';
  qs('#carMileage').value = item.mileage || '';
  qs('#carEngine').value = item.engine || '';
  qs('#carFuel').value = item.fuel_type || '';
  qs('#carDrivetrain').value = item.drivetrain || '';
  qs('#carTransmission').value = item.transmission || '';
  qs('#carColor').value = item.color || '';
  qs('#carCondition').value = item.condition || 'Sürülmüş';
  qs('#carBodyType').value = item.body_type || '';
  qs('#carCredit').value = String(!!item.is_credit);
  qs('#carBarter').value = String(!!item.is_barter);
  qs('#carDamage').value = String(!!item.has_damage);
  qs('#carPainted').value = String(!!item.is_painted);
  qs('#carVip').value = String(!!item.is_vip);
  qs('#carSeats').value = item.seats_count || '';
  qs('#carNote').value = item.salon_note || '';
  qs('#carDescription').value = item.description || '';
  renderEquipmentOptions(qs('#carEquipment'), Array.isArray(item.equipment) ? item.equipment : []);
}

function collectAdminListingPayload(existingImages = []) {
  const colorName = qs('#carColor').value || '';
  return {
    brand: qs('#carBrand').value.trim(),
    model: qs('#carModel').value.trim(),
    title: `${qs('#carBrand').value.trim()} ${qs('#carModel').value.trim()}`.trim(),
    price: Number(qs('#carPrice').value || 0),
    currency: qs('#carCurrency').value || 'AZN',
    year: Number(qs('#carYear').value || 0),
    mileage: Number(qs('#carMileage').value || 0),
    engine: qs('#carEngine').value.trim(),
    fuel_type: qs('#carFuel').value || '',
    drivetrain: qs('#carDrivetrain').value || '',
    transmission: qs('#carTransmission').value || '',
    color: colorName,
    color_name: colorName,
    color_hex: getColorHexByName(colorName),
    condition: qs('#carCondition').value || 'Sürülmüş',
    body_type: qs('#carBodyType').value || '',
    is_credit: qs('#carCredit').value === 'true',
    is_barter: qs('#carBarter').value === 'true',
    has_credit: qs('#carCredit').value === 'true',
    has_barter: qs('#carBarter').value === 'true',
    has_damage: qs('#carDamage').value === 'true',
    is_painted: qs('#carPainted').value === 'true',
    is_vip: qs('#carVip').value === 'true',
    seats_count: Number(qs('#carSeats').value || 0) || null,
    salon_note: qs('#carNote').value.trim(),
    special_note: qs('#carNote').value.trim(),
    description: qs('#carDescription').value.trim(),
    equipment: getSelectedEquipment(),
    images: existingImages
  };
}



function fullName(profile) {
  return [profile?.name, profile?.surname].filter(Boolean).join(' ').trim() || profile?.email || 'İstifadəçi';
}

function avatarUrl(profile) {
  return profile?.avatar_url || 'foto/elit_avto_777_logo.png';
}

function isUserOnline(profile) {
  if (!profile) return false;
  if (!profile.last_seen_at) return false;

  const diff = Date.now() - new Date(profile.last_seen_at).getTime();
  return diff < 45000;
}

function avatarStatusDot(profile) {
  return `<span class="avatar-status-dot ${isUserOnline(profile) ? 'online' : 'offline'}"></span>`;
}

function shouldShowEdited(msg) {
  if (!msg?.updated_at || !msg?.created_at) return false;
  const created = new Date(msg.created_at).getTime();
  const updated = new Date(msg.updated_at).getTime();
  return updated - created > 5000;
}

async function pingPresence() {
  const user = await getSessionUser();
  if (!user) return;

  await supabaseClient
    .from('users')
    .update({
      is_online: true,
      last_seen_at: new Date().toISOString()
    })
    .eq('id', user.id);
}

function setupPresenceTracking() {
  pingPresence();
  setInterval(pingPresence, 20000);

    window.addEventListener('beforeunload', async () => {
    const user = await getSessionUser();
    if (!user) return;

    try {
      await supabaseClient
        .from('users')
        .update({
          is_online: false,
          last_seen_at: new Date(Date.now() - 60000).toISOString()
        })
        .eq('id', user.id);
    } catch (e) {
      console.warn('Offline status yazılmadı:', e);
    }
  });
}

function playMessageSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = 'sine';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.24);
  } catch (e) {
    console.warn('Səs çalınmadı:', e);
  }
}

let globalMessageSoundChannel = null;
let lastSeenIncomingMessageId = null;

async function setupGlobalMessageNotifications() {
  const user = await getSessionUser();
  if (!user) return;

  const profile = await getProfile(user.id);
  const isAdmin = profile?.role === 'admin';

  if (globalMessageSoundChannel) {
    supabaseClient.removeChannel(globalMessageSoundChannel);
  }

  globalMessageSoundChannel = supabaseClient
    .channel(`global-message-sound-${user.id}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
      const msg = payload.new;
      if (!msg) return;

      const incomingForMe = isAdmin
        ? msg.sender_role === 'user'
        : msg.user_id === user.id && msg.sender_role === 'admin';

      if (!incomingForMe) return;
      if (lastSeenIncomingMessageId === msg.id) return;

      lastSeenIncomingMessageId = msg.id;
      playMessageSound();
      await refreshMessageBadge();
    })
    .subscribe();
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('az-AZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}


function formatShortDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('az-AZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function openUserDetailModal(user) {
  qs('#userModalAvatar').src = user?.avatar_url || 'foto/user-placeholder.png';
  qs('#userModalName').textContent = [user?.name, user?.surname].filter(Boolean).join(' ').trim() || user?.email || 'İstifadəçi';
  qs('#userModalRole').textContent = user?.role === 'admin' ? 'Admin' : 'İstifadəçi';
  qs('#userModalEmail').textContent = user?.email || '-';
  qs('#userModalPhone').textContent = user?.phone || '-';
  qs('#userModalAddress').textContent = user?.address || '-';
  qs('#userModalBio').textContent = user?.bio || '-';
  qs('#userModalCreatedAt').textContent = formatShortDate(user?.created_at);

  qs('#userDetailModal')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeUserDetailModal() {
  qs('#userDetailModal')?.classList.add('hidden');
  document.body.style.overflow = '';
}



async function fetchUsersMap(ids = []) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};
  const { data } = await supabaseClient.from('users').select('*').in('id', uniqueIds);
  return Object.fromEntries((data || []).map(u => [u.id, u]));
}

async function fetchConversationMessages(chatUserId) {
  const { data } = await supabaseClient
    .from('messages')
    .select('*')
    .eq('user_id', chatUserId)
    .order('created_at', { ascending: true });

  return data || [];
}

async function fetchAdminThreads() {
  const { data } = await supabaseClient
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  const all = data || [];
  const grouped = new Map();

  for (const msg of all) {
    if (!msg.user_id) continue;
    if (!grouped.has(msg.user_id)) {
      grouped.set(msg.user_id, {
        user_id: msg.user_id,
        last_message: msg.message || '',
        last_time: msg.created_at,
        unread_count: 0
      });
    }

    const row = grouped.get(msg.user_id);

    if (!row.last_time || new Date(msg.created_at) > new Date(row.last_time)) {
      row.last_message = msg.message || '';
      row.last_time = msg.created_at;
    }

    if (!msg.is_read && msg.sender_role === 'user') {
      row.unread_count += 1;
    }
  }

  const threads = [...grouped.values()].sort((a, b) => new Date(b.last_time) - new Date(a.last_time));
  const usersMap = await fetchUsersMap(threads.map(t => t.user_id));

  return threads.map(t => ({
    ...t,
    profile: usersMap[t.user_id] || null
  }));
}

function renderThreadList(items, selectedUserId) {
  if (!items.length) {
    return `<div class="empty-state">Hələ söhbət yoxdur.</div>`;
  }

  return items.map(item => `
    <button class="chat-thread-item ${item.user_id === selectedUserId ? 'active' : ''} ${item.unread_count ? 'unread' : ''}" type="button" data-chat-user="${item.user_id}">
      <div class="chat-list-avatar">
        <img src="${avatarUrl(item.profile)}" alt="${escapeHtml(fullName(item.profile))}">
      </div>

      <div class="chat-thread-text">
        <strong class="name-with-status">
          <span class="inline-status-dot ${isUserOnline(item.profile) ? 'online' : 'offline'}"></span>
          <span>${escapeHtml(fullName(item.profile))}</span>
        </strong>
        <p>${escapeHtml(item.last_message || 'Mesaj yoxdur')}</p>
      </div>

      <div class="chat-thread-badges">
        <span class="small-text muted">${formatDateTime(item.last_time)}</span>
        ${item.unread_count ? `<span class="unread-dot">${item.unread_count}</span>` : ''}
      </div>
    </button>
  `).join('');
}

function renderMessageRows(messages, usersMap, currentUserId, canManageAny = false) {
  if (!messages.length) {
    return `<div class="empty-state">Hələ mesaj yoxdur.</div>`;
  }

  const adminProfile = Object.values(usersMap).find(x => x?.role === 'admin') || null;
  const targetUserProfile = Object.values(usersMap).find(x => x?.role !== 'admin') || null;

  return messages.map(msg => {
    let senderProfile = usersMap[msg.sender_id] || null;

    if (!senderProfile) {
      senderProfile = msg.sender_role === 'admin' ? adminProfile : targetUserProfile;
    }

    const mine = msg.sender_id === currentUserId;
    const canManage = mine;
    const roleText = senderProfile?.role === 'admin' || msg.sender_role === 'admin' ? 'Admin' : 'İstifadəçi';

    return `
      <div class="message-row ${mine ? 'mine' : 'theirs'}">
        <div class="message-bubble">
          <div class="message-top">
            <div class="message-avatar">
              <img src="${avatarUrl(senderProfile)}" alt="${escapeHtml(fullName(senderProfile))}">
            </div>
            <div>
              <div class="message-name">${escapeHtml(fullName(senderProfile))}</div>
              <span class="message-role message-role-line">
                <span class="inline-status-dot ${isUserOnline(senderProfile) ? 'online' : 'offline'}"></span>
                <span>${roleText}</span>
              </span>
            </div>
          </div>

          <div class="message-text">${escapeHtml(msg.message || '')}</div>

          <div class="message-bottom">
            <span class="message-time">
              ${formatDateTime(msg.created_at)}
              ${shouldShowEdited(msg) ? ' • redaktə edildi' : ''}
            </span>
            <div class="message-actions">
              ${canManage ? `<button class="message-action-btn edit-message-btn" type="button" data-id="${msg.id}" data-text="${escapeHtml(msg.message || '')}">Redaktə</button>` : ''}
              ${canManage ? `<button class="message-action-btn delete-message-btn" type="button" data-id="${msg.id}">Sil</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}




async function markConversationRead(chatUserId, viewerRole) {
  if (!chatUserId) return;

  let query = supabaseClient
    .from('messages')
    .update({ is_read: true })
    .eq('user_id', chatUserId)
    .eq('is_read', false);

  if (viewerRole === 'admin') {
    query = query.eq('sender_role', 'user');
  } else {
    query = query.eq('sender_role', 'admin');
  }

  await query;
}




function createCard(item, favoriteIds = []) {
  const images = Array.isArray(item.images) && item.images.length ? item.images : ['foto/car-placeholder.jpg'];
  const isFav = favoriteIds.includes(item.id);

  const conditionText =
    item.condition === 'new' ? 'Yeni' :
    item.condition === 'used' ? 'Sürülmüş' :
    (item.condition || 'Sürülmüş');

  return `
    <article class="card listing-card" data-id="${item.id}">
      <div class="card-media" data-slider='${JSON.stringify(images)}'>
        <img src="${images[0]}" alt="${item.brand} ${item.model}">
        
        <div class="card-topbadges card-topfav-only">
          <button class="favorite-btn ${isFav ? 'active' : ''}" data-fav="${item.id}" type="button">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>

        <div class="slide-dots">
          ${images.map((_, i) => `<span class="${i === 0 ? 'active' : ''}"></span>`).join('')}
        </div>
      </div>

      <div class="card-body listing-card-body">
        <div class="listing-main-text">
          <div class="price">${fmt(item.price, item.currency)}</div>
          <div class="card-title">${item.brand} ${item.model}</div>
        </div>

        <div class="listing-flags">
          <span class="listing-flag condition-flag">
            <i class="fa-solid fa-car-side"></i> ${conditionText}
          </span>

          ${item.is_credit ? `
            <span class="listing-flag credit-flag">
              <i class="fa-solid fa-wallet"></i> Kredit
            </span>
          ` : ''}

          ${item.is_barter ? `
            <span class="listing-flag barter-flag">
              <i class="fa-solid fa-arrow-right-arrow-left"></i> Barter
            </span>
          ` : ''}
        </div>

        <div class="specs compact-specs">
        
          <div class="spec"><small>İl</small><strong>${item.year || '-'}</strong></div>
          <div class="spec"><small>Yürüş</small><strong>${Number(item.mileage || 0).toLocaleString('az-AZ')} km</strong></div>
          
        </div>

        <div class="card-footer listing-card-footer">
          <a class="btn btn-outline" href="elan.html?id=${item.id}">
            <i class="fa-solid fa-eye"></i> Ətraflı bax
          </a>

          <a
            class="btn btn-green whatsapp-card-btn"
            target="_blank"
            href="https://wa.me/994517089500?text=${encodeURIComponent(`Salam, ${item.brand} ${item.model} (${item.year}) elanıyla maraqlanıram.`)}"
          >
            <i class="fa-brands fa-whatsapp"></i>
          </a>
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
  let query = supabaseClient
    .from('elanlar')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (filters.brand) query = query.eq('brand', filters.brand);
  if (filters.model) query = query.eq('model', filters.model);
  if (filters.currency) query = query.eq('currency', filters.currency);
  if (filters.condition) query = query.eq('condition', filters.condition);
  if (filters.fuel) query = query.eq('fuel_type', filters.fuel);
  if (filters.drivetrain) query = query.eq('drivetrain', filters.drivetrain);
  if (filters.transmission) query = query.eq('transmission', filters.transmission);
  if (filters.color) query = query.eq('color', filters.color);
  if (filters.bodyType) query = query.eq('body_type', filters.bodyType);

  if (filters.credit) query = query.eq('is_credit', true);
  if (filters.barter) query = query.eq('is_barter', true);
  if (filters.vip) query = query.eq('is_vip', true);
  if (filters.damage) query = query.eq('has_damage', true);
  if (filters.painted) query = query.eq('is_painted', true);

  if (filters.priceMin) query = query.gte('price', Number(filters.priceMin));
  if (filters.priceMax) query = query.lte('price', Number(filters.priceMax));

  if (filters.yearMin) query = query.gte('year', Number(filters.yearMin));
  if (filters.yearMax) query = query.lte('year', Number(filters.yearMax));

  if (filters.mileageMin) query = query.gte('mileage', Number(filters.mileageMin));
  if (filters.mileageMax) query = query.lte('mileage', Number(filters.mileageMax));

  if (filters.seatsMin) query = query.gte('seats_count', Number(filters.seatsMin));
  if (filters.seatsMax) query = query.lte('seats_count', Number(filters.seatsMax));

  if (filters.engine) query = query.ilike('engine', `%${filters.engine}%`);

  const { data, error } = await query;

  if (error) {
    console.error(error.message);
    return [];
  }

  let listings = data || [];

  if (filters.equipment?.length) {
    listings = listings.filter(item => {
      const eq = Array.isArray(item.equipment) ? item.equipment : [];
      return filters.equipment.every(x => eq.includes(x));
    });
  }

  return listings;
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
    yearMin: qs('#filterYearMin')?.value || '',
    yearMax: qs('#filterYearMax')?.value || '',
    mileageMin: qs('#filterMileageMin')?.value || '',
    mileageMax: qs('#filterMileageMax')?.value || '',
    engine: qs('#filterEngine')?.value?.trim() || '',
    fuel: qs('#filterFuel')?.value || '',
    drivetrain: qs('#filterDrivetrain')?.value || '',
    transmission: qs('#filterTransmission')?.value || '',
    color: qs('#filterColor')?.value || '',
    bodyType: qs('#filterBodyType')?.value || '',
    condition: qs('input[name="condition"]:checked')?.value || '',
    seatsMin: qs('#filterSeatsMin')?.value || '',
    seatsMax: qs('#filterSeatsMax')?.value || '',
    credit: qs('#filterCredit')?.checked || false,
    barter: qs('#filterBarter')?.checked || false,
    vip: qs('#filterVip')?.checked || false,
    damage: qs('#filterDamage')?.checked || false,
    painted: qs('#filterPainted')?.checked || false,
    equipment: qsa('#filterEquipmentGrid input:checked').map(x => x.value)
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
  if (brandSelect) {
    brandSelect.innerHTML = '<option value="">Hamısı</option>' + brands.map(b => `<option>${b}</option>`).join('');
  }

  updateModels(listings);
  renderListingGrid(listings, favoriteIds, grid);

  qs('#filterBrand')?.addEventListener('change', async () => {
    updateModels(listings);
    qsa('.brand-item').forEach(x => x.classList.toggle('active', x.dataset.brand === qs('#filterBrand').value));
    qsa('.brand-chip').forEach(x => x.classList.toggle('active', x.dataset.brand === qs('#filterBrand').value));
  });

  qs('#applyFilters')?.addEventListener('click', async () => {
    const filtered = await fetchListings(readFilters());
    renderListingGrid(filtered, await getFavoriteIds(), grid);
  });

  qs('#resetFilters')?.addEventListener('click', async () => {
  qsa('.filter-wrap input').forEach(input => {
    if (input.type === 'checkbox') input.checked = false;
    else if (input.type === 'radio') input.checked = input.value === '';
    else input.value = '';
  });

  qsa('.filter-wrap select').forEach(select => select.value = '');
  qsa('.brand-item').forEach(x => x.classList.remove('active'));
  qsa('.brand-chip').forEach(x => x.classList.remove('active'));

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
  qs('#avatarPreview').src = profile?.avatar_url || 'foto/elit_avto_777_logo.png';

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
    const email = qs('#profileEmail')?.value?.trim();
    const msgEl = qs('#profileMsg');

    if (!email) {
      if (msgEl) msgEl.textContent = 'Email tapılmadı.';
      return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://qerib-seferli.github.io/elit-avto-777/reset-password.html'
    });

    if (msgEl) {
      msgEl.textContent = error
        ? `Xəta: ${error.message}`
        : 'Şifrə yeniləmə linki email ünvanınıza göndərildi.';
    }
  });

  qs('#logoutBtn')?.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    location.href = 'login.html';
  });

  refreshMessageBadge();
}



async function initResetPassword() {
  const form = qs('#resetPasswordForm');
  const msgEl = qs('#resetPasswordMsg');
  if (!form) return;

  try {
    const hash = window.location.hash || '';
    const search = new URLSearchParams(window.location.search);

    if (hash.includes('access_token') || search.get('code')) {
      if (search.get('code')) {
        await supabaseClient.auth.exchangeCodeForSession(window.location.href);
      }
    }
  } catch (e) {
    console.warn('Reset session qurulmadı:', e);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = qs('#newPassword')?.value?.trim();
    const confirmNewPassword = qs('#confirmNewPassword')?.value?.trim();

    if (!newPassword || !confirmNewPassword) {
      msgEl.textContent = 'Bütün sahələri doldurun.';
      return;
    }

    if (newPassword.length < 6) {
      msgEl.textContent = 'Şifrə ən azı 6 simvol olmalıdır.';
      return;
    }

    if (newPassword !== confirmNewPassword) {
      msgEl.textContent = 'Şifrələr eyni deyil.';
      return;
    }

    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (error) {
      msgEl.textContent = `Xəta: ${error.message}`;
      return;
    }

    msgEl.textContent = 'Şifrəniz uğurla yeniləndi. İndi yeni şifrə ilə daxil ola bilərsiniz.';

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1800);
  });
}







async function initDetail() {
  const id = params.get('id');
  const root = qs('#detailRoot');
  if (!root) return;

  if (!id) {
    root.innerHTML = '<div class="empty-state">Elan tapılmadı.</div>';
    return;
  }

  const { data } = await supabaseClient
    .from('elanlar')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!data) {
    root.innerHTML = '<div class="empty-state">Elan tapılmadı.</div>';
    return;
  }

  const images = Array.isArray(data.images) && data.images.length
    ? data.images
    : ['foto/car-placeholder.jpg'];

  const favoriteIds = await getFavoriteIds();
  const isFav = favoriteIds.includes(data.id);

  const equipment = Array.isArray(data.equipment) ? data.equipment : [];
  const colorHex = data.color_hex || getColorHexByName(data.color || '') || '#ffffff';

  root.innerHTML = `
    <section class="detail-pro-layout">
      <div class="detail-pro-gallery panel">
        <div class="detail-gallery-main-wrap">
          ${data.is_vip ? `
            <span class="vip-badge detail-vip-badge">
              <i class="fa-solid fa-crown"></i> VIP
            </span>
          ` : ''}

          <button class="detail-floating-fav ${isFav ? 'active' : ''}" id="detailFavBtn" type="button" aria-label="Sevimli">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
          </button>

          <div class="main-photo detail-main-photo-pro">
            <img id="detailMainImage" src="${images[0]}" alt="${escapeHtml(data.brand || '')} ${escapeHtml(data.model || '')}">
          </div>
        </div>

        <div class="thumbs detail-thumbs-pro">
          ${images.map((src, i) => `
            <button type="button" class="${i === 0 ? 'active' : ''}">
              <img src="${src}" alt="thumb">
            </button>
          `).join('')}
        </div>
      </div>

      <div class="detail-pro-sidebar">
        <section class="sidebar-card detail-title-card">
          <div class="detail-title-top">
  <div>
    <h2>${escapeHtml(data.brand || '')} ${escapeHtml(data.model || '')}</h2>
    <p class="detail-price-pro">${fmt(data.price, data.currency)}</p>
  </div>

  <div class="detail-top-actions">
    <button class="btn btn-outline detail-interest-btn" id="detailInterestBtn" type="button">
      <i class="fa-regular fa-paper-plane"></i> Maraqlanıram
    </button>

    <a
      class="btn btn-green detail-whatsapp-btn"
      target="_blank"
      href="https://wa.me/994517089500?text=${encodeURIComponent(`Salam, ${data.brand} ${data.model} elanına baxdım, ətraflı məlumat istəyirəm.`)}"
    >
      <i class="fa-brands fa-whatsapp"></i> WhatsApp
    </a>
  </div>
</div>

          <div class="detail-badges-pro">
            <span class="listing-flag condition-flag">
              <i class="fa-solid fa-car-side"></i> ${data.condition || '-'}
            </span>

            ${data.is_credit ? `
              <span class="listing-flag credit-flag">
                <i class="fa-solid fa-wallet"></i> Kredit
              </span>
            ` : ''}

            ${data.is_barter ? `
              <span class="listing-flag barter-flag">
                <i class="fa-solid fa-arrow-right-arrow-left"></i> Barter
              </span>
            ` : ''}
          </div>
        </section>

        <section class="sidebar-card">
          <h3 class="detail-section-title">Əsas məlumatlar</h3>

          <div class="detail-spec-grid-pro">
            ${false /* Müvəqqəti gizlədildi */? `<div class="spec"><small>Marka</small><strong>${data.brand || '-'}</strong></div>` : ''}
            ${false /* Müvəqqəti gizlədildi */? `<div class="spec"><small>Model</small><strong>${data.model || '-'}</strong></div>` : ''}
            ${false /* Müvəqqəti gizlədildi */? `<div class="spec"><small>Qiymət</small><strong>${fmt(data.price, data.currency)}</strong></div>` : ''}
            ${false /* Müvəqqəti gizlədildi */? `<div class="spec"><small>Valyuta</small><strong>${data.currency || '-'}</strong></div>` : ''}
            <div class="spec"><small>İl</small><strong>${data.year || '-'}</strong></div>
            <div class="spec"><small>Yürüş (km)</small><strong>${Number(data.mileage || 0).toLocaleString('az-AZ')} km</strong></div>
            <div class="spec"><small>Mühərrik</small><strong>${data.engine || '-'}</strong></div>
            <div class="spec"><small>Yanacaq</small><strong>${data.fuel_type || '-'}</strong></div>
            <div class="spec"><small>Ötürücü</small><strong>${data.drivetrain || '-'}</strong></div>
            <div class="spec"><small>Sürətlər qutusu</small><strong>${data.transmission || '-'}</strong></div>

            <div class="spec">
              <small>Rəng</small>
              <strong class="color-preview">
                <span class="color-dot" style="background:${colorHex}"></span>
                <span>${data.color || '-'}</span>
              </strong>
            </div>

            <div class="spec"><small>Ban növü</small><strong>${data.body_type || '-'}</strong></div>
            <div class="spec"><small>Vəziyyət</small><strong>${data.condition || '-'}</strong></div>
            <div class="spec"><small>Oturacaq sayı</small><strong>${data.seats_count || '-'}</strong></div>
            <div class="spec"><small>Vuruğu</small><strong>${data.has_damage ? 'Var' : 'Yoxdur'}</strong></div>
            <div class="spec"><small>Rənglənib</small><strong>${data.is_painted ? 'Rənglənib' : 'Rənglənməyib'}</strong></div>
          </div>
        </section>
      </div>
    </section>

    <section class="detail-bottom-stack">
      <section class="sidebar-card">
        <h3 class="detail-section-title">Avtomobilin təchizatı</h3>
        ${
          equipment.length
            ? `<div class="detail-equipment-grid">
                ${equipment.map(item => `
                  <span class="detail-equipment-chip">
                    <i class="fa-solid fa-check"></i> ${escapeHtml(item)}
                  </span>
                `).join('')}
              </div>`
            : `<div class="empty-state">Təchizat məlumatı əlavə edilməyib.</div>`
        }
      </section>

      <section class="sidebar-card">
        <h3 class="detail-section-title">ELİT AVTO 777 qeydi</h3>
        <p class="detail-text">${data.salon_note || 'Salon qeydi əlavə edilməyib.'}</p>
      </section>

      <section class="sidebar-card">
        <h3 class="detail-section-title">Təsvir</h3>
        <p class="detail-text">${data.description || 'Təsvir əlavə edilməyib.'}</p>
      </section>
    </section>
  `;

  qsa('.detail-thumbs-pro button').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      qs('#detailMainImage').src = images[i];
      qsa('.detail-thumbs-pro button').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  qs('#detailFavBtn')?.addEventListener('click', async () => {
  await toggleFavorite(data.id);
  const currentFavs = await getFavoriteIds();
  const nowFav = currentFavs.includes(data.id);
  const favBtn = qs('#detailFavBtn');

  favBtn.classList.toggle('active', nowFav);
  favBtn.innerHTML = `<i class="fa-${nowFav ? 'solid' : 'regular'} fa-heart"></i>`;
});

qs('#detailInterestBtn')?.addEventListener('click', async () => {
  const user = await getSessionUser();

  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const payload = {
    user_id: user.id,
    sender_role: 'user',
    message: `${data.brand || ''} ${data.model || ''} ${data.year ? '(' + data.year + ')' : ''} elanına maraqlanıram. Zəhmət olmasa mənimlə əlaqə saxlayın.`,
    message_text: `${data.brand || ''} ${data.model || ''} ${data.year ? '(' + data.year + ')' : ''} elanına maraqlanıram. Zəhmət olmasa mənimlə əlaqə saxlayın.`,
    elan_id: data.id,
    is_read: false
  };

  const { error } = await supabaseClient.from('messages').insert(payload);

  if (!error) {
    alert('Mesaj adminə göndərildi.');
    await refreshMessageBadge();
  } else {
    alert(`Xəta: ${error.message}`);
  }
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






async function initMessages() {
  const user = await requireAuth();
  if (!user) return;

  await ensureProfile(user);
  const profile = await getProfile(user.id);
  const isAdmin = profile?.role === 'admin';

  const sidebarPanel = qs('#chatSidebarPanel');
  const threadsEl = qs('#chatThreads');
  const countEl = qs('#chatUserCount');
  const titleEl = qs('#chatThreadTitle');
  const metaEl = qs('#chatThreadMeta');
  const avatarEl = qs('#chatThreadAvatar');
  const messagesEl = qs('#chatMessages');
  const inputEl = qs('#chatInput');
  const sendBtn = qs('#sendChatBtn');
  const editorBanner = qs('#chatEditorBanner');
  const editorPreview = qs('#chatEditorPreview');
  const cancelEditBtn = qs('#cancelEditBtn');

  let selectedUserId = isAdmin ? null : user.id;
  let editingMessageId = null;

  if (!isAdmin && sidebarPanel) {
    sidebarPanel.style.display = 'none';
    if (countEl) countEl.textContent = '1';
  }

  async function renderThreads() {
    if (!isAdmin || !threadsEl) return;

    const threads = await fetchAdminThreads();
    countEl.textContent = threads.length;

    if (!selectedUserId && threads.length) {
      selectedUserId = threads[0].user_id;
    }

    threadsEl.innerHTML = renderThreadList(threads, selectedUserId);

    qsa('[data-chat-user]', threadsEl).forEach(btn => {
      btn.addEventListener('click', async () => {
        selectedUserId = btn.dataset.chatUser;
        editingMessageId = null;
        editorBanner?.classList.add('hidden');
        await renderAll();
      });
    });
  }

  async function renderMessages() {
    if (!selectedUserId) {
      messagesEl.innerHTML = `<div class="empty-state">Söhbət seçin.</div>`;
      titleEl.textContent = 'Dəstək söhbəti';
      metaEl.textContent = 'Söhbət seçilməyib';
      avatarEl.src = 'foto/elit_avto_777_logo.png';
      return;
    }

    const messages = await fetchConversationMessages(selectedUserId);
    const ids = [...new Set(messages.flatMap(m => [m.sender_id, m.receiver_id, m.user_id]))];
    const usersMap = await fetchUsersMap(ids);
    const targetProfile = usersMap[selectedUserId] || null;

    titleEl.textContent = isAdmin ? fullName(targetProfile) : 'ELİT AVTO 777 dəstək';
    metaEl.textContent = isAdmin
      ? `${targetProfile?.email || ''}${targetProfile?.phone ? ' • ' + targetProfile.phone : ''}`
      : 'Admin ilə yazışırsınız';
    avatarEl.src = isAdmin ? avatarUrl(targetProfile) : (avatarUrl(usersMap[messages.find(x => x.sender_role === 'admin')?.sender_id]) || 'foto/user-placeholder.png');

    messagesEl.innerHTML = renderMessageRows(messages, usersMap, user.id, isAdmin);

    qsa('.edit-message-btn', messagesEl).forEach(btn => {
      btn.addEventListener('click', () => {
        editingMessageId = btn.dataset.id;
        const text = btn.dataset.text || '';
        inputEl.value = text.replaceAll('&#39;', "'").replaceAll('&quot;', '"');
        editorPreview.textContent = inputEl.value;
        editorBanner.classList.remove('hidden');
        inputEl.focus();
      });
    });

    qsa('.delete-message-btn', messagesEl).forEach(btn => {
      btn.addEventListener('click', async () => {
        const { error } = await supabaseClient.from('messages').delete().eq('id', btn.dataset.id);
        if (!error) {
          if (editingMessageId === btn.dataset.id) {
            editingMessageId = null;
            editorBanner.classList.add('hidden');
            inputEl.value = '';
          }
          await renderAll();
        }
      });
    });

    await markConversationRead(selectedUserId, isAdmin ? 'admin' : 'user');
    messagesEl.scrollTop = messagesEl.scrollHeight;
    await refreshMessageBadge();
  }

  async function renderAll() {
    await renderThreads();
    await renderMessages();
  }

  cancelEditBtn?.addEventListener('click', () => {
    editingMessageId = null;
    inputEl.value = '';
    editorBanner.classList.add('hidden');
  });

  async function submitMessage() {
    const text = inputEl.value.trim();
    if (!text || !selectedUserId) return;

    if (editingMessageId) {
      const { error } = await supabaseClient
        .from('messages')
        .update({ message: text, message_text: text })
        .eq('id', editingMessageId);

      if (!error) {
        editingMessageId = null;
        inputEl.value = '';
        editorBanner.classList.add('hidden');
        await renderAll();
      }
      return;
    }

    const payload = {
      user_id: selectedUserId,
      sender_role: isAdmin ? 'admin' : 'user',
      message: text,
      message_text: text,
      is_read: false
    };

    const { error } = await supabaseClient.from('messages').insert(payload);
    if (!error) {
      inputEl.value = '';
      await renderAll();
    }
  }

  sendBtn?.addEventListener('click', submitMessage);
  inputEl?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitMessage();
    }
  });

                                                setupPresenceTracking();
                                                await setupGlobalMessageNotifications();
  
  await renderAll();

  if (liveMessageChannel) {
    supabaseClient.removeChannel(liveMessageChannel);
  }

  liveMessageChannel = supabaseClient
    .channel(`messages-page-${isAdmin ? 'admin' : user.id}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async () => {
      await renderAll();
    })
    .subscribe();
}





async function refreshMessageBadge() {
  const el = qs('#bottomMsgCount');
  if (!el) return;

  const user = await getSessionUser();
  if (!user) {
    el.textContent = '0';
    return;
  }

  const profile = await getProfile(user.id);

  let query = supabaseClient
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  if (profile?.role === 'admin') {
    query = query.eq('sender_role', 'user');
  } else {
    query = query.eq('user_id', user.id).eq('sender_role', 'admin');
  }

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
    const [{ count: listingCount }, { count: userCount }, { count: totalMsgCount }, { count: unreadUserMsgCount }] = await Promise.all([
      supabaseClient.from('elanlar').select('*', { count: 'exact', head: true }),
      supabaseClient.from('users').select('*', { count: 'exact', head: true }),
      supabaseClient.from('messages').select('*', { count: 'exact', head: true }),
      supabaseClient.from('messages').select('*', { count: 'exact', head: true }).eq('sender_role', 'user').eq('is_read', false)
    ]);

    if (qs('#adminTotalListings')) qs('#adminTotalListings').textContent = listingCount || 0;
    if (qs('#adminTotalUsers')) qs('#adminTotalUsers').textContent = userCount || 0;
    if (qs('#adminTotalMessages')) qs('#adminTotalMessages').textContent = unreadUserMsgCount || 0;

    const kpiBtn = qs('#adminMessageKpi');
    if (kpiBtn) {
      kpiBtn.classList.toggle('has-new', (unreadUserMsgCount || 0) > 0);
    }
  }


  
  
    async function loadListings() {
    const tbody = qs('#adminListingTable');
    if (!tbody) return;

    const { data } = await supabaseClient
      .from('elanlar')
      .select('*')
      .order('created_at', { ascending: false });

    const items = data || [];

    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state">Hələ elan yoxdur.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(item => `
      <tr>
        <td>
          <div class="user-name-stack">
            <strong>${escapeHtml(item.brand || '')} ${escapeHtml(item.model || '')}</strong>
            <span>${item.is_vip ? `<span class="vip-badge"><i class="fa-solid fa-crown"></i> VIP</span>` : (item.body_type || '-')}</span>
          </div>
        </td>
        <td>${fmt(item.price, item.currency)}</td>
        <td>${item.year || '-'}</td>
        <td>
          <div class="admin-action-stack">
            <a class="btn btn-outline btn-small" href="elan.html?id=${item.id}" target="_blank">
              <i class="fa-regular fa-eye"></i> Ətraflı bax
            </a>
            <button class="btn btn-outline btn-small edit-listing-btn" type="button" data-id="${item.id}">
              Redaktə
            </button>
            <button class="btn btn-danger btn-small delete-listing-btn" type="button" data-id="${item.id}">
              Sil
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.onclick = async (e) => {
      const editBtn = e.target.closest('.edit-listing-btn');
      const deleteBtn = e.target.closest('.delete-listing-btn');

      if (editBtn) {
        const item = items.find(x => x.id === editBtn.dataset.id);
        if (!item) return;
        populateAdminListingFormOptions();
        fillAdminListingForm(item);
        qs('#adminMsg').textContent = 'Elan redaktə rejiminə gətirildi.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        const { error } = await supabaseClient.from('elanlar').delete().eq('id', id);
        qs('#adminMsg').textContent = error ? `Xəta: ${error.message}` : 'Elan silindi.';
        if (!error) {
          clearAdminListingForm();
          await loadListings();
          await loadStats();
        }
      }
    };
  }


  
    async function loadUsers() {
    const tbody = qs('#adminUsersTable');
    const searchInput = qs('#adminUserSearch');
    const showLast10Btn = qs('#showLast10Users');
    const showAllBtn = qs('#showAllUsers');
    const toggleBtn = qs('#toggleUsersSection');
    const sectionBody = qs('#usersSectionBody');

    if (!tbody) return;

    const { data } = await supabaseClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    const allUsers = data || [];
    let currentMode = 'last10';
    let query = '';

    function applyFilters(list) {
      let filtered = [...list];

      if (query.trim()) {
        const q = query.trim().toLowerCase();
        filtered = filtered.filter(user => {
          const full = `${user.name || ''} ${user.surname || ''}`.toLowerCase();
          return (
            full.includes(q) ||
            (user.phone || '').toLowerCase().includes(q) ||
            (user.email || '').toLowerCase().includes(q)
          );
        });
      }

      if (currentMode === 'last10' && !query.trim()) {
        filtered = filtered.slice(0, 10);
      }

      return filtered;
    }


      
    function renderUsers() {
      const filtered = applyFilters(allUsers);

      if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">İstifadəçi tapılmadı.</div></td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map(user => `
        <tr>
          <td>
            <div class="user-mini-profile">
              <img src="${user.avatar_url || 'foto/user-placeholder.png'}" alt="${escapeHtml(fullName(user))}">
            </div>
          </td>

          <td>
            <div class="user-name-stack">
              <strong>${escapeHtml(fullName(user))}</strong>
              <span>${user.role === 'admin' ? 'Admin hesabı' : 'İstifadəçi hesabı'}</span>
            </div>
          </td>

          <td>${user.phone || '-'}</td>
          <td>${user.email || '-'}</td>
          <td>${user.role === 'admin' ? 'Admin' : 'İstifadəçi'}</td>

          <td>
            <div class="user-actions">
              <button class="btn btn-outline btn-small user-detail-btn" type="button" data-user-id="${user.id}">
                <i class="fa-regular fa-id-card"></i> Ətraflı bax
              </button>
            </div>
          </td>
        </tr>
      `).join('');

      qsa('.user-detail-btn', tbody).forEach(btn => {
        btn.addEventListener('click', () => {
          const user = allUsers.find(x => x.id === btn.dataset.userId);
          if (user) openUserDetailModal(user);
        });
      });
    }

    searchInput?.addEventListener('input', (e) => {
      query = e.target.value || '';
      renderUsers();
    });

    showLast10Btn?.addEventListener('click', () => {
      currentMode = 'last10';
      renderUsers();
    });

    showAllBtn?.addEventListener('click', () => {
      currentMode = 'all';
      renderUsers();
    });

    toggleBtn?.addEventListener('click', () => {
      sectionBody?.classList.toggle('collapsed');
    });

    qs('#closeUserDetailModal')?.addEventListener('click', closeUserDetailModal);
    qs('#userDetailModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'userDetailModal') closeUserDetailModal();
    });

    renderUsers();
  }





  
    async function loadMessages() {
    const threadsEl = qs('#adminChatThreads');
    const countEl = qs('#adminChatCount');
    const titleEl = qs('#adminChatThreadTitle');
    const metaEl = qs('#adminChatThreadMeta');
    const avatarEl = qs('#adminChatThreadAvatar');
    const messagesEl = qs('#adminChatMessages');
    const inputEl = qs('#adminChatInput');
    const sendBtn = qs('#adminSendChatBtn');
    const editorBanner = qs('#adminChatEditorBanner');
    const editorPreview = qs('#adminChatEditorPreview');
    const cancelEditBtn = qs('#adminCancelEditBtn');

    if (!threadsEl || !messagesEl) return;

    let selectedUserId = null;
    let editingMessageId = null;

    async function renderThreads() {
      const threads = await fetchAdminThreads();
      countEl.textContent = threads.length;

      if (!selectedUserId && threads.length) {
        selectedUserId = threads[0].user_id;
      }

      threadsEl.innerHTML = renderThreadList(threads, selectedUserId);

      qsa('[data-chat-user]', threadsEl).forEach(btn => {
        btn.addEventListener('click', async () => {
          selectedUserId = btn.dataset.chatUser;
          editingMessageId = null;
          editorBanner.classList.add('hidden');
          await renderMessages();
          await renderThreads();
        });
      });
    }

    async function renderMessages() {
      if (!selectedUserId) {
        messagesEl.innerHTML = `<div class="empty-state">Hələ söhbət yoxdur.</div>`;
        titleEl.textContent = 'İstifadəçi seçin';
        metaEl.textContent = 'Mesaj görünəcək';
        avatarEl.src = 'foto/elit_avto_777_logo.png';
        return;
      }

      const messages = await fetchConversationMessages(selectedUserId);
      const ids = [...new Set(messages.flatMap(m => [m.sender_id, m.receiver_id, m.user_id]))];
      const usersMap = await fetchUsersMap(ids);
      const targetProfile = usersMap[selectedUserId] || null;

      titleEl.textContent = fullName(targetProfile);
      metaEl.textContent = `${targetProfile?.email || ''}${targetProfile?.phone ? ' • ' + targetProfile.phone : ''}`;
      avatarEl.src = avatarUrl(targetProfile);

      messagesEl.innerHTML = renderMessageRows(messages, usersMap, user.id, true);

      qsa('.edit-message-btn', messagesEl).forEach(btn => {
        btn.addEventListener('click', () => {
          editingMessageId = btn.dataset.id;
          const text = btn.dataset.text || '';
          inputEl.value = text.replaceAll('&#39;', "'").replaceAll('&quot;', '"');
          editorPreview.textContent = inputEl.value;
          editorBanner.classList.remove('hidden');
          inputEl.focus();
        });
      });

      qsa('.delete-message-btn', messagesEl).forEach(btn => {
        btn.addEventListener('click', async () => {
          const { error } = await supabaseClient.from('messages').delete().eq('id', btn.dataset.id);
          if (!error) {
            if (editingMessageId === btn.dataset.id) {
              editingMessageId = null;
              editorBanner.classList.add('hidden');
              inputEl.value = '';
            }
            await renderThreads();
            await renderMessages();
          }
        });
      });

      await markConversationRead(selectedUserId, 'admin');
      messagesEl.scrollTop = messagesEl.scrollHeight;
      await refreshMessageBadge();
    }

    cancelEditBtn?.addEventListener('click', () => {
      editingMessageId = null;
      inputEl.value = '';
      editorBanner.classList.add('hidden');
    });

    async function submitAdminReply() {
      const text = inputEl.value.trim();
      if (!text || !selectedUserId) return;

      if (editingMessageId) {
        const { error } = await supabaseClient
          .from('messages')
          .update({ message: text, message_text: text })
          .eq('id', editingMessageId);

        if (!error) {
          editingMessageId = null;
          editorBanner.classList.add('hidden');
          inputEl.value = '';
          await renderThreads();
          await renderMessages();
        }
        return;
      }

      const payload = {
        user_id: selectedUserId,
        sender_role: 'admin',
        message: text,
        message_text: text,
        is_read: false
      };

      const { error } = await supabaseClient.from('messages').insert(payload);
      if (!error) {
        inputEl.value = '';
        await renderThreads();
        await renderMessages();
      }
    }

    sendBtn?.addEventListener('click', submitAdminReply);
    inputEl?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitAdminReply();
      }
    });

    await renderThreads();
    await renderMessages();

    if (liveAdminChannel) {
      supabaseClient.removeChannel(liveAdminChannel);
    }

    liveAdminChannel = supabaseClient
      .channel('admin-support-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async () => {
        await renderThreads();
        await renderMessages();
        await loadStats();
      })
      .subscribe();
  }

  
  
      populateAdminListingFormOptions();

  qs('#clearListingForm')?.addEventListener('click', () => {
    clearAdminListingForm();
    qs('#adminMsg').textContent = 'Forma təmizləndi.';
  });

  qs('#listingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = qs('#listingId').value.trim();
    const imageFiles = [...(qs('#carImages')?.files || [])];
    let existingImages = [];

    if (id) {
      const { data: currentItem } = await supabaseClient
        .from('elanlar')
        .select('images')
        .eq('id', id)
        .maybeSingle();

      existingImages = Array.isArray(currentItem?.images) ? currentItem.images : [];
    }

    const uploadedUrls = [];
    for (const file of imageFiles) {
      const path = `listing-${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
      const { error: uploadErr } = await supabaseClient.storage.from('elan-images').upload(path, file, { upsert: true });
      if (!uploadErr) {
        const { data: publicUrlData } = supabaseClient.storage.from('elan-images').getPublicUrl(path);
        if (publicUrlData?.publicUrl) uploadedUrls.push(publicUrlData.publicUrl);
      }
    }

    const payload = collectAdminListingPayload(uploadedUrls.length ? [...existingImages, ...uploadedUrls] : existingImages);

    let error = null;

    if (id) {
      const res = await supabaseClient.from('elanlar').update(payload).eq('id', id);
      error = res.error;
    } else {
      const res = await supabaseClient.from('elanlar').insert(payload);
      error = res.error;
    }

    qs('#adminMsg').textContent = error
      ? `Xəta: ${error.message}`
      : (id ? 'Elan uğurla redaktə olundu.' : 'Yeni elan uğurla əlavə olundu.');

    if (!error) {
      clearAdminListingForm();
      await loadListings();
      await loadStats();
    }
  });

  
          await Promise.all([loadStats(), loadListings(), loadUsers()]);
              setupPresenceTracking();
          await setupGlobalMessageNotifications();
          await loadMessages();

  
        qs('#adminMessageKpi')?.addEventListener('click', () => {
          const chatSection = qs('.admin-chat-workspace');
            if (chatSection) {
            chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
  
  }

        





async function init() {
  markActiveNav();
  async function renderHomeHeaderAuth() {
  const btn = qs('#homeAuthBtn');
  if (!btn) return;

  const user = await getSessionUser();

  if (!user) {
    btn.href = 'login.html';
    btn.innerHTML = `<i class="fa-regular fa-user"></i><span>Giriş</span>`;
    return;
  }

  const profile = await getProfile(user.id);
  const displayName =
    [profile?.name, profile?.surname].filter(Boolean).join(' ').trim() ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Profil';

  if (profile?.role === 'admin') {
    btn.href = 'admin.html';
    btn.innerHTML = `<i class="fa-solid fa-shield-halved"></i><span>${displayName}</span>`;
  } else {
    btn.href = 'profile.html';
    btn.innerHTML = `<i class="fa-regular fa-user"></i><span>${displayName}</span>`;
  }
}
  const page = getPage();
  if (page === 'home') await initHome();
  if (page === 'login') await initLogin();
  if (page === 'profile') await initProfile();
  if (page === 'detail') await initDetail();
  if (page === 'favorites') await initFavorites();
  if (page === 'messages') await initMessages();
  if (page === 'admin') await initAdmin();
  if (page === 'reset-password') await initResetPassword();

  setupPresenceTracking();
  await setupGlobalMessageNotifications();
  await refreshMessageBadge();
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
