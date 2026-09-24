// PAYMENT BACKEND CONFIG
const PAYMENT_BACKEND_URL = "https://hiv3-store.onrender.com/api/create-payment";

// LOCALSTORAGE HELPERS (JENERIK AK VYÈJ)
function getProducts() {
    const saved = localStorage.getItem('store_products');
    return saved ? JSON.parse(saved) : [];
}

function saveProducts(products) {
    localStorage.setItem('store_products', JSON.stringify(products));
}

function getBanner() {
    const saved = localStorage.getItem('store_banner');
    return saved ? JSON.parse(saved) : null;
}

function saveBanner(banner) {
    localStorage.setItem('store_banner', JSON.stringify(banner));
}

function getCategories() {
    const saved = localStorage.getItem('store_categories');
    return saved ? JSON.parse(saved) : [];
}

function saveCategories(cats) {
    localStorage.setItem('store_categories', JSON.stringify(cats));
}

function getFavorites() {
    const saved = localStorage.getItem('store_favorites');
    return saved ? JSON.parse(saved) : [];
}

function saveFavorites(favs) {
    localStorage.setItem('store_favorites', JSON.stringify(favs));
}

function getCart() {
    const saved = localStorage.getItem('store_cart');
    return saved ? JSON.parse(saved) : [];
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

// WELCOME PAGE SETUP
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

// UPLOAD VARIABLES
let uploadedImages = [];
let uploadedBannerImg = "";
let uploadedWelcomeBg = "";

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

// MODALS POU KATEGORI
function openCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (modal) {
        renderModalCategories();
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

function addNewCategory() {
    const input = document.getElementById('newCategoryInput');
    if (!input) return;
    const val = input.value.trim();
    if (val) {
        const cats = getCategories();
        if (!cats.includes(val)) {
            cats.push(val);
            saveCategories(cats);
            input.value = '';
            renderModalCategories();
        }
    }
}

function removeCategory(catName, e) {
    if (e) e.stopPropagation();
    if (confirm(`Èske w vle siprime kategori "${catName}"?`)) {
        let cats = getCategories();
        cats = cats.filter(c => c !== catName);
        saveCategories(cats);
        renderModalCategories();
    }
}

function filterByCategory(catName) {
    closeCategoryModal();
    const products = getProducts();
    const filtered = products.filter(p => p.category === catName);
    renderProductGrid(filtered);
}

function renderModalCategories() {
    const cats = getCategories();
    const adminList = document.getElementById('adminCategoryOptionsList');
    const catalogList = document.getElementById('catalogCategoryList');

    const emptyText = `<p style="font-size:12px; color:var(--text-gray); padding:10px; text-align:center;">Pa gen okenn kategori ki kreye ankò.</p>`;

    if (adminList) {
        if (cats.length === 0) {
            adminList.innerHTML = emptyText;
        } else {
            adminList.innerHTML = cats.map(c => `
                <div class="cat-option" onclick="selectCategory('${c}')">
                    <span>${c}</span>
                    <i class="fa-solid fa-trash" style="color:#EF4444; cursor:pointer;" onclick="removeCategory('${c}', event)"></i>
                </div>
            `).join('');
        }
    }

    if (catalogList) {
        if (cats.length === 0) {
            catalogList.innerHTML = emptyText;
        } else {
            catalogList.innerHTML = cats.map(c => `
                <div class="cat-option" onclick="filterByCategory('${c}')">
                    <span>${c}</span>
                    <i class="fa-solid fa-chevron-right" style="color:var(--text-gray);"></i>
                </div>
            `).join('');
        }
    }
}

// SEARCH
function handleSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const query = input.value.toLowerCase().trim();
    const products = getProducts();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.category && p.category.toLowerCase().includes(query))
    );
    renderProductGrid(filtered);
}

// FAVORITES MANAGEMENT
function toggleLike(btn, id) {
    let favs = getFavorites();
    const index = favs.indexOf(id);

    if (index > -1) {
        favs.splice(index, 1);
        btn.classList.remove('liked');
        btn.querySelector('i').className = 'fa-regular fa-heart';
    } else {
        favs.push(id);
        btn.classList.add('liked');
        btn.querySelector('i').className = 'fa-solid fa-heart';
    }
    saveFavorites(favs);

    if (window.location.pathname.includes('favorite.html')) {
        renderFavoritesPage();
    }
}

