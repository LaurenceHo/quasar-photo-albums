import type { UploadFile as IUploadFile } from '@/schema';
import { ref } from 'vue';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
export const ALLOWED_FILE_TYPE = ['image/png', 'image/jpeg'];

const files = ref<IUploadFile[]>([]);

export default function FileListContext() {
  const addFiles = (newFiles: File[]) => {
    const newUploadFiles = [...newFiles]
      .map((file) => {
        let isValidImage: 'y' | 'wrong_format' | 'wrong_size' = 'y';

        if (!ALLOWED_FILE_TYPE.includes(file.type)) {
          isValidImage = 'wrong_format';
          return new UploadFile(file, isValidImage);
        }

        if (file.size > MAX_FILE_SIZE) {
          isValidImage = 'wrong_size';
        }

        return new UploadFile(file, isValidImage);
      })
      .filter((file) => !fileExists(file.id));
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
  isValidImage: 'y' | 'wrong_format' | 'wrong_size';

  constructor(file: File, isValidImage: 'y' | 'wrong_format' | 'wrong_size') {
    this.file = file;
    this.id = `${file.name}-${file.size}-${file.lastModified}-${file.type}`;
    this.url = URL.createObjectURL(file);
    this.status = null;
    this.exists = false;
    this.isValidImage = isValidImage;
  }
}
