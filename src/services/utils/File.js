import { getBase64Strings } from 'exif-rotate-js/lib';

export default class File
{
    static toBase64 = (file) =>
    {
        return new Promise((resolve, reject) =>
        {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }

    static imgToBase64 = async (file) =>
    {
        const res = await getBase64Strings([file]);
        return res[0];
    }

    static setFile = async (file, allowed = []) =>
    {
        const base64 = await File.toBase64(file);
        return {
            name: file.name,
            size: file.size,
            sizeSerialize: File.bytesToSize(file.size),
            ext: file.name.split('.').pop(),
            mime: file.type,
            base64: base64
        };
    }

    static setImage = async (file, allowed = []) =>
    {
        const base64 = await File.imgToBase64(file);
        return {
            name: file.name,
            size: file.size,
            sizeSerialize: File.bytesToSize(file.size),
            ext: file.name.split('.').pop(),
            mime: file.type,
            base64: base64
        };
    }

    static bytesToSize = (bytes) =>
    {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return bytes ? Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i] : "0 bytes";
    }
};