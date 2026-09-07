// Data Base senp
const productsData = [
    {
        id: 1,
        name: "Nike ACG\nMountain",
        price: 180,
        image: "https://i.ibb.co/D8G4yG8/shoe-grey.png",
        sizes: ["UK 5.5", "UK 6.5", "UK 9.5", "UK 11"],
        colors: ["#1A1A1A", "#9084A8"]
    },
    {
        id: 2,
        name: "Nike Air Max",
        price: 218,
        image: "https://i.ibb.co/wSRyPTh/shoe-color.png",
        sizes: ["UK 6.0", "UK 7.5", "UK 8.5", "UK 10"],
        colors: ["#3A5A40", "#A3B18A"]
    }
];

// Rele pa Catalog pou navigasyon
function openDetail(id) {
    window.location.href = `detail.html?id=${id}`;
}

// Chaje done yo sèlman si nou sou paj detail.html
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id')) || 1;

        const product = productsData.find(p => p.id === productId);

        if (product) {
            document.getElementById('productTitle').innerText = product.name;
            document.getElementById('productPrice').innerText = `$${product.price}`;
            document.getElementById('productImg').src = product.image;

            // Render Sizes
            const sizeBox = document.getElementById('sizeContainer');
            sizeBox.innerHTML = product.sizes.map((s, i) => `
                <button class="size-btn ${i === 1 ? 'active' : ''}" onclick="setActiveSize(this)">${s}</button>
            `).join('');

            // Render Colors
            const colorBox = document.getElementById('colorContainer');
            colorBox.innerHTML = product.colors.map(c => `
                <div class="dot" style="background: ${c};"></div>
            `).join('');
        }
    }
});

function setActiveSize(btn) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function toggleLike(btn) {
    const icon = btn.querySelector('i');
    if (icon.classList.contains('fa-regular')) {
        icon.className = 'fa-solid fa-heart';
        icon.style.color = '#EF4444';
    } else {
        icon.className = 'fa-regular fa-heart';
        icon.style.color = '#8C8C8C';
    }
}

function addToCart() {
    alert("Produi ajoute nan panyen!");
}

function buyNow() {
    alert("Redirèksyon pou kosyon...");
}