// RENDER GRID PWODUI
function renderProductGrid(productsToRender) {
    const grid = document.getElementById('catalogProductGrid');
    if (!grid) return;
    const favs = getFavorites();

    if (!productsToRender || productsToRender.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; font-size:13px; color:var(--text-gray); margin-top:30px;">Pa gen okenn pwodui nan boutik la pou kounye a.</p>`;
        return;
    }

    grid.innerHTML = productsToRender.map(p => {
        const isFav = favs.includes(p.id);
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
    window.location.href = `detail.html?id=${id}`;
}

// CART MANAGEMENT
function addToCartFromDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    if (!productId) return;

    const activeSizeBtn = document.querySelector('.size-btn.active');
    const selectedSize = activeSizeBtn ? activeSizeBtn.innerText : 'M';

    let cart = getCart();
    const existing = cart.find(item => item.id === productId && item.size === selectedSize);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: productId, size: selectedSize, qty: 1 });
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

// RENDER CART PAGE WITH DYNAMIC SUBTOTAL & TOTAL MATCH
function renderCartPage() {
    const cartList = document.getElementById('cartItemsList');
    if (!cartList) return;

    const cart = getCart();
    const products = getProducts();

    if (cart.length === 0) {
        cartList.innerHTML = `<p style="text-align:center; font-size:13px; color:var(--text-gray); margin-top:40px;">Panyen ou vid.</p>`;
        updateCartDisplayValues(0, 0);
        return;
    }

    let subTotal = 0;

    cartList.innerHTML = cart.map(item => {
        const prod = products.find(p => p.id === item.id);
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

// FONKSYON POU METE AJOU SUBTOTAL AK TOTAL
function updateCartDisplayValues(subTotal, shipping) {
    const grandTotal = subTotal > 0 ? (subTotal + shipping) : 0;

    document.querySelectorAll('#subTotalVal, #subtotal, .subtotal-val, .cart-subtotal').forEach(el => {
        el.innerText = `$${subTotal.toFixed(2)}`;
    });

    document.querySelectorAll('#shippingVal, #shipping, .shipping-val').forEach(el => {
        el.innerText = `$${shipping.toFixed(2)}`;
    });

    document.querySelectorAll('#grandTotalVal, #cart-total, #total, .total-val, .grand-total').forEach(el => {
        el.innerText = `$${grandTotal.toFixed(2)}`;
    });
}

// CHECKOUT CART DINAMIK
async function checkoutCart() {
    const btn = document.querySelector('.checkout-btn') || document.querySelector('button[onclick*="checkoutCart"]');
    let originalText = "";
    if (btn) {
        originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = "N ap trete peman an...";
    }

    try {
        const cart = getCart();
        const products = getProducts();

        if (!cart || cart.length === 0) {
            alert("Panye w la vid! Ajoute kèk pwodui anvan ou fè checkout.");
            if (btn) { btn.disabled = false; btn.innerText = originalText; }
            return;
        }

        let subtotal = 0;
        cart.forEach(item => {
            const prod = products.find(p => p.id === item.id);
            if (prod) {
                subtotal += Number(prod.price) * Number(item.qty);
            }
        });

        const shipping = 5.00;
        const grandTotal = subtotal + shipping;

        const response = await fetch(PAYMENT_BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: grandTotal,
                referenceId: `order_${Date.now()}`
            })
        });

        const data = await response.json();

        if (response.ok && data.paymentUrl) {
            window.location.href = data.paymentUrl;
        } else {
            alert("Erè Sèvè (" + response.status + "): " + JSON.stringify(data));
            if (btn) { btn.disabled = false; btn.innerText = originalText; }
        }
    } catch (err) {
        console.error("Erè Rekèt:", err);
        alert("Erè nan peman an: " + err.message);
        if (btn) { btn.disabled = false; btn.innerText = originalText; }
    }
}

