// ==================== LOGIC HALAMAN SPP ====================

let mhsAktif = null;
let cicilanDipilih = [];
let selectedMetode = null;
let saldo = Storage ? Storage.get('saldo', 1250000) : 1250000;

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('nimInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') cekSPP();
    });
});

function cekSPP() {
    const nim = document.getElementById('nimInput').value.trim();
    const errorEl = document.getElementById('nimError');
    const inputEl = document.getElementById('nimInput');
    // Cek semua cicilan sudah lunas
    const semuaLunas = mhsAktif.cicilan.every(c => c.status === 'lunas');
    if (semuaLunas) {
        showToast('Semua cicilan sudah lunas! 🎉', 'info');
        // Tetap tampilkan data
    }

    errorEl.textContent = '';
    inputEl.classList.remove('is-invalid');
    document.getElementById('hasilSPP').style.display = 'none';
    document.getElementById('metodeSPPSection').style.display = 'none';
    mhsAktif = null;
    cicilanDipilih = [];
    selectedMetode = null;

    if (!validasiNIM(nim)) {
        inputEl.classList.add('is-invalid');
        errorEl.textContent = 'Format NIM tidak valid (6-10 digit angka)';
        return;
    }

    const sppList = Storage.get('sppData', sppData);
    mhsAktif = sppList.find(m => m.nim === nim);

    if (!mhsAktif) {
        inputEl.classList.add('is-invalid');
        errorEl.textContent = 'NIM tidak ditemukan';
        return;
    }

    renderDataSPP();
}

function renderDataSPP() {
    const m = mhsAktif;
    const lunas = m.cicilan.filter(c => c.status === 'lunas').length;
    const total = m.cicilan.length;
    const persen = Math.round((lunas / total) * 100);

    document.getElementById('hasilSPP').style.display = 'block';
    document.getElementById('hasilSPP').innerHTML = `
    <div class="fade-in">
        <!-- Info Mahasiswa -->
        <div class="card card-custom mb-4">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h6 class="fw-bold mb-1">${m.nama}</h6>
                        <p class="text-muted small mb-2">NIM: ${m.nim} | ${m.jurusan} | Semester ${m.semester}</p>
                        <div class="d-flex align-items-center gap-2">
                            <small class="text-muted">Progress:</small>
                            <div class="progress flex-grow-1" style="height:8px;">
                                <div class="progress-bar ${persen === 100 ? 'bg-success' : 'bg-primary'}" 
                                     style="width:${persen}%"></div>
                            </div>
                            <small class="fw-bold">${persen}%</small>
                        </div>
                    </div>
                    <div class="col-md-4 text-md-end mt-3 mt-md-0">
                        <span class="${persen === 100 ? 'badge-lunas' : 'badge-belum'}">
                            ${lunas}/${total} Lunas
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Daftar Cicilan -->
        <h6 class="fw-bold mb-3"><i class="bi bi-list-check me-2"></i>Daftar Cicilan</h6>
        <div class="table-container card-custom mb-3 overflow-hidden">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th width="50">
                            <input type="checkbox" id="checkAll" onchange="toggleAll(this)">
                        </th>
                        <th>Kode</th>
                        <th>Deskripsi</th>
                        <th>Jumlah</th>
                        <th>Status</th>
                        <th>Tgl Bayar</th>
                    </tr>
                </thead>
                <tbody>
                    ${m.cicilan.map(c => `
                    <tr class="${c.status === 'lunas' ? 'table-light opacity-75' : ''}">
                        <td>
                            ${c.status === 'belum' ?
            `<input type="checkbox" class="cicilan-check" value="${c.id}" 
                                        data-jumlah="${c.jumlah}" data-deskripsi="${c.deskripsi}"
                                        onchange="updateTotal()">` :
            '<i class="bi bi-check-circle-fill text-success"></i>'}
                        </td>
                        <td><small class="fw-medium">${c.id}</small></td>
                        <td>${c.deskripsi}</td>
                        <td>${formatRupiah(c.jumlah)}</td>
                        <td>
                            <span class="${c.status === 'lunas' ? 'badge-lunas' : 'badge-belum'}">
                                ${c.status === 'lunas' ? 'Lunas' : 'Belum'}
                            </span>
                        </td>
                        <td><small>${c.tglBayar ? formatTanggal(c.tglBayar, false) : '-'}</small></td>
                    </tr>
                    `).join('')}
                </tbody>
                <tfoot class="table-light">
                    <tr>
                        <td colspan="3" class="text-end fw-bold">Total Dipilih:</td>
                        <td class="fw-bold text-primary" id="totalDisplay">Rp 0</td>
                        <td colspan="2"></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Tombol Lanjut -->
        <div class="text-end">
            <button class="btn btn-primary" id="btnLanjutBayar" disabled onclick="lanjutPembayaran()">
                <i class="bi bi-arrow-right me-1"></i> Lanjut ke Pembayaran
            </button>
        </div>
    </div>`;
}

