// Data Produk - dimuat dari product.json
let products = [];

// Data Alamat
let provinsiData = [];

// Keranjang Belanja
let cart = [];

// Image Slider
let currentProductId = null;
let currentImageIndex = 1;
let totalImages = 0;

// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    loadProducts();
    loadCartFromStorage();
    updateCartCount();
    loadProvinsiData();
});

// Load data produk dari product.json
function loadProducts() {
    console.log('Loading products...');
    fetch('product/product.json')
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Products loaded:', data.length, 'items');
            products = data;
            displayProducts(products);
        })
        .catch(error => {
            console.error('Error loading products:', error);
            showNotification('Gagal memuat data produk');
        });
}

// Tampilkan produk
function displayProducts(productsToDisplay) {
    console.log('Displaying products:', productsToDisplay.length);
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    if (productsToDisplay.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Tidak ada produk yang ditemukan</p>';
        return;
    }

    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Gunakan lazy loading untuk image
        let imageHtml = '';
        if (product.image) {
            imageHtml = `<img data-src="${product.image}" alt="${product.name}" class="product-image-img lazy-image" onclick="openImageSlider(${product.id})" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`;
        }
        
        productCard.innerHTML = `
            ${imageHtml}
            <div class="product-image" style="background-color: ${product.color}; ${product.image ? 'display:none;' : ''} cursor: pointer;" onclick="openImageSlider(${product.id})"></div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">Rp${product.price.toLocaleString('id-ID')}</div>
                    <button class="btn-add" onclick="addToCart(${product.id}, event)" disabled>+ Keranjang</button>
                </div>
            </div>
        `;
        grid.appendChild(productCard);
    });
    
    // Inisialisasi lazy loading untuk image yang baru ditambahkan
    console.log('Initializing lazy loading...');
    initializeLazyLoading();
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
function addToCart(productId, event) {
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
    
    // Animasi flying item ke cart icon
    if (event) {
        animateAddToCart(event.target, product.name);
    }
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
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">Rp${item.price.toLocaleString('id-ID')}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="cart-qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                    <span class="cart-qty">${item.quantity}</span>
                    <button class="cart-qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button class="cart-remove-btn" onclick="removeFromCart(${item.id})">×</button>
                </div>
                <div class="cart-item-subtotal">Rp${subtotal.toLocaleString('id-ID')}</div>
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
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = 'block';
    // Scroll ke atas
    cartModal.querySelector('.modal-content').scrollTop = 0;
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
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.style.display = 'block';
    // Scroll ke atas
    checkoutModal.querySelector('.modal-content').scrollTop = 0;
    document.getElementById('checkoutForm').reset();
}

// Tutup checkout form
function closeCheckoutForm() {
    document.getElementById('checkoutModal').style.display = 'none';
}

// Load data provinsi dari file JSON
let mappingKotaData = [];
let jneKotaData = [];

function loadProvinsiData() {
    fetch('kodepos/provinsi.json')
        .then(response => response.json())
        .then(data => {
            provinsiData = data;
            initializeAddressDropdowns();
        })
        .catch(error => {
            console.error('Error loading provinsi data:', error);
            showNotification('Gagal memuat data provinsi');
        });
    
    // Load mapping kota data
    fetch('mapping/kota.json')
        .then(response => response.json())
        .then(data => {
            mappingKotaData = data;
        })
        .catch(error => {
            console.error('Error loading mapping kota data:', error);
        });
    
    // Load JNE kota data
    fetch('jne/kota/kota.json')
        .then(response => response.json())
        .then(data => {
            jneKotaData = data;
        })
        .catch(error => {
            console.error('Error loading JNE kota data:', error);
        });
}

// Inisialisasi dropdown alamat
function initializeAddressDropdowns() {
    const provinsiSelect = document.getElementById('provinsi');
    
    // Clear existing options
    provinsiSelect.innerHTML = '<option value="">-- Pilih Provinsi --</option>';
    
    // Populate provinsi dari data JSON
    provinsiData.forEach(prov => {
        const option = document.createElement('option');
        option.value = prov.kode_wilayah;
        option.textContent = prov.nama;
        provinsiSelect.appendChild(option);
    });
}