// FAVORITES PAGE
function renderFavoritesPage() {
    const grid = document.getElementById('favoriteProductGrid');
    if (!grid) return;

    const favs = getFavorites();
    const products = getProducts();
    const favProducts = products.filter(p => favs.includes(p.id));

    if (favProducts.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; font-size:13px; color:var(--text-gray); margin-top:40px;">Pa gen okenn pwodui nan favori w yo.</p>`;
        return;
    }

    grid.innerHTML = favProducts.map(p => `
        <div class="grid-card" onclick="openDetail(${p.id})">
            <img src="${p.images[0] || 'https://via.placeholder.com/150'}" alt="${p.name}">
            <div class="price">$${p.price}</div>
            <div class="name">${p.name}</div>
            <button class="like-btn liked" onclick="event.stopPropagation(); toggleLike(this, ${p.id})">
                <i class="fa-solid fa-heart"></i>
            </button>
        </div>
    `).join('');
}

// PROFILE PAGE
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
                <div class="menu-item-card">
                    <div class="menu-item-left"><i class="fa-solid fa-language"></i> Lang</div>
                    <i class="fa-solid fa-chevron-right" style="color:var(--text-gray); font-size:12px;"></i>
                </div>
                <div class="menu-item-card">
                    <div class="menu-item-left"><i class="fa-solid fa-shield-halved"></i> Sekirite</div>
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
                <button class="btn-login" onclick="loginUser()">Log in / Sign up</button>
            </div>
        `;
    }
}

function loginUser() {
    setAuthStatus(true);
    renderProfilePage();
}

function logoutUser() {
    setAuthStatus(false);
    localStorage.removeItem('store_current_user');
    renderProfilePage();
}

// ADMIN ACTIONS
function renderAdminProductList() {
    const listContainer = document.getElementById('adminProductList');
    if (!listContainer) return;

    const products = getProducts();
    if (products.length === 0) {
        listContainer.innerHTML = `<p style="font-size:12px; color:var(--text-gray);">Pa gen okenn pwodui ki anregistre nan paj admin lan.</p>`;
        return;
    }

    listContainer.innerHTML = products.map(p => `
        <div class="admin-product-item">
            <div class="admin-prod-info">
                <img src="${p.images[0] || 'https://via.placeholder.com/150'}" alt="${p.name}">
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

function editProduct(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
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

function removeProduct(id) {
    if (confirm("Èske w sèten ou vle siprime pwodui sa a?")) {
        let products = getProducts();
        products = products.filter(p => p.id !== id);
        saveProducts(products);
        renderAdminProductList();
    }
}

function toggleDetailLike() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    if (!productId) return;
    const btn = document.getElementById('detailLikeBtn');
    toggleLike(btn, productId);
}