function toggleAll(el) {
    const checks = document.querySelectorAll('.cicilan-check');
    checks.forEach(c => {
        c.checked = el.checked;
    });
    updateTotal();
}

function updateTotal() {
    const checks = document.querySelectorAll('.cicilan-check:checked');
    cicilanDipilih = [];
    let total = 0;

    checks.forEach(c => {
        cicilanDipilih.push({
            id: c.value,
            jumlah: parseInt(c.dataset.jumlah),
            deskripsi: c.dataset.deskripsi
        });
        total += parseInt(c.dataset.jumlah);
    });

    document.getElementById('totalDisplay').textContent = formatRupiah(total);
    document.getElementById('btnLanjutBayar').disabled = cicilanDipilih.length === 0;
}

function lanjutPembayaran() {
    if (cicilanDipilih.length === 0) {
        showToast('Pilih minimal satu cicilan', 'warning');
        return;
    }

    const total = cicilanDipilih.reduce((sum, c) => sum + c.jumlah, 0);

    document.getElementById('metodeSPPSection').style.display = 'block';
    document.getElementById('metodeSPPSection').innerHTML = `
    <div class="fade-in">
        <div class="card card-custom mb-4">
            <div class="card-header">
                <i class="bi bi-credit-card me-2"></i> Pilih Metode Pembayaran
            </div>
            <div class="card-body">
                <div class="row g-3 mb-3">
                    <div class="col-md-4">
                        <div class="metode-card" data-metode="va" onclick="pilihMetode('va', this)">
                            <div class="metode-icon text-primary"><i class="bi bi-bank"></i></div>
                            <div class="fw-semibold small">Virtual Account</div>
                            <small class="text-muted">Transfer via ATM</small>
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
                            <small class="text-muted">Bayar langsung</small>
                        </div>
                    </div>
                </div>
                <div id="metodeDetail"></div>
            </div>
        </div>

        <!-- Ringkasan -->
        <div class="card card-custom" id="ringkasanSPP">
            <div class="card-body">
                <h6 class="fw-bold mb-3">Ringkasan Pembayaran</h6>
                ${cicilanDipilih.map(c => `
                <div class="detail-row">
                    <span class="label">${c.deskripsi}</span>
                    <span class="value">${formatRupiah(c.jumlah)}</span>
                </div>
                `).join('')}
                <div class="detail-row fw-bold">
                    <span class="label">Total</span>
                    <span class="value fs-5 text-primary">${formatRupiah(total)}</span>
                </div>
                <button class="btn btn-primary btn-lg w-100 mt-3" id="btnBayarSPP" disabled onclick="konfirmasiBayarSPP()">
                    <i class="bi bi-check-circle me-2"></i>Bayar Sekarang
                </button>
            </div>
        </div>
    </div>`;

    // Scroll ke metode bayar
    document.getElementById('metodeSPPSection').scrollIntoView({ behavior: 'smooth' });
}

