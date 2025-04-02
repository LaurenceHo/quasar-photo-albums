import { ref } from 'vue';

export default function useLoading() {
  const isLoading = ref(false);

  const startLoading = () => {
    isLoading.value = true;
  };

  const endLoading = () => {
    isLoading.value = false;
  };

  return {
    isLoading,
    startLoading,
    endLoading,
  };
}
