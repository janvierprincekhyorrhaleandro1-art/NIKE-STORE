// INITIAL DATA SETUP
const defaultBanner = {
    title: "Nike Air Presto",
    subtitle: "Men's Shoes",
    productId: 1,
    image: "https://i.ibb.co/2N4X33q/shoe-red.png"
};

const defaultCategories = ["Sneakers / Soulye", "Rad / Vêtements", "Akseswa", "Lòt Bagay"];

const defaultProducts = [
    {
        id: 1,
        name: "Nike ACG Mountain",
        category: "Sneakers / Soulye",
        price: 180,
        images: ["https://i.ibb.co/D8G4yG8/shoe-grey.png"],
        sizes: ["UK 5.5", "UK 6.5", "UK 9.5", "UK 11"],
        colors: ["#1A1A1A", "#9084A8"]
    },
    {
        id: 2,
        name: "Nike Air Max",
        category: "Sneakers / Soulye",
        price: 218,
        images: ["https://i.ibb.co/wSRyPTh/shoe-color.png"],
        sizes: ["UK 6.0", "UK 7.5", "UK 8.5"],
        colors: ["#3A5A40", "#A3B18A"]
    }
];

// LOCALSTORAGE HELPERS
function getProducts() {
    const saved = localStorage.getItem('nike_products');
    return saved ? JSON.parse(saved) : defaultProducts;
}

function saveProducts(products) {
    localStorage.setItem('nike_products', JSON.stringify(products));
}

function getBanner() {
    const saved = localStorage.getItem('nike_banner');
    return saved ? JSON.parse(saved) : defaultBanner;
}

function saveBanner(banner) {
    localStorage.setItem('nike_banner', JSON.stringify(banner));
}

function getCategories() {
    const saved = localStorage.getItem('nike_categories');
    return saved ? JSON.parse(saved) : defaultCategories;
}

function saveCategories(cats) {
    localStorage.setItem('nike_categories', JSON.stringify(cats));
}

function getFavorites() {
    const saved = localStorage.getItem('nike_favorites');
    return saved ? JSON.parse(saved) : [];
}

function saveFavorites(favs) {
    localStorage.setItem('nike_favorites', JSON.stringify(favs));
}

function getCart() {
    const saved = localStorage.getItem('nike_cart');
    return saved ? JSON.parse(saved) : [];
}

function saveCart(cart) {
    localStorage.setItem('nike_cart', JSON.stringify(cart));
}

function getAuthStatus() {
    return localStorage.getItem('nike_is_logged_in') === 'true';
}

function setAuthStatus(status) {
    localStorage.setItem('nike_is_logged_in', status ? 'true' : 'false');
}

// UPLOAD VARIABLES
let uploadedImages = [];
let uploadedBannerImg = "";

