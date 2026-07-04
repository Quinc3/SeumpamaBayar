// ==================== LOGIC HALAMAN ISI PULSA ====================

let currentProvider = null;
let currentNomor = '';
let currentJenis = 'pulsa'; // 'pulsa' atau 'paket'
let selectedItem = null;
let selectedHarga = 0;
let selectedMetode = null;
let saldo = Storage ? Storage.get('saldo', 1250000) : 1250000;

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('nomorHP').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') deteksiOtomatis();
    });
});

function deteksiOtomatis() {
    const nomor = document.getElementById('nomorHP').value.replace(/\D/g, '');
    const errorEl = document.getElementById('nomorHPError');
    const inputEl = document.getElementById('nomorHP');
    const providerInfo = document.getElementById('providerInfo');
    const pilihanSection = document.getElementById('pilihanSection');

    errorEl.textContent = '';
    inputEl.classList.remove('is-invalid');
    providerInfo.style.display = 'none';
    pilihanSection.style.display = 'none';
    currentProvider = null;
    currentNomor = '';
    selectedItem = null;
    selectedHarga = 0;
    selectedMetode = null;

    // Reset preview & metode
    document.getElementById('previewCard').style.display = 'none';
    document.getElementById('metodeCard').style.display = 'none';
    document.getElementById('btnBayarPulsa').disabled = true;

    if (!nomor) return;

    if (!validasiNomorHP(nomor)) {
        inputEl.classList.add('is-invalid');
        errorEl.textContent = 'Nomor HP tidak valid (10-13 digit, awalan 08)';
        return;
    }

    currentProvider = deteksiProvider(nomor);
    currentNomor = nomor;

    if (!currentProvider) {
        inputEl.classList.add('is-invalid');
        errorEl.textContent = 'Provider tidak dikenali';
        return;
    }

    // Tampilkan provider
    providerInfo.style.display = 'block';
    document.getElementById('providerName').textContent = currentProvider;
    inputEl.classList.add('is-valid');

    // Render pilihan
    renderPilihan();
    pilihanSection.style.display = 'block';
    pilihanSection.scrollIntoView({ behavior: 'smooth' });

    // Validasi nomor HP lebih ketat
    if (nomor.length < 10) {
        inputEl.classList.add('is-invalid');
        errorEl.textContent = 'Nomor HP terlalu pendek (min 10 digit)';
        return;
    }
}

function renderPilihan() {
    // Render nominal pulsa
    const nominalContainer = document.getElementById('nominalContainer');
    nominalContainer.innerHTML = nominalPulsa.map(n => `
        <div class="col-4 col-md-3">
            <div class="kategori-card p-3" data-nominal="${n}" onclick="pilihItem('pulsa', 'Pulsa ${formatRupiah(n)}', ${n}, this)">
                <div class="fw-bold">${formatRupiah(n)}</div>
                <small class="text-muted">Pulsa Reguler</small>
            </div>
        </div>
    `).join('');

    // Render paket data
    const paketContainer = document.getElementById('paketContainer');
    const paketList = paketData[currentProvider] || [];

    if (paketList.length === 0) {
        paketContainer.innerHTML = `
            <div class="col-12">
                <p class="text-muted text-center py-3">Paket data tidak tersedia untuk provider ini.</p>
            </div>`;
    } else {
        paketContainer.innerHTML = paketList.map(p => `
            <div class="col-6 col-md-4">
                <div class="kategori-card p-3" data-harga="${p.harga}" onclick="pilihItem('paket', '${p.nama}', ${p.harga}, this)">
                    <div class="fw-bold">${p.nama}</div>
                    <small class="text-primary">${formatRupiah(p.harga)}</small>
                </div>
            </div>
        </div>
        `).join('');
    }
}

