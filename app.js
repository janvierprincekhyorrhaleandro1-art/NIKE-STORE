// ==========================================
// 0. SPA NAVIGATION SYSTEM & ROUTER
// ==========================================
function navigateTo(targetPageId, extraData = null) {
    const loader = document.getElementById('app-loader');
    
    if (loader) loader.classList.add('show');

    setTimeout(async () => {
        document.querySelectorAll('.page-view').forEach(page => {
            page.classList.remove('active');
        });

        if (targetPageId === 'page-detail' && extraData) {
            await renderDetailPage(extraData);
        }

        if (targetPageId === 'page-catalog' && typeof renderCatalogPage === 'function') {
            await renderCatalogPage();
        } else if (targetPageId === 'page-cart' && typeof renderCartPage === 'function') {
            await renderCartPage();
        } else if (targetPageId === 'page-favorite' && typeof renderFavoritesPage === 'function') {
            await renderFavoritesPage();
        } else if (targetPageId === 'page-profile' && typeof renderProfilePage === 'function') {
            renderProfilePage();
        }

        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        window.scrollTo(0, 0);

        if (loader) loader.classList.remove('show');
    }, 150);
}

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabSignupBtn = document.getElementById('tabSignupBtn');

    if (tab === 'login') {
        if (loginForm) loginForm.classList.remove('hidden');
        if (signupForm) signupForm.classList.add('hidden');
        if (tabLoginBtn) tabLoginBtn.classList.add('active');
        if (tabSignupBtn) tabSignupBtn.classList.remove('active');
    } else {
        if (loginForm) loginForm.classList.add('hidden');
        if (signupForm) signupForm.classList.remove('hidden');
        if (tabLoginBtn) tabLoginBtn.classList.remove('active');
        if (tabSignupBtn) tabSignupBtn.classList.add('active');
    }
}

function togglePasswordVisibility(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// ==========================================
// 1. CONFIGURATION SUPABASE & BACKEND
// ==========================================
const SUPABASE_URL = "https://euhubmvffjltycgzpvpb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aHVibXZmZmpsdHljZ3pwdnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMTQ5MjEsImV4cCI6MjEwNTc5MDkyMX0.eZUE3CStbSYKXTBOlFQxlEmSUhGnDjoGLsPG-CEyqKo";

let supabaseClient = null;

function initSupabase() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("Supabase chaje ak siksè!");
        } catch (err) {
            console.warn("Erè nan inisyalizasyon Supabase:", err);
        }
    }
}

const PAYMENT_BACKEND_URL = "https://hiv3-store.onrender.com/api/create-payment";

let uploadedImages = [];
let uploadedBannerImg = "";
let uploadedWelcomeBg = "";
let currentDetailProductId = null;

// ==========================================
// 2. SUPABASE API HELPERS
// ==========================================
async function getProducts() {
    if (!supabaseClient) return JSON.parse(localStorage.getItem('store_products') || '[]');
    const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error("Erè Supabase (getProducts):", error.message);
        return JSON.parse(localStorage.getItem('store_products') || '[]');
    }
    return data || [];
}

async function getCategories() {
    if (!supabaseClient) return JSON.parse(localStorage.getItem('store_categories') || '[]');
    const { data, error } = await supabaseClient.from('categories').select('name').order('created_at', { ascending: true });
    if (error) {
        console.error("Erè Supabase (getCategories):", error.message);
        return JSON.parse(localStorage.getItem('store_categories') || '[]');
    }
    return data.map(c => c.name);
}

async function getBanner() {
    if (!supabaseClient) return JSON.parse(localStorage.getItem('store_banner') || 'null');
    const { data, error } = await supabaseClient.from('banners').select('*').limit(1).maybeSingle();
    if (error) console.error("Erè Supabase (getBanner):", error.message);
    return data || JSON.parse(localStorage.getItem('store_banner') || 'null');
}

