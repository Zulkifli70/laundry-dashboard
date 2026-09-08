# Architecture — Dashboard Laundry Multi-Outlet

## 1. Overview

Dashboard web untuk mengelola operasional bisnis laundry dengan 2-3 outlet/cabang. Sistem mencakup pencatatan transaksi, manajemen keuangan (pengeluaran), manajemen stok manual, dan role-based access untuk Admin (Owner+Superadmin) dan Karyawan.

## 2. Tech Stack

| Layer    | Teknologi                                                                            |
| -------- | ------------------------------------------------------------------------------------ |
| Frontend | React                                                                                |
| Backend  | Node.js + Express                                                                    |
| Database | PostgreSQL / MySQL (relational, karena data sangat terstruktur dengan banyak relasi) |
| Auth     | JWT (JSON Web Token)                                                                 |
| Export   | Library `exceljs` atau `csv-writer` (Node.js)                                        |

## 3. Daftar Fitur

### MVP (Fase 1)

- Autentikasi & otorisasi berbasis role (Admin, Karyawan)
- Pencatatan transaksi (per kg & per item), multi-outlet
- List transaksi + filter (tanggal, status, outlet)
- Export transaksi ke CSV/Excel
- Pencatatan pengeluaran per outlet
- Pencatatan stok manual per outlet + histori perubahan (audit log)
- Notifikasi pelanggan via WhatsApp (`wa.me` link, manual klik)

### Fase 2 (setelah MVP jalan)

- Dashboard analytics/grafik omzet per outlet
- Manajemen member/pelanggan tetap + sistem poin

### Dihold (belum dibutuhkan)

- Perencanaan stok pembelian otomatis (forecasting) — belanja sudah rutin terjadwal, cek stok manual masih cukup

## 4. Role & Permission Matrix

| Fitur                    | Admin (Owner+Superadmin) | Karyawan               |
| ------------------------ | ------------------------ | ---------------------- |
| Input transaksi          | ✅                       | ✅                     |
| Lihat & filter transaksi | ✅ semua outlet          | ✅ outlet sendiri saja |
| Export CSV/Excel         | ✅                       | ❌                     |
| Catat pengeluaran        | ✅                       | ❌                     |
| Lihat stok               | ✅                       | ✅ (read-only)         |
| Update stok              | ✅                       | ❌ (cegah fraud)       |
| Kelola user & outlet     | ✅                       | ❌                     |
| Kirim notifikasi WA      | ✅                       | ✅                     |

Catatan: Admin memiliki `outlet_id = NULL` di database, yang berarti akses ke semua outlet. Karyawan selalu terikat ke satu `outlet_id` tertentu.

## 5. Skema Database (ERD)

```
OUTLET ||--o{ USER : mempekerjakan
OUTLET ||--o{ TRANSAKSI : memiliki
OUTLET ||--o{ PENGELUARAN : memiliki
OUTLET ||--o{ STOK_ITEM : memiliki
USER ||--o{ TRANSAKSI : mencatat
USER ||--o{ PENGELUARAN : mencatat
USER ||--o{ STOK_LOG : mengubah
LAYANAN ||--o{ TRANSAKSI : dipakai_di
STOK_ITEM ||--o{ STOK_LOG : dicatat_di
```

### OUTLET

| Field      | Tipe     | Keterangan |
| ---------- | -------- | ---------- |
| id         | int (PK) |            |
| nama       | string   |            |
| alamat     | string   |            |
| no_telepon | string   |            |

### USER

| Field         | Tipe               | Keterangan                        |
| ------------- | ------------------ | --------------------------------- |
| id            | int (PK)           |                                   |
| outlet_id     | int (FK, nullable) | NULL = akses semua outlet (Admin) |
| nama          | string             |                                   |
| email         | string             | unique, dipakai untuk login       |
| password_hash | string             | jangan simpan password plain text |
| role          | string             | `admin` atau `karyawan`           |

### LAYANAN

| Field       | Tipe     | Keterangan                           |
| ----------- | -------- | ------------------------------------ |
| id          | int (PK) |                                      |
| nama        | string   | misal "Cuci Reguler", "Cuci+Setrika" |
| tipe_satuan | string   | `kg` atau `item`                     |
| harga       | decimal  | harga per satuan                     |

### TRANSAKSI

| Field           | Tipe     | Keterangan                                      |
| --------------- | -------- | ----------------------------------------------- |
| id              | int (PK) |                                                 |
| outlet_id       | int (FK) |                                                 |
| user_id         | int (FK) | karyawan/admin yang input                       |
| layanan_id      | int (FK) |                                                 |
| nama_pelanggan  | string   |                                                 |
| no_hp_pelanggan | string   | untuk notifikasi WA                             |
| jumlah_qty      | decimal  | berat (kg) atau jumlah item                     |
| total_harga     | decimal  |                                                 |
| status          | string   | `diterima` / `diproses` / `selesai` / `diambil` |
| status_bayar    | string   | `belum_bayar` / `lunas`                         |
| created_at      | datetime |                                                 |

### PENGELUARAN

| Field     | Tipe     | Keterangan                     |
| --------- | -------- | ------------------------------ |
| id        | int (PK) |                                |
| outlet_id | int (FK) |                                |
| user_id   | int (FK) | harus role admin               |
| kategori  | string   | listrik, gaji, bahan baku, dll |
| jumlah    | decimal  |                                |
| deskripsi | string   |                                |
| tanggal   | date     |                                |