// MAIN INIT
document.addEventListener('DOMContentLoaded', () => {
    // 0. WELCOME PAGE RENDER (INDEX.HTML)
    const welcomeHero = document.getElementById('welcomeHero');
    if (welcomeHero) {
        const w = getWelcome();
        if (w.bgImage) welcomeHero.style.backgroundImage = `url('${w.bgImage}')`;
        document.getElementById('welcomeBadgeName').innerText = w.badgeName;
        document.getElementById('welcomeBadgeSub').innerText = w.badgeSub;
        document.getElementById('welcomeBrandName').innerText = w.brandName;
        document.getElementById('welcomeBrandSub').innerText = w.brandSub;
        document.getElementById('welcomeHeading').innerText = w.heading;
        document.getElementById('welcomeText1').innerText = w.text1;
        document.getElementById('welcomeText2').innerText = w.text2;
    }

    // 0.1 WELCOME PAGE EDITOR SETUP (EDIT-WELCOME.HTML)
    const welcomeForm = document.getElementById('welcomeForm');
    if (welcomeForm) {
        const w = getWelcome();
        document.getElementById('wBadgeName').value = w.badgeName;
        document.getElementById('wBadgeSub').value = w.badgeSub;
        document.getElementById('wBrandName').value = w.brandName;
        document.getElementById('wBrandSub').value = w.brandSub;
        document.getElementById('wHeading').value = w.heading;
        document.getElementById('wText1').value = w.text1;
        document.getElementById('wText2').value = w.text2;
        if (w.bgImage) {
            const container = document.getElementById('welcomeBgPreview');
            if (container) {
                const img = document.createElement('img');
                img.src = w.bgImage;
                container.appendChild(img);
            }
        }

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
            location.href = 'index.html';
        });
    }

    // 1. BANNER SETUP (CATALOG)
    const featuredCard = document.getElementById('featuredCardContainer');
    if (featuredCard) {
        const banner = getBanner();
        if (banner) {
            featuredCard.style.display = 'block';
            featuredCard.innerHTML = `
                <span class="badge">Nouvèl Koleksyon</span>
                <h3>${banner.title}</h3>
                <p class="subtitle">${banner.subtitle}</p>
                <img src="${banner.image}" alt="${banner.title}" class="featured-shoe-img">
            `;
            if (banner.productId) {
                featuredCard.onclick = () => openDetail(banner.productId);
            }
        } else {
            featuredCard.style.display = 'none'; // Kache banè a si l poko kreye nan admin
        }
    }

    // 2. CATALOG RENDER
    if (document.getElementById('catalogProductGrid')) {
        renderProductGrid(getProducts());
    }

    // 3. DETAIL PAGE SETUP
    if (window.location.pathname.includes('detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        const products = getProducts();
        const product = products.find(p => p.id === productId);

        if (product) {
            document.getElementById('productTitle').innerText = product.name;
            document.getElementById('productPrice').innerText = `$${product.price}`;
            document.getElementById('productImg').src = (product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/150';

            const favs = getFavorites();
            const btn = document.getElementById('detailLikeBtn');
            if (favs.includes(productId) && btn) {
                btn.classList.add('liked');
                btn.querySelector('i').className = 'fa-solid fa-heart';
            }

            if (product.images && product.images.length > 1) {
                const imgBox = document.querySelector('.detail-image-box');
                const galleryHTML = product.images.map(img => `
                    <img src="${img}" style="width: 45px; height: 45px; object-fit: contain; cursor: pointer; border-radius: 8px; border: 1px solid #ddd; background: #fff;" onclick="document.getElementById('productImg').src='${img}'">
                `).join('');
                if (imgBox) {
                    imgBox.insertAdjacentHTML('afterend', `<div style="display:flex; justify-content:center; gap:8px; margin-bottom:12px;">${galleryHTML}</div>`);
                }
            }

            const sizeContainer = document.getElementById('sizeContainer');
            if (sizeContainer && product.sizes && product.sizes.length > 0) {
                sizeContainer.innerHTML = product.sizes.map((s, i) => `
                    <button class="size-btn ${i === 0 ? 'active' : ''}" onclick="setActiveSize(this)">${s}</button>
                `).join('');
            }

            const colorContainer = document.getElementById('colorContainer');
            if (colorContainer && product.colors && product.colors.length > 0) {
                colorContainer.innerHTML = product.colors.map(c => `
                    <div class="dot" style="background: ${c.trim()};"></div>
                `).join('');
            }
        }
    }

    // 4. PAGES INIT
    if (window.location.pathname.includes('cart.html')) renderCartPage();
    if (window.location.pathname.includes('favorite.html')) renderFavoritesPage();
    if (window.location.pathname.includes('profil.html')) renderProfilePage();

    // 5. ADMIN SETUP
    if (window.location.pathname.includes('admin.html')) {
        renderAdminProductList();
        
        // Fill Banner Form if exists
        const b = getBanner();
        if (b) {
            document.getElementById('bannerTitle').value = b.title || '';
            document.getElementById('bannerSub').value = b.subtitle || '';
            document.getElementById('bannerProdId').value = b.productId || '';
        }

        // Banner Form Submit
        const bannerForm = document.getElementById('newCollectionForm');
        if (bannerForm) {
            bannerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const currentB = getBanner() || {};
                const updated = {
                    title: document.getElementById('bannerTitle').value,
                    subtitle: document.getElementById('bannerSub').value,
                    productId: parseInt(document.getElementById('bannerProdId').value) || null,
                    image: uploadedBannerImg || currentB.image || "https://via.placeholder.com/300"
                };
                saveBanner(updated);
                alert('Banè piblisite sove ak siksè!');
            });
        }

        // Add / Edit Product Submit
        const addProdForm = document.getElementById('addProductForm');
        if (addProdForm) {
            addProdForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const editId = document.getElementById('editProductId').value;
                const rawSizes = document.getElementById('prodSizes').value;
                const rawColors = document.getElementById('prodColors').value;

                const sizesArr = rawSizes ? rawSizes.split(',').map(s => s.trim()).filter(Boolean) : [];
                const colorsArr = rawColors ? rawColors.split(',').map(c => c.trim()).filter(Boolean) : [];
                const categoryVal = document.getElementById('prodCategory').value || 'Pwodui Jenerik';

                let products = getProducts();

                if (editId) {
                    // EDIT EXISTING
                    const index = products.findIndex(p => p.id === parseInt(editId));
                    if (index > -1) {
                        products[index].name = document.getElementById('prodName').value;
                        products[index].price = parseFloat(document.getElementById('prodPrice').value);
                        products[index].sizes = sizesArr;
                        products[index].colors = colorsArr;
                        products[index].category = categoryVal;
                        if (uploadedImages.length > 0) {
                            products[index].images = uploadedImages;
                        }
                    }
                    alert('Pwodui modifye ak siksè!');
                } else {
                    // ADD NEW
                    const newProduct = {
                        id: Date.now(),
                        name: document.getElementById('prodName').value,
                        category: categoryVal,
                        price: parseFloat(document.getElementById('prodPrice').value),
                        images: uploadedImages.length ? uploadedImages : ["https://via.placeholder.com/150"],
                        sizes: sizesArr.length ? sizesArr : ["S", "M", "L"],
                        colors: colorsArr.length ? colorsArr : ["#000000"]
                    };
                    products.unshift(newProduct);
                    alert('Pwodui anrejistre ak siksè!');
                }

                saveProducts(products);
                resetForm();
                renderAdminProductList();
            });
        }
    }
});