const defaultWelcome = {
    bgImage: "",
    badgeName: "BOUTIK MWEN",
    badgeSub: "E-COMMERCE STORE",
    brandName: "MY STORE",
    brandSub: "Byenveni nan boutik nou an",
    heading: "BYENVENI",
    text1: "Dekouvri pi bon pwodui nou yo",
    text2: "Achte ak tout sekirite ak konfyans"
};

function getWelcome() {
    const saved = localStorage.getItem('store_welcome');
    return saved ? JSON.parse(saved) : defaultWelcome;
}

function saveWelcome(data) {
    localStorage.setItem('store_welcome', JSON.stringify(data));
}

function getFavorites() {
    return JSON.parse(localStorage.getItem('store_favorites') || '[]');
}
function saveFavorites(favs) {
    localStorage.setItem('store_favorites', JSON.stringify(favs));
}

function getCart() {
    return JSON.parse(localStorage.getItem('store_cart') || '[]');
}
function saveCart(cart) {
    localStorage.setItem('store_cart', JSON.stringify(cart));
}

function getAuthStatus() {
    return localStorage.getItem('store_is_logged_in') === 'true';
}
function setAuthStatus(status) {
    localStorage.setItem('store_is_logged_in', status ? 'true' : 'false');
}

// ==========================================
// 3. IMAGE PREVIEWS
// ==========================================
function previewImage(event) {
    const container = document.getElementById('image-preview-container');
    if (!container) return;
    container.innerHTML = '';
    uploadedImages = [];
    const files = event.target.files;

    if (files) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedImages.push(e.target.result);
                const img = document.createElement('img');
                img.src = e.target.result;
                container.appendChild(img);
            }
            reader.readAsDataURL(file);
        });
    }
}

function previewBannerImg(event) {
    const container = document.getElementById('banner-preview');
    if (!container) return;
    container.innerHTML = '';
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedBannerImg = e.target.result;
            const img = document.createElement('img');
            img.src = e.target.result;
            container.appendChild(img);
        }
        reader.readAsDataURL(file);
    }
}

function previewWelcomeBg(event) {
    const container = document.getElementById('welcomeBgPreview');
    if (!container) return;
    container.innerHTML = '';
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedWelcomeBg = e.target.result;
            const img = document.createElement('img');
            img.src = e.target.result;
            container.appendChild(img);
        }
        reader.readAsDataURL(file);
    }
}

// ==========================================
// 4. KATEGORI DINAMIK
// ==========================================
async function openCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (modal) {
        await renderModalCategories();
        modal.classList.add('active');
    }
}

function closeCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (modal) modal.classList.remove('active');
}

function selectCategory(name) {
    const textElem = document.getElementById('selected-category-text');
    const inputElem = document.getElementById('prodCategory');
    if (textElem && inputElem) {
        textElem.innerText = name;
        textElem.style.color = 'var(--text-dark)';
        inputElem.value = name;
    }
    closeCategoryModal();
}

async function addNewCategory() {
    const input = document.getElementById('newCategoryInput');
    if (!input) return;
    const val = input.value.trim();
    if (val) {
        if (supabaseClient) {
            const { error } = await supabaseClient.from('categories').insert([{ name: val }]);
            if (error) return alert("Erè nan kreye kategori: " + error.message);
        } else {
            let cats = JSON.parse(localStorage.getItem('store_categories') || '[]');
            if (!cats.includes(val)) { cats.push(val); localStorage.setItem('store_categories', JSON.stringify(cats)); }
        }
        input.value = '';
        await renderModalCategories();
    }
}

async function removeCategory(catName, e) {
    if (e) e.stopPropagation();
    if (confirm(`Èske w vle siprime kategori "${catName}"?`)) {
        if (supabaseClient) {
            const { error } = await supabaseClient.from('categories').delete().eq('name', catName);
            if (error) return alert("Erè nan efase kategori: " + error.message);
        } else {
            let cats = JSON.parse(localStorage.getItem('store_categories') || '[]');
            cats = cats.filter(c => c !== catName);
            localStorage.setItem('store_categories', JSON.stringify(cats));
        }
        await renderModalCategories();
    }
}

