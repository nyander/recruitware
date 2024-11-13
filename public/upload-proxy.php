<!DOCTYPE html>
<html>
<head>
    <title>Upload Proxy</title>
    <script>
        // Notify parent when we're ready
        window.onload = function() {
            console.log('Upload proxy loaded');
            window.parent.postMessage({ type: 'iframeReady' }, '*');
        };

        // Function to handle file selection and upload
        function listFolder(e) {
        console.log('File selected:', e.files);
        var files = e.files;
        var fileNames = Array.from(files).map(f => f.name).join(';');
        
        // Update form fields
        document.getElementById("NewAttachmentName").value = fileNames;
        
        // Submit the form
        document.forms[0].submit();

        // After form submission, send the file location back to the parent
        // Assuming the file location is something like 'http://31.193.136.171/files/' + fileNames
        const filePath = '/freshfiles/library/Fungai_Motezu/' + fileNames; // Update this path as per your logic

        window.parent.postMessage({
            type: 'fileUploaded',
            filename: fileNames,
            fileLocation: filePath
        }, '*');
    }


        // Listen for click requests from parent
        window.addEventListener('message', function(event) {
            console.log('Message received:', event.data);
            if (event.data.type === 'clickUploadButton') {
                document.getElementById('freshupload').click();
            }
        });
    </script>
</head>
<body>
    <form method="post" 
          action="http://31.193.136.171/Apex/webstore.nsf/fresource!OpenForm&Seq=1" 
          enctype="multipart/form-data" 
          name="_fresource">
        <input type="hidden" name="__Click" value="0">
        <input type="hidden" name="NewAttachmentName" id="NewAttachmentName" value="">
        <input type="hidden" name="UnitNo" id="UnitNo" value="">
        <input type="hidden" name="UnitName" id="UnitName" value="">
        <input type="file" 
               id="freshupload" 
               name="%%File.80258b51001d9149.a4b44356fd496fa980257e7b00484ff4.$Body.0.F6A" 
               multiple="" 
               onchange="listFolder(this)" 
               style="display:none">
        
        <div style="padding: 10px; text-align: center;">
            <button type="button" onclick="document.getElementById('freshupload').click()">
                Select File
            </button>
        </div>
    </form>

    <div id="status" style="padding: 10px; font-family: monospace; font-size: 12px;">
        Ready to upload...
    </div>
</body>
</html>
