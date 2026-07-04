// ==================== UTILITY FUNCTIONS ====================

function formatRupiah(angka) {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(angka);
}

function formatTanggal(tanggal, full = true) {
    if (!tanggal) return '-';
    const options = full
        ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        : { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(tanggal).toLocaleDateString('id-ID', options);
}

function formatJam(date) {
    return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function generateId(prefix = 'TRX') {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function generateVA(bank = 'random') {
    const banks = {
        'BNI': { code: '009', name: 'Bank BNI' },
        'BCA': { code: '014', name: 'Bank BCA' },
        'Mandiri': { code: '008', name: 'Bank Mandiri' }
    };

    let selectedBank;
    if (bank === 'random') {
        const keys = Object.keys(banks);
        selectedBank = banks[keys[Math.floor(Math.random() * keys.length)]];
    } else {
        selectedBank = banks[bank] || banks['BNI'];
    }

    const va = selectedBank.code + '77' + Math.floor(Math.random() * 10000000000);
    return { number: va, bank: selectedBank.name, code: selectedBank.code };
}

function validasiIdPelanggan(id, kategori) {
    if (kategori === 'seminar') return /^[a-zA-Z0-9]{4,20}$/.test(id);
    return /^\d{8,12}$/.test(id);
}

function validasiNIM(nim) {
    return /^\d{6,10}$/.test(nim);
}

function validasiNomorHP(nomor) {
    const cleaned = nomor.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 13 && cleaned.startsWith('08');
}

function deteksiProvider(nomor) {
    const prefix = nomor.substring(0, 4);
    const mapping = {
        '0811': 'Telkomsel', '0812': 'Telkomsel', '0813': 'Telkomsel', '0821': 'Telkomsel', '0822': 'Telkomsel', '0823': 'Telkomsel', '0852': 'Telkomsel', '0853': 'Telkomsel',
        '0814': 'Indosat', '0815': 'Indosat', '0816': 'Indosat', '0855': 'Indosat', '0856': 'Indosat', '0857': 'Indosat', '0858': 'Indosat',
        '0817': 'XL', '0818': 'XL', '0819': 'XL', '0859': 'XL', '0877': 'XL', '0878': 'XL',
        '0895': 'Tri', '0896': 'Tri', '0897': 'Tri', '0898': 'Tri', '0899': 'Tri',
        '0881': 'Smartfren', '0882': 'Smartfren', '0883': 'Smartfren', '0884': 'Smartfren', '0885': 'Smartfren', '0886': 'Smartfren', '0887': 'Smartfren', '0888': 'Smartfren',
        '0831': 'Axis', '0832': 'Axis', '0833': 'Axis', '0838': 'Axis'
    };
    return mapping[prefix] || null;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-warning';
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';

    const toastHTML = `
        <div class="toast align-items-center text-white ${bgClass} border-0" 
             role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body"><i class="bi bi-${icon} me-2" aria-hidden="true"></i>${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Tutup notifikasi"></button>
            </div>
        </div>`;
    container.innerHTML += toastHTML;
    const toastEl = container.querySelector('.toast:last-child');
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

function showLoading() {
    const el = document.getElementById('loadingOverlay');
    if (el) el.classList.add('show');
}

function hideLoading() {
    const el = document.getElementById('loadingOverlay');
    if (el) el.classList.remove('show');
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Berhasil disalin!', 'success');
    }).catch(() => {
        showToast('Gagal menyalin', 'error');
    });
}

function startCountdown(seconds, elementId = 'countdown') {
    const display = document.getElementById(elementId);
    if (!display) return;

    // Clear existing interval if any
    if (display._interval) clearInterval(display._interval);

    let remaining = seconds;
    display.textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;

    display._interval = setInterval(() => {
        remaining--;
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        display.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

        if (remaining <= 0) {
            clearInterval(display._interval);
            display.textContent = 'EXPIRED';
            display.classList.add('text-danger');
        }
    }, 1000);
}

// ==================== QR CODE ====================
function generateQRCode(containerId, text) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear previous QR
    container.innerHTML = '';

    new QRCode(container, {
        text: text,
        width: 150,
        height: 150,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    });
}

// ==================== EXPORT PDF (jsPDF) ====================
function exportPDF(transaksi) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 160] // Ukuran struk kecil
    });

    // Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SeumpamaBayar', 40, 10, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Struk Pembayaran Digital', 40, 16, { align: 'center' });

    // Garis
    doc.setDrawColor(200, 200, 200);
    doc.line(5, 20, 75, 20);

    // Info Transaksi
    doc.setFontSize(8);
    let y = 26;
    const lineHeight = 5;

    const info = [
        ['ID Transaksi', transaksi.id],
        ['Tanggal', formatTanggal(transaksi.tanggal)],
        ['Jam', formatJam(transaksi.tanggal)],
        ['Jenis', transaksi.jenis],
        ['Deskripsi', transaksi.deskripsi],
        ['Metode', transaksi.metode],
    ];

    info.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(label, 5, y);
        doc.setTextColor(0, 0, 0);
        doc.text(': ' + (value || '-'), 35, y);
        y += lineHeight;
    });

    // Garis
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(5, y, 75, y);
    y += 6;

    // Total
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 107, 44);
    doc.text('TOTAL', 5, y);
    doc.text(formatRupiah(transaksi.total), 75, y, { align: 'right' });

    // Garis
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(5, y, 75, y);
    y += 8;

    // Footer
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Terima kasih telah menggunakan', 40, y, { align: 'center' });
    y += 4;
    doc.text('SeumpamaBayar', 40, y, { align: 'center' });
    y += 4;
    doc.text('Simpel, Cepat, Aman.', 40, y, { align: 'center' });

    // Simpan
    doc.save(`Struk-${transaksi.id}.pdf`);
}

// ==================== DARK MODE TOGGLE ====================
function initTheme() {
    const theme = Storage.get('theme', 'light');
    applyTheme(theme);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    Storage.set('theme', newTheme);
    return newTheme;
}