async function filterByCategory(catName) {
    closeCategoryModal();
    const products = await getProducts();
    const filtered = products.filter(p => p.category === catName);
    renderProductGrid(filtered);
}

async function renderModalCategories() {
    const cats = await getCategories();
    const adminList = document.getElementById('adminCategoryOptionsList');
    const catalogList = document.getElementById('catalogCategoryList');
    const emptyText = `<p style="font-size:12px; color:var(--text-gray); padding:10px; text-align:center;">Pa gen okenn kategori.</p>`;

    if (adminList) {
        adminList.innerHTML = cats.length === 0 ? emptyText : cats.map(c => `
            <div class="cat-option" onclick="selectCategory('${c}')">
                <span>${c}</span>
                <i class="fa-solid fa-trash" style="color:#EF4444; cursor:pointer;" onclick="removeCategory('${c}', event)"></i>
            </div>
        `).join('');
    }

    if (catalogList) {
        catalogList.innerHTML = cats.length === 0 ? emptyText : cats.map(c => `
            <div class="cat-option" onclick="filterByCategory('${c}')">
                <span>${c}</span>
                <i class="fa-solid fa-chevron-right" style="color:var(--text-gray);"></i>
            </div>
        `).join('');
    }
}

// ==========================================
// 5. RECHÈCH AK FAVORI
// ==========================================
async function handleSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const query = input.value.toLowerCase().trim();
    const products = await getProducts();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.category && p.category.toLowerCase().includes(query))
    );
    renderProductGrid(filtered);
}

function toggleLike(btn, id) {
    let favs = getFavorites();
    const index = favs.indexOf(Number(id));

    if (index > -1) {
        favs.splice(index, 1);
        if (btn) {
            btn.classList.remove('liked');
            btn.querySelector('i').className = 'fa-regular fa-heart';
        }
    } else {
        favs.push(Number(id));
        if (btn) {
            btn.classList.add('liked');
            btn.querySelector('i').className = 'fa-solid fa-heart';
        }
    }
    saveFavorites(favs);

    const favGrid = document.getElementById('favoriteProductGrid');
    if (favGrid && favGrid.closest('.page-view').classList.contains('active')) {
        renderFavoritesPage();
    }
}

function toggleDetailLike() {
    if (!currentDetailProductId) return;
    const btn = document.getElementById('detailLikeBtn');
    toggleLike(btn, currentDetailProductId);
}

// ==========================================
// 6. RENDER CATALOG GRID & DETAIL PAGE
// ==========================================
async function renderCatalogPage() {
    const products = await getProducts();
    renderProductGrid(products);

    const featuredCard = document.getElementById('featuredCardContainer');
    if (featuredCard) {
        const banner = await getBanner();
        if (banner) {
            featuredCard.style.display = 'block';
            featuredCard.innerHTML = `
                <span class="badge">Nouvèl Koleksyon</span>
                <h3>${banner.title}</h3>
                <p class="subtitle">${banner.subtitle}</p>
                <img src="${banner.image}" alt="${banner.title}" class="featured-shoe-img">
            `;
            if (banner.product_id) {
                featuredCard.onclick = () => openDetail(banner.product_id);
            }
        } else {
            featuredCard.style.display = 'none';
        }
    }
}

function renderProductGrid(productsToRender) {
    const grid = document.getElementById('catalogProductGrid');
    if (!grid) return;
    const favs = getFavorites();

    if (!productsToRender || productsToRender.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; font-size:13px; color:var(--text-gray); margin-top:30px;">Pa gen okenn pwodui nan boutik la pou kounye a.</p>`;
        return;
    }

    grid.innerHTML = productsToRender.map(p => {
        const isFav = favs.includes(Number(p.id));
        const img = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/150';
        return `
            <div class="grid-card" onclick="openDetail(${p.id})">
                <img src="${img}" alt="${p.name}">
                <div class="price">$${p.price}</div>
                <div class="name">${p.name}</div>
                <button class="like-btn ${isFav ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLike(this, ${p.id})">
                    <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
            </div>
        `;
    }).join('');
}

