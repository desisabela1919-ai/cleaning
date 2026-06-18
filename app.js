// 1. IMPORT FIREBASE SDK UTAMA
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 2. JANGAN LUPA SESUAIKAN KONFIGURASI FIREBASE-MU DI SINI, BOY!
const firebaseConfig = {
    apiKey: "CONFI_KAMU_DISINI",
    authDomain: "PROJECT_KAMU.firebaseapp.com",
    databaseURL: "https://PROJECT_KAMU-default-rtdb.firebaseio.com",
    projectId: "PROJECT_KAMU",
    storageBucket: "PROJECT_KAMU.appspot.com",
    messagingSenderId: "ID_SENDER",
    appId: "ID_APP"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Variabel Kontrol Akses Global
let currentUserUID, userRoleKunci, userGedungKunci, userShiftKunci, userNamaKunci;

// DOM Selektor Elemen Utama
const loginPage = document.getElementById('login-page');
const mainHeader = document.getElementById('main-header');
const karyawanSection = document.getElementById('karyawan-section');
const adminSection = document.getElementById('admin-section');

// PROSES EVENT LOGIN UTAMA
document.getElementById('btn-login').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    if(email && pass){
        signInWithEmailAndPassword(auth, email, pass).catch(err => alert("Gagal Masuk: " + err.message));
    } else { alert("Mohon isi Email dan Password!"); }
});

// LOGIKA REALTIME MONITORING AUTHENTIKASI & USER PROFIL
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserUID = user.uid;
        
        onValue(ref(db, `users_profile/${currentUserUID}`), (snapshot) => {
            const profil = snapshot.val();
            
            if (profil && profil.status === "Aktif") {
                userRoleKunci = profil.role; 
                userGedungKunci = profil.gedung || "Belum Diatur";
                userShiftKunci = profil.shift || "Shift 1";
                userNamaKunci = profil.nama;

                if(loginPage) loginPage.style.display = 'none';
                if(mainHeader) mainHeader.style.display = 'block'; 

                // JIKA LOGIN SEBAGAI KARYAWAN (SKUAD LAPANGAN)
                if (userRoleKunci === "Karyawan") {
                    document.getElementById('user-display-nama').textContent = profil.nama;
                    
                    // Bersihkan karakter '_' atau '_-_' dari Firebase agar terbaca rapi dengan spasi
                    const namaGedungBersih = userGedungKunci.replace(/_-_/g, ' - ').replace(/_/g, ' ');
                    document.getElementById('user-display-gedung').textContent = `📍 ${namaGedungBersih}`;
                    
                    document.getElementById('karyawan-shift-label').textContent = userShiftKunci;
                    document.getElementById('total-hari-kerja').textContent = `${profil.total_kehadiran || 0} Hari`;
                    
                    if(karyawanSection) karyawanSection.style.display = 'block'; 
                    if(adminSection) adminSection.style.display = 'none';
                    
                    // Set default label absensi seperti di foto
                    document.getElementById('absen-status').textContent = "Shift Selesai (Sudah Absen Pulang)";

                // JIKA LOGIN SEBAGAI ADMIN / PENGAWAS OPERASIONAL
                } else {
                    document.getElementById('user-display-nama').textContent = profil.nama;
                    document.getElementById('user-display-gedung').textContent = "💼 Dashboard Pengawas Operasional";
                    document.getElementById('karyawan-shift-label').textContent = "-";
                    document.getElementById('total-hari-kerja').textContent = "All Day";
                    
                    if(adminSection) adminSection.style.display = 'block'; 
                    if(karyawanSection) karyawanSection.style.display = 'none';
                }

            } else if (profil && profil.status === "Pending") {
                alert("Akun belum disetujui Pengawas!"); signOut(auth);
            } else {
                signOut(auth);
            }
        });
    } else {
        if(loginPage) loginPage.style.display = 'block'; 
        if(mainHeader) mainHeader.style.display = 'none';
        if(karyawanSection) karyawanSection.style.display = 'none';
    }
});

// ACTION TOMBOL KELUAR APLIKASI
document.getElementById('btn-logout').addEventListener('click', () => {
    if(confirm("Apakah kamu yakin ingin keluar aplikasi?")) {
        signOut(auth).then(() => { window.location.reload(); });
    }
});

// GLOBAL ACTION WINDOW (Agar aman dipakai atribut onclick di HTML module)
window.triggerSosSystem = function() {
    alert("Sinyal EMERGENCY dikirim secara realtime ke admin pusat!");
    // Tempatkan logika set(ref(db, 'sos/...')) andalanmu disini
};

window.bukaMenu = function(jenisMenu) {
    alert("Membuka Modul: " + jenisMenu.toUpperCase());
    // Tempatkan routing halaman navigasi menu kamu di sini
};
