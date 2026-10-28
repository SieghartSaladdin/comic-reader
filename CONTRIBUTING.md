# Berkontribusi

Terima kasih sudah mau membantu. Dokumen ini singkat: cara menjalankan proyek, apa yang dicek sebelum PR, dan jenis kontribusi yang paling berguna.

## Memulai

1. Fork repositori, lalu clone fork kamu.
2. Pasang dependensi dan jalankan server dev (butuh Node.js 20 atau lebih baru):

   ```bash
   npm install
   npm run dev
   ```

3. Buat branch dari `main`, misalnya `fix/parser-chapter` atau `feat/filter-tahun`.

## Sebelum membuka PR

Jalankan dua perintah ini dan pastikan build lolos:

```bash
npx tsc --noEmit
npm run build
```

`npm run lint` saat ini masih melaporkan beberapa error `react-hooks/set-state-in-effect` yang sudah ada sebelumnya. Jangan menambah error baru di file yang kamu ubah. Memperbaiki yang lama sangat dipersilakan, di PR terpisah.

Untuk perubahan tampilan, buka halamannya di browser dan cek tema terang, tema gelap, dan lebar layar 390 px. Sertakan screenshot sebelum dan sesudah di PR.

## Aturan kode

- Satu komponen atau modul, satu tanggung jawab. Usahakan file di bawah 300 baris. Struktur lengkapnya ada di [AGENTS.md](AGENTS.md).
- TypeScript eksplisit, tanpa `any`.
- Fungsi yang mengambil data dari luar harus mengikuti aturan cache di [docs/cache.md](docs/cache.md).
- Jangan commit file `.env`, kunci API, atau data pribadi.

## Aturan tampilan

Kami menjaga tampilan tetap spesifik dan jujur. Pada PR UI, mohon hindari:

- Angka, testimoni, atau klaim yang tidak punya sumber nyata.
- Tombol atau tautan yang tidak melakukan apa-apa.
- Efek dekoratif tanpa fungsi: blur di banyak elemen, glow, gradien latar, ikon berkilau.
- Teks dengan kontras di bawah WCAG AA (4,5:1 untuk teks biasa).
- Em dash (—) di teks antarmuka.

Setiap kontrol harus bisa dipakai dengan keyboard dan punya fokus yang terlihat.

## Kontribusi yang paling berguna

- Memperbaiki scraper saat sumber data mengubah HTML-nya. Sertakan URL halaman yang gagal dan hasil yang diharapkan.
- Perbaikan tampilan di layar kecil.
- Perbaikan aksesibilitas: label, urutan fokus, kontras.
- Memperbaiki error lint yang sudah ada.

## Pesan commit dan PR

Pakai prefix `feat:`, `fix:`, `docs:`, `perf:`, atau `refactor:`. Jelaskan apa yang berubah dan kenapa, dan tautkan issue kalau ada. Satu PR sebaiknya satu topik.

## Konten dan hak cipta

Jangan menambahkan file komik, gambar, atau video milik pihak lain ke repositori, termasuk di screenshot dan fixture. Pakai data sintetis atau placeholder. Lisensi MIT hanya mencakup kode.

Dengan mengirim kontribusi, kamu setuju kodenya dirilis di bawah [lisensi MIT](LICENSE) proyek ini.
