const fs = require('fs');
const path = './src/app/admin/banners/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// remove states
content = content.replace(/const \[showCropper, setShowCropper\] = useState\(false\);\n/, '');
content = content.replace(/const \[cropperImageUrl, setCropperImageUrl\] = useState\(''\);\n/, '');
content = content.replace(/const \[showCropperMessage, setShowCropperMessage\] = useState\(false\);\n/, '');

// redefine handleFileUpload
content = content.replace(/const handleFileUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\};(\n\s*\/\/ Handle cropped image)/, `const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);
                uploadFormData.append('folder', 'gonuts/banners');
                uploadFormData.append('type', 'banner');

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                });

                const result = await response.json();
                
                if (result.success) {
                    console.log('✅ Banner uploaded to Cloudinary:', result.data.url);
                    setFormData({ ...formData, imageUrl: result.data.url });
                    toast.success('Upload thành công', 'Ảnh đã được tải lên.');
                } else {
                    console.error('❌ Upload failed:', result.message);
                    toast.error('Upload thất bại', result.message || 'Vui lòng thử lại.');
                }
            } catch (error) {
                console.error('❌ Error uploading banner:', error);
                toast.error('Lỗi khi upload banner', 'Vui lòng thử lại.');
            }
        }
    };$1`);

// remove cropped handle
content = content.replace(/\/\/ Handle cropped image\n\s*const handleCroppedImage = \(croppedImageUrl: string\) => \{[\s\S]*?\};\n/, '');
content = content.replace(/\/\/ Handle cropper cancel\n\s*const handleCropperCancel = \(\) => \{[\s\S]*?\};\n/, '');

// remove import
content = content.replace(/import ImageCropper from '@\/components\/admin\/ImageCropper';\n/, '');

// remove UI cropper
content = content.replace(/\{\/\* Auto-cropper notification \*\/\}[\s\S]*?\{\/\* Image Cropper Modal \*\/\}[\s\S]*?\}\)/, '');

// remove text mentioning crop
content = content.replace(/<div className="text-brand text-xs mt-1">\s*Ảnh sẽ được tự động cắt và điều chỉnh về đúng tỉ lệ\s*<\/div>/, '');

// remove crop button
content = content.replace(/\{formData\.imageUrl && \([\s\S]*?<Crop size=\{18\} \/>[\s\S]*?<\/button>\s*\)\}/, '');

fs.writeFileSync(path, content);
