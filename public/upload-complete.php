<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

// Debug logging
error_log("upload-complete.php - GET parameters: " . print_r($_GET, true));
error_log("upload-complete.php - POST parameters: " . print_r($_POST, true));

$field = $_POST['Fieldn'] ?? $_GET['fieldn'] ?? '';
error_log("upload-complete.php - Field value: " . $field);

$filePath = isset($_GET['value']) ? $_GET['value'] : '';
$fileName = isset($_GET['field']) ? $_GET['field'] : '';
$filePath = str_replace('%26', '%20', $filePath);
$decodedFilePath = urldecode($filePath);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Upload Complete</title>
</head>
<body>
    <script>
        // Debug logging
        console.log('Upload complete parameters:', {
            field: "Upload complete",
            filePath: "<?php echo htmlspecialchars($decodedFilePath); ?>"
        });

        if ("<?php echo $filePath ?>") {
            const message = {
                type: 'fileUploaded',
                fileLocation: "<?php echo htmlspecialchars($decodedFilePath); ?>",
                field: "<?php echo htmlspecialchars($fileName); ?>"
            };
            
            console.log('Sending message to parent:', message);
            window.parent.postMessage(message, '*');
        } else {
            console.error('No file path provided');
        }
    </script>

    <!-- Debug display -->
    <div style="margin-top: 10px; font-size: 12px; color: #666;">
        Field: Upload Complete <br>
    </div>
</body>
</html>