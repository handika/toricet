// Data Produk
const products = [
    {
        id: 1,
        name: 'Binder A4 Premium',
        category: 'binder',
        price: 45000,
        description: 'Binder A4 dengan desain modern dan durable',
        emoji: '📕'
    },
    {
        id: 2,
        name: 'Binder A5 Compact',
        category: 'binder',
        price: 35000,
        description: 'Binder ukuran kecil, praktis untuk dibawa',
        emoji: '📗'
    },
    {
        id: 3,
        name: 'Looseleaf A4 100 Lembar',
        category: 'looseleaf',
        price: 25000,
        description: 'Kertas looseleaf berkualitas tinggi, 100 lembar',
        emoji: '📄'
    },
    {
        id: 4,
        name: 'Looseleaf A5 80 Lembar',
        category: 'looseleaf',
        price: 18000,
        description: 'Looseleaf ukuran kecil, cocok untuk catatan',
        emoji: '📃'
    },
    {
        id: 5,
        name: 'Binder Premium Leather',
        category: 'premium',
        price: 85000,
        description: 'Binder premium dengan kulit asli, eksklusif',
        emoji: '📙'
    },
    {
        id: 6,
        name: 'Looseleaf Premium Dotted',
        category: 'premium',
        price: 55000,
        description: 'Looseleaf premium dengan pola titik, 200 lembar',
        emoji: '📋'
    },
    {
        id: 7,
        name: 'Binder Warna Pastel',
        category: 'binder',
        price: 40000,
        description: 'Binder dengan warna pastel yang cantik',
        emoji: '🎀'
    },
    {
        id: 8,
        name: 'Looseleaf Lined 150 Lembar',
        category: 'looseleaf',
        price: 30000,
        description: 'Looseleaf dengan garis, 150 lembar berkualitas',
        emoji: '📝'
    },
    {
        id: 9,
        name: 'Binder Set Bundle',
        category: 'premium',
        price: 120000,
        description: 'Paket hemat: 2 binder + looseleaf gratis',
        emoji: '🎁'
    }
];

// Keranjang Belanja
let cart = [];

// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', function() {
    displayProducts(products);
    loadCartFromStorage();
    updateCartCount();
});

