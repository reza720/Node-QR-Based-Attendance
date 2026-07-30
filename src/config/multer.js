import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath} from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination(req, file, cb){
        const dir = path.resolve(__dirname, "../../storage/photos");
        fs.mkdirSync(dir, {recursive: true});
        cb(null, dir);
    },
    filename(req, file, cb){
        const fileName = `${Date.now()}-${crypto.randomUUID()}-${file.originalname}` 
        cb(null, fileName);
    }
});
const fileFilter = (req, file, cb)=>{
    const allowedTypes = ["image/jpeg", "image/jpg"] 
    if(allowedTypes.includes(file.mimetype)){
        cb(null, true);
    }
    else{
        cb(new Error("Only JPEG images are acceptable"), false);
    }
}
const upload = multer({
    storage,
    fileFilter,
    limits:{
        fileSize: 10 * 1024 * 1024
    }
});

export default upload;