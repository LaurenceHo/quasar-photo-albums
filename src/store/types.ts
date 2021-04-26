import { Album } from 'components/models';
import { ActionContext, CommitOptions, DispatchOptions, Store as VuexStore } from 'vuex';

export interface StoreState {
  loadingData: boolean;
  allAlbumList: Album[];
}

export type Getters = {
  chunkAlbumList(state: StoreState): (firstIndex: number, lastIndex: number) => Album[];
  filteredAlbumList(state: StoreState): (searchKey: string) => Album[];
};

export enum ActionType {
  loadingData = 'loadingData',
  getAllAlbumList = 'getAllAlbumList',
}

export type Actions = {
  [ActionType.loadingData](context: ActionAugments, payload: boolean): void;
  [ActionType.getAllAlbumList](context: ActionAugments): void;
};

export enum MutationType {
  loadingData = 'loadingData',
  setAllAlbumList = 'setAllAlbumList',
}

export type Mutations = {
  [MutationType.loadingData](state: StoreState, payload: boolean): void;
  [MutationType.setAllAlbumList](state: StoreState, payload: Album[]): void;
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
