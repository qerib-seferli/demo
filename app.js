const sb = window.supabaseClient;
const page = document.body.dataset.page;

const BRANDS = [
  { name: "Audi", logo: "foto/audi_logo.png" },
  { name: "BMW", logo: "foto/bmw_logo.png" },
  { name: "BYD", logo: "foto/byd_logo.png" },
  { name: "Changan", logo: "foto/changan_logo.png" },
  { name: "Chery", logo: "foto/chery_logo.png" },
  { name: "Chevrolet", logo: "foto/chevrolet_logo.png" },
  { name: "Ford", logo: "foto/ford_logo.png" },
  { name: "Hyundai", logo: "foto/hyundai_logo.png" },
  { name: "Infiniti", logo: "foto/infiniti_logo.png" },
  { name: "Jeep", logo: "foto/jeep_logo.png" },
  { name: "Khazar", logo: "foto/khazar_logo.png" },
  { name: "Kia", logo: "foto/kia_logo.png" },
  { name: "Lada / VAZ", logo: "foto/lada_vaz_logo.png" },
  { name: "Land Rover", logo: "foto/land_Rover_logo.png" },
  { name: "Lexus", logo: "foto/lexus_logo.png" },
  { name: "Mazda", logo: "foto/mazda_logo.png" },
  { name: "Mercedes", logo: "foto/mercedes_logo.png" },
  { name: "Mitsubishi", logo: "foto/mitsubishi_logo.png" },
  { name: "Nissan", logo: "foto/nissan_logo.png" },
  { name: "Opel", logo: "foto/opel_logo.png" },
  { name: "Porsche", logo: "foto/porsche_logo.png" },
  { name: "Renault", logo: "foto/renault_logo.png" },
  { name: "Toyota", logo: "foto/toyota_logo.png" },
  { name: "Volkswagen", logo: "foto/volkswagen_logo.png" }
];

let currentUser = null;
let currentProfile = null;
let favoriteIds = new Set();
let activeChat = null;
let chatRefreshTimer = null;
let homeListingsCache = [];

document.addEventListener("DOMContentLoaded", async () => {
  await restoreSession();
  renderHeader();
  renderBottomNav();
  bindGlobalChatModal();

  if (page === "home") await initHomePage();
  if (page === "login") await initLoginPage();
  if (page === "profile") await initProfilePage();
  if (page === "favorites") await initFavoritesPage();
  if (page === "detail") await initDetailPage();
  if (page === "admin") await initAdminPage();

  await refreshUnreadBadges();
});

async function restoreSession() {
  const { data } = await sb.auth.getSession();
  currentUser = data.session?.user || null;
  if (currentUser) {
    currentProfile = await getMyProfile();
    await loadMyFavorites();
  }
}

async function getMyProfile() {
  if (!currentUser) return null;
  const { data } = await sb
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .maybeSingle();
  return data || null;
}

async function loadMyFavorites() {
  if (!currentUser) {
    favoriteIds = new Set();
    return;
  }
  const { data } = await sb
    .from("favorites")
    .select("listing_id")
    .eq("user_id", currentUser.id);
  favoriteIds = new Set((data || []).map(i => i.listing_id));
}

function qs(id) { return document.getElementById(id); }