function openDetail(id) {
    navigateTo('page-detail', id);
}

async function renderDetailPage(productId) {
    currentDetailProductId = Number(productId);
    const products = await getProducts();
    const product = products.find(p => Number(p.id) === Number(productId));

    if (product) {
        if(document.getElementById('productTitle')) document.getElementById('productTitle').innerText = product.name;
        if(document.getElementById('productPrice')) document.getElementById('productPrice').innerText = `$${product.price}`;
        if(document.getElementById('productImg')) document.getElementById('productImg').src = (product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/150';

        const favs = getFavorites();
        const btn = document.getElementById('detailLikeBtn');
        if (btn) {
            if (favs.includes(Number(productId))) {
                btn.classList.add('liked');
                btn.querySelector('i').className = 'fa-solid fa-heart';
            } else {
                btn.classList.remove('liked');
                btn.querySelector('i').className = 'fa-regular fa-heart';
            }
        }

        const sizeContainer = document.getElementById('sizeContainer');
        if (sizeContainer) {
            const sizesArr = product.sizes && product.sizes.length > 0 ? product.sizes : ['Standard'];
            sizeContainer.innerHTML = sizesArr.map((s, i) => `
                <button class="size-btn ${i === 0 ? 'active' : ''}" onclick="setActiveSize(this)">${s}</button>
            `).join('');
        }
    }
}

// ==========================================
// 7. PANYEN (CART) AK CHECKOUT
// ==========================================
function addToCartFromDetail() {
    if (!currentDetailProductId) return;

    const activeSizeBtn = document.querySelector('#page-detail .size-btn.active');
    const selectedSize = activeSizeBtn ? activeSizeBtn.innerText : 'M';

    let cart = getCart();
    const existing = cart.find(item => item.id === currentDetailProductId && item.size === selectedSize);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: currentDetailProductId, size: selectedSize, qty: 1 });
    }

    saveCart(cart);
    alert('Pwodui ajoute nan panyen ou!');
}

function updateCartQty(id, size, delta) {
    let cart = getCart();
    const item = cart.find(i => i.id === id && i.size === size);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => !(i.id === id && i.size === size));
        }
    }
    saveCart(cart);
    renderCartPage();
}