// Tampilkan produk
function displayProducts(productsToDisplay) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    if (productsToDisplay.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Tidak ada produk yang ditemukan</p>';
        return;
    }

    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">Rp ${product.price.toLocaleString('id-ID')}</div>
                    <button class="btn-add" onclick="addToCart(${product.id})">+ Keranjang</button>
                </div>
            </div>
        `;
        grid.appendChild(productCard);
    });
}

// Filter produk
function filterProducts(category) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter dan tampilkan
    if (category === 'semua') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        displayProducts(filtered);
    }
}

// Tambah ke keranjang
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    // Cek apakah produk sudah ada di keranjang
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCartToStorage();
    updateCartCount();
    showNotification(`${product.name} ditambahkan ke keranjang!`);
}

// Hapus dari keranjang
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartCount();
    displayCart();
}

// Update jumlah item
function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCartToStorage();
        updateCartCount();
        displayCart();
    }
}

// Update jumlah keranjang
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Tampilkan keranjang
function displayCart() {
    const cartItemsDiv = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align: center; color: #999;">Keranjang Anda kosong</p>';
        document.getElementById('total-price').textContent = '0';
        return;
    }

    let html = '';
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        html += `
            <div class="modal-item">
                <div>
                    <div style="font-weight: bold; color: #5864A4;">${item.name}</div>
                    <div style="font-size: 12px; color: #999;">Rp ${item.price.toLocaleString('id-ID')}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" style="width: 25px; height: 25px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 3px;">-</button>
                    <span style="width: 30px; text-align: center;">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" style="width: 25px; height: 25px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 3px;">+</button>
                    <button onclick="removeFromCart(${item.id})" style="width: 25px; height: 25px; border: 1px solid #ff6b6b; background: #ff6b6b; color: white; cursor: pointer; border-radius: 3px;">×</button>
                </div>
                <div style="font-weight: bold; color: #CF66A1;">Rp ${subtotal.toLocaleString('id-ID')}</div>
            </div>
        `;
    });

    cartItemsDiv.innerHTML = html;
    updateTotalPrice();
}

// Update total harga
function updateTotalPrice() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('total-price').textContent = total.toLocaleString('id-ID');
}

// Buka keranjang
function openCart() {
    displayCart();
    document.getElementById('cartModal').style.display = 'block';
}

// Tutup keranjang
function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

// Buka checkout form
function openCheckoutForm() {
    if (cart.length === 0) {
        alert('Keranjang Anda kosong!');
        return;
    }
    
    closeCart();
    document.getElementById('checkoutModal').style.display = 'block';
    document.getElementById('checkoutForm').reset();
}

// Tutup checkout form
function closeCheckoutForm() {
    document.getElementById('checkoutModal').style.display = 'none';
}

// Submit checkout form
function submitCheckout(event) {
    event.preventDefault();
    
    const nama = document.getElementById('nama').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    // Simpan data pelanggan
    window.customerData = {
        nama: nama,
        email: email,
        phone: phone
    };
    
    // Tampilkan payment modal
    closeCheckoutForm();
    displayPaymentModal();
}

// Tampilkan payment modal
function displayPaymentModal() {
    const paymentItemsDiv = document.getElementById('payment-items');
    
    let html = '<div class="payment-items">';
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        html += `
            <div class="payment-item">
                <span class="payment-item-name">${item.name}</span>
                <span class="payment-item-qty">x${item.quantity}</span>
                <span class="payment-item-price">Rp ${subtotal.toLocaleString('id-ID')}</span>
            </div>
        `;
    });
    html += '</div>';
    
    paymentItemsDiv.innerHTML = html;
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('payment-total').textContent = total.toLocaleString('id-ID');
    
    // Update customer info
    document.getElementById('display-nama').textContent = window.customerData.nama;
    document.getElementById('display-email').textContent = window.customerData.email;
    document.getElementById('display-phone').textContent = window.customerData.phone;
    
    // Buka payment modal
    document.getElementById('paymentModal').style.display = 'block';
}

// Tutup payment modal
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Proses pembayaran
function processPayment() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Siapkan payload sesuai dengan format di payload.txt
    const payload = {
        agree: true,
        notUnderage: true,
        message: `Order Toricet #${Date.now()}`,
        amount: total.toString(),
        payment_type: "qris",
        vote: "",
        currency: "IDR",
        customer_info: {
            first_name: window.customerData.nama,
            email: window.customerData.email,
            phone: window.customerData.phone || ""
        }
    };
    
    // Disable button saat loading
    const payBtn = event.target;
    payBtn.disabled = true;
    payBtn.textContent = 'Memproses...';
    
    // AJAX POST Request dengan semua header dari payload.txt
    fetch('https://backend.saweria.co/donations/snap/674c0112-9552-45d8-ade8-5083e89c1035', {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9,id;q=0.8',
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            'origin': 'https://saweria.co',
            'pragma': 'no-cache',
            'priority': 'u=1, i',
            'referer': 'https://saweria.co/',
            'sec-ch-ua': '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Tampilkan QR modal dengan data response
        displayQRModal(data.data);
        closePaymentModal();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.\n\nError: ' + error.message);
        payBtn.disabled = false;
        payBtn.textContent = 'Lanjutkan Pembayaran';
    });
}

// Tampilkan QR Modal
function displayQRModal(data) {
    // Update info
    document.getElementById('qr-first-name').textContent = data.donator.first_name;
    document.getElementById('qr-email').textContent = data.donator.email;
    document.getElementById('qr-amount').textContent = `Rp ${data.amount.toLocaleString('id-ID')}`;
    
    // Clear previous QR code
    const qrContainer = document.getElementById('qr-code-container');
    qrContainer.innerHTML = '';
    
    // Generate QR Code
    new QRCode(qrContainer, {
        text: data.qr_string,
        width: 250,
        height: 250,
        colorDark: "#5864A4",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Buka QR modal
    document.getElementById('qrModal').style.display = 'block';
}

// Tutup QR modal
function closeQRModal() {
    document.getElementById('qrModal').style.display = 'none';
    // Clear cart setelah pembayaran
    cart = [];
    saveCartToStorage();
    updateCartCount();
    showNotification('Terima kasih telah berbelanja di Toricet!');
}

// Simpan keranjang ke localStorage
function saveCartToStorage() {
    localStorage.setItem('toricetCart', JSON.stringify(cart));
}

// Load keranjang dari localStorage
function loadCartFromStorage() {
    const saved = localStorage.getItem('toricetCart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

// Notifikasi
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #5864A4;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Tutup modal saat klik di luar
window.onclick = function(event) {
    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    const paymentModal = document.getElementById('paymentModal');
    const qrModal = document.getElementById('qrModal');
    
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
    }
    if (event.target === checkoutModal) {
        checkoutModal.style.display = 'none';
    }
    if (event.target === paymentModal) {
        paymentModal.style.display = 'none';
    }
    if (event.target === qrModal) {
        qrModal.style.display = 'none';
    }
}