function toast(message) {
  const el = qs("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2600);
}

function money(v, c) {
  const n = Number(v || 0);
  return `${n.toLocaleString("az-AZ")} ${c || "AZN"}`;
}

function headerButton() {
  if (currentUser) {
    return `<a class="pill-btn" href="${currentProfile?.role === "admin" ? "admin.html" : "profile.html"}"><i class="fa-regular fa-user"></i> ${currentProfile?.role === "admin" ? "Panel" : "Profil"}</a>`;
  }
  return `<a class="pill-btn" href="login.html"><i class="fa-solid fa-right-to-bracket"></i> Login</a>`;
}

function renderHeader() {
  const header = qs("site-header");
  if (!header) return;
  header.innerHTML = `
    <div class="topbar-inner">
      <a class="brand-left" href="index.html">
        <img src="foto/elit_avto_777_logo.png" alt="ELİT AVTO 777">
        <div class="brand-text">
          <div class="brand-title">ELİT AVTO 777</div>
          <div class="brand-sub">Avtomobil Satışı Mərkəzi</div>
        </div>
      </a>
      <div class="topbar-actions">
        ${headerButton()}
      </div>
    </div>
  `;
}

function renderBottomNav() {
  const nav = qs("bottom-nav");
  if (!nav) return;
  nav.innerHTML = `
    <div class="bottom-nav-inner">
      <a class="nav-item ${page === "favorites" ? "active" : ""}" href="sevimliler.html">
        <i class="fa-regular fa-heart"></i><span>Sevimlilər</span>
      </a>
      <button class="nav-item ${page === "admin" ? "active" : ""}" id="nav-message-btn" style="background:none;border:none;">
        <i class="fa-regular fa-message"></i><span>Mesaj</span><b class="nav-badge hidden" id="nav-msg-badge">0</b>
      </button>
      <a class="nav-item ${page === "home" ? "active" : ""}" href="index.html">
        <i class="fa-solid fa-house"></i><span>Əsas</span>
      </a>
      <a class="nav-item ${page === "profile" || page === "login" ? "active" : ""}" href="${currentUser ? "profile.html" : "login.html"}">
        <i class="fa-regular fa-user"></i><span>Profil</span>
      </a>
      <a class="nav-item" href="https://wa.me/" target="_blank" rel="noopener noreferrer">
        <i class="fa-brands fa-whatsapp"></i><span>WhatsApp</span>
      </a>
    </div>
  `;
  const btn = qs("nav-message-btn");
  if (btn) {
    btn.addEventListener("click", async () => {
      if (!currentUser) {
        location.href = "login.html";
        return;
      }
      if (currentProfile?.role === "admin") {
        location.href = "admin.html";
        return;
      }
      await openAdminGeneralChat();
    });
  }
}

async function refreshUnreadBadges() {
  if (!currentUser) return;
  const { count } = await sb
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", currentUser.id)
    .is("read_at", null);
  const badge = qs("nav-msg-badge");
  if (badge && count > 0) {
    badge.classList.remove("hidden");
    badge.textContent = count > 99 ? "99+" : count;
  }
}

function carCardMarkup(item) {
  const image = item.listing_images?.[0]?.image_url || "foto/elit_avto_777_logo.png";
  const extraImages = item.listing_images?.map(i => i.image_url) || [image];
  const favClass = favoriteIds.has(item.id) ? "active" : "";
  return `
    <article class="car-card" data-card-id="${item.id}">
      <div class="card-media">
        <button class="like-btn ${favClass}" data-fav-id="${item.id}"><i class="fa-${favoriteIds.has(item.id) ? "solid" : "regular"} fa-heart"></i></button>
        <img src="${image}" alt="${item.brand} ${item.model}" data-rotator='${JSON.stringify(extraImages)}'>
        <div class="card-badges">
          ${item.is_credit ? `<span class="badge kredit"><i class="fa-solid fa-credit-card"></i> Kredit</span>` : ""}
          ${item.is_barter ? `<span class="badge barter"><i class="fa-solid fa-right-left"></i> Barter</span>` : ""}
        </div>
      </div>
      <div class="card-body">
        <div class="price-row">
          <div class="price">${money(item.price, item.currency)}</div>
          <div class="muted">${item.condition || ""}</div>
        </div>
        <div class="car-name">${item.brand} ${item.model}</div>
        <div class="car-meta">
          <span class="meta-chip">${item.year || "-"}</span>
          <span class="meta-chip">${item.engine || "-"}</span>
          <span class="meta-chip">${Number(item.mileage || 0).toLocaleString("az-AZ")} km</span>
        </div>
        <div class="card-actions">
          <a href="elan.html?id=${item.id}" class="primary-link" data-open-detail="${item.id}">Ətraflı bax</a>
          <button class="ghost-link" data-open-chat="${item.id}"><i class="fa-regular fa-message"></i></button>
        </div>
      </div>
    </article>
  `;
}

function initCardRotators(root = document) {
  root.querySelectorAll("img[data-rotator]").forEach(img => {
    let list = [];
    try { list = JSON.parse(img.dataset.rotator || "[]"); } catch (e) {}
    if (list.length <= 1) return;
    let index = 0;
    if (img._rotator) clearInterval(img._rotator);
    img._rotator = setInterval(() => {
      index = (index + 1) % list.length;
      img.src = list[index];
    }, 2000);
  });
}

async function initHomePage() {
  buildBrandStrip();
  await fillBrandOptions();
  await loadListings();

  qs("search-btn").addEventListener("click", async () => loadListings());
  qs("filter-brand").addEventListener("change", async (e) => {
    await fillModelOptions(e.target.value);
  });
  window.addEventListener("beforeunload", () => {
    sessionStorage.setItem("home-scroll", String(window.scrollY));
  });
  setTimeout(() => {
    const lastY = Number(sessionStorage.getItem("home-scroll") || 0);
    if (lastY) window.scrollTo({ top: lastY, behavior: "instant" });
  }, 40);
}

function buildBrandStrip() {
  const strip = qs("brand-strip");
  if (!strip) return;
  const html = [...BRANDS, ...BRANDS].map(b => `
    <button class="brand-chip" data-brand="${b.name}">
      <img src="${b.logo}" alt="${b.name}">
      <span>${b.name}</span>
    </button>
  `).join("");
  strip.innerHTML = html;
  strip.querySelectorAll(".brand-chip").forEach(btn => {
    btn.addEventListener("click", async () => {
      qs("filter-brand").value = btn.dataset.brand;
      await fillModelOptions(btn.dataset.brand);
      await loadListings();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

async function fillBrandOptions() {
  const select = qs("filter-brand");
  if (!select) return;
  const { data } = await sb
    .from("listings")
    .select("brand")
    .eq("status", "active")
    .order("brand");
  const brands = [...new Set((data || []).map(i => i.brand).filter(Boolean))];
  select.innerHTML = `<option value="">Marka</option>` + brands.map(b => `<option>${b}</option>`).join("");
}

async function fillModelOptions(brand = "") {
  const modelSel = qs("filter-model");
  if (!modelSel) return;
  let query = sb.from("listings").select("model").eq("status", "active");
  if (brand) query = query.eq("brand", brand);
  const { data } = await query.order("model");
  const models = [...new Set((data || []).map(i => i.model).filter(Boolean))];
  modelSel.innerHTML = `<option value="">Model</option>` + models.map(m => `<option>${m}</option>`).join("");
}

async function loadListings() {
  const grid = qs("listing-grid");
  if (!grid) return;

  let query = sb
    .from("listings")
    .select("*, listing_images(*), profiles:seller_id(full_name, phone)")
    .eq("status", "active");

  const keyword = qs("search-keyword")?.value.trim();
  const brand = qs("filter-brand")?.value;
  const model = qs("filter-model")?.value;
  const condition = qs("filter-condition")?.value;
  const fuel = qs("filter-fuel")?.value;
  const currency = qs("filter-currency")?.value;
  const color = qs("filter-color")?.value;
  const min = qs("price-min")?.value;
  const max = qs("price-max")?.value;
  const sort = qs("filter-sort")?.value;
  const credit = qs("filter-credit")?.checked;
  const barter = qs("filter-barter")?.checked;

  if (keyword) query = query.or(`brand.ilike.%${keyword}%,model.ilike.%${keyword}%,description.ilike.%${keyword}%`);
  if (brand) query = query.eq("brand", brand);
  if (model) query = query.eq("model", model);
  if (condition) query = query.eq("condition", condition);
  if (fuel) query = query.eq("fuel_type", fuel);
  if (currency) query = query.eq("currency", currency);
  if (color) query = query.eq("color", color);
  if (min) query = query.gte("price", Number(min));
  if (max) query = query.lte("price", Number(max));
  if (credit) query = query.eq("is_credit", true);
  if (barter) query = query.eq("is_barter", true);

  if (sort === "price_desc") query = query.order("price", { ascending: false });
  else if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "year_desc") query = query.order("year", { ascending: false });
  else if (sort === "mileage_asc") query = query.order("mileage", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
    grid.innerHTML = `<div class="empty-state">Elanları yükləmək olmadı</div>`;
    return;
  }
  homeListingsCache = data || [];
  qs("listing-count").textContent = `${homeListingsCache.length} elan`;
  grid.innerHTML = homeListingsCache.length
    ? homeListingsCache.map(carCardMarkup).join("")
    : `<div class="empty-state">Bu filtrə uyğun elan tapılmadı.</div>`;
  bindCardActions(grid, homeListingsCache);
  initCardRotators(grid);
}

function bindCardActions(root, items) {
  root.querySelectorAll("[data-fav-id]").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = btn.dataset.favId;
      await toggleFavorite(id);
    });
  });
  root.querySelectorAll("[data-open-chat]").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const item = items.find(x => x.id === btn.dataset.openChat);
      await openChatForListing(item);
    });
  });
  root.querySelectorAll("[data-open-detail]").forEach(link => {
    link.addEventListener("click", () => {
      sessionStorage.setItem("home-scroll", String(window.scrollY));
    });
  });
}