function pilihJenis(jenis) {
    currentJenis = jenis;
    selectedItem = null;
    selectedHarga = 0;
    selectedMetode = null;

    // Reset semua pilihan
    document.querySelectorAll('#nominalContainer .kategori-card, #paketContainer .kategori-card')
        .forEach(c => c.classList.remove('active'));

    document.getElementById('previewCard').style.display = 'none';
    document.getElementById('metodeCard').style.display = 'none';
    document.getElementById('btnBayarPulsa').disabled = true;

    // Reset metode
    document.querySelectorAll('#metodeCard .metode-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('metodeDetail').innerHTML = '';
}

function pilihItem(jenis, nama, harga, el) {
    // Reset semua pilihan di tab aktif
    const container = jenis === 'pulsa' ? '#nominalContainer' : '#paketContainer';
    document.querySelectorAll(container + ' .kategori-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');

    selectedItem = nama;
    selectedHarga = harga;
    currentJenis = jenis;

    // Tampilkan preview
    document.getElementById('previewCard').style.display = 'block';
    document.getElementById('previewCard').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('previewContent').innerHTML = `
        <div class="row align-items-center">
            <div class="col-md-8">
                <div class="detail-row"><span class="label">Provider</span><span class="value">${currentProvider}</span></div>
                <div class="detail-row"><span class="label">Nomor</span><span class="value">${maskNomor(currentNomor)}</span></div>
                <div class="detail-row"><span class="label">Jenis</span><span class="value">${jenis === 'pulsa' ? 'Pulsa Reguler' : 'Paket Data'}</span></div>
                <div class="detail-row"><span class="label">Produk</span><span class="value fw-bold">${nama}</span></div>
            </div>
            <div class="col-md-4 text-md-end mt-3 mt-md-0">
                <small class="text-muted">Total Bayar</small>
                <h4 class="fw-bold text-primary">${formatRupiah(harga)}</h4>
            </div>
        </div>`;

    // Tampilkan metode bayar
    document.getElementById('metodeCard').style.display = 'block';
    document.getElementById('metodeCard').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('btnBayarPulsa').disabled = true;
    selectedMetode = null;
    document.querySelectorAll('#metodeCard .metode-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('metodeDetail').innerHTML = '';
}

function pilihMetode(metode, el) {
    selectedMetode = metode;
    document.querySelectorAll('#metodeCard .metode-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('btnBayarPulsa').disabled = false;

    const detailDiv = document.getElementById('metodeDetail');

    if (metode === 'va') {
        const va = generateVA();
        detailDiv.innerHTML = `
            <div class="text-center p-3 bg-light rounded-3">
                <i class="bi bi-bank fs-3 text-primary"></i>
                <p class="fw-bold mb-1 mt-2">Virtual Account</p>
                <p class="fs-5 text-primary fw-bold mb-2">${va}</p>
                <small class="text-muted">a.n SeumpamaBayar</small><br>
                <button class="btn btn-outline-primary btn-sm mt-2" onclick="copyText('${va}')">
                    <i class="bi bi-copy me-1"></i>Salin VA
                </button>
            </div>`;
    } else if (metode === 'qris') {
        const qrText = 'SEUMPAMABAYAR-PULSA-' + generateId('QR') + '-' + selectedHarga;
        detailDiv.innerHTML = `
        <div class="text-center p-3 bg-light rounded-3">
            <p class="fw-bold mb-1">QR Code Pembayaran</p>
            <div class="bg-white d-inline-block p-3 rounded my-2 border" id="qrcodeContainerPulsa"></div>
            <p class="small text-muted">Scan di e-wallet Anda</p>
            <div class="text-danger small"><i class="bi bi-clock me-1"></i>Berlaku: <span id="countdown">05:00</span></div>
        </div>`;

        setTimeout(() => {
            generateQRCode('qrcodeContainerPulsa', qrText);
        }, 100);

        startCountdown(300);
    } else if (metode === 'teller') {
        const kode = generateKodeBayar();
        detailDiv.innerHTML = `
            <div class="text-center p-3 bg-light rounded-3">
                <i class="bi bi-shop fs-3 text-warning"></i>
                <p class="fw-bold mb-1 mt-2">Kode Bayar</p>
                <p class="fs-5 text-warning fw-bold mb-2">${kode}</p>
                <small class="text-muted">Tunjukkan ke kasir</small><br>
                <button class="btn btn-outline-warning btn-sm mt-2" onclick="copyText('${kode}')">
                    <i class="bi bi-copy me-1"></i>Salin Kode
                </button>
            </div>`;
    }
}

function konfirmasiBayarPulsa() {
    if (!selectedItem || !selectedMetode) {
        showToast('Pilih produk dan metode pembayaran', 'warning');
        return;
    }

    if (saldo < selectedHarga) {
        showToast('Saldo tidak mencukupi!', 'error');
        return;
    }

    const metodeNama = { va: 'Virtual Account', qris: 'QRIS', teller: 'Teller/Kasir' };

    document.getElementById('modalKonfirmasiBody').innerHTML = `
        <p>Anda akan membeli:</p>
        <table class="table table-sm table-borderless">
            <tr><td class="text-muted">Provider</td><td><strong>${currentProvider}</strong></td></tr>
            <tr><td class="text-muted">Nomor</td><td>${maskNomor(currentNomor)}</td></tr>
            <tr><td class="text-muted">Produk</td><td>${selectedItem}</td></tr>
            <tr><td class="text-muted">Metode</td><td>${metodeNama[selectedMetode]}</td></tr>
            <tr><td class="text-muted">Total</td><td class="fs-5 text-primary fw-bold">${formatRupiah(selectedHarga)}</td></tr>
            <tr><td class="text-muted">Saldo</td><td>${formatRupiah(saldo)}</td></tr>
        </table>`;

    const modal = new bootstrap.Modal(document.getElementById('modalKonfirmasi'));
    modal.show();

    document.getElementById('btnKonfirmasiBayar').onclick = function () {
        modal.hide();
        prosesBayarPulsa();
    };
}

function prosesBayarPulsa() {
    showLoading();

    setTimeout(() => {
        hideLoading();

        const metodeNama = { va: 'Virtual Account', qris: 'QRIS', teller: 'Teller/Kasir' };

        const transaksi = {
            id: generateId('TRX'),
            jenis: currentJenis === 'pulsa' ? 'Pulsa' : 'Paket Data',
            deskripsi: `${selectedItem} - ${maskNomor(currentNomor)} (${currentProvider})`,
            total: selectedHarga,
            metode: metodeNama[selectedMetode],
            tanggal: new Date().toISOString(),
            status: 'sukses',
            detailPulsa: {
                provider: currentProvider,
                nomor: currentNomor,
                produk: selectedItem
            }
        };

        // Simpan ke storage
        const riwayat = Storage.get('riwayat', []);
        riwayat.unshift(transaksi);
        Storage.set('riwayat', riwayat);
        saldo -= selectedHarga;
        Storage.set('saldo', saldo);

        document.getElementById('modalSuksesBody').innerHTML = `
            <i class="bi bi-check-circle fs-1 text-success"></i>
            <h5 class="mt-3">Pembelian Berhasil!</h5>
            <p class="text-muted">${selectedItem} untuk ${maskNomor(currentNomor)}</p>
            <p class="fw-bold text-primary">${formatRupiah(selectedHarga)}</p>
            <small class="text-muted">ID: ${transaksi.id}</small>`;
        document.getElementById('modalSuksesFooter').innerHTML = `
            <button class="btn btn-outline-primary btn-sm" onclick="cetakStrukPulsa('${transaksi.id}')">
                <i class="bi bi-printer me-1"></i>Cetak Struk
            </button>
            <button class="btn btn-success btn-sm" data-bs-dismiss="modal" onclick="location.reload()">
                <i class="bi bi-check me-1"></i>Selesai
            </button>`;

        const modalSukses = new bootstrap.Modal(document.getElementById('modalSukses'));
        modalSukses.show();
    }, 2000);
}

function maskNomor(nomor) {
    if (nomor.length <= 4) return nomor;
    return nomor.substring(0, 4) + '-****-' + nomor.substring(nomor.length - 4);
}

function cetakStrukPulsa(id) {
    const transaksi = Storage.get('riwayat', []).find(t => t.id === id);
    if (!transaksi) {
        showToast('Transaksi tidak ditemukan', 'error');
        return;
    }

    const modalPilihan = document.createElement('div');
    modalPilihan.innerHTML = `
        <div class="modal fade" id="modalPilihanCetak" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">Cetak Struk</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <p class="small text-muted mb-3">Pilih metode cetak struk</p>
                        <button class="btn btn-outline-primary w-100 mb-2" id="btnPrintStruk">
                            <i class="bi bi-printer me-2"></i>Print Struk
                        </button>
                        <button class="btn btn-outline-success w-100" id="btnPDFStruk">
                            <i class="bi bi-file-pdf me-2"></i>Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

    document.body.appendChild(modalPilihan);
    const modal = new bootstrap.Modal(document.getElementById('modalPilihanCetak'));
    modal.show();

    document.getElementById('btnPrintStruk').onclick = function () {
        modal.hide();
        const win = window.open('', '_blank', 'width=400,height=500');
        win.document.write(`
            <html><head><title>Struk - ${transaksi.id}</title>
            <style>body{font-family:monospace;padding:20px;}h4{margin:0;}hr{border:1px dashed #ccc;}
            .text-right{text-align:right;}.text-center{text-align:center;}</style></head>
            <body>
                <h4 class="text-center">SeumpamaBayar</h4><p class="text-center">Struk Pembelian</p><hr>
                <p>ID: ${transaksi.id}</p>
                <p>Tanggal: ${formatTanggal(transaksi.tanggal)} ${formatJam(transaksi.tanggal)}</p>
                <p>Provider: ${transaksi.detailPulsa?.provider || '-'}</p>
                <p>Nomor: ${maskNomor(transaksi.detailPulsa?.nomor || '')}</p>
                <p>Produk: ${transaksi.detailPulsa?.produk || '-'}</p>
                <p>Metode: ${transaksi.metode}</p><hr>
                <h4 class="text-right">Total: ${formatRupiah(transaksi.total)}</h4><hr>
                <p class="text-center">Terima kasih</p>
            </body></html>
        `);
        win.document.close();
        win.print();
        setTimeout(() => document.body.removeChild(modalPilihan), 500);
    };

    document.getElementById('btnPDFStruk').onclick = function () {
        modal.hide();
        exportPDF(transaksi);
        showToast('PDF berhasil diunduh', 'success');
        setTimeout(() => document.body.removeChild(modalPilihan), 500);
    };

    document.getElementById('modalPilihanCetak').addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(modalPilihan);
    });
}

// Init theme
initTheme();
updateThemeIcon();

function toggleThemeButton() {
    const theme = toggleTheme();
    updateThemeIcon();
    showToast(`Tema ${theme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'info');
}

function updateThemeIcon() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>';
}

function showCustomInput() {
    // Reset pilihan
    document.querySelectorAll('#nominalContainer .kategori-card, #paketContainer .kategori-card')
        .forEach(c => c.classList.remove('active'));

    const modalHTML = `
        <div class="modal fade" id="modalCustomNominal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">Nominal Custom</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <label class="form-label small">Masukkan nominal (min Rp 5.000)</label>
                        <input type="number" class="form-control" id="customNominal" 
                               placeholder="Contoh: 15000" min="5000" step="1000">
                        <div class="invalid-feedback d-block" id="customNominalError"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Batal</button>
                        <button type="button" class="btn btn-primary btn-sm" onclick="submitCustomNominal()">Pilih</button>
                    </div>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('modalCustomNominal'));
    modal.show();

    document.getElementById('modalCustomNominal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

function submitCustomNominal() {
    const nominal = parseInt(document.getElementById('customNominal').value);
    const errorEl = document.getElementById('customNominalError');

    errorEl.textContent = '';

    if (!nominal || nominal < 5000) {
        errorEl.textContent = 'Minimal Rp 5.000';
        return;
    }

    if (nominal % 1000 !== 0) {
        errorEl.textContent = 'Harus kelipatan Rp 1.000';
        return;
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalCustomNominal'));
    modal.hide();

    // Pilih item custom
    const customCard = document.querySelector('[data-nominal="custom"]');
    pilihItem('pulsa', `Pulsa ${formatRupiah(nominal)}`, nominal, customCard);
}