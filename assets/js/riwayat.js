// ==================== LOGIC HALAMAN RIWAYAT ====================

let currentDetailId = null;

document.addEventListener('DOMContentLoaded', function () {
    renderRiwayat();
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

function getRiwayatFiltered() {
    let riwayat = Storage.get('riwayat', []);

    const filterJenis = document.getElementById('filterJenis')?.value || '';
    const filterStatus = document.getElementById('filterStatus')?.value || '';
    const filterDari = document.getElementById('filterDari')?.value || '';
    const filterSampai = document.getElementById('filterSampai')?.value || '';
    const searchText = document.getElementById('searchTransaksi')?.value.toLowerCase() || '';
    const sortOrder = document.getElementById('sortOrder')?.value || 'terbaru';

    if (filterJenis) {
        riwayat = riwayat.filter(t => t.jenis === filterJenis);
    }

    if (filterStatus) {
        riwayat = riwayat.filter(t => t.status === filterStatus);
    }

    if (filterDari) {
        riwayat = riwayat.filter(t => new Date(t.tanggal) >= new Date(filterDari));
    }
    if (filterSampai) {
        const sampai = new Date(filterSampai);
        sampai.setHours(23, 59, 59);
        riwayat = riwayat.filter(t => new Date(t.tanggal) <= sampai);
    }

    if (searchText) {
        riwayat = riwayat.filter(t =>
            t.id.toLowerCase().includes(searchText) ||
            t.jenis.toLowerCase().includes(searchText) ||
            t.deskripsi.toLowerCase().includes(searchText) ||
            t.metode.toLowerCase().includes(searchText)
        );
    }

    switch (sortOrder) {
        case 'terlama':
            riwayat.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
            break;
        case 'termahal':
            riwayat.sort((a, b) => b.total - a.total);
            break;
        case 'termurah':
            riwayat.sort((a, b) => a.total - b.total);
            break;
        default:
            riwayat.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    }

    return riwayat;
}

// ✅ Hanya SATU fungsi resetFilter (hapus duplikat)
function resetFilter() {
    document.getElementById('filterJenis').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterDari').value = '';
    document.getElementById('filterSampai').value = '';
    document.getElementById('sortOrder').value = 'terbaru';
    document.getElementById('searchTransaksi').value = '';
    renderRiwayat();
    showToast('Filter direset', 'info');
}

function renderRiwayat() {
    const riwayat = getRiwayatFiltered();
    const listEl = document.getElementById('riwayatList');
    const emptyEl = document.getElementById('emptyState');
    const totalEl = document.getElementById('totalTransaksi');

    if (totalEl) totalEl.textContent = `${riwayat.length} transaksi tercatat`;

    if (riwayat.length === 0) {
        if (listEl) listEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    const grouped = {};
    riwayat.forEach(t => {
        const dateKey = formatTanggal(t.tanggal, false);
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(t);
    });

    let html = '';
    const iconMap = {
        'PLN': 'bi-lightning-charge text-warning',
        'PDAM': 'bi-droplet text-primary',
        'Internet': 'bi-wifi text-info',
        'Seminar': 'bi-megaphone text-danger',
        'SPP': 'bi-mortarboard text-success',
        'Pulsa': 'bi-phone text-secondary',
        'Paket Data': 'bi-wifi text-info'
    };

    for (const [date, items] of Object.entries(grouped)) {
        html += `
        <div class="mb-3">
            <small class="text-muted fw-semibold d-block mb-2">📅 ${date}</small>
            ${items.map(t => `
            <div class="list-group-item d-flex justify-content-between align-items-center mb-1" 
                 onclick="showDetail('${t.id}')" style="cursor:pointer;" role="button" tabindex="0"
                 aria-label="Lihat detail transaksi ${t.id}">
                <div class="d-flex align-items-center gap-3">
                    <div class="fs-5 ${iconMap[t.jenis] || 'bi-receipt text-muted'}">
                        <i class="bi ${(iconMap[t.jenis] || 'bi-receipt').split(' ')[0]}"></i>
                    </div>
                    <div>
                        <div class="fw-medium small">${t.deskripsi}</div>
                        <small class="text-muted">
                            ${t.jenis} · ${t.metode} · ${formatJam(t.tanggal)}
                        </small>
                    </div>
                </div>
                <div class="text-end">
                    <span class="fw-bold small ${t.status === 'sukses' ? 'text-danger' : 'text-muted'}">
                        -${formatRupiah(t.total)}
                    </span>
                    <br>
                    <span class="${t.status === 'sukses' ? 'badge-sukses' : 'badge-proses'}">
                        ${t.status === 'sukses' ? 'Sukses' : 'Gagal'}
                    </span>
                </div>
            </div>
            `).join('')}
        </div>`;
    }

    if (listEl) listEl.innerHTML = html;
}

function filterRiwayat() {
    renderRiwayat();
}

function showDetail(id) {
    const riwayat = Storage.get('riwayat', []);
    const t = riwayat.find(r => r.id === id);
    if (!t) return;

    currentDetailId = id;

    document.getElementById('modalDetailBody').innerHTML = `
        <div class="text-center mb-3">
            <span class="${t.status === 'sukses' ? 'badge-sukses' : 'badge-proses'} fs-6">
                ${t.status === 'sukses' ? 'Transaksi Sukses' : 'Transaksi Gagal'}
            </span>
        </div>
        <div class="detail-row"><span class="label">ID Transaksi</span><span class="value small">${t.id}</span></div>
        <div class="detail-row"><span class="label">Tanggal</span><span class="value">${formatTanggal(t.tanggal)}</span></div>
        <div class="detail-row"><span class="label">Jam</span><span class="value">${formatJam(t.tanggal)}</span></div>
        <div class="detail-row"><span class="label">Jenis</span><span class="value"><span class="badge bg-primary">${t.jenis}</span></span></div>
        <div class="detail-row"><span class="label">Deskripsi</span><span class="value">${t.deskripsi}</span></div>
        <div class="detail-row"><span class="label">Metode</span><span class="value">${t.metode}</span></div>
        <div class="detail-row"><span class="label">Total</span><span class="value fs-5 text-primary fw-bold">${formatRupiah(t.total)}</span></div>
        ${t.detailSPP ? `
        <div class="detail-row"><span class="label">NIM</span><span class="value">${t.detailSPP.nim}</span></div>
        <div class="detail-row"><span class="label">Jml Cicilan</span><span class="value">${t.detailSPP.cicilan.length} cicilan</span></div>
        ` : ''}
        ${t.detailPulsa ? `
        <div class="detail-row"><span class="label">Provider</span><span class="value">${t.detailPulsa.provider}</span></div>
        <div class="detail-row"><span class="label">Nomor</span><span class="value">${maskNomor(t.detailPulsa.nomor)}</span></div>
        ` : ''}
    `;

    document.getElementById('btnCetakDetail').onclick = function () {
        cetakStruk(t);
    };

    document.getElementById('btnHapusSatu').onclick = function () {
        hapusSatu(id);
    };

    const modal = new bootstrap.Modal(document.getElementById('modalDetail'));
    modal.show();
}

function hapusSatu(id) {
    const riwayat = Storage.get('riwayat', []);
    const updated = riwayat.filter(t => t.id !== id);
    Storage.set('riwayat', updated);

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalDetail'));
    modal.hide();

    showToast('Transaksi dihapus', 'success');
    renderRiwayat();
}

function konfirmasiHapusSemua() {
    const modal = new bootstrap.Modal(document.getElementById('modalHapus'));
    modal.show();

    document.getElementById('btnHapusSemua').onclick = function () {
        Storage.set('riwayat', []);
        modal.hide();
        showToast('Semua riwayat dihapus', 'success');
        renderRiwayat();
    };
}

function exportRiwayat() {
    const riwayat = Storage.get('riwayat', []);
    if (riwayat.length === 0) {
        showToast('Tidak ada data untuk diexport', 'warning');
        return;
    }

    let csv = 'ID,Tanggal,Jenis,Deskripsi,Total,Metode,Status\n';
    riwayat.forEach(t => {
        csv += `"${t.id}","${formatTanggal(t.tanggal, false)}","${t.jenis}","${t.deskripsi}","${t.total}","${t.metode}","${t.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riwayat-seumpamabayar-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Riwayat berhasil diexport', 'success');
}

function cetakStruk(transaksi) {
    const modalPilihan = document.createElement('div');
    modalPilihan.innerHTML = `
        <div class="modal fade" id="modalPilihanCetakRiwayat" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">Cetak Struk</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <p class="small text-muted mb-3">Pilih metode cetak struk</p>
                        <button class="btn btn-outline-primary w-100 mb-2" id="btnPrintStrukRiwayat">
                            <i class="bi bi-printer me-2"></i>Print Struk
                        </button>
                        <button class="btn btn-outline-success w-100" id="btnPDFStrukRiwayat">
                            <i class="bi bi-file-pdf me-2"></i>Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

    document.body.appendChild(modalPilihan);
    const modal = new bootstrap.Modal(document.getElementById('modalPilihanCetakRiwayat'));
    modal.show();

    document.getElementById('btnPrintStrukRiwayat').onclick = function () {
        modal.hide();
        const win = window.open('', '_blank', 'width=400,height=500');
        win.document.write(`
            <!DOCTYPE html>
            <html><head><title>Struk - ${transaksi.id}</title>
            <style>body{font-family:monospace;padding:20px;}h4{margin:0;}hr{border:1px dashed #ccc;}.text-right{text-align:right;}.text-center{text-align:center;}</style></head>
            <body>
                <h4 class="text-center">🌱 SeumpamaBayar</h4><p class="text-center">Struk Transaksi</p><hr>
                <p>ID: ${transaksi.id}</p>
                <p>Tanggal: ${formatTanggal(transaksi.tanggal)} ${formatJam(transaksi.tanggal)}</p>
                <p>Jenis: ${transaksi.jenis}</p>
                <p>Deskripsi: ${transaksi.deskripsi}</p>
                <p>Metode: ${transaksi.metode}</p><hr>
                <h4 class="text-right">Total: ${formatRupiah(transaksi.total)}</h4><hr>
                <p class="text-center">Terima kasih</p>
            </body></html>
        `);
        win.document.close();
        win.print();
        cleanup();
    };

    document.getElementById('btnPDFStrukRiwayat').onclick = function () {
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

    document.getElementById('modalPilihanCetakRiwayat').addEventListener('hidden.bs.modal', cleanup);
}

function maskNomor(nomor) {
    if (!nomor || nomor.length <= 4) return nomor || '-';
    return nomor.substring(0, 4) + '-****-' + nomor.substring(nomor.length - 4);
}