function previewImage(event) {
    const container = document.getElementById('image-preview-container');
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

    if (adminList) {
        adminList.innerHTML = cats.map(c => `
            <div class="cat-option" onclick="selectCategory('${c}')">
                <span>${c}</span>
                <i class="fa-solid fa-trash" style="color:#EF4444; cursor:pointer;" onclick="removeCategory('${c}', event)"></i>
            </div>
        `).join('');
    }

    if (catalogList) {
        catalogList.innerHTML = cats.map(c => `
            <div class="cat-option" onclick="filterByCategory('${c}')">
                <span>${c}</span>
                <i class="fa-solid fa-chevron-right" style="color:var(--text-gray);"></i>
            </div>
        `).join('');
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
        p.category.toLowerCase().includes(query)
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

    if (productsToRender.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; font-size:12px; color:var(--text-gray); margin-top:20px;">Pa gen okenn pwodui ki jwenn.</p>`;
        return;
    }

    grid.innerHTML = productsToRender.map(p => {
        const isFav = favs.includes(p.id);
        return `
            <div class="grid-card" onclick="openDetail(${p.id})">
                <img src="${p.images[0] || 'https://via.placeholder.com/150'}" alt="${p.name}">
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
    const productId = parseInt(urlParams.get('id')) || 1;
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

function renderCartPage() {
    const cartList = document.getElementById('cartItemsList');
    if (!cartList) return;

    const cart = getCart();
    const products = getProducts();

    if (cart.length === 0) {
        cartList.innerHTML = `<p style="text-align:center; font-size:13px; color:var(--text-gray); margin-top:40px;">Panyen ou vid.</p>`;
        document.getElementById('subTotalVal').innerText = '$0.00';
        document.getElementById('grandTotalVal').innerText = '$0.00';
        return;
    }

    let subTotal = 0;

    cartList.innerHTML = cart.map(item => {
        const prod = products.find(p => p.id === item.id);
        if (!prod) return '';
        const itemTotal = prod.price * item.qty;
        subTotal += itemTotal;

        return `
            <div class="cart-item-card">
                <div class="cart-item-img">
                    <img src="${prod.images[0] || 'https://via.placeholder.com/150'}" alt="${prod.name}">
                </div>
                <div class="cart-item-info">
                    <h4>${prod.name} (${item.size})</h4>
                    <div class="brand">${prod.category}</div>
                    <div class="price">$${prod.price.toFixed(2)}</div>
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
    document.getElementById('subTotalVal').innerText = `$${subTotal.toFixed(2)}`;
    document.getElementById('shippingVal').innerText = `$${shipping.toFixed(2)}`;
    document.getElementById('grandTotalVal').innerText = `$${(subTotal + shipping).toFixed(2)}`;
}

function checkoutCart() {
    if (getCart().length === 0) {
        alert("Panyen ou vid!");
        return;
    }
    alert("Kòmand ou anrejistre ak siksè!");
    saveCart([]);
    renderCartPage();
}

// FAVORITES PAGE
function renderFavoritesPage() {
    const grid = document.getElementById('favoriteProductGrid');
    if (!grid) return;

    const favs = getFavorites();
    const products = getProducts();
    const favProducts = products.filter(p => favs.includes(p.id));

    if (favProducts.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; font-size:13px; color:var(--text-gray); margin-top:40px;">Ou pa gen okenn pwodui nan favori yo.</p>`;
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

    if (isLoggedIn) {
        container.innerHTML = `
            <div class="profile-user-card">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" alt="Profile" class="profile-avatar">
                <h3>Hadi jafrai</h3>
                <p>hadijafari.official@gmail.com</p>
                <p style="font-size:10px; color:var(--text-gray); margin-top:2px;">Product designer • Madrid, spain</p>
                <button class="btn-edit-profile"><i class="fa-solid fa-pen"></i> Edit Profile</button>
            </div>

            <div class="profile-menu-list">
                <div class="menu-item-card">
                    <div class="menu-item-left"><i class="fa-solid fa-language"></i> Language</div>
                    <i class="fa-solid fa-chevron-right" style="color:var(--text-gray); font-size:12px;"></i>
                </div>
                <div class="menu-item-card">
                    <div class="menu-item-left"><i class="fa-solid fa-coins"></i> Currencies</div>
                    <i class="fa-solid fa-chevron-right" style="color:var(--text-gray); font-size:12px;"></i>
                </div>
                <div class="menu-item-card">
                    <div class="menu-item-left"><i class="fa-solid fa-shirt"></i> Appearance</div>
                    <i class="fa-solid fa-chevron-right" style="color:var(--text-gray); font-size:12px;"></i>
                </div>
                <div class="menu-item-card">
                    <div class="menu-item-left"><i class="fa-solid fa-shield-halved"></i> Application Security</div>
                    <i class="fa-solid fa-chevron-right" style="color:var(--text-gray); font-size:12px;"></i>
                </div>
                <div class="menu-item-card">
                    <div class="menu-item-left"><i class="fa-solid fa-mobile-screen"></i> Manage Devices</div>
                    <i class="fa-solid fa-chevron-right" style="color:var(--text-gray); font-size:12px;"></i>
                </div>
                <div class="menu-item-card">
                    <div class="menu-item-left"><i class="fa-solid fa-key"></i> Change Password</div>
                    <i class="fa-solid fa-chevron-right" style="color:var(--text-gray); font-size:12px;"></i>
                </div>
                <div class="menu-item-card" onclick="logoutUser()" style="color:#EF4444;">
                    <div class="menu-item-left"><i class="fa-solid fa-right-from-bracket" style="color:#EF4444;"></i> Log Out</div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="auth-card">
                <i class="fa-regular fa-user"></i>
                <h3>Oups, ou poko konekte!</h3>
                <p>Konekte sou kont ou pou w ka gade enfòmasyon pèsonèl ou yo.</p>
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
    renderProfilePage();
}

// ADMIN ACTIONS
function renderAdminProductList() {
    const listContainer = document.getElementById('adminProductList');
    if (!listContainer) return;

    const products = getProducts();
    if (products.length === 0) {
        listContainer.innerHTML = `<p style="font-size:12px; color:var(--text-gray);">Pa gen okenn pwodui.</p>`;
        return;
    }

    listContainer.innerHTML = products.map(p => `
        <div class="admin-product-item">
            <div class="admin-prod-info">
                <img src="${p.images[0] || 'https://via.placeholder.com/150'}" alt="${p.name}">
                <div class="admin-prod-details">
                    <h5>${p.name}</h5>
                    <span>$${p.price} • ${p.category}</span>
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
    document.getElementById('prodSizes').value = product.sizes.join(', ');
    document.getElementById('prodColors').value = product.colors.join(', ');
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('selected-category-text').innerText = product.category;
    document.getElementById('selected-category-text').style.color = 'var(--text-dark)';

    uploadedImages = [...product.images];
    const previewBox = document.getElementById('image-preview-container');
    previewBox.innerHTML = uploadedImages.map(img => `<img src="${img}">`).join('');

    document.getElementById('formActionTitle').innerText = 'Modifye Pwodwi sa a';
    document.getElementById('submitProdBtn').innerText = 'Sove Modifikasyon yo';
    document.getElementById('cancelEditBtn').style.display = 'flex';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('addProductForm').reset();
    document.getElementById('editProductId').value = '';
    uploadedImages = [];
    document.getElementById('image-preview-container').innerHTML = '';
    document.getElementById('selected-category-text').innerText = 'Chwazi yon kategori...';
    document.getElementById('selected-category-text').style.color = 'var(--text-gray)';
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
    const productId = parseInt(urlParams.get('id')) || 1;
    const btn = document.getElementById('detailLikeBtn');
    toggleLike(btn, productId);
}

// MAIN INIT
document.addEventListener('DOMContentLoaded', () => {
    // 1. BANNER SETUP (CATALOG)
    const featuredCard = document.getElementById('featuredCardContainer');
    if (featuredCard) {
        const banner = getBanner();
        featuredCard.innerHTML = `
            <span class="badge">NEW COLLECTION</span>
            <p style="font-size: 9px; color: #8C8C8C;">Nike Original 2026</p>
            <h3>${banner.title}</h3>
            <p class="subtitle">${banner.subtitle}</p>
            <button class="btn-shop-now">Shop Now</button>
            <img src="${banner.image}" alt="${banner.title}" class="featured-shoe-img">
        `;
        featuredCard.onclick = () => openDetail(banner.productId);
    }

    // 2. CATALOG RENDER
    if (document.getElementById('catalogProductGrid')) {
        renderProductGrid(getProducts());
    }

    // 3. DETAIL PAGE SETUP
    if (window.location.pathname.includes('detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id')) || 1;
        const products = getProducts();
        const product = products.find(p => p.id === productId);

        if (product) {
            document.getElementById('productTitle').innerText = product.name;
            document.getElementById('productPrice').innerText = `$${product.price}`;
            document.getElementById('productImg').src = product.images[0];

            const favs = getFavorites();
            const btn = document.getElementById('detailLikeBtn');
            if (favs.includes(productId)) {
                btn.classList.add('liked');
                btn.querySelector('i').className = 'fa-solid fa-heart';
            }

            if (product.images.length > 1) {
                const imgBox = document.querySelector('.detail-image-box');
                const galleryHTML = product.images.map(img => `
                    <img src="${img}" style="width: 45px; height: 45px; object-fit: contain; cursor: pointer; border-radius: 8px; border: 1px solid #ddd; background: #fff;" onclick="document.getElementById('productImg').src='${img}'">
                `).join('');
                imgBox.insertAdjacentHTML('afterend', `<div style="display:flex; justify-content:center; gap:8px; margin-bottom:12px;">${galleryHTML}</div>`);
            }

            const sizeContainer = document.getElementById('sizeContainer');
            if (sizeContainer) {
                sizeContainer.innerHTML = product.sizes.map((s, i) => `
                    <button class="size-btn ${i === 0 ? 'active' : ''}" onclick="setActiveSize(this)">${s}</button>
                `).join('');
            }

            const colorContainer = document.getElementById('colorContainer');
            if (colorContainer) {
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
        
        // Fill Banner Form with current
        const b = getBanner();
        document.getElementById('bannerTitle').value = b.title;
        document.getElementById('bannerSub').value = b.subtitle;
        document.getElementById('bannerProdId').value = b.productId;

        // Banner Form Submit
        document.getElementById('newCollectionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const currentB = getBanner();
            const updated = {
                title: document.getElementById('bannerTitle').value,
                subtitle: document.getElementById('bannerSub').value,
                productId: parseInt(document.getElementById('bannerProdId').value),
                image: uploadedBannerImg || currentB.image
            };
            saveBanner(updated);
            alert('Banè New Collection sove ak siksè!');
        });

        // Add / Edit Product Submit
        document.getElementById('addProductForm').addEventListener('submit', (e) => {
            e.preventDefault();

            const editId = document.getElementById('editProductId').value;
            const sizesArr = document.getElementById('prodSizes').value.split(',').map(s => s.trim());
            const colorsArr = document.getElementById('prodColors').value.split(',').map(c => c.trim());
            const categoryVal = document.getElementById('prodCategory').value || 'Sneakers / Soulye';

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
});

function setActiveSize(btn) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}