// Load kota berdasarkan provinsi
function loadKota() {
    const kodeProvinsi = document.getElementById('provinsi').value;
    const kotaSelect = document.getElementById('kota');
    const kecamatanSelect = document.getElementById('kecamatan');
    const kelurahanSelect = document.getElementById('kelurahan');
    const kodePosInput = document.getElementById('kodepos');
    
    // Reset kota, kecamatan, kelurahan, kodepos
    kotaSelect.innerHTML = '<option value="">-- Pilih Kota/Kabupaten --</option>';
    kecamatanSelect.innerHTML = '<option value="">-- Pilih Kecamatan --</option>';
    kelurahanSelect.innerHTML = '<option value="">-- Pilih Kelurahan --</option>';
    kodePosInput.value = '';
    
    // Disable kecamatan, kelurahan, kodepos
    kecamatanSelect.disabled = true;
    kelurahanSelect.disabled = true;
    kodePosInput.disabled = true;
    
    if (!kodeProvinsi) {
        kotaSelect.disabled = true;
        return;
    }
    
    // Enable kota
    kotaSelect.disabled = false;
    
    // Fetch data kota dari file JSON
    const kotaFile = `kodepos/kotakab/${kodeProvinsi}.json`;
    fetch(kotaFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`File not found: ${kotaFile}`);
            }
            return response.json();
        })
        .then(data => {
            // Populate kota dropdown
            data.forEach(kota => {
                const option = document.createElement('option');
                option.value = kota.kode_wilayah;
                // Gabungkan dt2 dan nama
                option.textContent = `${kota.dt2} ${kota.nama}`;
                kotaSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading kota data:', error);
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '-- Data tidak tersedia --';
            kotaSelect.appendChild(option);
        });
}

// Load kecamatan berdasarkan kota
function loadKecamatan() {
    const kodeProvinsi = document.getElementById('provinsi').value;
    const kodeKota = document.getElementById('kota').value;
    const kecamatanSelect = document.getElementById('kecamatan');
    const kelurahanSelect = document.getElementById('kelurahan');
    const kodePosInput = document.getElementById('kodepos');
    
    // Reset kecamatan, kelurahan, kodepos
    kecamatanSelect.innerHTML = '<option value="">-- Pilih Kecamatan --</option>';
    kelurahanSelect.innerHTML = '<option value="">-- Pilih Kelurahan --</option>';
    kodePosInput.value = '';
    
    // Disable kelurahan dan kodepos
    kelurahanSelect.disabled = true;
    kodePosInput.disabled = true;
    
    if (!kodeProvinsi || !kodeKota) {
        kecamatanSelect.disabled = true;
        return;
    }
    
    // Enable kecamatan
    kecamatanSelect.disabled = false;
    
    // Fetch data kecamatan dari file JSON (gunakan kodeKota langsung dengan format 35/29)
    const kecamatanFile = `kodepos/kecamatan/${kodeKota.replace(/\./g, '/')}.json`;
    fetch(kecamatanFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`File not found: ${kecamatanFile}`);
            }
            return response.json();
        })
        .then(data => {
            // Populate kecamatan dropdown
            data.forEach(kecamatan => {
                const option = document.createElement('option');
                option.value = kecamatan.kode_wilayah;
                option.textContent = `${kecamatan.nama}`;
                kecamatanSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading kecamatan data:', error);
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '-- Data tidak tersedia --';
            kecamatanSelect.appendChild(option);
        });
}

// Load kelurahan berdasarkan kecamatan
function loadKelurahan() {
    const kodeKecamatan = document.getElementById('kecamatan').value;
    const kelurahanSelect = document.getElementById('kelurahan');
    const kodePosInput = document.getElementById('kodepos');
    
    // Reset kelurahan dan kodepos
    kelurahanSelect.innerHTML = '<option value="">-- Pilih Kelurahan --</option>';
    kodePosInput.value = '';
    
    if (!kodeKecamatan) {
        kelurahanSelect.disabled = true;
        kodePosInput.disabled = true;
        return;
    }
    
    // Enable kelurahan
    kelurahanSelect.disabled = false;
    
    // Fetch data kelurahan dari file JSON (gunakan kodeKecamatan langsung dengan format 35/29/11)
    const kelurahanFile = `kodepos/kelurahan/${kodeKecamatan.replace(/\./g, '/')}.json`;
    fetch(kelurahanFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`File not found: ${kelurahanFile}`);
            }
            return response.json();
        })
        .then(data => {
            // Populate kelurahan dropdown
            data.forEach(kelurahan => {
                const option = document.createElement('option');
                // Isi value dengan kode_wilayah + "/" + kodepos
                option.value = `${kelurahan.kode_wilayah}/${kelurahan.kodepos}`;
                option.textContent = `${kelurahan.nama}`;
                kelurahanSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading kelurahan data:', error);
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '-- Data tidak tersedia --';
            kelurahanSelect.appendChild(option);
        });
}

// Handle perubahan kelurahan dan parsing kodepos
function handleKelurahanChange() {
    const kelurahanValue = document.getElementById('kelurahan').value;
    const kodePosInput = document.getElementById('kodepos');
    
    if (!kelurahanValue) {
        kodePosInput.value = '';
        kodePosInput.disabled = true;
        return;
    }
    
    // Enable kodepos
    kodePosInput.disabled = false;
    
    // Parse value: 35/78/26/1005/60113 -> ambil bagian terakhir (60113)
    const parts = kelurahanValue.split('/');
    const kodepos = parts[parts.length - 1];
    
    // Isi input kodepos
    kodePosInput.value = kodepos;
}

// Submit checkout form
function submitCheckout(event) {
    event.preventDefault();
    
    const nama = document.getElementById('nama').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const kodeProvinsi = document.getElementById('provinsi').value;
    const kota = document.getElementById('kota').value;
    const kecamatan = document.getElementById('kecamatan').value;
    const kelurahan = document.getElementById('kelurahan').value;
    const kodepos = document.getElementById('kodepos').value;
    const alamat = document.getElementById('alamat').value;
    
    // Cari nama provinsi berdasarkan kode_wilayah
    const provinsi = provinsiData.find(p => p.kode_wilayah === kodeProvinsi);
    const namaProvinsi = provinsi ? provinsi.nama : '';
    
    // Ambil text dari dropdown (bukan value)
    const kotaSelect = document.getElementById('kota');
    const namaKota = kotaSelect.options[kotaSelect.selectedIndex].text;
    
    const kecamatanSelect = document.getElementById('kecamatan');
    const namaKecamatan = kecamatanSelect.options[kecamatanSelect.selectedIndex].text;
    
    const kelurahanSelect = document.getElementById('kelurahan');
    const namaKelurahan = kelurahanSelect.options[kelurahanSelect.selectedIndex].text;
    
    // Hitung total berat barang (dalam gram)
    // Pastikan setiap item memiliki weight, jika tidak gunakan default 60g
    const totalWeight = cart.reduce((sum, item) => {
        const weight = item.weight || 60; // Default 60g jika tidak ada
        return sum + (weight * item.quantity);
    }, 0);
    
    // Bulatkan ke atas ke kelipatan 1000 gram (1 kg)
    const roundedWeight = Math.ceil(totalWeight / 1000) * 1000;
    const weightInKg = roundedWeight / 1000;
    
    // Cari code kota dari mapping/kota.json berdasarkan kode_wilayah
    const mappingKota = mappingKotaData.find(m => m.kode_wilayah === kota);
    const codeKota = mappingKota ? mappingKota.code : '';
    
    // Cari data pengiriman dari jne/kota/kota.json berdasarkan destination = codeKota
    let shippingData = null;
    let shippingCost = 0;
    
    if (codeKota) {
        const jneData = jneKotaData.find(j => j.destination === codeKota);
        if (jneData) {
            // Cari layanan REG
            const regService = jneData.layanan.find(l => l.nama_layanan === 'REG');
            if (regService) {
                shippingData = regService;
                // Tarif dikalikan dengan berat yang sudah dibulatkan ke atas (dalam kg)
                shippingCost = regService.tarif * weightInKg;
            }
        }
    }
    
    // Simpan data pelanggan
    window.customerData = {
        nama: nama,
        email: email,
        phone: phone,
        alamat: {
            kodeProvinsi: kodeProvinsi,
            namaProvinsi: namaProvinsi,
            kota: kota,
            namaKota: namaKota,
            codeKota: codeKota,
            kecamatan: kecamatan,
            namaKecamatan: namaKecamatan,
            kelurahan: kelurahan,
            namaKelurahan: namaKelurahan,
            kodepos: kodepos,
            alamat: alamat
        },
        shipping: {
            data: shippingData,
            cost: shippingCost,
            totalWeight: totalWeight,
            roundedWeight: roundedWeight,
            weightInKg: weightInKg
        }
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
                <span class="payment-item-price">Rp${subtotal.toLocaleString('id-ID')}</span>
            </div>
        `;
    });
    html += '</div>';
    
    paymentItemsDiv.innerHTML = html;
    
    // Hitung total produk
    const totalProducts = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = window.customerData.shipping.cost || 0;
    const subtotal = totalProducts + shippingCost;
    
    // Hitung biaya payment gateway (0,71%)
    const gatewayFee = Math.round(subtotal * 0.0071);
    const totalPayment = subtotal + gatewayFee;
    
    // Simpan biaya gateway ke customerData
    window.customerData.gatewayFee = gatewayFee;
    
    // Update total
    document.getElementById('payment-total').textContent = totalPayment.toLocaleString('id-ID');
    
    // Update customer info
    document.getElementById('display-nama').textContent = window.customerData.nama;
    document.getElementById('display-email').textContent = window.customerData.email;
    document.getElementById('display-phone').textContent = window.customerData.phone;
    
    // Update alamat pengiriman info - tampilkan text dropdown, bukan value
    document.getElementById('display-provinsi').textContent = window.customerData.alamat.namaProvinsi;
    document.getElementById('display-kota').textContent = window.customerData.alamat.namaKota;
    document.getElementById('display-kecamatan').textContent = window.customerData.alamat.namaKecamatan;
    document.getElementById('display-kelurahan').textContent = window.customerData.alamat.namaKelurahan;
    document.getElementById('display-kodepos').textContent = window.customerData.alamat.kodepos;
    document.getElementById('display-alamat').textContent = window.customerData.alamat.alamat;
    
    // Tampilkan biaya pengiriman dan biaya gateway di dalam section Ringkasan Pesanan
    const shippingSection = document.getElementById('shipping-section');
    if (shippingSection) {
        let shippingHtml = '';
        
        if (window.customerData.shipping.data) {
            const totalWeight = window.customerData.shipping.totalWeight;
            const roundedWeight = window.customerData.shipping.roundedWeight;
            const weightInKg = window.customerData.shipping.weightInKg;
            const tarifPerKg = window.customerData.shipping.data.tarif;
            const totalShippingCost = window.customerData.shipping.cost;
            
            shippingHtml += `
                <div style="margin-top: 10px;">
                    <div class="payment-item" style="padding-top: 10px; font-size: 13px; color: #999;">
                        <span class="payment-item-name">📦 Berat Barang</span>
                        <span class="payment-item-price">${totalWeight}g → ${roundedWeight}g (${weightInKg}kg)</span>
                    </div>
                    <div class="payment-item" style="padding-top: 10px; font-size: 13px; color: #999;">
                        <span class="payment-item-name">💰 Tarif Pengiriman</span>
                        <span class="payment-item-price">Rp${tarifPerKg.toLocaleString('id-ID')}/kg × ${weightInKg}kg</span>
                    </div>
                    <div class="payment-item" style="padding-top: 10px;">
                        <span class="payment-item-name">🚚 Biaya Pengiriman (${window.customerData.shipping.data.nama_layanan})</span>
                        <span class="payment-item-price">Rp${totalShippingCost.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="payment-subtotal-section">
                        <div class="payment-subtotal-label">
                            <span>Subtotal (Item + Pengiriman)</span>
                            <span style="font-weight: bold; color: #5864A4;">Rp${subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div class="payment-item payment-gateway-fee">
                            <span class="payment-item-name">💳 Biaya Payment Gateway (0,71%)</span>
                            <span class="payment-item-price">Rp${gatewayFee.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            shippingHtml += `
                <div style="margin-top: 10px;">
                    <div class="payment-subtotal-section">
                        <div class="payment-subtotal-label">
                            <span>Subtotal (Item + Pengiriman)</span>
                            <span style="font-weight: bold; color: #5864A4;">Rp${subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div class="payment-item payment-gateway-fee">
                            <span class="payment-item-name">💳 Biaya Payment Gateway (0,71%)</span>
                            <span class="payment-item-price">Rp${gatewayFee.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        shippingSection.innerHTML = shippingHtml;
    }
    
    // Buka payment modal
    const paymentModal = document.getElementById('paymentModal');
    paymentModal.style.display = 'block';
    // Scroll ke atas
    paymentModal.querySelector('.modal-content').scrollTop = 0;
}

// Tutup payment modal saja (tombol close X)
function closePaymentModalOnly() {
    document.getElementById('paymentModal').style.display = 'none';
    
    // Reset button state
    const payBtn = document.querySelector('.btn-pay');
    if (payBtn) {
        payBtn.disabled = false;
        payBtn.textContent = 'Lanjutkan Pembayaran';
    }
}

// Tutup payment modal dan buka checkout modal (tombol Kembali)
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    
    // Reset button state
    const payBtn = document.querySelector('.btn-pay');
    if (payBtn) {
        payBtn.disabled = false;
        payBtn.textContent = 'Lanjutkan Pembayaran';
    }
    
    // Buka kembali modal checkout
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.style.display = 'block';
    // Scroll ke atas
    checkoutModal.querySelector('.modal-content').scrollTop = 0;
}

// Proses pembayaran
function processPayment(evt) {
    const totalProducts = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = window.customerData.shipping.cost || 0;
    const subtotal = totalProducts + shippingCost;
    const gatewayFee = window.customerData.gatewayFee || Math.round(subtotal * 0.0071);
    
    // Siapkan payload dengan amount sebelum ditambahkan biaya payment gateway
    const payload = {
        agree: true,
        notUnderage: true,
        message: `Order Toricet #${Date.now()}`,
        amount: subtotal.toString(),
        payment_type: "qris",
        vote: "",
        currency: "IDR",
        customer_info: {
            first_name: window.customerData.nama,
            email: window.customerData.email,
            phone: window.customerData.phone
        }
    };
    
    // Disable button saat loading
    const payBtn = evt ? evt.target : document.querySelector('.btn-pay');
    payBtn.disabled = true;
    payBtn.textContent = 'Memproses...';
    
    console.log('Mengirim payload:', payload);
    
    // AJAX POST Request ke endpoint baru
    fetch('https://cool-field-b445-prod.toricet.workers.dev', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP ${response.status}: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        
        // Validasi struktur response
        if (!data || !data.data) {
            throw new Error('Response format tidak sesuai. Data tidak ditemukan.');
        }
        
        if (!data.data.donator || !data.data.qr_string) {
            console.error('Response structure:', data);
            throw new Error('Response tidak memiliki donator atau qr_string.');
        }
        
        // Tampilkan QR modal dengan data response
        displayQRModal(data.data);
        closePaymentModal();
    })
    .catch(error => {
        console.error('Error detail:', error);
        console.error('Error message:', error.message);
        alert('Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.\n\nError: ' + error.message);
        payBtn.disabled = false;
        payBtn.textContent = 'Lanjutkan Pembayaran';
    });
}

// Tampilkan QR Modal
function displayQRModal(data) {
    try {
        // Validasi data
        if (!data || !data.donator || !data.qr_string) {
            throw new Error('Data QR tidak lengkap');
        }
        
        // Update info dengan fallback values
        document.getElementById('qr-first-name').textContent = data.donator.first_name || 'N/A';
        document.getElementById('qr-email').textContent = data.donator.email || 'N/A';
        document.getElementById('qr-amount').textContent = `Rp${(data.amount || 0).toLocaleString('id-ID')}`;
        
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
        
        // Bersihkan shopping cart
        cart = [];
        saveCartToStorage();
        updateCartCount();
        
        // Buka QR modal
        const qrModal = document.getElementById('qrModal');
        qrModal.style.display = 'block';
        // Scroll ke atas
        qrModal.querySelector('.modal-content').scrollTop = 0;
    } catch (error) {
        console.error('Error displaying QR modal:', error);
        alert('Terjadi kesalahan saat menampilkan QR code. Silakan coba lagi.\n\nError: ' + error.message);
    }
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

// Animasi flying item ke cart icon
function animateAddToCart(button, productName) {
    // Dapatkan posisi button
    const buttonRect = button.getBoundingClientRect();
    const cartIcon = document.querySelector('.cart-icon');
    const cartRect = cartIcon.getBoundingClientRect();
    
    // Buat elemen flying item
    const flyingItem = document.createElement('div');
    flyingItem.className = 'flying-item';
    flyingItem.innerHTML = '🛒';
    flyingItem.style.left = buttonRect.left + 'px';
    flyingItem.style.top = buttonRect.top + 'px';
    document.body.appendChild(flyingItem);
    
    // Trigger animasi
    setTimeout(() => {
        flyingItem.style.left = cartRect.left + 'px';
        flyingItem.style.top = cartRect.top + 'px';
        flyingItem.style.opacity = '0';
        flyingItem.style.transform = 'scale(0.5)';
    }, 10);
    
    // Hapus elemen setelah animasi selesai
    setTimeout(() => {
        flyingItem.remove();
        // Tampilkan tooltip
        showCartNotification(productName);
    }, 600);
}

// Tooltip notifikasi di cart icon
function showCartNotification(productName) {
    const cartIcon = document.querySelector('.cart-icon');
    
    // Buat tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'cart-tooltip';
    tooltip.textContent = `✓ ${productName} ditambahkan!`;
    document.body.appendChild(tooltip);
    
    // Dapatkan posisi cart icon
    const cartRect = cartIcon.getBoundingClientRect();
    
    // Cek apakah mobile view
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        tooltip.classList.add('mobile-tooltip');
        
        // Tunggu tooltip di-render untuk mendapatkan width-nya
        setTimeout(() => {
            const tooltipRect = tooltip.getBoundingClientRect();
            const tooltipWidth = tooltipRect.width;
            const viewportWidth = window.innerWidth;
            
            // Hitung posisi x yang ideal (centered pada cart icon)
            let leftPos = cartRect.left + cartRect.width / 2;
            
            // Jika tooltip akan overflow ke kanan, geser ke kiri
            if (leftPos + tooltipWidth / 2 > viewportWidth - 10) {
                leftPos = viewportWidth - tooltipWidth / 2 - 10;
            }
            
            // Jika tooltip akan overflow ke kiri, geser ke kanan
            if (leftPos - tooltipWidth / 2 < 10) {
                leftPos = tooltipWidth / 2 + 10;
            }
            
            tooltip.style.left = leftPos + 'px';
            tooltip.style.top = (cartRect.bottom + 15) + 'px';
        }, 0);
    } else {
        // Di desktop, letakkan di bawah cart icon
        tooltip.style.position = 'fixed';
        tooltip.style.left = (cartRect.left + cartRect.width / 2) + 'px';
        tooltip.style.top = (cartRect.bottom + 15) + 'px';
    }
    
    // Set posisi awal untuk desktop
    if (!isMobile) {
        tooltip.style.position = 'fixed';
    }
    
    // Animasi tooltip
    setTimeout(() => {
        tooltip.classList.add('show');
    }, 10);
    
    // Hapus tooltip setelah 2.5 detik
    setTimeout(() => {
        tooltip.classList.remove('show');
        setTimeout(() => {
            tooltip.remove();
        }, 300);
    }, 2500);
}

// Image Slider Functions
function openImageSlider(productId) {
    currentProductId = productId;
    currentImageIndex = 1;
    totalImages = 1; // Set default 1 image
    
    console.log('Opening image slider for product:', productId);
    
    // Load first image langsung
    const sliderImage = document.getElementById('sliderImage');
    const counter = document.getElementById('sliderCounter');
    const imagePath = `product/${productId}/1.webp`;
    
    sliderImage.src = imagePath;
    counter.textContent = '1 / 1';
    
    // Open modal
    const imageSliderModal = document.getElementById('imageSliderModal');
    imageSliderModal.style.display = 'block';
    // Scroll ke atas
    imageSliderModal.querySelector('.modal-content').scrollTop = 0;
    
    // Detect total images di background
    detectTotalImages(productId, function(total) {
        console.log('Total images detected:', total);
        totalImages = total || 1;
        counter.textContent = `1 / ${totalImages}`;
    });
}

function detectTotalImages(productId, callback) {
    // Detect total images dengan sequential checking, stop saat image tidak ditemukan
    let count = 0;
    
    function checkImage(index) {
        const imagePath = `product/${productId}/${index}.webp`;
        const img = new Image();
        
        img.onload = function() {
            console.log('Image found:', imagePath);
            count = index;
            // Lanjut check image berikutnya
            checkImage(index + 1);
        };
        
        img.onerror = function() {
            console.log('Image not found:', imagePath, '- Total images:', count);
            // Image tidak ditemukan, stop checking dan return total count
            callback(count);
        };
        
        img.src = imagePath;
    }
    
    checkImage(1);
}

function loadSliderImage(index) {
    console.log('Loading slider image:', index, 'Total:', totalImages);
    
    if (index < 1 || index > totalImages) {
        console.log('Index out of range');
        return;
    }
    
    currentImageIndex = index;
    const imagePath = `product/${currentProductId}/${index}.webp`;
    const sliderImage = document.getElementById('sliderImage');
    const counter = document.getElementById('sliderCounter');
    
    console.log('Setting image src to:', imagePath);
    
    sliderImage.src = imagePath;
    counter.textContent = `${index} / ${totalImages}`;
}

function nextImage() {
    if (currentImageIndex < totalImages) {
        loadSliderImage(currentImageIndex + 1);
    }
}

function prevImage() {
    if (currentImageIndex > 1) {
        loadSliderImage(currentImageIndex - 1);
    }
}

function closeImageSlider() {
    document.getElementById('imageSliderModal').style.display = 'none';
    currentProductId = null;
    currentImageIndex = 1;
    totalImages = 0;
}

// Keyboard navigation for image slider
document.addEventListener('keydown', function(event) {
    const modal = document.getElementById('imageSliderModal');
    if (modal && modal.style.display === 'block') {
        if (event.key === 'ArrowRight') {
            nextImage();
        } else if (event.key === 'ArrowLeft') {
            prevImage();
        } else if (event.key === 'Escape') {
            closeImageSlider();
        }
    }
});

// Lazy Loading dengan Intersection Observer
function initializeLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    
                    if (src) {
                        img.src = src;
                        img.classList.remove('lazy-image');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '100px'
        });
        
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                imageObserver.observe(img);
            }
        });
    } else {
        // Fallback untuk browser yang tidak support Intersection Observer
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.classList.remove('lazy-image');
            }
        });
    }
}

// Tutup modal saat klik di luar
window.onclick = function(event) {
    // Semua modal hanya bisa ditutup dengan klik tombol close (×)
    // Klik di luar modal tidak melakukan action apapun
}