async function renderCartPage() {
    const cartList = document.getElementById('cartItemsList');
    if (!cartList) return;

    const cart = getCart();
    const products = await getProducts();

    if (cart.length === 0) {
        cartList.innerHTML = `<p style="text-align:center; font-size:13px; color:var(--text-gray); margin-top:40px;">Panyen ou vid.</p>`;
        updateCartDisplayValues(0, 0);
        return;
    }

    let subTotal = 0;

    cartList.innerHTML = cart.map(item => {
        const prod = products.find(p => Number(p.id) === Number(item.id));
        if (!prod) return '';
        const itemTotal = prod.price * item.qty;
        subTotal += itemTotal;
        const img = (prod.images && prod.images.length > 0) ? prod.images[0] : 'https://via.placeholder.com/150';

        return `
            <div class="cart-item-card">
                <div class="cart-item-img">
                    <img src="${img}" alt="${prod.name}">
                </div>
                <div class="cart-item-info">
                    <h4>${prod.name} (${item.size})</h4>
                    <div class="brand">${prod.category || 'Pwodui'}</div>
                    <div class="price">$${Number(prod.price).toFixed(2)}</div>
                    <div class="cart-qty-ctrl">
                        <button class="qty-btn" onclick="updateCartQty(${item.id}, '${item.size}', -1)">-</button>
                        <span style="font-size:12px; font-weight:800;">${item.qty}</span>
                        <button class="qty-btn plus" onclick="updateCartQty(${item.id}, '${item.size}', 1)">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const shipping = 5.00;
    updateCartDisplayValues(subTotal, shipping);
}

function updateCartDisplayValues(subTotal, shipping) {
    const grandTotal = subTotal > 0 ? (subTotal + shipping) : 0;
    document.querySelectorAll('#subTotalVal, #subtotal, .subtotal-val, .cart-subtotal').forEach(el => el.innerText = `$${subTotal.toFixed(2)}`);
    document.querySelectorAll('#shippingVal, #shipping, .shipping-val').forEach(el => el.innerText = `$${shipping.toFixed(2)}`);
    document.querySelectorAll('#grandTotalVal, #cart-total, #total, .total-val, .grand-total').forEach(el => el.innerText = `$${grandTotal.toFixed(2)}`);
}

async function checkoutCart() {
    const btn = document.querySelector('.btn-checkout');
    let originalText = btn ? btn.innerText : "";
    if (btn) { btn.disabled = true; btn.innerText = "N ap trete peman an..."; }

    try {
        const cart = getCart();
        const products = await getProducts();
        if (!cart || cart.length === 0) {
            alert("Panye w la vid!");
            if (btn) { btn.disabled = false; btn.innerText = originalText; }
            return;
        }

        let subtotal = 0;
        cart.forEach(item => {
            const prod = products.find(p => Number(p.id) === Number(item.id));
            if (prod) subtotal += Number(prod.price) * Number(item.qty);
        });

        const grandTotal = subtotal + 5.00;
        const response = await fetch(PAYMENT_BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: grandTotal, referenceId: `order_${Date.now()}` })
        });

        const data = await response.json();
        if (response.ok && data.paymentUrl) {
            window.location.href = data.paymentUrl;
        } else {
            alert("Erè nan peman: " + JSON.stringify(data));
            if (btn) { btn.disabled = false; btn.innerText = originalText; }
        }
    } catch (err) {
        alert("Erè: " + err.message);
        if (btn) { btn.disabled = false; btn.innerText = originalText; }
    }
}

// ==========================================
// 8. FAVORIS AK PROFILE & AUTH
// ==========================================
async function renderFavoritesPage() {
    const grid = document.getElementById('favoriteProductGrid');
    if (!grid) return;

    const favs = getFavorites();
    const products = await getProducts();
    const favProducts = products.filter(p => favs.includes(Number(p.id)));

    if (favProducts.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; font-size:13px; color:var(--text-gray); margin-top:40px;">Pa gen okenn pwodui nan favori w yo.</p>`;
        return;
    }

    grid.innerHTML = favProducts.map(p => `
        <div class="grid-card" onclick="openDetail(${p.id})">
            <img src="${(p.images && p.images[0]) ? p.images[0] : 'https://via.placeholder.com/150'}" alt="${p.name}">
            <div class="price">$${p.price}</div>
            <div class="name">${p.name}</div>
            <button class="like-btn liked" onclick="event.stopPropagation(); toggleLike(this, ${p.id})">
                <i class="fa-solid fa-heart"></i>
            </button>
        </div>
    `).join('');
}

function renderProfilePage() {
    const container = document.getElementById('profileContent');
    if (!container) return;

    const isLoggedIn = getAuthStatus();
    const currentUser = JSON.parse(localStorage.getItem('store_current_user') || '{}');

    if (isLoggedIn) {
        container.innerHTML = `
            <div class="profile-user-card">
                <img src="https://via.placeholder.com/100" alt="Profile" class="profile-avatar">
                <h3>${currentUser.name || 'Kliyan'}</h3>
                <p>${currentUser.email || 'kliyan@email.com'}</p>
                <button class="btn-edit-profile"><i class="fa-solid fa-pen"></i> Edit Profile</button>
            </div>

            <div class="profile-menu-list">
                <div class="menu-item-card" onclick="navigateTo('page-admin')">
                    <div class="menu-item-left"><i class="fa-solid fa-user-shield"></i> Pano Admin</div>
                    <i class="fa-solid fa-chevron-right" style="color:var(--text-gray); font-size:12px;"></i>
                </div>
                <div class="menu-item-card" onclick="logoutUser()" style="color:#EF4444;">
                    <div class="menu-item-left"><i class="fa-solid fa-right-from-bracket" style="color:#EF4444;"></i> Dekonekte</div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="auth-card">
                <i class="fa-regular fa-user"></i>
                <h3>Ou poko konekte!</h3>
                <p>Konekte sou kont ou pou w ka gade enfòmasyon w yo.</p>
                <button class="btn-login" onclick="navigateTo('page-auth')">Log in / Sign up</button>
            </div>
        `;
    }
}

async function logoutUser() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    setAuthStatus(false);
    localStorage.removeItem('store_current_user');
    renderProfilePage();
}

