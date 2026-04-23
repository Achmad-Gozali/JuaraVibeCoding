export const MAX_EVIDENCE_FILES = 10;
export const MAX_TARGET_NUMBERS = 5;

export const STEPS = [
  { number: 1, label: 'Data Penipu' },
  { number: 2, label: 'Kronologi' },
  { number: 3, label: 'Bukti & Kirim' },
];

export const bankList = [
  { value: 'BCA', label: 'BCA (Bank Central Asia)' },
  { value: 'BRI', label: 'BRI (Bank Rakyat Indonesia)' },
  { value: 'BNI', label: 'BNI (Bank Negara Indonesia)' },
  { value: 'Mandiri', label: 'Bank Mandiri' },
  { value: 'BTN', label: 'BTN (Bank Tabungan Negara)' },
  { value: 'BSI', label: 'BSI (Bank Syariah Indonesia)' },
  { value: 'CIMB Niaga', label: 'CIMB Niaga' },
  { value: 'Danamon', label: 'Bank Danamon' },
  { value: 'Permata', label: 'Bank Permata' },
  { value: 'OCBC NISP', label: 'OCBC NISP' },
  { value: 'Panin', label: 'Bank Panin' },
  { value: 'Mega', label: 'Bank Mega' },
  { value: 'Maybank', label: 'Maybank Indonesia' },
  { value: 'Sinarmas', label: 'Bank Sinarmas' },
  { value: 'BTPN', label: 'BTPN (Jenius)' },
  { value: 'Bukopin', label: 'Bank Bukopin' },
  { value: 'Commonwealth', label: 'Commonwealth Bank' },
  { value: 'UOB', label: 'UOB Indonesia' },
  { value: 'HSBC', label: 'HSBC Indonesia' },
  { value: 'Jago', label: 'Bank Jago' },
  { value: 'SeaBank', label: 'SeaBank' },
  { value: 'Blu BCA', label: 'Blu by BCA Digital' },
  { value: 'Motion Banking', label: 'Motion Banking (MNC Bank)' },
  { value: 'Neo Commerce', label: 'Bank Neo Commerce' },
  { value: 'Allo Bank', label: 'Allo Bank' },
  { value: 'Superbank', label: 'Superbank' },
  { value: 'BJB', label: 'BJB (Bank Jabar Banten)' },
  { value: 'Bank DKI', label: 'Bank DKI' },
  { value: 'BPD Jateng', label: 'BPD Jawa Tengah' },
  { value: 'BPD Jatim', label: 'BPD Jawa Timur' },
  { value: 'BPD Bali', label: 'BPD Bali' },
  { value: 'Lainnya', label: 'Bank Lainnya' },
];

export const ewalletList = [
  { value: 'GoPay', label: 'GoPay' },
  { value: 'Dana', label: 'DANA' },
  { value: 'OVO', label: 'OVO' },
  { value: 'ShopeePay', label: 'ShopeePay' },
  { value: 'LinkAja', label: 'LinkAja' },
  { value: 'iSaku', label: 'iSaku' },
  { value: 'DOKU', label: 'DOKU Wallet' },
  { value: 'Sakuku', label: 'Sakuku (BCA)' },
  { value: 'TrueMoney', label: 'TrueMoney' },
  { value: 'Flip', label: 'Flip' },
  { value: 'PayLater Shopee', label: 'PayLater Shopee' },
  { value: 'PayLater Tokopedia', label: 'PayLater Tokopedia' },
  { value: 'Akulaku', label: 'Akulaku' },
  { value: 'Kredivo', label: 'Kredivo' },
  { value: 'Lainnya', label: 'E-Wallet Lainnya' },
];

export const platformList = [
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Telegram', label: 'Telegram' },
  { value: 'SMS', label: 'SMS' },
  { value: 'Telepon', label: 'Telepon langsung' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Facebook', label: 'Facebook / Marketplace' },
  { value: 'TikTok', label: 'TikTok / TikTok Shop' },
  { value: 'Twitter/X', label: 'Twitter / X' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Tokopedia', label: 'Tokopedia' },
  { value: 'Shopee', label: 'Shopee' },
  { value: 'Lazada', label: 'Lazada' },
  { value: 'Bukalapak', label: 'Bukalapak' },
  { value: 'OLX', label: 'OLX / Jual Beli Online' },
  { value: 'Email', label: 'Email' },
  { value: 'Website', label: 'Website / Toko Online' },
  { value: 'Lainnya', label: 'Platform Lainnya' },
];

export const categoryList = [
  { value: 'Jual Beli Online', label: 'Jual Beli Online — barang tidak dikirim / tidak sesuai' },
  { value: 'Investasi Bodong', label: 'Investasi Bodong — janji untung besar tapi uang raib' },
  { value: 'Pinjaman Online', label: 'Pinjaman Online Ilegal — bunga mencekik / penagihan kasar' },
  { value: 'Phishing / Soceng', label: 'Phishing / Soceng — minta OTP, PIN, atau data pribadi' },
  { value: 'Modus Kurir/APK', label: 'Modus Kurir / File APK — disuruh install aplikasi mencurigakan' },
  { value: 'Arisan Online', label: 'Arisan Online Fiktif — uang arisan tidak dibayar' },
  { value: 'Rental / Sewa Fiktif', label: 'Rental / Sewa Fiktif — kendaraan atau properti tidak ada' },
  { value: 'Lowongan Kerja Palsu', label: 'Lowongan Kerja Palsu — minta uang pelatihan / seragam' },
  { value: 'Pinjam Uang Tidak Bayar', label: 'Pinjam Uang Tidak Bayar — kenalan / teman online kabur' },
  { value: 'Hadiah / Undian Palsu', label: 'Hadiah / Undian Palsu — minta bayar pajak hadiah duluan' },
  { value: 'Jasa Tidak Dikerjakan', label: 'Jasa Tidak Dikerjakan — sudah bayar tapi tidak ada hasilnya' },
  { value: 'Penipuan Percintaan', label: 'Penipuan Percintaan — kenalan online lalu minta uang' },
  { value: 'Lainnya', label: 'Lainnya' },
];

export const reportedToOptions = [
  { value: 'polisi', label: 'Polisi' },
  { value: 'ojk', label: 'OJK' },
  { value: 'platform', label: 'Platform terkait' },
  { value: 'belum', label: 'Belum lapor' },
];

export const provinsiList = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau',
  'Jambi', 'Bengkulu', 'Sumatera Selatan', 'Kepulauan Bangka Belitung',
  'Lampung', 'Banten', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah',
  'DI Yogyakarta', 'Jawa Timur', 'Bali', 'Nusa Tenggara Barat',
  'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah',
  'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat',
  'Sulawesi Selatan', 'Sulawesi Tenggara', 'Maluku', 'Maluku Utara',
  'Papua Barat', 'Papua Barat Daya', 'Papua', 'Papua Pegunungan',
  'Papua Selatan', 'Papua Tengah',
];