import { Album } from 'components/models';
import { ActionContext, CommitOptions, DispatchOptions, Store as VuexStore } from 'vuex';

export interface StoreState {
  loadingAlbum: boolean;
  loadingAlbumTags: boolean;
  allAlbumList: Album[];
  albumTags: string[];
  searchKey: string;
}

export type Getters = {
  chunkAlbumList(state: StoreState): (firstIndex: number, lastIndex: number) => Album[];
  filteredAlbumList(state: StoreState): (searchKey: string, selectedTags: string[]) => Album[];
};

export enum ActionType {
  loadingAlbum = 'loadingAlbum',
  loadingAlbumTags = 'loadingAlbumTags',
  getAllAlbumList = 'getAllAlbumList',
  getAlbumTags = 'getAlbumTags',
  inputSearchKey = 'inputSearchKey',
}

export type Actions = {
  [ActionType.loadingAlbum](context: ActionAugments, payload: boolean): void;
  [ActionType.loadingAlbumTags](context: ActionAugments, payload: boolean): void;
  [ActionType.getAllAlbumList](context: ActionAugments): void;
  [ActionType.getAlbumTags](context: ActionAugments): void;
  [ActionType.inputSearchKey](context: ActionAugments, payload: string): void;
};

export enum MutationType {
  loadingAlbum = 'loadingAlbum',
  loadingAlbumTags = 'loadingAlbumTags',
  setAllAlbumList = 'setAllAlbumList',
  setAlbumTags = 'setAlbumTags',
  inputSearchKey = 'inputSearchKey',
}

export type Mutations = {
  [MutationType.loadingAlbum](state: StoreState, payload: boolean): void;
  [MutationType.loadingAlbumTags](state: StoreState, payload: boolean): void;
  [MutationType.setAllAlbumList](state: StoreState, payload: Album[]): void;
  [MutationType.setAlbumTags](state: StoreState, payload: string[]): void;
  [MutationType.inputSearchKey](state: StoreState, payload: string): void;
};

export type ActionAugments = Omit<ActionContext<StoreState, StoreState>, 'commit'> & {
  commit<K extends keyof Mutations>(key: K, payload: Parameters<Mutations[K]>[1]): ReturnType<Mutations[K]>;
};

export type Store = Omit<VuexStore<StoreState>, 'commit' | 'dispatch' | 'getters'> & {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<Mutations[K]>;
} & {
  dispatch<K extends keyof Actions>(
    key: K,
    payload?: Parameters<Actions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<Actions[K]>;
} & {
  getters: {
    [K in keyof Getters]: ReturnType<Getters[K]>;
  };
};
