// ==================== LOGIC DASHBOARD ====================

document.addEventListener('DOMContentLoaded', function () {

    const user = JSON.parse(localStorage.getItem('user') || '{"nama":"Budi Darmawan","nim":"221011450661"}');

    const topbarName = document.getElementById('topbarName');
    if (topbarName) topbarName.textContent = user.nama;

    const avatar = document.getElementById('topbarAvatar');
    if (avatar) avatar.textContent = user.nama.charAt(0).toUpperCase();

    updateTanggal();
    updateSaldo();
    renderStatCards();
    renderRiwayatTerakhir();
    initChart();

    initTheme();
    updateThemeIcon();
});

function updateTanggal() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('id-ID', options);
}

function updateSaldo() {
    const saldo = Storage.get('saldo', 1250000);
    document.getElementById('saldoDisplay').textContent = formatRupiah(saldo);
}

function renderStatCards() {
    const riwayat = Storage.get('riwayat', []);
    const now = new Date();
    const bulanIni = riwayat.filter(t => {
        const tgl = new Date(t.tanggal);
        return tgl.getMonth() === now.getMonth() && tgl.getFullYear() === now.getFullYear();
    });

    const totalBulanIni = bulanIni.reduce((sum, t) => sum + t.total, 0);
    const tagihanAktif = Storage.get('tagihanAktif', []);
    const belumBayar = tagihanAktif.filter(t => t.status === 'belum').length;

    document.getElementById('statCards').innerHTML = `
        <div class="col-6 col-md-3">
            <div class="card card-stat p-3">
                <div class="d-flex align-items-center gap-3">
                    <div class="stat-icon bg-primary bg-opacity-10 text-primary">
                        <i class="bi bi-arrow-left-right"></i>
                    </div>
                    <div>
                        <small class="text-muted">Total Transaksi</small>
                        <h5 class="fw-bold mb-0">${riwayat.length}</h5>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="card card-stat p-3">
                <div class="d-flex align-items-center gap-3">
                    <div class="stat-icon bg-warning bg-opacity-10 text-warning">
                        <i class="bi bi-exclamation-circle"></i>
                    </div>
                    <div>
                        <small class="text-muted">Tagihan Aktif</small>
                        <h5 class="fw-bold mb-0">${belumBayar}</h5>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="card card-stat p-3">
                <div class="d-flex align-items-center gap-3">
                    <div class="stat-icon bg-info bg-opacity-10 text-info">
                        <i class="bi bi-cash-stack"></i>
                    </div>
                    <div>
                        <small class="text-muted">Bulan Ini</small>
                        <h5 class="fw-bold mb-0">${formatRupiah(totalBulanIni)}</h5>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="card card-stat p-3">
                <div class="d-flex align-items-center gap-3">
                    <div class="stat-icon bg-success bg-opacity-10 text-success">
                        <i class="bi bi-check-circle"></i>
                    </div>
                    <div>
                        <small class="text-muted">Sukses</small>
                        <h5 class="fw-bold mb-0">${riwayat.filter(t => t.status === 'sukses').length}</h5>
                    </div>
                </div>
            </div>
        </div>`;
}

function renderRiwayatTerakhir() {
    const riwayat = Storage.get('riwayat', []);
    const container = document.getElementById('riwayatTerakhir');

    if (riwayat.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                <small>Belum ada transaksi</small>
            </div>`;
        return;
    }

    const iconMap = {
        'PLN': 'bi-lightning-charge text-warning',
        'PDAM': 'bi-droplet text-primary',
        'Internet': 'bi-wifi text-info',
        'Seminar': 'bi-megaphone text-danger',
        'SPP': 'bi-mortarboard text-success',
        'Pulsa': 'bi-phone text-secondary',
        'Paket Data': 'bi-wifi text-info'
    };

    container.innerHTML = riwayat.slice(0, 5).map(t => `
        <div class="list-group-item d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-3">
                <div class="fs-5 ${iconMap[t.jenis] || 'bi-receipt text-muted'}">
                    <i class="bi ${iconMap[t.jenis]?.split(' ')[0] || 'bi-receipt'}"></i>
                </div>
                <div>
                    <div class="fw-medium small">${t.deskripsi}</div>
                    <small class="text-muted">${formatTanggal(t.tanggal, false)} · ${t.metode}</small>
                </div>
            </div>
            <div class="text-end">
                <span class="fw-bold small text-danger">-${formatRupiah(t.total)}</span>
                <br><span class="badge-sukses">${t.status === 'sukses' ? 'Sukses' : 'Gagal'}</span>
            </div>
        </div>
    `).join('');
}

function initChart() {
    const ctx = document.getElementById('chartPengeluaran');
    if (!ctx) return;

    const riwayat = Storage.get('riwayat', []);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const labels = [];
    const data = [];

    for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(months[month.getMonth()]);
        const total = riwayat
            .filter(t => {
                const tgl = new Date(t.tanggal);
                return tgl.getMonth() === month.getMonth() && tgl.getFullYear() === month.getFullYear();
            })
            .reduce((sum, t) => sum + t.total, 0);
        data.push(total);
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pengeluaran',
                data: data,
                backgroundColor: '#006b2c',
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => 'Rp ' + (value / 1000000).toFixed(1) + 'jt'
                    }
                }
            }
        }
    });
}

function setKategori(kategori) {
    sessionStorage.setItem('selectedKategori', kategori);
}

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

// ✅ Fungsi Isi Saldo (Modal)
function isiSaldo() {
    document.getElementById('customNominalIsi').value = '';
    const modal = new bootstrap.Modal(document.getElementById('modalIsiSaldo'));
    modal.show();
}

function pilihNominalIsi(nominal) {
    document.getElementById('customNominalIsi').value = nominal;
}

function konfirmasiIsiSaldo() {
    const nominal = parseInt(document.getElementById('customNominalIsi').value);

    if (!nominal || nominal < 50000) {
        showToast('Minimal Rp 50.000', 'error');
        return;
    }

    const saldo = Storage.get('saldo', 0);
    Storage.set('saldo', saldo + nominal);
    updateSaldo();

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalIsiSaldo'));
    modal.hide();

    showToast(`Saldo berhasil ditambah ${formatRupiah(nominal)} 🎉`, 'success');
}

// ✅ Fungsi Transfer
function transferSaldo() {
    showToast('Fitur transfer sedang dalam pengembangan', 'info');
}