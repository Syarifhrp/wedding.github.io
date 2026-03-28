// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyChiVbfK7r7kKThI8_7J9UHrkF9Dem4fLs",
  authDomain: "weddingsyarif-91c40.firebaseapp.com",
  databaseURL: "https://weddingsyarif-91c40-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "weddingsyarif-91c40",
  storageBucket: "weddingsyarif-91c40.firebasestorage.app",
  messagingSenderId: "84219121037",
  appId: "1:84219121037:web:bcaca78320957a6cdf01c4",
  measurementId: "G-TQD5LP9JJ9"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function showData(dataMessage) {
  let row = "";

  if (!dataMessage || dataMessage.length == 0) {
    return `<h1 class="title" style="text-align : center">Belum Ada Pesan Masuk</h1>`;
  }

  // membalik urutan agar pesan terbaru di atas
  dataMessage.reverse().forEach(function (item) {
    row += `<h1 class="title">${item["nama"]}</h1>`;
    let hub = item["hubungan"] || "Tamu";
    row += `<h4>- ${hub}</h4>`;
    row += `<p>${item["pesan"]}</p>`;
  });
  return row;
}

$(function () {
  // 1. Baca data secara real-time dari Firebase menggunakan Listener .on("value")
  // Event ini otomatis ter-trigger saat pertama diload dan setiap kali ada data baru!
  db.ref("pesan").on("value", function(snapshot) {
    let messages = [];
    snapshot.forEach(function(childSnapshot) {
      messages.push(childSnapshot.val());
    });
    $(".card-message").html(showData(messages));
  });

  // 2. Event Handle form submit
  $("#formMessage").on("submit", function (e) {
    e.preventDefault();
    
    let submitBtn = $(this).find('button[type="submit"]');
    let originalText = submitBtn.html();
    
    // Memberikan state loading
    submitBtn.prop('disabled', true).text('Sending...');

    // Ambil nilai dari form
    let formData = $(this).serializeArray();
    let dataObj = {};
    $(formData).each(function(index, obj){
        dataObj[obj.name] = obj.value;
    });

    // Tambahkan timestamp server
    dataObj.timestamp = firebase.database.ServerValue.TIMESTAMP;

    // Push ke Realtime Database pada node "pesan"
    db.ref("pesan").push(dataObj)
      .then(() => {
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Terima Kasih Atas Ucapan & Doanya ",
            showConfirmButton: false,
            timer: 2000,
        });
        
        // reset form
        $("#formMessage")[0].reset();
      })
      .catch((error) => {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Mengirim',
            text: error.message || 'Terjadi kesalahan saat mengirim pesan via Firebase.'
        });
      })
      .finally(() => {
        // Restore button text
        submitBtn.prop('disabled', false).html(originalText);
        // Re-render icon
        if (typeof feather !== 'undefined') {
            feather.replace(); 
        }
      });
  });
});
