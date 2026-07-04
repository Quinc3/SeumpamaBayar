// ==================== LOGIC HALAMAN BAYAR TAGIHAN ====================

let selectedKategori = 'PLN';
let selectedMetode = null;
let currentTagihan = null;
let saldo = Storage ? Storage.get('saldo', 1250000) : 1250000;

// Init
document.addEventListener('DOMContentLoaded', function () {
    const savedKategori = sessionStorage.getItem('selectedKategori');
    if (savedKategori) {
        selectedKategori = savedKategori;
        const targetCard = document.querySelector(`.kategori-card[data-kategori="${savedKategori}"]`);
        if (targetCard) {
            document.querySelectorAll('.kategori-card').forEach(c => c.classList.remove('active'));
            targetCard.classList.add('active');
        }
        sessionStorage.removeItem('selectedKategori');
    }

    document.getElementById('idPelanggan').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') cekTagihan();
    });

    initTheme();
    updateThemeIcon();
});

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

function pilihKategori(kategori, el) {
    selectedKategori = kategori;
    document.querySelectorAll('.kategori-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    resetForm();
}

function resetForm() {
    document.getElementById('idPelanggan').value = '';
    document.getElementById('idPelangganError').textContent = '';
    document.getElementById('idPelanggan').classList.remove('is-invalid');
    document.getElementById('hasilTagihan').style.display = 'none';
    document.getElementById('metodeBayarSection').style.display = 'none';
    document.getElementById('ringkasanBayar').style.display = 'none';
    currentTagihan = null;
    selectedMetode = null;
}

function generateTagihan(dataPelanggan, kategori) {
    let total = 0, denda = 0, detail = '';
    const jatuhTempo = new Date(Date.now() + Math.floor(Math.random() * 15 + 3) * 86400000).toISOString().split('T')[0];

    if (kategori === 'PLN') {
        const kwh = Math.floor(Math.random() * 200) + 50;
        total = kwh * 1444;
        denda = Math.random() > 0.6 ? Math.floor(total * 0.02) : 0;
        detail = `Penggunaan: ${kwh} kWh - ${dataPelanggan.tarif || 'R1/900'}`;
    } else if (kategori === 'PDAM') {
        const m3 = Math.floor(Math.random() * 20) + 5;
        total = m3 * 5000 + 25000;
        denda = 5000;
        detail = `Pemakaian: ${m3} m³ - ${dataPelanggan.golongan || 'Rumah Tangga'}`;
    } else if (kategori === 'Internet') {
        if (dataPelanggan.paket && dataPelanggan.paket.includes('100')) total = 450000;
        else if (dataPelanggan.paket && dataPelanggan.paket.includes('150')) total = 650000;
        else total = 350000;
        denda = 0;
        detail = `Paket ${dataPelanggan.paket || 'Reguler'} - ${dataPelanggan.provider || 'ISP'}`;
    } else if (kategori === 'seminar') {
        total = 150000;
        denda = 0;
        detail = 'Biaya Pendaftaran Seminar/Event';
    }

    return {
        id: 'TAG-' + Date.now(),
        idPelanggan: dataPelanggan.id || dataPelanggan,
        jenis: kategori === 'seminar' ? 'Seminar' : kategori,
        nama: dataPelanggan.nama || 'Peserta',
        alamat: dataPelanggan.alamat || '',
        detail: detail,
        total: total,
        denda: denda,
        jatuhTempo: jatuhTempo,
        status: 'belum'
    };
}

function cekTagihan() {
    const idPelanggan = document.getElementById('idPelanggan').value.trim();
    const errorEl = document.getElementById('idPelangganError');
    const inputEl = document.getElementById('idPelanggan');

    errorEl.textContent = '';
    inputEl.classList.remove('is-invalid');
    document.getElementById('hasilTagihan').style.display = 'none';
    document.getElementById('metodeBayarSection').style.display = 'none';
    document.getElementById('ringkasanBayar').style.display = 'none';
    currentTagihan = null;
    selectedMetode = null;

    if (!idPelanggan) {
        inputEl.classList.add('is-invalid');
        errorEl.textContent = 'Nomor pelanggan harus diisi';
        return;
    }

    if (!validasiIdPelanggan(idPelanggan, selectedKategori)) {
        inputEl.classList.add('is-invalid');
        errorEl.textContent = selectedKategori === 'seminar'
            ? 'Format ID tidak valid (4-20 karakter alfanumerik)'
            : 'Format nomor tidak valid (8-12 digit angka)';
        return;
    }

    // ✅ Cek tagihan sudah lunas (DIPINDAHKAN KE SINI)
    const tagihanLunas = Storage.get('tagihanLunas', []);
    if (tagihanLunas.includes(idPelanggan + '_' + selectedKategori)) {
        inputEl.classList.add('is-invalid');
        errorEl.textContent = 'Tagihan ini sudah lunas';
        return;
    }

    let dataPelanggan = null;

    if (selectedKategori === 'PLN') {
        dataPelanggan = plnData.find(p => p.id === idPelanggan);
    } else if (selectedKategori === 'PDAM') {
        dataPelanggan = pdamData.find(p => p.id === idPelanggan);
    } else if (selectedKategori === 'Internet') {
        dataPelanggan = internetData.find(p => p.id === idPelanggan);
    } else if (selectedKategori === 'seminar') {
        dataPelanggan = {
            id: idPelanggan,
            nama: 'Peserta: ' + idPelanggan,
            alamat: 'Event: Seminar/Workshop ' + idPelanggan
        };
    }

    if (!dataPelanggan) {
        inputEl.classList.add('is-invalid');
        errorEl.textContent = 'Nomor pelanggan tidak ditemukan';
        return;
    }

    showLoading();
    setTimeout(() => {
        hideLoading();
        currentTagihan = generateTagihan(dataPelanggan, selectedKategori);
        renderHasilTagihan();
        document.getElementById('hasilTagihan').scrollIntoView({ behavior: 'smooth' });
    }, 600);
}

function renderHasilTagihan() {
    const t = currentTagihan;
    const totalBayar = t.total + t.denda;

    document.getElementById('hasilTagihan').style.display = 'block';
    document.getElementById('hasilTagihan').innerHTML = `
        <div class="card card-custom mb-4 fade-in">
            <div class="card-header">
                <i class="bi bi-2-circle-fill text-primary me-2"></i> Detail Tagihan
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="detail-row"><span class="label">Nama</span><span class="value">${t.nama}</span></div>
                        <div class="detail-row"><span class="label">Alamat</span><span class="value">${t.alamat || '-'}</span></div>
                        <div class="detail-row"><span class="label">Jenis</span><span class="value"><span class="badge bg-primary">${t.jenis}</span></span></div>
                        <div class="detail-row"><span class="label">Detail</span><span class="value">${t.detail}</span></div>
                        <div class="detail-row"><span class="label">ID Tagihan</span><span class="value"><small>${t.id}</small></span></div>
                    </div>
                    <div class="col-md-6">
                        <div class="detail-row"><span class="label">Tagihan</span><span class="value">${formatRupiah(t.total)}</span></div>
                        <div class="detail-row"><span class="label">Denda</span><span class="value ${t.denda > 0 ? 'text-danger' : ''}">${formatRupiah(t.denda)}</span></div>
                        <div class="detail-row"><span class="label">Jatuh Tempo</span><span class="value">${formatTanggal(t.jatuhTempo)}</span></div>
                        <div class="detail-row"><span class="label">Total Bayar</span><span class="value fs-5 text-primary fw-bold">${formatRupiah(totalBayar)}</span></div>
                    </div>
                </div>
            </div>
        </div>`;

    renderMetodeBayar();
}

function renderMetodeBayar() {
    document.getElementById('metodeBayarSection').style.display = 'block';
    document.getElementById('metodeBayarSection').innerHTML = `
        <div class="card card-custom mb-4">
            <div class="card-header">
                <i class="bi bi-3-circle-fill text-primary me-2"></i> Pilih Metode Pembayaran
            </div>
            <div class="card-body">
                <div class="row g-3 mb-3">
                    <div class="col-md-4">
                        <div class="metode-card" data-metode="va" onclick="pilihMetode('va', this)">
                            <div class="metode-icon text-primary"><i class="bi bi-bank"></i></div>
                            <div class="fw-semibold small">Virtual Account</div>
                            <small class="text-muted">Transfer via ATM/mBanking</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="metode-card" data-metode="qris" onclick="pilihMetode('qris', this)">
                            <div class="metode-icon text-success"><i class="bi bi-qr-code"></i></div>
                            <div class="fw-semibold small">QRIS</div>
                            <small class="text-muted">Scan kode QR</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="metode-card" data-metode="teller" onclick="pilihMetode('teller', this)">
                            <div class="metode-icon text-warning"><i class="bi bi-shop"></i></div>
                            <div class="fw-semibold small">Teller / Kasir</div>
                            <small class="text-muted">Bayar langsung di kasir</small>
                        </div>
                    </div>
                </div>
                <div id="metodeDetail"></div>
            </div>
        </div>`;

    document.getElementById('metodeBayarSection').scrollIntoView({ behavior: 'smooth' });
}

function pilihMetode(metode, el) {
    selectedMetode = metode;
    document.querySelectorAll('.metode-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');

    const detailDiv = document.getElementById('metodeDetail');
    const totalBayar = currentTagihan.total + currentTagihan.denda;

    detailDiv.innerHTML = '';

    if (metode === 'va') {
        const vaData = generateVA();
        detailDiv.innerHTML = `
        <div class="text-center p-3 bg-light rounded-3 fade-in">
            <i class="bi bi-bank fs-3 text-primary"></i>
            <p class="fw-bold mb-1 mt-2">Virtual Account - ${vaData.bank}</p>
            <p class="fs-5 text-primary fw-bold mb-2">${vaData.number}</p>
            <small class="text-muted">a.n SeumpamaBayar</small><br>
            <button class="btn btn-outline-primary btn-sm mt-2" onclick="copyText('${vaData.number}')">
                <i class="bi bi-copy me-1"></i>Salin VA
            </button>
            <div class="mt-2">
                <small class="text-muted">Ganti bank:</small><br>
                <button class="btn btn-outline-secondary btn-sm mt-1" onclick="gantiBank('BCA')">BCA</button>
                <button class="btn btn-outline-secondary btn-sm mt-1" onclick="gantiBank('BNI')">BNI</button>
                <button class="btn btn-outline-secondary btn-sm mt-1" onclick="gantiBank('Mandiri')">Mandiri</button>
            </div>
        </div>`;
    } else if (metode === 'qris') {
        const qrText = 'SEUMPAMABAYAR-' + generateId('QR') + '-' + totalBayar;
        detailDiv.innerHTML = `
            <div class="text-center p-3 bg-light rounded-3 fade-in">
                <p class="fw-bold mb-1">QR Code Pembayaran</p>
                <div class="bg-white d-inline-block p-3 rounded my-2 border" id="qrcodeContainerTagihan"></div>
                <p class="small text-muted">Scan di aplikasi e-wallet Anda</p>
                <div class="text-danger small"><i class="bi bi-clock me-1"></i>Berlaku: <span id="countdownTagihan">05:00</span></div>
            </div>`;

        setTimeout(() => {
            const qrContainer = document.getElementById('qrcodeContainerTagihan');
            if (qrContainer) {
                generateQRCode('qrcodeContainerTagihan', qrText);
            }
        }, 150);

        startCountdown(300, 'countdownTagihan');
    } else if (metode === 'teller') {
        const kode = generateKodeBayar();
        detailDiv.innerHTML = `
            <div class="text-center p-3 bg-light rounded-3 fade-in">
                <i class="bi bi-shop fs-3 text-warning"></i>
                <p class="fw-bold mb-1 mt-2">Kode Bayar Teller</p>
                <p class="fs-5 text-warning fw-bold mb-2" id="kodeTeller">${kode}</p>
                <small class="text-muted">Tunjukkan kode ini ke kasir</small><br>
                <button class="btn btn-outline-warning btn-sm mt-2" onclick="copyText('${kode}')">
                    <i class="bi bi-copy me-1"></i>Salin Kode
                </button>
            </div>`;
    }

    document.getElementById('ringkasanBayar').style.display = 'block';
    document.getElementById('ringkasanBayar').innerHTML = `
        <div class="card card-custom fade-in">
            <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <span class="text-muted small">Total Pembayaran</span>
                    <h5 class="fw-bold text-primary mb-0">${formatRupiah(totalBayar)}</h5>
                </div>
                <button class="btn btn-primary btn-lg px-5" onclick="konfirmasiBayar()">
                    <i class="bi bi-check-circle me-2"></i>Bayar Sekarang
                </button>
            </div>
        </div>`;

    document.getElementById('ringkasanBayar').scrollIntoView({ behavior: 'smooth' });
}

// ✅ Fungsi gantiBank() DITAMBAHKAN
function gantiBank(bank) {
    const vaData = generateVA(bank);
    const detailDiv = document.getElementById('metodeDetail');
    detailDiv.innerHTML = `
        <div class="text-center p-3 bg-light rounded-3 fade-in">
            <i class="bi bi-bank fs-3 text-primary"></i>
            <p class="fw-bold mb-1 mt-2">Virtual Account - ${vaData.bank}</p>
            <p class="fs-5 text-primary fw-bold mb-2">${vaData.number}</p>
            <small class="text-muted">a.n SeumpamaBayar</small><br>
            <button class="btn btn-outline-primary btn-sm mt-2" onclick="copyText('${vaData.number}')">
                <i class="bi bi-copy me-1"></i>Salin VA
            </button>
            <div class="mt-2">
                <small class="text-muted">Ganti bank:</small><br>
                <button class="btn btn-outline-secondary btn-sm mt-1" onclick="gantiBank('BCA')">BCA</button>
                <button class="btn btn-outline-secondary btn-sm mt-1" onclick="gantiBank('BNI')">BNI</button>
                <button class="btn btn-outline-secondary btn-sm mt-1" onclick="gantiBank('Mandiri')">Mandiri</button>
            </div>
        </div>`;
}

function konfirmasiBayar() {
    if (!currentTagihan || !selectedMetode) {
        showToast('Pilih metode pembayaran terlebih dahulu', 'warning');
        return;
    }

    const totalBayar = currentTagihan.total + currentTagihan.denda;

    if (saldo < totalBayar) {
        showToast('Saldo tidak mencukupi! Silakan isi saldo terlebih dahulu.', 'error');
        return;
    }

    const metodeNama = { va: 'Virtual Account', qris: 'QRIS', teller: 'Teller/Kasir' };

    document.getElementById('modalKonfirmasiBody').innerHTML = `
        <div class="text-center mb-3">
            <i class="bi bi-shield-check fs-1 text-primary"></i>
        </div>
        <p class="text-center">Apakah Anda yakin ingin membayar tagihan ini?</p>
        <table class="table table-sm table-borderless">
            <tr><td class="text-muted">Jenis</td><td><strong>${currentTagihan.jenis}</strong></td></tr>
            <tr><td class="text-muted">Nama</td><td>${currentTagihan.nama}</td></tr>
            <tr><td class="text-muted">Metode</td><td>${metodeNama[selectedMetode]}</td></tr>
            <tr><td class="text-muted">Total</td><td class="fs-5 text-primary fw-bold">${formatRupiah(totalBayar)}</td></tr>
            <tr><td class="text-muted">Saldo Saat Ini</td><td>${formatRupiah(saldo)}</td></tr>
            <tr><td class="text-muted">Sisa Saldo</td><td>${formatRupiah(saldo - totalBayar)}</td></tr>
        </table>`;

    const modal = new bootstrap.Modal(document.getElementById('modalKonfirmasi'));
    modal.show();

    document.getElementById('btnKonfirmasiBayar').onclick = function () {
        modal.hide();
        prosesBayar();
    };
}

function prosesBayar() {
    showLoading();

    setTimeout(() => {
        hideLoading();

        const totalBayar = currentTagihan.total + currentTagihan.denda;
        const metodeNama = { va: 'Virtual Account', qris: 'QRIS', teller: 'Teller/Kasir' };
        const transaksi = {
            id: generateId('TRX'),
            jenis: currentTagihan.jenis,
            deskripsi: `${currentTagihan.jenis} - ${currentTagihan.nama}`,
            total: totalBayar,
            metode: metodeNama[selectedMetode],
            tanggal: new Date().toISOString(),
            status: 'sukses',
            detail: {
                idPelanggan: currentTagihan.idPelanggan,
                nama: currentTagihan.nama,
                alamat: currentTagihan.alamat
            }
        };

        if (typeof Storage !== 'undefined') {
            const riwayat = Storage.get('riwayat', []);
            riwayat.unshift(transaksi);
            Storage.set('riwayat', riwayat);
            saldo -= totalBayar;
            Storage.set('saldo', saldo);

            // ✅ Tandai lunas (DIPINDAHKAN KE SINI)
            const tagihanLunas = Storage.get('tagihanLunas', []);
            tagihanLunas.push(currentTagihan.idPelanggan + '_' + currentTagihan.jenis);
            Storage.set('tagihanLunas', tagihanLunas);
        }

        document.getElementById('modalSuksesBody').innerHTML = `
            <i class="bi bi-check-circle fs-1 text-success"></i>
            <h5 class="mt-3">Pembayaran Berhasil!</h5>
            <p class="text-muted">${currentTagihan.jenis} sebesar ${formatRupiah(totalBayar)} telah dibayar.</p>
            <small class="text-muted">ID Transaksi: ${transaksi.id}</small>`;
        document.getElementById('modalSuksesFooter').innerHTML = `
            <button class="btn btn-outline-primary btn-sm" onclick="cetakStruk('${transaksi.id}')">
                <i class="bi bi-printer me-1"></i>Cetak Struk
            </button>
            <button class="btn btn-success btn-sm" data-bs-dismiss="modal" onclick="location.reload()">
                <i class="bi bi-check me-1"></i>Selesai
            </button>`;

        const modalSukses = new bootstrap.Modal(document.getElementById('modalSukses'));
        modalSukses.show();
    }, 2000);
}

function cetakStruk(id) {
    const transaksi = Storage ? Storage.get('riwayat', []).find(t => t.id === id) : null;
    if (!transaksi) {
        showToast('Transaksi tidak ditemukan', 'error');
        return;
    }

    const modalPilihan = document.createElement('div');
    modalPilihan.innerHTML = `
        <div class="modal fade" id="modalPilihanCetakTagihan" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">Cetak Struk</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <p class="small text-muted mb-3">Pilih metode cetak struk</p>
                        <button class="btn btn-outline-primary w-100 mb-2" id="btnPrintStrukTagihan">
                            <i class="bi bi-printer me-2"></i>Print Struk
                        </button>
                        <button class="btn btn-outline-success w-100" id="btnPDFStrukTagihan">
                            <i class="bi bi-file-pdf me-2"></i>Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

    document.body.appendChild(modalPilihan);
    const modal = new bootstrap.Modal(document.getElementById('modalPilihanCetakTagihan'));
    modal.show();

    document.getElementById('btnPrintStrukTagihan').onclick = function () {
        modal.hide();
        const win = window.open('', '_blank', 'width=400,height=600');
        win.document.write(`
            <!DOCTYPE html>
            <html><head><title>Struk - ${transaksi.id}</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 20px; max-width: 350px; margin: 0 auto; }
                h3 { text-align: center; margin: 0; color: #006b2c; }
                .subtitle { text-align: center; font-size: 11px; color: #666; margin-bottom: 10px; }
                hr { border: 1px dashed #ccc; }
                table { width: 100%; font-size: 12px; }
                td { padding: 3px 0; }
                .label { color: #666; }
                .total { font-size: 16px; font-weight: bold; color: #006b2c; text-align: right; }
                .footer { text-align: center; font-size: 10px; color: #999; margin-top: 10px; }
            </style></head>
            <body>
                <h3>🌱 SeumpamaBayar</h3>
                <p class="subtitle">Struk Pembayaran Digital</p><hr>
                <table>
                    <tr><td class="label">ID</td><td>: ${transaksi.id}</td></tr>
                    <tr><td class="label">Tanggal</td><td>: ${formatTanggal(transaksi.tanggal)}</td></tr>
                    <tr><td class="label">Jam</td><td>: ${formatJam(transaksi.tanggal)}</td></tr>
                    <tr><td class="label">Jenis</td><td>: ${transaksi.jenis}</td></tr>
                    <tr><td class="label">Deskripsi</td><td>: ${transaksi.deskripsi}</td></tr>
                    <tr><td class="label">Metode</td><td>: ${transaksi.metode}</td></tr>
                </table><hr>
                <p class="total">${formatRupiah(transaksi.total)}</p><hr>
                <p class="footer">Terima kasih telah menggunakan<br>SeumpamaBayar</p>
            </body></html>
        `);
        win.document.close();
        win.print();
        cleanup();
    };

    document.getElementById('btnPDFStrukTagihan').onclick = function () {
        modal.hide();
        if (typeof exportPDF === 'function') {
            exportPDF(transaksi);
            showToast('PDF berhasil diunduh', 'success');
        } else {
            showToast('Fitur PDF tidak tersedia', 'error');
        }
        cleanup();
    };

    function cleanup() {
        setTimeout(() => {
            if (document.body.contains(modalPilihan)) {
                document.body.removeChild(modalPilihan);
            }
        }, 500);
    }

    document.getElementById('modalPilihanCetakTagihan').addEventListener('hidden.bs.modal', cleanup);
}