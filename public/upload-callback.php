<?php
header('Access-Control-Allow-Origin: *');

// Get the filename and ID from the request
$filename = $_GET['filename'] ?? '';
$fileId = $_GET['fileId'] ?? '';
?>
<script>
    window.parent.parent.fresh_setAttach("<?php echo $filename; ?>", "<?php echo $fileId; ?>");
</script>