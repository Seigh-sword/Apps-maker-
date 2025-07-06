const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileElem');
const fileList = document.getElementById('file-list');
let filesArray = [];

fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, e => {
    e.preventDefault();
    dropArea.classList.add('hover');
  });
});

['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, e => {
    e.preventDefault();
    dropArea.classList.remove('hover');
  });
});

dropArea.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
});

function handleFiles(files) {
  for (const file of files) {
    filesArray.push(file);
    const li = document.createElement('li');
    li.textContent = `📄 ${file.name}`;
    fileList.appendChild(li);
  }
}

function downloadBundle() {
  if (filesArray.length === 0) {
    alert("No files uploaded!");
    return;
  }

  const zip = new JSZip();
  filesArray.forEach(file => {
    zip.file(file.name, file);
  });

  // Auto-includes PWA stuff
  zip.file("manifest.json", JSON.stringify(manifestObj, null, 2));
  zip.file("service-worker.js", serviceWorkerCode);

  zip.generateAsync({type:"blob"}).then(function(content) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "AppifiedFiles.zip";
    link.click();
  });
}

// Auto-generated manifest
const manifestObj = {
  "name": "My Converted App",
  "short_name": "Appified",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#121212",
  "theme_color": "#00ffcc",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
};

// Service worker string
const serviceWorkerCode = `
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('apps-maker-cache').then(cache => {
      return cache.addAll(['/', '/index.html']);
    })
  );
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
`;
