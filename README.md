# 🚢 PT. Kusuma Samudera Berkah - ERP System

**PT. Kusuma Samudera Berkah** adalah sistem manajemen sumber daya perusahaan terintegrasi yang dirancang khusus untuk operasional industri logistik dan pertambangan. Sistem ini berfokus pada sinkronisasi data antara performa SDM (Absensi & Payroll) dengan efisiensi operasional alat berat (BBM & Hour Meter).

---

## 🛠️ Fitur Utama (MVP Phase)

Sistem ini dirancang untuk menyelesaikan tantangan logistik di lapangan secara real-time:

* **Manajemen SDM & Absensi:** Pencatatan kehadiran karyawan berbasis lokasi (Geotagging) untuk memastikan validitas data lapangan.
* **Logistik Alat Berat:** Pemantauan konsumsi BBM per unit alat berat yang disinkronkan dengan *Hour Meter* (HM) untuk menghitung efisiensi bahan bakar.
* **Perhitungan Gaji (Payroll):** Automasi perhitungan gaji berdasarkan data kehadiran, tunjangan lapangan, dan lembur.
* **Monitoring Ongoing Project:** Pelacakan progres pekerjaan harian di berbagai lokasi proyek secara simultan.

---

## 💻 Tech Stack

Aplikasi ini menggunakan arsitektur modern yang skalabel:

* **Frontend:** [React.js](https://react.dev/) + [Vite](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/)
* **Backend:** [FastAPI (Python 3.13)](https://fastapi.tiangolo.com/)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Memulai (Getting Started)

### Prasyarat
Sebelum memulai, pastikan Anda telah menginstal:
* Python 3.13 atau versi terbaru.
* Node.js (LTS Version).
* PostgreSQL (Atau Docker untuk menjalankan database).

### 1. Setup Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Aktifkan venv
source venv/bin/activate  # Mac/Linux
.\venv\Scripts\activate   # Windows

pip install -r requirements.txt
uvicorn app.main:app --reload
```