async function handleLogin(event) {
    if (event) event.preventDefault();
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value.trim();

    if (!email || !password) {
        alert("Tanpri antre imèl ak modpas ou!");
        return;
    }

    if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) return alert("Erè nan konneksyon: " + error.message);

        const userName = data.user?.user_metadata?.name || 'Kliyan';
        localStorage.setItem('store_current_user', JSON.stringify({ 
            id: data.user.id,
            email: data.user.email, 
            name: userName 
        }));
        setAuthStatus(true);
        alert("Ou konekte ak siksè!");
        navigateTo('page-catalog');
    } else {
        const users = JSON.parse(localStorage.getItem('store_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem('store_current_user', JSON.stringify(user));
            setAuthStatus(true);
            navigateTo('page-catalog');
        } else {
            alert('Email oswa modpas sa pa korèk!');
        }
    }
}

async function handleSignUp(event) {
    if (event) event.preventDefault();
    const name = document.getElementById('signupName')?.value.trim();
    const email = document.getElementById('signupEmail')?.value.trim();
    const password = document.getElementById('signupPassword')?.value.trim();

    if (!email || !password) {
        alert("Tanpri ranpli imèl ak modpas la!");
        return;
    }

    if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.signUp({ 
            email, 
            password, 
            options: { data: { name } } 
        });
        if (error) return alert("Erè nan enskripsyon: " + error.message);

        alert("Enskripsyon reyisi!");
        localStorage.setItem('store_current_user', JSON.stringify({
            id: data.user?.id,
            email: email,
            name: name
        }));
        setAuthStatus(true);
        navigateTo('page-catalog');
    } else {
        let users = JSON.parse(localStorage.getItem('store_users') || '[]');
        const newUser = { id: Date.now(), name, email, password };
        users.push(newUser);
        localStorage.setItem('store_users', JSON.stringify(users));
        localStorage.setItem('store_current_user', JSON.stringify(newUser));
        setAuthStatus(true);
        alert("Kont kreye an lokal!");
        navigateTo('page-catalog');
    }
}