async function toggleFavorite(listingId) {
  if (!currentUser) {
    location.href = "login.html";
    return;
  }
  if (favoriteIds.has(listingId)) {
    await sb.from("favorites").delete().eq("user_id", currentUser.id).eq("listing_id", listingId);
    favoriteIds.delete(listingId);
    toast("Sevimlilərdən silindi");
  } else {
    await sb.from("favorites").insert({ user_id: currentUser.id, listing_id: listingId });
    favoriteIds.add(listingId);
    toast("Sevimlilərə əlavə olundu");
  }
  if (page === "home") loadListings();
  if (page === "favorites") initFavoritesPage();
  if (page === "detail") initDetailPage();
}

async function initLoginPage() {
  const tabs = document.querySelectorAll("[data-auth-tab]");
  const forms = {
    login: qs("login-form"),
    register: qs("register-form"),
    forgot: qs("forgot-form")
  };

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      Object.values(forms).forEach(f => f.classList.add("hidden"));
      forms[btn.dataset.authTab].classList.remove("hidden");
    });
  });

  forms.login.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(forms.login);
    const email = fd.get("email");
    const password = fd.get("password");
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return toast(error.message);
    toast("Giriş uğurludur");
    setTimeout(() => location.href = "index.html", 700);
  });

  forms.register.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(forms.register);
    const email = fd.get("email");
    const password = fd.get("password");
    const full_name = fd.get("full_name");
    const phone = fd.get("phone");
    const address = fd.get("address");

    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { full_name, phone, address } }
    });
    if (error) return toast(error.message);

    if (data.user?.id) {
      await sb.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name,
        phone,
        address
      });
    }
    toast("Qeydiyyat tamamlandı. Email təsdiqi tələb oluna bilər.");
    setTimeout(() => location.href = "index.html", 1200);
  });

  forms.forgot.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = new FormData(forms.forgot).get("email");
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: location.origin + location.pathname.replace("login.html", "profile.html")
    });
    if (error) return toast(error.message);
    toast("Sıfırlama linki göndərildi");
  });
}

