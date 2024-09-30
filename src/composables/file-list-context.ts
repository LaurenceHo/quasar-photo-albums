import type { UploadFile as IUploadFile } from '@/schema';
import { ref } from 'vue';

const files = ref<IUploadFile[]>([]);

export default function FileListContext() {
  const addFiles = (newFiles: IUploadFile[]) => {
    const newUploadFiles = [...newFiles].map((file) => new UploadFile(file)).filter((file) => !fileExists(file.id));
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

  constructor(file: any) {
    this.file = file;
    this.id = `${file.name}-${file.size}-${file.lastModified}-${file.type}`;
    this.url = URL.createObjectURL(file);
    this.status = null;
    this.exists = false;
  }
}
