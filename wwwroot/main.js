import { initViewer, loadModel } from './viewer.js';

initViewer(document.getElementById('preview')).then(viewer => {
    const urn = window.location.hash?.substring(1);
    setupModelSelection(viewer, urn);
    setupModelUpload(viewer);
});

async function setupModelSelection(viewer, selectedUrn) {
    const dropdown = document.getElementById('models');
    dropdown.innerHTML = '';
    try {
        const resp = await fetch('/api/models');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const models = await resp.json();
        dropdown.innerHTML = models.map(model => `<option value=${model.urn} ${model.urn === selectedUrn ? 'selected' : ''}>${model.name}</option>`).join('\n');
        dropdown.onchange = () => onModelSelected(viewer, dropdown.value);
        if (dropdown.value) {
            onModelSelected(viewer, dropdown.value);
        }
    } catch (err) {
        showNotification('Không thể tải danh sách mô hình. Kiểm tra console để biết thêm chi tiết.', 'error');
        console.error(err);
    }
}

async function setupModelUpload(viewer) {
    const upload = document.getElementById('upload');
    const input = document.getElementById('input');
    const models = document.getElementById('models');
    upload.onclick = () => input.click();
    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        
        // Kiểm tra kích thước file trước khi upload
        const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
        if (file.size > MAX_FILE_SIZE) {
            showNotification(`File quá lớn. Kích thước tối đa là 50MB. File của bạn: ${(file.size / (1024 * 1024)).toFixed(2)}MB`, 'error');
            input.value = '';
            return;
        }
        
        try {
            // Hiển thị thông tin file đang upload
            showNotification(`<div class="file-info">
                <div><strong>Tên:</strong> ${file.name}</div>
                <div><strong>Kích thước:</strong> ${(file.size / (1024 * 1024)).toFixed(2)}MB</div>
                <div><strong>Loại:</strong> ${file.type}</div>
            </div>`, 'info');
            
            let data = new FormData();
            data.append('model-file', file);
            
            if (file.name.endsWith('.zip')) { // When uploading a zip file, ask for the main design file in the archive
                const entrypoint = window.prompt('Vui lòng nhập tên file thiết kế chính trong tệp nén.');
                if (entrypoint) {
                    data.append('model-zip-entrypoint', entrypoint);
                }
            }
            
            upload.setAttribute('disabled', 'true');
            models.setAttribute('disabled', 'true');
            showNotification(`<div class="loading-spinner"></div> Đang tải lên mô hình <em>${file.name}</em>. Vui lòng không tải lại trang.`, 'info');
            
            // Gửi dữ liệu lên server
            const resp = await fetch('/api/models', { 
                method: 'POST', 
                body: data,
                timeout: 120000 // 2 phút timeout
            });
            
            if (!resp.ok) {
                const errorText = await resp.text();
                let errorMessage = 'Lỗi không xác định khi tải lên';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // Nếu phản hồi không phải là JSON, sử dụng text gốc
                    errorMessage = errorText;
                }
                throw new Error(errorMessage);
            }
            
            const model = await resp.json();
            setupModelSelection(viewer, model.urn);
            showNotification(`Tải lên mô hình ${file.name} thành công!`, 'success');
        } catch (err) {
            showNotification(`Không thể tải lên mô hình ${file.name}. Lỗi: ${err.message}`, 'error');
            console.error('Upload error:', err);
        } finally {
            upload.removeAttribute('disabled');
            models.removeAttribute('disabled');
            input.value = '';
        }
    };
}

async function onModelSelected(viewer, urn) {
    if (window.onModelSelectedTimeout) {
        clearTimeout(window.onModelSelectedTimeout);
        delete window.onModelSelectedTimeout;
    }
    window.location.hash = urn;
    showNotification('<div class="loading-spinner"></div> Đang tải mô hình...', 'info');
    try {
        const resp = await fetch(`/api/models/${urn}/status`);
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const status = await resp.json();
        switch (status.status) {
            case 'n/a':
                showNotification(`Mô hình chưa được xử lý.`, 'warning');
                break;
            case 'inprogress':
                showNotification(`Đang xử lý mô hình (${status.progress})...`, 'info');
                window.onModelSelectedTimeout = setTimeout(onModelSelected, 5000, viewer, urn);
                break;
            case 'failed':
                showNotification(`Xử lý thất bại. <ul>${status.messages.map(msg => `<li>${JSON.stringify(msg)}</li>`).join('')}</ul>`, 'error');
                break;
            default:
                clearNotification();
                loadModel(viewer, urn);
                break; 
        }
    } catch (err) {
        showNotification('Không thể tải mô hình. Kiểm tra console để biết thêm chi tiết.', 'error');
        console.error(err);
    }
}

function showNotification(message, type = 'info') {
    const overlay = document.getElementById('overlay');
    let icon = '';
    switch(type) {
        case 'error':
            icon = '<i class="fas fa-exclamation-circle" style="color: #e74c3c;"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle" style="color: #f39c12;"></i>';
            break;
        case 'success':
            icon = '<i class="fas fa-check-circle" style="color: #27ae60;"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle" style="color: #3498db;"></i>';
            break;
    }
    overlay.innerHTML = `<div class="notification notification-${type}">${icon} ${message}</div>`;
    overlay.style.display = 'flex';
}

function clearNotification() {
    const overlay = document.getElementById('overlay');
    overlay.innerHTML = '';
    overlay.style.display = 'none';
}
