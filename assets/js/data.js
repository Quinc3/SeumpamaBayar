// ==================== DATA DUMMY ====================

const plnData = [
    { id: "123456789012", nama: "Budi Santoso", alamat: "Jl. Merdeka No. 12, Jakarta Pusat", tarif: "R1/1300", daya: "1300 VA" },
    { id: "234567890123", nama: "Ani Wulandari", alamat: "Jl. Melati No. 5, Bandung", tarif: "R1/900", daya: "900 VA" },
    { id: "345678901234", nama: "Cahyo Nugroho", alamat: "Jl. Mawar No. 8, Surabaya", tarif: "R1/2200", daya: "2200 VA" },
    { id: "456789012345", nama: "Dewi Lestari", alamat: "Jl. Anggrek No. 3, Yogyakarta", tarif: "R1/1300", daya: "1300 VA" },
    { id: "567890123456", nama: "Eko Prasetyo", alamat: "Jl. Kenanga No. 15, Semarang", tarif: "R1/900", daya: "900 VA" }
];

const pdamData = [
    { id: "PDAM001", nama: "Fajar Hermawan", alamat: "Jl. Air Bersih No. 1, Jakarta Timur", golongan: "Rumah Tangga A" },
    { id: "PDAM002", nama: "Gita Rahayu", alamat: "Jl. Sumber Jaya No. 7, Bandung", golongan: "Rumah Tangga B" },
    { id: "PDAM003", nama: "Hadi Susilo", alamat: "Jl. Tirta Kencana No. 4, Surabaya", golongan: "Rumah Tangga A" }
];

const internetData = [
    { id: "INET001", nama: "Indra Kusuma", alamat: "Jl. Digital No. 10, Jakarta Selatan", provider: "IndiHome", paket: "100 Mbps" },
    { id: "INET002", nama: "Joko Widodo", alamat: "Jl. Online No. 20, Bandung", provider: "First Media", paket: "75 Mbps" },
    { id: "INET003", nama: "Kartika Sari", alamat: "Jl. Fiber No. 5, Surabaya", provider: "Biznet", paket: "150 Mbps" }
];

const sppData = [
    {
        nim: "2024001", nama: "Andi Pratama", jurusan: "Teknik Informatika", semester: 4,
        cicilan: [
            { id: "CIC-2401-01", deskripsi: "Cicilan 1 - Semester 4", jumlah: 2500000, status: "lunas", tglBayar: "2024-01-15" },
            { id: "CIC-2401-02", deskripsi: "Cicilan 2 - Semester 4", jumlah: 2500000, status: "lunas", tglBayar: "2024-02-15" },
            { id: "CIC-2401-03", deskripsi: "Cicilan 3 - Semester 4", jumlah: 2500000, status: "belum", tglBayar: null },
            { id: "CIC-2401-04", deskripsi: "Cicilan 4 - Semester 4", jumlah: 2500000, status: "belum", tglBayar: null },
            { id: "CIC-2401-05", deskripsi: "Cicilan 5 - Semester 4", jumlah: 2500000, status: "belum", tglBayar: null },
            { id: "CIC-2401-06", deskripsi: "Cicilan 6 - Semester 4", jumlah: 2500000, status: "belum", tglBayar: null }
        ]
    },
    {
        nim: "2024002", nama: "Bunga Citra", jurusan: "Sistem Informasi", semester: 2,
        cicilan: [
            { id: "CIC-2402-01", deskripsi: "Cicilan 1 - Semester 2", jumlah: 2000000, status: "lunas", tglBayar: "2024-01-10" },
            { id: "CIC-2402-02", deskripsi: "Cicilan 2 - Semester 2", jumlah: 2000000, status: "belum", tglBayar: null },
            { id: "CIC-2402-03", deskripsi: "Cicilan 3 - Semester 2", jumlah: 2000000, status: "belum", tglBayar: null },
            { id: "CIC-2402-04", deskripsi: "Cicilan 4 - Semester 2", jumlah: 2000000, status: "belum", tglBayar: null },
            { id: "CIC-2402-05", deskripsi: "Cicilan 5 - Semester 2", jumlah: 2000000, status: "belum", tglBayar: null },
            { id: "CIC-2402-06", deskripsi: "Cicilan 6 - Semester 2", jumlah: 2000000, status: "belum", tglBayar: null },
            { id: "CIC-2402-07", deskripsi: "Cicilan 7 - Semester 2", jumlah: 2000000, status: "belum", tglBayar: null },
            { id: "CIC-2402-08", deskripsi: "Cicilan 8 - Semester 2", jumlah: 2000000, status: "belum", tglBayar: null }
        ]
    },
    {
        nim: "2024003", nama: "Cindy Permata", jurusan: "Manajemen", semester: 6,
        cicilan: [
            { id: "CIC-2403-01", deskripsi: "Cicilan 1 - Semester 6", jumlah: 3000000, status: "lunas", tglBayar: "2024-01-05" },
            { id: "CIC-2403-02", deskripsi: "Cicilan 2 - Semester 6", jumlah: 3000000, status: "lunas", tglBayar: "2024-02-05" },
            { id: "CIC-2403-03", deskripsi: "Cicilan 3 - Semester 6", jumlah: 3000000, status: "lunas", tglBayar: "2024-03-05" },
            { id: "CIC-2403-04", deskripsi: "Cicilan 4 - Semester 6", jumlah: 3000000, status: "belum", tglBayar: null },
            { id: "CIC-2403-05", deskripsi: "Cicilan 5 - Semester 6", jumlah: 3000000, status: "belum", tglBayar: null },
            { id: "CIC-2403-06", deskripsi: "Cicilan 6 - Semester 6", jumlah: 3000000, status: "belum", tglBayar: null }
        ]
    }
];

const paketData = {
    'Telkomsel': [
        { nama: '3 GB / 7 Hari', harga: 15000 },
        { nama: '10 GB / 30 Hari', harga: 50000 },
        { nama: '25 GB / 30 Hari', harga: 90000 },
        { nama: '50 GB / 30 Hari', harga: 140000 }
    ],
    'XL': [
        { nama: '3 GB / 7 Hari', harga: 12000 },
        { nama: '10 GB / 30 Hari', harga: 45000 },
        { nama: '25 GB / 30 Hari', harga: 85000 }
    ],
    'Indosat': [
        { nama: '3 GB / 7 Hari', harga: 13000 },
        { nama: '10 GB / 30 Hari', harga: 48000 },
        { nama: '25 GB / 30 Hari', harga: 88000 }
    ],
    'Tri': [
        { nama: '3 GB / 7 Hari', harga: 10000 },
        { nama: '10 GB / 30 Hari', harga: 40000 },
        { nama: 'AlwaysOn 25 GB', harga: 80000 }
    ],
    'Smartfren': [
        { nama: '3 GB / 7 Hari', harga: 10000 },
        { nama: '10 GB / 30 Hari', harga: 42000 }
    ],
    'Axis': [
        { nama: '3 GB / 7 Hari', harga: 11000 },
        { nama: '10 GB / 30 Hari', harga: 43000 }
    ]
};

const nominalPulsa = [5000, 10000, 20000, 25000, 50000, 100000, 200000];