function setActiveSize(btn) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// LOGIQUE D'AUTHENTIFICATION (AUTH)
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabSignupBtn = document.getElementById('tabSignupBtn');
    const authHeading = document.getElementById('authHeading');
    const authSubheading = document.getElementById('authSubheading');
    const errorDiv = document.getElementById('errorMessage');

    if (!loginForm || !signupForm) return;

    if (errorDiv) errorDiv.style.display = 'none';

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        if (tabLoginBtn) tabLoginBtn.classList.add('active');
        if (tabSignupBtn) tabSignupBtn.classList.remove('active');
        if (authHeading) authHeading.innerText = 'Byenveni sou Boutik la';
        if (authSubheading) authSubheading.innerText = 'Konekte pou w ka fè achte w yo';
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        if (tabSignupBtn) tabSignupBtn.classList.add('active');
        if (tabLoginBtn) tabLoginBtn.classList.remove('active');
        if (authHeading) authHeading.innerText = 'Kreye yon Kont';
        if (authSubheading) authSubheading.innerText = 'Inskri nan kèk segonn';
    }
}

function togglePasswordVisibility(inputId, icon) {
    const input = document.getElementById(inputId);
    if (!input) return;

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

function showError(msg) {
    const errorDiv = document.getElementById('errorMessage');
    if (!errorDiv) return;
    errorDiv.innerText = msg;
    errorDiv.style.display = 'block';
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const users = JSON.parse(localStorage.getItem('store_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('store_current_user', JSON.stringify(user));
        setAuthStatus(true);
        window.location.href = 'catalog.html';
    } else {
        showError('Email oswa modpas sa pa korèk!');
    }
}

function handleSignUp(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirmPassword = document.getElementById('signupConfirmPassword').value.trim();

    if (password !== confirmPassword) {
        showError('Modpas yo pa sanble!');
        return;
    }

    let users = JSON.parse(localStorage.getItem('store_users') || '[]');
    if (users.some(u => u.email === email)) {
        showError('Gen yon kont ki deja kreye ak email sa a!');
        return;
    }

    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    localStorage.setItem('store_users', JSON.stringify(users));
    localStorage.setItem('store_current_user', JSON.stringify(newUser));
    setAuthStatus(true);

    window.location.href = 'catalog.html';
}