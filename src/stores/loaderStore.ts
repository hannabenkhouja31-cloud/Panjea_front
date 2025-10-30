import { createStore } from "solid-js/store";

interface LoaderStore {
  isLoading: boolean;
}

const [loader, setLoader] = createStore<LoaderStore>({
  isLoading: false
});

const startLoading = () => {
  setLoader("isLoading", true);
}

const stopLoading = () => {
  setLoader("isLoading", false);
}

export {
  loader,
  startLoading,
  stopLoading
}