async function initProfilePage() {
  if (!currentUser) return location.href = "login.html";
  currentProfile = await getMyProfile();
  const form = qs("profile-form");
  form.full_name.value = currentProfile?.full_name || "";
  form.phone.value = currentProfile?.phone || "";
  form.email.value = currentUser.email || "";
  form.address.value = currentProfile?.address || "";
  qs("password-reset-email").value = currentUser.email || "";
  if (currentProfile?.avatar_url) qs("profile-avatar").src = currentProfile.avatar_url;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let avatarUrl = currentProfile?.avatar_url || null;
    const avatarFile = qs("avatar-file").files[0];
    if (avatarFile) {
      const filePath = `${currentUser.id}/${Date.now()}-${avatarFile.name}`;
      const { error: upErr } = await sb.storage.from("avatars").upload(filePath, avatarFile, { upsert: false });
      if (upErr) return toast(upErr.message);
      const { data: urlData } = sb.storage.from("avatars").getPublicUrl(filePath);
      avatarUrl = urlData.publicUrl;
    }

    const payload = {
      id: currentUser.id,
      full_name: form.full_name.value,
      phone: form.phone.value,
      address: form.address.value,
      avatar_url: avatarUrl,
      email: currentUser.email
    };
    const { error } = await sb.from("profiles").upsert(payload);
    if (error) return toast(error.message);
    toast("Profil yeniləndi");
    currentProfile = await getMyProfile();
    renderHeader();
    if (currentProfile?.avatar_url) qs("profile-avatar").src = currentProfile.avatar_url;
  });

  qs("logout-btn").addEventListener("click", async () => {
    await sb.auth.signOut();
    location.href = "index.html";
  });

  qs("send-reset-from-profile").addEventListener("click", async () => {
    const { error } = await sb.auth.resetPasswordForEmail(currentUser.email, {
      redirectTo: location.origin + location.pathname
    });
    if (error) return toast(error.message);
    toast("Şifrə sıfırlama linki göndərildi");
  });
}

