<?php
header('Content-Type: application/json');

$file = 'data_pesan.json';

// Buat file otomatis jika belum ada
if (!file_exists($file)) {
    file_put_contents($file, json_encode([]));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ambil data yang sudah ada
    $currentData = json_decode(file_get_contents($file), true);
    if (!is_array($currentData)) {
        $currentData = [];
    }
    
    // Ambil data dari form submit (AJAX)
    $nama = $_POST['nama'] ?? '';
    $hubungan = $_POST['hubungan'] ?? '';
    $pesan = $_POST['pesan'] ?? '';
    
    if (!empty($nama) && !empty($pesan)) {
        $newData = [
            'id' => time(),
            'nama' => htmlspecialchars($nama),
            'hubungan' => htmlspecialchars($hubungan),
            'pesan' => nl2br(htmlspecialchars($pesan)),
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        // Tambahkan pesan ke barisan PAILNG ATAS (terbaru)
        array_unshift($currentData, $newData);
        
        // Simpan permanen ke dalam file json (data_pesan.json)
        file_put_contents($file, json_encode($currentData, JSON_PRETTY_PRINT));
        
        echo json_encode(['status' => 'success', 'message' => 'Pesan terkirim!', 'data' => $newData]);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Nama dan Pesan wajib diisi!']);
    }
} else {
    // Kalau methodnya GET, maka kirim semua data ke client/js
    $data = file_get_contents($file);
    echo $data;
}
?>
