const express = require('express');
const formidable = require('express-formidable');
const { listObjects, uploadObject, translateObject, getManifest, urnify } = require('../services/aps.js');

let router = express.Router();

router.get('/api/models', async function (req, res, next) {
    try {
        const objects = await listObjects();
        res.json(objects.map(o => ({
            name: o.objectKey,
            urn: urnify(o.objectId)
        })));
    } catch (err) {
        next(err);
    }
});

router.get('/api/models/:urn/status', async function (req, res, next) {
    try {
        const manifest = await getManifest(req.params.urn);
        if (manifest) {
            let messages = [];
            if (manifest.derivatives) {
                for (const derivative of manifest.derivatives) {
                    messages = messages.concat(derivative.messages || []);
                    if (derivative.children) {
                        for (const child of derivative.children) {
                            messages = messages.concat(child.messages || []);
                        }
                    }
                }
            }
            res.json({ status: manifest.status, progress: manifest.progress, messages });
        } else {
            res.json({ status: 'n/a' });
        }
    } catch (err) {
        next(err);
    }
});

router.post('/api/models', formidable({
    maxFileSize: 50 * 1024 * 1024, // 50MB 
    maxFields: 5,
    maxFieldsSize: 20 * 1024 * 1024, // 20MB
    multiples: false, // Chỉ cho phép upload một file
    keepExtensions: true, // Giữ phần mở rộng của file
    filter: function(part) {
        // Lọc và chỉ chấp nhận các file có định dạng phù hợp
        return part.name === 'model-file' || part.name === 'model-zip-entrypoint';
    }
}), async function (req, res, next) {
    const file = req.files['model-file'];
    
    if (!file) {
        return res.status(400).json({
            error: 'The required field ("model-file") is missing.'
        });
    }
    
    try {
        console.log(`Uploading file: ${file.name}, size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        
        const obj = await uploadObject(file.name, file.path);
        await translateObject(urnify(obj.objectId), req.fields['model-zip-entrypoint']);
        
        res.json({
            name: obj.objectKey,
            urn: urnify(obj.objectId)
        });
    } catch (err) {
        console.error('Upload error:', err);
        
        // Trả về thông báo lỗi chi tiết
        if (err.message && err.message.includes('too large')) {
            return res.status(413).json({
                error: 'File quá lớn để xử lý. Vui lòng upload file nhỏ hơn 50MB.',
                details: err.message
            });
        }
        
        next(err);
    }
});

module.exports = router;