async function initFavoritesPage() {
  if (!currentUser) return location.href = "login.html";
  const grid = qs("favorites-grid");
  const { data, error } = await sb
    .from("favorites")
    .select("listing_id, listings(*, listing_images(*))")
    .eq("user_id", currentUser.id);
  if (error) {
    grid.innerHTML = `<div class="empty-state">Sevimliləri yükləmək olmadı</div>`;
    return;
  }
  const items = (data || []).map(x => x.listings).filter(Boolean);
  grid.innerHTML = items.length ? items.map(carCardMarkup).join("") : `<div class="empty-state">Hələ sevimli elan yoxdur.</div>`;
  bindCardActions(grid, items);
  initCardRotators(grid);
}

function getQueryParam(name) {
  return new URLSearchParams(location.search).get(name);
}

async function initDetailPage() {
  const id = getQueryParam("id");
  const root = qs("detail-root");
  if (!id) {
    root.innerHTML = `<div class="empty-state">Elan tapılmadı.</div>`;
    return;
  }
  const { data, error } = await sb
    .from("listings")
    .select("*, listing_images(*), profiles:seller_id(full_name, phone)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    root.innerHTML = `<div class="empty-state">Elan tapılmadı.</div>`;
    return;
  }
  const images = data.listing_images?.map(i => i.image_url) || ["foto/elit_avto_777_logo.png"];
  root.innerHTML = `
    <div class="detail-gallery">
      <img id="detail-main-image" src="${images[0]}" alt="${data.brand} ${data.model}">
      <div class="card-badges">
        ${data.is_credit ? `<span class="badge kredit"><i class="fa-solid fa-credit-card"></i> Kredit</span>` : ""}
        ${data.is_barter ? `<span class="badge barter"><i class="fa-solid fa-right-left"></i> Barter</span>` : ""}
      </div>
      <div class="gallery-dots" id="gallery-dots"></div>
    </div>

    <div class="price-row">
      <div class="price">${money(data.price, data.currency)}</div>
      <button class="icon-btn ${favoriteIds.has(data.id) ? "active" : ""}" id="detail-fav-btn"><i class="fa-${favoriteIds.has(data.id) ? "solid" : "regular"} fa-heart"></i></button>
    </div>
    <div class="hero-title" style="font-size:28px;margin-bottom:8px;">${data.brand} ${data.model}</div>
    <p class="hero-text">${data.description || "Ətraflı qeyd əlavə edilməyib."}</p>

    <div class="spec-grid">
      <div class="spec-item"><span>Buraxılış ili</span><strong>${data.year || "-"}</strong></div>
      <div class="spec-item"><span>Mühərrik</span><strong>${data.engine || "-"}</strong></div>
      <div class="spec-item"><span>Yürüş</span><strong>${Number(data.mileage || 0).toLocaleString("az-AZ")} km</strong></div>
      <div class="spec-item"><span>Yanacaq</span><strong>${data.fuel_type || "-"}</strong></div>
      <div class="spec-item"><span>Rəng</span><strong>${data.color || "-"}</strong></div>
      <div class="spec-item"><span>Vəziyyət</span><strong>${data.condition || "-"}</strong></div>
    </div>

    ${data.note ? `<div class="profile-card" style="padding:14px;margin-top:10px;"><div class="section-title"><h2>ELİT AVTO 777 qeydi</h2></div><p class="hero-text">${data.note}</p></div>` : ""}

    <div class="grid-2" style="margin-top:14px;">
      <a href="index.html" class="pill-btn soft-btn" style="display:grid;place-items:center;">Geri qayıt</a>
      <button class="pill-btn" id="detail-chat-btn">Mesaj yaz</button>
    </div>
  `;

  setupDetailGallery(images);
  qs("detail-fav-btn").addEventListener("click", async () => toggleFavorite(data.id));
  qs("detail-chat-btn").addEventListener("click", async () => openChatForListing(data));
}