function pilihMetode(metode, el) {
    selectedMetode = metode;
    document.querySelectorAll('.metode-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('btnBayarSPP').disabled = false;

    const detailDiv = document.getElementById('metodeDetail');

    if (metode === 'va') {
        const va = generateVA();
        detailDiv.innerHTML = `
            <div class="text-center p-3 bg-light rounded-3">
                <i class="bi bi-bank fs-3 text-primary"></i>
                <p class="fw-bold mb-1 mt-2">Virtual Account</p>
                <p class="fs-5 text-primary fw-bold mb-2">${va}</p>
                <small class="text-muted">a.n SeumpamaBayar - Bank BNI</small><br>
                <button class="btn btn-outline-primary btn-sm mt-2" onclick="copyText('${va}')">
                    <i class="bi bi-copy me-1"></i>Salin VA
                </button>
            </div>`;
    } else if (metode === 'qris') {
        detailDiv.innerHTML = `
            <div class="text-center p-3 bg-light rounded-3">
                <i class="bi bi-qr-code fs-1 text-success"></i>
                <p class="fw-bold mb-1 mt-2">QR Code</p>
                <div class="bg-white d-inline-block p-3 rounded my-2 border">
                    <div style="width:120px;height:120px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;">
                        <i class="bi bi-qr-code fs-1 text-dark"></i>
                    </div>
                </div>
                <p class="small text-muted">Scan di e-wallet Anda</p>
                <div class="text-danger small"><i class="bi bi-clock me-1"></i>Berlaku: <span id="countdown">05:00</span></div>
            </div>`;
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

function konfirmasiBayarSPP() {
    if (!selectedMetode || cicilanDipilih.length === 0) {
        showToast('Pilih metode pembayaran', 'warning');
        return;
    }

    const total = cicilanDipilih.reduce((sum, c) => sum + c.jumlah, 0);
    const metodeNama = { va: 'Virtual Account', qris: 'QRIS', teller: 'Teller/Kasir' };

    if (saldo < total) {
        showToast('Saldo tidak mencukupi!', 'error');
        return;
    }

    document.getElementById('modalKonfirmasiBody').innerHTML = `
        <p>Anda akan membayar <strong>${cicilanDipilih.length} cicilan</strong>:</p>
        <ul class="small">
            ${cicilanDipilih.map(c => `<li>${c.deskripsi} - ${formatRupiah(c.jumlah)}</li>`).join('')}
        </ul>
        <table class="table table-sm table-borderless">
            <tr><td class="text-muted">Total</td><td class="fs-5 text-primary fw-bold">${formatRupiah(total)}</td></tr>
            <tr><td class="text-muted">Metode</td><td>${metodeNama[selectedMetode]}</td></tr>
            <tr><td class="text-muted">Saldo</td><td>${formatRupiah(saldo)}</td></tr>
            <tr><td class="text-muted">Sisa</td><td>${formatRupiah(saldo - total)}</td></tr>
        </table>`;

    const modal = new bootstrap.Modal(document.getElementById('modalKonfirmasi'));
    modal.show();

    document.getElementById('btnKonfirmasiBayar').onclick = function () {
        modal.hide();
        prosesBayarSPP();
    };
}

function prosesBayarSPP() {
    showLoading();

    setTimeout(() => {
        hideLoading();

        const total = cicilanDipilih.reduce((sum, c) => sum + c.jumlah, 0);
        const metodeNama = { va: 'Virtual Account', qris: 'QRIS', teller: 'Teller/Kasir' };

        const transaksi = {
            id: generateId('TRX'),
            jenis: 'SPP',
            deskripsi: `SPP - ${mhsAktif.nama} (${cicilanDipilih.length} cicilan)`,
            total: total,
            metode: metodeNama[selectedMetode],
            tanggal: new Date().toISOString(),
            status: 'sukses',
            detailSPP: {
                nim: mhsAktif.nim,
                cicilan: cicilanDipilih.map(c => c.id)
            }
        };

        // Simpan transaksi
        const riwayat = Storage.get('riwayat', []);
        riwayat.unshift(transaksi);
        Storage.set('riwayat', riwayat);
        saldo -= total;
        Storage.set('saldo', saldo);

        // Update status cicilan
        const sppList = Storage.get('sppData', sppData);
        const mhs = sppList.find(m => m.nim === mhsAktif.nim);
        if (mhs) {
            cicilanDipilih.forEach(c => {
                const cicilan = mhs.cicilan.find(x => x.id === c.id);
                if (cicilan) {
                    cicilan.status = 'lunas';
                    cicilan.tglBayar = new Date().toISOString().split('T')[0];
                }
            });
            Storage.set('sppData', sppList);
        }

        document.getElementById('modalSuksesBody').innerHTML = `
            <i class="bi bi-check-circle fs-1 text-success"></i>
            <h5 class="mt-3">Pembayaran SPP Berhasil!</h5>
            <p class="text-muted">${cicilanDipilih.length} cicilan senilai ${formatRupiah(total)} telah dibayar.</p>
            <small class="text-muted">ID: ${transaksi.id}</small>`;
        document.getElementById('modalSuksesFooter').innerHTML = `
            <button class="btn btn-outline-primary btn-sm" onclick="cetakStrukSPP('${transaksi.id}')">
                <i class="bi bi-printer me-1"></i>Cetak Struk
            </button>
            <button class="btn btn-success btn-sm" data-bs-dismiss="modal" onclick="location.reload()">
                <i class="bi bi-check me-1"></i>Selesai
            </button>`;

        const modalSukses = new bootstrap.Modal(document.getElementById('modalSukses'));
        modalSukses.show();
    }, 2000);
}

function cetakStrukSPP(id) {
    const transaksi = Storage.get('riwayat', []).find(t => t.id === id);
    if (!transaksi) return;

    const win = window.open('', '_blank', 'width=400,height=500');
    win.document.write(`
        <html><head><title>Struk SPP - ${id}</title>
        <style>body{font-family:monospace;padding:20px;}h4{margin:0;}hr{border:1px dashed #ccc;}
        .text-right{text-align:right;}</style></head>
        <body>
            <h4>SeumpamaBayar</h4><p>Struk Pembayaran SPP</p><hr>
            <p>ID: ${transaksi.id}</p>
            <p>Tanggal: ${formatTanggal(transaksi.tanggal)} ${formatJam(transaksi.tanggal)}</p>
            <p>NIM: ${transaksi.detailSPP.nim}</p>
            <p>Jumlah Cicilan: ${transaksi.detailSPP.cicilan.length}</p>
            <p>Metode: ${transaksi.metode}</p><hr>
            <h4 class="text-right">Total: ${formatRupiah(transaksi.total)}</h4><hr>
            <p style="text-align:center;">Terima kasih</p>
        </body></html>
    `);
    win.document.close();
    win.print();
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