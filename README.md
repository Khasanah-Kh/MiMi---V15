# Mimi V15 — Room Belajar Interaktif (Gemini AI 3.6 Flash)

Selamat datang di repositori **Mimi V15 (Mimi 15)** — aplikasi web *Room Belajar* bergaya interaktif, rapi, dan estetik untuk pelajar **SD (Kelas 1–6)**, **SMP (Kelas 7–9)**, dan **SMA (Kelas 10–12)**.

## Keunggulan Utama

1. **Persona Multi-Peran Mimi V15 (Bertenaga Gemini AI 3.6 Flash)**
   - **Asisten, Guru, Profesor & Teman Belajar Sekaligus**: Sangat peka membaca konteks obrolan seperti manusia.
   - **Menuntun dengan Kisi-Kisi (Tanpa Bocoran Kunci Jawaban)**: Saat ditanya soal pelajaran atau PR, Mimi V15 tidak langsung membocorkan jawaban akhir, melainkan memberi kisi-kisi (*hints*), konsep dasar, dan menuntun langkah berpikir sampai kamu paham sendiri.
   - **Peka Pertanyaan Umum**: Saat diajak ngobrol santai atau bertanya hal umum, Mimi merespons secara luwes sesuai konteks.

2. **Jalur Belajar Interaktif & Simulasi Konsep**
   - Dilengkapi laboratorium simulasi interaktif (Pecahan, Siklus Air, Aljabar, Hukum Newton, Hukum Ohm, Efek Bohr, hingga Fisika Kuantum).
   - Desain kartu belajar yang rapi, nyaman dibaca, dan tombol taktil yang menyenangkan.

3. **Papan Peringkat Global, Tantangan Partner & Kuis Adaptif**
   - Bandingkan XP dan **Gelar Belajar** (*Pelajar Pemula I* hingga *Bintang Akademia V*) di seluruh platform.
   - Buat soal kuis baru secara dinamis sesuai topik pilihanmu.

4. **Sistem Login Pengguna yang Aman**
   - Enkripsi kata sandi menggunakan `scrypt` + *16-byte random salt* dan token sesi `HMAC-SHA256`.

---

## Cara Menjalankan di Lokal / GitHub Codespaces

```bash
# 1. Instal dependensi
npm install

# 2. Salin konfigurasi environment dan isi GEMINI_API_KEY
cp .env.example .env

# 3. Jalankan server pengembangan (Port 3000)
npm run dev
```

## Cara Menghubungkan & Mengatur di GitHub

```bash
git init
git add .
git commit -m "feat: Room Belajar Mimi V15 powered by Gemini AI 3.6 Flash"
git branch -M main
git remote add origin https://github.com/username-kamu/mimi-v15-room-belajar.git
git push -u origin main
```
