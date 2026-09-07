// Base de données par défaut
const defaultProducts = [
    {
        id: 1,
        name: "Nike ACG Mountain",
        category: "Lifestyle",
        price: 180,
        images: ["https://i.ibb.co/D8G4yG8/shoe-grey.png"],
        sizes: ["UK 5.5", "UK 6.5", "UK 9.5", "UK 11"],
        colors: ["#1A1A1A", "#9084A8"]
    },
    {
        id: 2,
        name: "Nike Air Max",
        category: "Running",
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
                <img src="${p.images[0]}" alt="${p.name}">
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

            // Galerie ti foto si gen plis pase 1 imaj
            if(product.images.length > 1) {
                const imgBox = document.querySelector('.detail-image-box');
                const galleryHTML = product.images.map(img => `
                    <img src="${img}" style="width: 50px; height: 50px; object-fit: contain; cursor: pointer; border-radius: 8px; border: 1px solid #ddd; background: #fff;" onclick="document.getElementById('productImg').src='${img}'">
                `).join('');
                imgBox.insertAdjacentHTML('afterend', `<div style="display:flex; justify-content:center; gap:8px; margin-bottom:12px;">${galleryHTML}</div>`);
            }

            // Render Gwosè ak Koulè
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

            const selectedSizes = Array.from(document.querySelectorAll('.size-check:checked')).map(cb => cb.value);
            const rawImages = document.getElementById('prodImages').value.trim().split('\n').map(url => url.trim()).filter(url => url !== '');
            const rawColors = document.getElementById('prodColors').value.split(',');

            const newProduct = {
                id: Date.now(),
                name: document.getElementById('prodName').value,
                category: document.getElementById('prodCategory').value,
                price: parseFloat(document.getElementById('prodPrice').value),
                images: rawImages,
                sizes: selectedSizes.length ? selectedSizes : ["UK 7.0"],
                colors: rawColors.length ? rawColors : ["#000000"]
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