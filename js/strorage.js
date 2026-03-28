function showData(dataMessage) {
  let row = "";

  if (!dataMessage || dataMessage.length == 0) {
    return (row = `<h1 class="title" style="text-align : center">Belum Ada Pesan Masuk</h1>`);
  }

  // PHP sudah meletakkan pesan paling baru di barisan Index 0.
  dataMessage.forEach(function (item) {
    row += `<h1 class="title">${item["nama"]}</h1>`;
    let hub = item["hubungan"] || "Tamu";
    row += `<h4>- ${hub}</h4>`;
    row += `<p>${item["pesan"]}</p>`;
  });
  return row;
}

// State sementara pesan-pesan
let currentMessages = [];

// Method AJAX GET -> layaknya Livewire poll method memmanggil function untuk me-refresh component
function loadMessages() {
  $.ajax({
    url: "api_pesan.php",
    type: "GET",
    dataType: "json",
    success: function(response) {
      if (Array.isArray(response)) {
        currentMessages = response;
        $(".card-message").html(showData(currentMessages));
      } else {
        $(".card-message").html(showData([]));
      }
    },
    error: function(err) {
      // Abaikan console logging di production mode, atau tampil warning.
      // console.error("Gagal memuat pesan dari server...", err);
    }
  });
}

$(function () {
  // 1. Ambil data pesan dari File System/PHP saat user membuka halaman di div .card-message
  loadMessages();

  // Livewire Wire:Poll Equivalent -> Secara otomatis check data ke PHP per-3 Detik 
  // Jika pengguna di HP A mengisi form, pengguna HP B akan otomatis mendapatkan pesan itu 
  // dalam hitungan maksimal 3 detik.
  setInterval(loadMessages, 3000);

  // 2. Event Handle form submit menggunakan jQuery Ajax POST -> wire:submit
  $("#formMessage").on("submit", function (e) {
    e.preventDefault();
    
    let submitBtn = $(this).find('button[type="submit"]');
    let originalText = submitBtn.html();
    
    // Memberikan state loading seperti wire:loading
    submitBtn.prop('disabled', true).text('Sending...');

    $.ajax({
        url: "api_pesan.php",
        type: "POST",
        data: $(this).serialize(), // Mengumpulkan value (nama, hubungan, pesan)
        dataType: "json",
        success: function(response) {
            if (response.status === 'success') {
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Terima Kasih Atas Ucapan & Doanya ",
                    showConfirmButton: false,
                    timer: 2000,
                });
                
                // reset textarea dan input tags
                $("#formMessage")[0].reset();
                
                // Tarik data agar tampilan langsung update tanpa harus menunggu 3 detik (Instant UI Feedback)
                loadMessages();
            }
        },
        error: function(xhr) {
            let res = xhr.responseJSON;
            Swal.fire({
                icon: 'error',
                title: 'Gagal Mengirim',
                text: (res && res.message) ? res.message : 'Terjadi kesalahan saat mengirim pesan via AJAX.'
            });
        },
        complete: function() {
            // Restore button text
            submitBtn.prop('disabled', false).html(originalText);
            // Re-render icon
            if (typeof feather !== 'undefined') {
                feather.replace(); 
            }
        }
    });
  });
});