// ==========================================
// 9. ADMIN ACTIONS & SUPABASE MUTATIONS
// ==========================================
async function renderAdminProductList() {
    const listContainer = document.getElementById('adminProductList');
    if (!listContainer) return;

    const products = await getProducts();
    if (products.length === 0) {
        listContainer.innerHTML = `<p style="font-size:12px; color:var(--text-gray);">Pa gen okenn pwodui nan baz done a.</p>`;
        return;
    }

    listContainer.innerHTML = products.map(p => `
        <div class="admin-product-item">
            <div class="admin-prod-info">
                <img src="${(p.images && p.images[0]) ? p.images[0] : 'https://via.placeholder.com/150'}" alt="${p.name}">
                <div class="admin-prod-details">
                    <h5>${p.name}</h5>
                    <span>$${p.price} • ${p.category || 'San Kategori'}</span>
                </div>
            </div>
            <div class="admin-actions">
                <button class="btn-edit-prod" onclick="editProduct(${p.id})">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn-remove-prod" onclick="removeProduct(${p.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

async function editProduct(id) {
    const products = await getProducts();
    const product = products.find(p => Number(p.id) === Number(id));
    if (!product) return;

    document.getElementById('editProductId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodSizes').value = product.sizes ? product.sizes.join(', ') : '';
    document.getElementById('prodColors').value = product.colors ? product.colors.join(', ') : '';
    document.getElementById('prodCategory').value = product.category || '';

    const textElem = document.getElementById('selected-category-text');
    if (textElem) {
        textElem.innerText = product.category || 'Chwazi yon kategori...';
        textElem.style.color = 'var(--text-dark)';
    }

    uploadedImages = [...(product.images || [])];
    const previewBox = document.getElementById('image-preview-container');
    if (previewBox) {
        previewBox.innerHTML = uploadedImages.map(img => `<img src="${img}">`).join('');
    }

    document.getElementById('formActionTitle').innerText = 'Modifye Pwodwi sa a';
    document.getElementById('submitProdBtn').innerText = 'Sove Modifikasyon yo';
    document.getElementById('cancelEditBtn').style.display = 'flex';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    const form = document.getElementById('addProductForm');
    if (form) form.reset();
    document.getElementById('editProductId').value = '';
    uploadedImages = [];
    const previewBox = document.getElementById('image-preview-container');
    if (previewBox) previewBox.innerHTML = '';

    const textElem = document.getElementById('selected-category-text');
    if (textElem) {
        textElem.innerText = 'Chwazi yon kategori...';
        textElem.style.color = 'var(--text-gray)';
    }

    document.getElementById('formActionTitle').innerText = 'Ajoute yon Pwodwi';
    document.getElementById('submitProdBtn').innerText = 'Anregistre Pwodui a';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

async function removeProduct(id) {
    if (confirm("Èske w sèten ou vle siprime pwodui sa a?")) {
        if (supabaseClient) {
            const { error } = await supabaseClient.from('products').delete().eq('id', Number(id));
            if (error) return alert("Erè nan efase pwodui: " + error.message);
        } else {
            let products = JSON.parse(localStorage.getItem('store_products') || '[]');
            products = products.filter(p => Number(p.id) !== Number(id));
            localStorage.setItem('store_products', JSON.stringify(products));
        }
        await renderAdminProductList();
    }
}

// ==========================================
// 10. INIT & EVENTS ON DOM LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    initSupabase();

    const loader = document.getElementById('app-loader');
    if (loader) loader.classList.remove('show');

    const welcomeHero = document.getElementById('welcomeHero');
    if (welcomeHero) {
        const w = getWelcome();
        if (w.bgImage) welcomeHero.style.backgroundImage = `url('${w.bgImage}')`;
        if (document.getElementById('welcomeBadgeName')) document.getElementById('welcomeBadgeName').innerText = w.badgeName;
        if (document.getElementById('welcomeBadgeSub')) document.getElementById('welcomeBadgeSub').innerText = w.badgeSub;
        if (document.getElementById('welcomeBrandName')) document.getElementById('welcomeBrandName').innerText = w.brandName;
        if (document.getElementById('welcomeBrandSub')) document.getElementById('welcomeBrandSub').innerText = w.brandSub;
        if (document.getElementById('welcomeHeading')) document.getElementById('welcomeHeading').innerText = w.heading;
        if (document.getElementById('welcomeText1')) document.getElementById('welcomeText1').innerText = w.text1;
        if (document.getElementById('welcomeText2')) document.getElementById('welcomeText2').innerText = w.text2;
    }

    const welcomeForm = document.getElementById('welcomeForm');
    if (welcomeForm) {
        const w = getWelcome();
        if (document.getElementById('wBadgeName')) document.getElementById('wBadgeName').value = w.badgeName;
        if (document.getElementById('wBadgeSub')) document.getElementById('wBadgeSub').value = w.badgeSub;
        if (document.getElementById('wBrandName')) document.getElementById('wBrandName').value = w.brandName;
        if (document.getElementById('wBrandSub')) document.getElementById('wBrandSub').value = w.brandSub;
        if (document.getElementById('wHeading')) document.getElementById('wHeading').value = w.heading;
        if (document.getElementById('wText1')) document.getElementById('wText1').value = w.text1;
        if (document.getElementById('wText2')) document.getElementById('wText2').value = w.text2;

        welcomeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const current = getWelcome();
            const updated = {
                bgImage: uploadedWelcomeBg || current.bgImage,
                badgeName: document.getElementById('wBadgeName').value,
                badgeSub: document.getElementById('wBadgeSub').value,
                brandName: document.getElementById('wBrandName').value,
                brandSub: document.getElementById('wBrandSub').value,
                heading: document.getElementById('wHeading').value,
                text1: document.getElementById('wText1').value,
                text2: document.getElementById('wText2').value
            };
            saveWelcome(updated);
            alert('Paj Welcome la sove ak siksè!');
            navigateTo('page-welcome');
        });
    }

    const bannerForm = document.getElementById('newCollectionForm');
    if (bannerForm) {
        bannerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('bannerTitle').value;
            const subtitle = document.getElementById('bannerSub').value;
            const prodId = parseInt(document.getElementById('bannerProdId').value) || null;

            const currentB = await getBanner();
            const bannerData = {
                title,
                subtitle,
                product_id: prodId,
                image: uploadedBannerImg || (currentB ? currentB.image : 'https://via.placeholder.com/300')
            };

            if (supabaseClient) {
                if (currentB && currentB.id) {
                    await supabaseClient.from('banners').update(bannerData).eq('id', currentB.id);
                } else {
                    await supabaseClient.from('banners').insert([bannerData]);
                }
            } else {
                localStorage.setItem('store_banner', JSON.stringify(bannerData));
            }
            alert('Banè piblisite sove!');
        });
    }

    const addProdForm = document.getElementById('addProductForm');
    if (addProdForm) {
        addProdForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const editId = document.getElementById('editProductId').value;
            const name = document.getElementById('prodName').value;
            const price = parseFloat(document.getElementById('prodPrice').value);
            const rawSizes = document.getElementById('prodSizes').value;
            const rawColors = document.getElementById('prodColors').value;
            const category = document.getElementById('prodCategory').value || 'Pwodui Jenerik';

            const sizes = rawSizes ? rawSizes.split(',').map(s => s.trim()).filter(Boolean) : [];
            const colors = rawColors ? rawColors.split(',').map(c => c.trim()).filter(Boolean) : [];

            const payload = {
                name,
                price,
                category,
                sizes,
                colors,
                images: uploadedImages.length ? uploadedImages : ["https://via.placeholder.com/150"]
            };

            if (supabaseClient) {
                if (editId) {
                    const { error } = await supabaseClient.from('products').update(payload).eq('id', Number(editId));
                    if (error) return alert("Erè nan modifikasyon: " + error.message);
                    alert('Pwodui modifye nan Supabase!');
                } else {
                    const { error } = await supabaseClient.from('products').insert([payload]);
                    if (error) return alert("Erè nan anrejistreman: " + error.message);
                    alert('Pwodui kreye nan Supabase!');
                }
            } else {
                let products = JSON.parse(localStorage.getItem('store_products') || '[]');
                if (editId) {
                    const idx = products.findIndex(p => Number(p.id) === Number(editId));
                    if (idx > -1) products[idx] = { ...products[idx], ...payload };
                } else {
                    products.unshift({ id: Date.now(), ...payload });
                }
                localStorage.setItem('store_products', JSON.stringify(products));
                alert('Sove nan LocalStorage!');
            }

            resetForm();
            await renderAdminProductList();
        });
    }

    await renderCatalogPage();
    if (document.getElementById('adminProductList')) await renderAdminProductList();
});

function setActiveSize(btn) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}