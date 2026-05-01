import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Solo se permiten imágenes"));
      return;
    }
    cb(null, true);
  },
});

export default upload;