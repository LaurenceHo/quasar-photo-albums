import type { UploadFile as IUploadFile } from '@/schema';
import type { FileValidationStatus } from '@/schema/upload-file';
import { ref } from 'vue';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
export const ALLOWED_FILE_TYPE = ['image/png', 'image/jpeg', 'image/webp'];

const files = ref<IUploadFile[]>([]);

export default function FileListContext() {
  const addFiles = (newFiles: File[]) => {
    const newUploadFiles = [...newFiles]
      .filter((file) => !fileExists(`${file.name}-${file.size}-${file.lastModified}-${file.type}`))
      .map((file) => {
        let validationStatus: FileValidationStatus = 'valid';

        if (!ALLOWED_FILE_TYPE.includes(file.type)) {
          validationStatus = 'invalid_format';
          return new UploadFile(file, validationStatus);
        }

        if (file.size > MAX_FILE_SIZE) {
          validationStatus = 'invalid_size';
          return new UploadFile(file, validationStatus);
        }

        return new UploadFile(file, validationStatus);
      });
    files.value = files.value.concat(newUploadFiles);
  };

  const fileExists = (otherId: string) => files.value.some(({ id }) => id === otherId);

  const removeFile = (file: IUploadFile) => {
    const index = files.value.indexOf(file);

    if (index > -1) {
      files.value.splice(index, 1);
    }
  };

  return { files, addFiles, removeFile };
}

class UploadFile implements IUploadFile {
  id: string;
  file: File;
  url: string;
  status: 'loading' | boolean | null;
  exists: boolean;
  fileValidation: FileValidationStatus;

  constructor(file: File, fileValidation: FileValidationStatus) {
    this.file = file;
    this.id = `${file.name}-${file.size}-${file.lastModified}-${file.type}`;
    this.url = URL.createObjectURL(file);
    this.status = null;
    this.exists = false;
    this.fileValidation = fileValidation;
  }
}
