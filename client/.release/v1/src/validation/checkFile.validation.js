export const enumTypes = 'JPG,JPEG,PNG,GIF,BMP,TIFF,ICO,PDF,EPS,PSD,SVG,WebP,JXR,WDP';
const maxSize = 5000000; // ~ 5mb
const maxLength = 10;

export const checkFile = (fileName, fileSize, filesLength) => {
  // Check length
  if (filesLength >= maxLength) {
    return {
      correct: false,
      msg: LengthErrorMsg(),
    };
  }
  // Check size
  if (fileSize > maxSize) {
    return {
      correct: false,
      msg: SizeErrorMsg(),
    };
  }

  // Check type
  const fileTypeFromName = fileName.split('.');
  if (!enumTypes.toLowerCase().includes(fileTypeFromName[fileTypeFromName.length - 1])) {
    return {
      correct: false,
      msg: TypeErrorMsg(),
    };
  }
  return { correct: true, msg: '' };
};

const SizeErrorMsg = () => (
  <>
    <span>Your file size is too large</span>
    <p>Max size is 5.00 MB</p>
  </>
);
const TypeErrorMsg = () => (
  <>
    <span>Not supported this file yet</span>
    <p>At present, only support PDF and other image files.</p>
  </>
);
const LengthErrorMsg = () => (
  <>
    <span>Maximum file is 10</span>
    <p>Uploaded files are not over limit</p>
  </>
);
