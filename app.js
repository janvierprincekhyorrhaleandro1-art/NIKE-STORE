let uploadedImages = [];

// 1. AFFICHE FOTO YO PEZE DEPEN DE FICHYE MOBILE LA
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

// 2. LOJIK POP-UP KATEGORI
function openCategoryModal() {
    document.getElementById('category-modal').classList.add('active');
}

function closeCategoryModal() {
    document.getElementById('category-modal').classList.remove('active');
}

function selectCategory(name) {
    document.getElementById('selected-category-text').innerText = name;
    document.getElementById('selected-category-text').style.color = 'var(--text-dark)';
    document.getElementById('prodCategory').value = name;
    closeCategoryModal();
}

// Base de données par défaut
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

// Pran pwodui yo nan LocalStorage
function getProducts() {
    const saved = localStorage.getItem('nike_products');
    return saved ? JSON.parse(saved) : defaultProducts;
}

// Sove nan LocalStorage
function saveProducts(products) {
    localStorage.setItem('nike_products', JSON.stringify(products));
}

// Redirèksyon pou paj detay
function openDetail(id) {
    window.location.href = `detail.html?id=${id}`;
}

// Ekzekisyon lè paj la chaje
document.addEventListener('DOMContentLoaded', () => {
    const products = getProducts();

    // 1. SI NOU SOU PAJ CATALOG
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        productGrid.innerHTML = products.map(p => `
            <div class="grid-card" onclick="openDetail(${p.id})">
                <img src="${p.images[0] || 'https://via.placeholder.com/150'}" alt="${p.name}">
                <div class="price">$${p.price}</div>
                <div class="name">${p.name}</div>
                <button class="like-btn" onclick="event.stopPropagation(); toggleLike(this)">
                    <i class="fa-regular fa-heart"></i>
                </button>
            </div>
        `).join('');
    }

    // 2. SI NOU SOU PAJ DETAIL
    if (window.location.pathname.includes('detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id')) || 1;
        const product = products.find(p => p.id === productId);

        if (product) {
            document.getElementById('productTitle').innerText = product.name;
            document.getElementById('productPrice').innerText = `$${product.price}`;
            document.getElementById('productImg').src = product.images[0];

            if(product.images.length > 1) {
                const imgBox = document.querySelector('.detail-image-box');
                const galleryHTML = product.images.map(img => `
                    <img src="${img}" style="width: 50px; height: 50px; object-fit: cover; cursor: pointer; border-radius: 8px; border: 1px solid #ddd; background: #fff;" onclick="document.getElementById('productImg').src='${img}'">
                `).join('');
                imgBox.insertAdjacentHTML('afterend', `<div style="display:flex; justify-content:center; gap:8px; margin-bottom:12px;">${galleryHTML}</div>`);
            }

            const sizeContainer = document.getElementById('sizeContainer');
            if(sizeContainer) {
                sizeContainer.innerHTML = product.sizes.map((s, i) => `
                    <button class="size-btn ${i === 0 ? 'active' : ''}" onclick="setActiveSize(this)">${s}</button>
                `).join('');
            }

            const colorContainer = document.getElementById('colorContainer');
            if(colorContainer) {
                colorContainer.innerHTML = product.colors.map(c => `
                    <div class="dot" style="background: ${c.trim()};"></div>
                `).join('');
            }
        }
    }

    // 3. SI NOU SOU PAJ ADMIN (Fòm)
    const addForm = document.getElementById('addProductForm');
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const sizesArr = document.getElementById('prodSizes').value.split(',').map(s => s.trim());
            const colorsArr = document.getElementById('prodColors').value.split(',').map(c => c.trim());

            const newProduct = {
                id: Date.now(),
                name: document.getElementById('prodName').value,
                category: document.getElementById('prodCategory').value,
                price: parseFloat(document.getElementById('prodPrice').value),
                images: uploadedImages.length ? uploadedImages : ["https://via.placeholder.com/150"],
                sizes: sizesArr.length ? sizesArr : ["S", "M", "L"],
                colors: colorsArr.length ? colorsArr : ["#000000"]
            };

            const currentProducts = getProducts();
            currentProducts.unshift(newProduct);
            saveProducts(currentProducts);

            alert('Pwodui anrejistre ak siksè!');
            window.location.href = 'catalog.html';
        });
    }
});

function setActiveSize(btn) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function toggleLike(btn) {
    const icon = btn.querySelector('i');
    icon.classList.toggle('fa-solid');
    icon.classList.toggle('fa-regular');
    icon.style.color = icon.classList.contains('fa-solid') ? '#EF4444' : '#8C8C8C';
}

function addToCart() {
    alert("Produi ajoute nan panyen!");
}

function buyNow() {
    alert("Redirèksyon pou kòmand...");
}