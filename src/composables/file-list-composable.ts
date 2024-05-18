import { UploadableFile as IUploadableFile } from 'components/models';
import { ref } from 'vue';

export default function () {
  const files = ref<IUploadableFile[]>([]);

  const addFiles = (newFiles: IUploadableFile[]) => {
    const newUploadFiles = [...newFiles].map((file) => new UploadFile(file)).filter((file) => !fileExists(file.id));
    files.value = files.value.concat(newUploadFiles);
  };

  const fileExists = (otherId: string) => files.value.some(({ id }) => id === otherId);

  const removeFile = (file: IUploadableFile) => {
    const index = files.value.indexOf(file);

    if (index > -1) {
      files.value.splice(index, 1);
    }
  };

  return { files, addFiles, removeFile };
}

class UploadFile implements IUploadableFile {
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