### STOK_ITEM

| Field         | Tipe     | Keterangan                                  |
| ------------- | -------- | ------------------------------------------- |
| id            | int (PK) |                                             |
| outlet_id     | int (FK) |                                             |
| nama_barang   | string   | deterjen, pewangi, plastik, dll             |
| satuan        | string   | liter, kg, pcs, dll                         |
| jumlah_stok   | decimal  |                                             |
| batas_minimum | decimal  | untuk alert stok menipis (opsional, fase 2) |

### STOK_LOG

| Field            | Tipe     | Keterangan                            |
| ---------------- | -------- | ------------------------------------- |
| id               | int (PK) |                                       |
| stok_item_id     | int (FK) |                                       |
| user_id          | int (FK) | harus role admin, untuk audit trail   |
| tipe_perubahan   | string   | `masuk` (beli) atau `keluar` (pakai)  |
| jumlah_perubahan | decimal  |                                       |
| catatan          | string   | opsional, misal "beli 5 dus deterjen" |
| created_at       | datetime |                                       |

## 6. API Endpoints

Semua endpoint (kecuali login) butuh header `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint           | Akses      | Keterangan                  |
| ------ | ------------------ | ---------- | --------------------------- |
| POST   | `/api/auth/login`  | Publik     | Login, mengembalikan JWT    |
| POST   | `/api/auth/logout` | Semua role | Invalidate token            |
| GET    | `/api/auth/me`     | Semua role | Data user yang sedang login |

### User & Outlet (khusus Admin)

| Method | Endpoint         | Akses | Keterangan                           |
| ------ | ---------------- | ----- | ------------------------------------ |
| GET    | `/api/outlets`   | Admin | List semua outlet                    |
| POST   | `/api/outlets`   | Admin | Tambah outlet baru                   |
| GET    | `/api/users`     | Admin | List user, bisa filter `?outlet_id=` |
| POST   | `/api/users`     | Admin | Tambah karyawan/admin baru           |
| PUT    | `/api/users/:id` | Admin | Edit data user                       |
| DELETE | `/api/users/:id` | Admin | Nonaktifkan/hapus user               |

### Layanan

| Method | Endpoint           | Akses      | Keterangan                 |
| ------ | ------------------ | ---------- | -------------------------- |
| GET    | `/api/layanan`     | Semua role | List jenis layanan & harga |
| POST   | `/api/layanan`     | Admin      | Tambah jenis layanan baru  |
| PUT    | `/api/layanan/:id` | Admin      | Update harga/nama layanan  |

### Transaksi

| Method | Endpoint                | Akses      | Keterangan                                                                                                                                        |
| ------ | ----------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/transaksi`        | Semua role | Karyawan hanya lihat outlet sendiri (filter otomatis di backend). Query params: `?outlet_id=&status=&status_bayar=&tanggal_mulai=&tanggal_akhir=` |
| POST   | `/api/transaksi`        | Semua role | Buat transaksi baru                                                                                                                               |
| GET    | `/api/transaksi/:id`    | Semua role | Detail satu transaksi                                                                                                                             |
| PUT    | `/api/transaksi/:id`    | Semua role | Update status transaksi/pembayaran                                                                                                                |
| GET    | `/api/transaksi/export` | Admin      | Export ke CSV/Excel, pakai query filter yang sama seperti GET list                                                                                |

### Pengeluaran

| Method | Endpoint               | Akses | Keterangan                                                    |
| ------ | ---------------------- | ----- | ------------------------------------------------------------- |
| GET    | `/api/pengeluaran`     | Admin | Filter: `?outlet_id=&kategori=&tanggal_mulai=&tanggal_akhir=` |
| POST   | `/api/pengeluaran`     | Admin | Catat pengeluaran baru                                        |
| PUT    | `/api/pengeluaran/:id` | Admin | Edit                                                          |
| DELETE | `/api/pengeluaran/:id` | Admin | Hapus                                                         |

### Stok

| Method | Endpoint               | Akses      | Keterangan                                           |
| ------ | ---------------------- | ---------- | ---------------------------------------------------- |
| GET    | `/api/stok`            | Semua role | Karyawan read-only, filter `?outlet_id=`             |
| POST   | `/api/stok`            | Admin      | Tambah jenis barang stok baru                        |
| PUT    | `/api/stok/:id/adjust` | Admin      | Update jumlah stok (otomatis buat entri di STOK_LOG) |
| GET    | `/api/stok/:id/log`    | Admin      | Lihat histori perubahan stok item tertentu           |

## 7. Urutan Pengembangan yang Disarankan

1. Setup project (backend Express + database, frontend React)
2. Backend: model database + migrasi (7 tabel di atas)
3. Backend: auth (login, JWT, middleware role-check)
4. Backend: CRUD transaksi, pengeluaran, stok
5. Backend: fitur export CSV/Excel
6. Frontend: halaman login
7. Frontend: halaman transaksi (list, filter, form input)
8. Frontend: halaman pengeluaran & stok
9. Testing end-to-end tiap role
10. Fase 2: dashboard analytics, member/poin, mode offline bisa hold data dulu di lokal, waktu online lagi baru push ke database