function setupDetailGallery(images) {
  const main = qs("detail-main-image");
  const dotsWrap = qs("gallery-dots");
  if (!main || !dotsWrap) return;
  let index = 0;
  dotsWrap.innerHTML = images.map((_, i) => `<button class="${i === 0 ? "active" : ""}" data-dot="${i}"></button>`).join("");
  const dots = [...dotsWrap.querySelectorAll("[data-dot]")];
  function render() {
    main.src = images[index];
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  }
  dots.forEach(d => d.addEventListener("click", () => {
    index = Number(d.dataset.dot);
    render();
  }));
  if (images.length > 1) {
    setInterval(() => {
      index = (index + 1) % images.length;
      render();
    }, 2000);
  }
}

async function requireAdmin() {
  if (!currentUser) {
    location.href = "login.html";
    return false;
  }
  currentProfile = await getMyProfile();
  if (currentProfile?.role !== "admin") {
    toast("Bu səhifə yalnız admin üçündür");
    setTimeout(() => location.href = "index.html", 900);
    return false;
  }
  return true;
}

async function initAdminPage() {
  const ok = await requireAdmin();
  if (!ok) return;

  const form = qs("listing-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const listingId = fd.get("listing_id");
    const payload = {
      seller_id: currentUser.id,
      brand: fd.get("brand"),
      model: fd.get("model"),
      year: Number(fd.get("year") || 0),
      engine: fd.get("engine"),
      mileage: Number(fd.get("mileage") || 0),
      condition: fd.get("condition"),
      price: Number(fd.get("price") || 0),
      currency: fd.get("currency"),
      fuel_type: fd.get("fuel_type"),
      color: fd.get("color"),
      is_credit: fd.get("is_credit") === "on",
      is_barter: fd.get("is_barter") === "on",
      description: fd.get("description"),
      note: fd.get("note"),
      status: "active"
    };

    let savedId = listingId;
    if (listingId) {
      const { error } = await sb.from("listings").update(payload).eq("id", listingId);
      if (error) return toast(error.message);
    } else {
      const { data, error } = await sb.from("listings").insert(payload).select("id").single();
      if (error) return toast(error.message);
      savedId = data.id;
    }

    const files = qs("listing-images").files;
    if (files.length) {
      for (const file of files) {
        const filePath = `${savedId}/${Date.now()}-${file.name}`;
        const { error: upErr } = await sb.storage.from("listing-images").upload(filePath, file);
        if (upErr) return toast(upErr.message);
        const { data: urlData } = sb.storage.from("listing-images").getPublicUrl(filePath);
        await sb.from("listing_images").insert({
          listing_id: savedId,
          image_url: urlData.publicUrl
        });
      }
    }

    toast("Elan yadda saxlanıldı");
    form.reset();
    form.listing_id.value = "";
    await loadAdminListings();
  });

  qs("reset-listing-form").addEventListener("click", () => {
    form.reset();
    form.listing_id.value = "";
    toast("Form təmizləndi");
  });

  qs("load-admin-listings").addEventListener("click", loadAdminListings);
  qs("load-admin-users").addEventListener("click", loadAdminUsers);
  qs("load-admin-messages").addEventListener("click", loadAdminChats);

  await loadAdminListings();
  await loadAdminUsers();
  await loadAdminChats();
}

