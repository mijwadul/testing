# Panduan Sistem Manajemen Equipment dengan Status Kepemilikan

## 📋 Overview

Sistem ini telah ditingkatkan dengan fitur manajemen status kepemilikan equipment yang memisahkan data operasional dan finansial sesuai dengan akses pengguna.

## 🏗️ Struktur Database

### Tabel Equipment (Updated)

```sql
CREATE TABLE equipment (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    location VARCHAR,
    status VARCHAR DEFAULT 'active',
    
    -- Kolom baru untuk kepemilikan dan finansial
    ownership_status VARCHAR DEFAULT 'internal',  -- 'internal' atau 'rental'
    rental_rate_per_hour DECIMAL(15,2) DEFAULT 0,
    deposit_amount DECIMAL(15,2) DEFAULT 0,
    vendor_id INTEGER NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🎯 Fitur Utama

### 1. Form Add/Edit Equipment dengan Conditional Rendering

- **Status Kepemilikan**: Dropdown "Milik Sendiri" atau "Sewa/Rental"
- **Logika Form**:
  - Jika "Milik Sendiri": Field finansial disembunyikan
  - Jika "Sewa/Rental": Field berikut muncul:
    - Tarif Rental (Per Jam)
    - Nilai Deposit
    - Vendor ID

### 2. Visualisasi Status di Tabel Utama

- **Badge Biru**: `[Milik]` untuk equipment internal
- **Badge Kuning**: `[Rental]` untuk equipment sewaan
- Informasi finansial tidak ditampilkan di tabel utama

### 3. Tabbed View Detail Equipment

Modal detail dengan 2 tab:

#### Tab Informasi Umum (Semua User)
- Nama, Tipe, Lokasi equipment
- Status operasional
- Status kepemilikan (badge)
- Tanggal pembuatan & update

#### Tab Informasi Finansial (Admin/Manager Only)
- Status kepemilikan detail
- Tarif rental per jam
- Nilai deposit
- Informasi vendor

## 🔐 Sistem Akses Berbasis Role

### Role Operator
- ✅ Lihat tabel equipment dengan badge status
- ✅ Input HM dan BBM
- ✅ Lihat detail tab "Informasi Umum"
- ❌ Tidak bisa lihat tab "Informasi Finansial"

### Role Admin/Manager
- ✅ Semua fitur operator
- ✅ Edit data equipment termasuk finansial
- ✅ Lihat detail tab "Informasi Finansial"
- ✅ Akses penuh ke data tarif dan deposit

## 🚀 Cara Penggunaan

### 1. Menambah Equipment Baru

1. Klik tombol "Add Equipment"
2. Isi data dasar (Nama, Tipe, Lokasi, Status)
3. Pilih Status Kepemilikan:
   - **Milik Sendiri**: Form tetap ringkas
   - **Sewa/Rental**: Form menampilkan field finansial
4. Klik "Add" untuk menyimpan

### 2. Melihat Detail Equipment

1. Klik ikon 👁️ (Eye) di baris equipment
2. Tab "Informasi Umum" terbuka otomatis
3. Jika role Admin, bisa klik tab "Informasi Finansial"

### 3. Simulasi Role (Untuk Testing)

- Di halaman Equipment Management, klik "Ganti Role"
- Role akan berubah antara "Admin" dan "Operator"
- Test akses tab finansial dengan role berbeda

## 📊 Integrasi dengan Fitur Lainnya

### Costing Proyek (Future)
Data tarif rental dapat digunakan untuk:
```
Biaya Rental = (HM Akhir - HM Awal) × Tarif Per Jam
```

### Manajemen Deposit (Future)
- Pantau sisa deposit di vendor
- Notifikasi deposit yang akan jatuh tempo
- Laporan finansial terintegrasi

## 🛠️ Technical Implementation

### Backend Changes
- **Model**: `equipment.py` - Added financial fields
- **Schema**: `equipment.py` - Updated validation
- **API**: Existing endpoints support new fields

### Frontend Changes
- **EquipmentPage.jsx**: Enhanced form with conditional rendering
- **EquipmentDetailModal.jsx**: New component for tabbed view
- **Role-based access**: Dynamic tab visibility

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop and mobile
- **Conditional Forms**: Smart form that adapts to ownership status
- **Visual Badges**: Quick status identification
- **Tabbed Interface**: Organized information display
- **Role Simulation**: Easy testing for different access levels

## 📝 Contoh Data

### Equipment Internal
```
Nama: Excavator 1
Tipe: Excavator
Kepemilikan: [Milik]
Tarif: - (Tidak applicable)
Deposit: - (Tidak applicable)
```

### Equipment Rental
```
Nama: Truck Rental A
Tipe: Truck
Kepemilikan: [Rental]
Tarif: Rp 500,000/jam
Deposit: Rp 50,000,000
Vendor: #123
```

## 🔍 Testing Checklist

- [ ] Form add equipment berfungsi dengan baik
- [ ] Conditional rendering sesuai status kepemilikan
- [ ] Badge status muncul di tabel
- [ ] Modal detail terbuka dengan benar
- [ ] Tab finansial hanya muncul untuk admin
- [ ] Role simulation berfungsi
- [ ] Data tersimpan di database dengan benar

## 🚨 Security Notes

- Data finansial hanya accessible untuk role admin/manager
- Tidak ada sensitive data yang tampil di tabel utama
- Form validation untuk input numerik (tarif & deposit)
- Role-based access control di frontend layer

---

*System ini dirancang untuk menjaga kerahasiaan data finansial sambil tetap memberikan akses operasional yang efisien untuk staff lapangan.*
