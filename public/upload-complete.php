<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Upload Complete</title>
</head>
<body>
    <?php
    // Retrieve the file path from the URL parameter
    $filePath = isset($_GET['value']) ? $_GET['value'] : '';

    // Convert %26 to %20 (for spaces)
    $filePath = str_replace('%26', '%20', $filePath);

    // Decode the URL-encoded string to get the actual file path with spaces
    $decodedFilePath = urldecode($filePath);
    ?>
    
    <script>
        // Pass the decoded file path to JavaScript
        const filePath = "<?php echo htmlspecialchars($decodedFilePath); ?>";

        if (filePath) {
            // Send the file path back to the parent window
            window.parent.postMessage({
                type: 'fileUploaded',
                fileLocation: filePath
            }, '*');

            // Optional alert for debugging
            alert("File uploaded: " + filePath);
        } else {
            alert("No file path provided.");
        }
    </script>

    <p>File upload complete. You may close this window.</p>
</body>
</html>