async function loadAdminListings() {
  const wrap = qs("admin-listings");
  const { data, error } = await sb
    .from("listings")
    .select("*, listing_images(*)")
    .order("created_at", { ascending: false });
  if (error) {
    wrap.innerHTML = `<div class="empty-state">Elanları yükləmək olmadı</div>`;
    return;
  }
  wrap.innerHTML = (data || []).map(item => `
    <div class="admin-row">
      <div>
        <h4>${item.brand} ${item.model}</h4>
        <div class="muted">${money(item.price, item.currency)} • ${item.year || "-"} • ${Number(item.mileage || 0).toLocaleString("az-AZ")} km</div>
      </div>
      <div class="admin-actions">
        <button class="small-btn good" data-edit-listing="${item.id}">Redaktə</button>
        <button class="small-btn warn" data-delete-listing="${item.id}">Sil</button>
      </div>
    </div>
  `).join("") || `<div class="empty-state">Hələ elan yoxdur</div>`;

  wrap.querySelectorAll("[data-edit-listing]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const item = (data || []).find(x => x.id === btn.dataset.editListing);
      const form = qs("listing-form");
      form.listing_id.value = item.id;
      form.brand.value = item.brand || "";
      form.model.value = item.model || "";
      form.year.value = item.year || "";
      form.engine.value = item.engine || "";
      form.mileage.value = item.mileage || "";
      form.condition.value = item.condition || "Sürülmüş";
      form.price.value = item.price || "";
      form.currency.value = item.currency || "AZN";
      form.fuel_type.value = item.fuel_type || "Benzin";
      form.color.value = item.color || "";
      form.is_credit.checked = !!item.is_credit;
      form.is_barter.checked = !!item.is_barter;
      form.description.value = item.description || "";
      form.note.value = item.note || "";
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast("Elan redaktə üçün yükləndi");
    });
  });

  wrap.querySelectorAll("[data-delete-listing]").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Bu elanı silmək istəyirsiniz?")) return;
      const item = (data || []).find(x => x.id === btn.dataset.deleteListing);
      if (item?.listing_images?.length) {
        for (const img of item.listing_images) {
          try {
            const url = new URL(img.image_url);
            const path = decodeURIComponent(url.pathname.split("/listing-images/")[1] || "");
            if (path) await sb.storage.from("listing-images").remove([path]);
          } catch (e) {}
        }
      }
      await sb.from("listing_images").delete().eq("listing_id", item.id);
      const { error } = await sb.from("listings").delete().eq("id", item.id);
      if (error) return toast(error.message);
      toast("Elan silindi");
      await loadAdminListings();
    });
  });
}

async function loadAdminUsers() {
  const wrap = qs("admin-users");
  const { data, error } = await sb.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) {
    wrap.innerHTML = `<div class="empty-state">İstifadəçiləri yükləmək olmadı</div>`;
    return;
  }
  wrap.innerHTML = (data || []).map(user => `
    <div class="admin-row">
      <div>
        <h4>${user.full_name || "Adsız istifadəçi"}</h4>
        <div class="muted">${user.email || "-"} • ${user.phone || "-"} • ${user.address || "-"}</div>
      </div>
      <div class="admin-actions">
        ${user.email ? `<button class="small-btn good" data-reset-user="${user.email}">Reset link</button>` : ""}
      </div>
    </div>
  `).join("") || `<div class="empty-state">İstifadəçi yoxdur</div>`;

  wrap.querySelectorAll("[data-reset-user]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const email = btn.dataset.resetUser;
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: location.origin + "/profile.html"
      });
      if (error) return toast(error.message);
      toast("Şifrə sıfırlama linki göndərildi");
    });
  });
}

async function loadAdminChats() {
  const wrap = qs("admin-chats");
  const { data, error } = await sb
    .from("chats")
    .select("*, listing:listings(brand, model), buyer:buyer_id(full_name, email)")
    .order("updated_at", { ascending: false });

  if (error) {
    wrap.innerHTML = `<div class="empty-state">Mesajları yükləmək olmadı</div>`;
    return;
  }

  wrap.innerHTML = (data || []).map(chat => `
    <div class="admin-row">
      <div>
        <h4>${chat.listing ? `${chat.listing.brand} ${chat.listing.model}` : "Ümumi söhbət"}</h4>
        <div class="muted">${chat.buyer?.full_name || chat.buyer?.email || "İstifadəçi"}</div>
      </div>
      <div class="admin-actions">
        <button class="small-btn good" data-open-admin-chat="${chat.id}">Aç</button>
      </div>
    </div>
  `).join("") || `<div class="empty-state">Mesaj yoxdur</div>`;

  wrap.querySelectorAll("[data-open-admin-chat]").forEach(btn => {
    btn.addEventListener("click", async () => {
      activeChat = (data || []).find(x => x.id === btn.dataset.openAdminChat);
      await openChatModal(activeChat);
    });
  });
}

function bindGlobalChatModal() {
  qs("close-chat")?.addEventListener("click", closeChatModal);
  qs("chat-send")?.addEventListener("click", sendActiveChatMessage);
  qs("chat-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendActiveChatMessage();
  });
}

async function openAdminGeneralChat() {
  const adminId = await getFirstAdminId();
  if (!adminId) return toast("Admin tapılmadı");
  let { data } = await sb
    .from("chats")
    .select("*")
    .eq("buyer_id", currentUser.id)
    .is("listing_id", null)
    .maybeSingle();

  if (!data) {
    const created = await sb.from("chats").insert({
      buyer_id: currentUser.id,
      admin_id: adminId,
      listing_id: null
    }).select("*").single();
    data = created.data;
  }
  activeChat = data;
  await openChatModal(activeChat);
}

async function openChatForListing(listing) {
  if (!currentUser) return location.href = "login.html";
  const adminId = listing.seller_id || await getFirstAdminId();
  let { data } = await sb
    .from("chats")
    .select("*")
    .eq("buyer_id", currentUser.id)
    .eq("listing_id", listing.id)
    .maybeSingle();

  if (!data) {
    const created = await sb.from("chats").insert({
      buyer_id: currentUser.id,
      admin_id: adminId,
      listing_id: listing.id
    }).select("*").single();
    data = created.data;
  }
  activeChat = data;
  await openChatModal(activeChat);
}

async function getFirstAdminId() {
  const { data } = await sb.from("profiles").select("id").eq("role", "admin").limit(1).maybeSingle();
  return data?.id || null;
}

async function openChatModal(chat) {
  const modal = qs("chat-modal");
  if (!modal) return;
  modal.classList.add("show");
  await renderChatMessages(chat.id);
  if (chatRefreshTimer) clearInterval(chatRefreshTimer);
  chatRefreshTimer = setInterval(async () => {
    if (modal.classList.contains("show") && activeChat?.id) {
      await renderChatMessages(activeChat.id, false);
    }
  }, 3000);
}

function closeChatModal() {
  qs("chat-modal")?.classList.remove("show");
  if (chatRefreshTimer) clearInterval(chatRefreshTimer);
}

async function renderChatMessages(chatId, scrollBottom = true) {
  const wrap = qs("chat-messages");
  if (!wrap) return;
  const { data } = await sb
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  wrap.innerHTML = (data || []).map(msg => `
    <div class="msg ${msg.sender_id === currentUser?.id ? "me" : "other"}">${escapeHtml(msg.body || "")}</div>
  `).join("") || `<div class="empty-state">Hələ mesaj yoxdur</div>`;
  if (scrollBottom) wrap.scrollTop = wrap.scrollHeight;

  await sb
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("chat_id", chatId)
    .eq("receiver_id", currentUser.id)
    .is("read_at", null);

  await refreshUnreadBadges();
}

async function sendActiveChatMessage() {
  const input = qs("chat-input");
  if (!input || !activeChat || !currentUser) return;
  const body = input.value.trim();
  if (!body) return;
  const receiverId = currentUser.id === activeChat.admin_id ? activeChat.buyer_id : activeChat.admin_id;

  const { error } = await sb.from("messages").insert({
    chat_id: activeChat.id,
    sender_id: currentUser.id,
    receiver_id: receiverId,
    body
  });
  if (error) return toast(error.message);

  await sb.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", activeChat.id);
  input.value = "";
  await renderChatMessages(activeChat.id);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
