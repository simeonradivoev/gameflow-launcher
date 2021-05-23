import ElectronStore from 'electron-store';
import React, {
  DependencyList,
  Dispatch,
  Reducer,
  SetStateAction,
  useEffect,
  useReducer,
} from 'react';

export const useStateElectronStoreKey = <
  StoreType,
  StoreKey extends keyof StoreType
>(
  store: ElectronStore<StoreType>,
  key: StoreKey
): [StoreType[StoreKey] | undefined] => {
  const [value, setValue] = React.useState(
    store.has(key) ? store.get(key) : undefined
  );

  React.useEffect(() => {
    const unsubscribe = store.onDidChange(key, (newValue) =>
      setValue(newValue)
    );
    return () => {
      unsubscribe();
    };
  }, [store]);

  return [value];
};

export const useStateElectronStore = <StoreType>(
  store: ElectronStore<StoreType>
): [StoreType] => {
  const [value, setValue] = React.useState<StoreType>(store.store);

  React.useEffect(() => {
    const unsubscribe = store.onDidAnyChange((newValue) =>
      setValue(newValue ?? ({} as StoreType))
    );
    return () => {
      unsubscribe();
    };
  }, [store]);

  return [value];
};

export const useStateWithLocalStorageWithNull = (
  localStorageKey: string
): [string | null, Dispatch<SetStateAction<string | null>>] => {
  const [value, setValue] = React.useState(
    localStorage.getItem(localStorageKey)
  );

  React.useEffect(() => {
    if (value !== null) {
      localStorage.setItem(localStorageKey, value);
    }
  }, [value]);

  return [value, setValue];
};

export const useStateWithLocalStorage = (
  localStorageKey: string,
  initialState: string | (() => string)
): [string, Dispatch<SetStateAction<string>>] => {
  const [value, setValue] = React.useState(
    localStorage.getItem(localStorageKey) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(localStorageKey, value);
  }, [value]);

  return [value, setValue];
};

export const useStateWithWithSessionStorageWithNull = (
  sessionStorageKey: string
): [string | null, Dispatch<SetStateAction<string | null>>] => {
  const [value, setValue] = React.useState(
    sessionStorage.getItem(sessionStorageKey)
  );

  React.useEffect(() => {
    if (value !== null) {
      sessionStorage.setItem(sessionStorageKey, value);
    }
  }, [value]);

  return [value, setValue];
};

export const useStateWithSessionStorage = (
  sessionStorageKey: string,
  initialState: string | (() => string)
): [string, Dispatch<SetStateAction<string>>] => {
  const [value, setValue] = React.useState(
    sessionStorage.getItem(sessionStorageKey) || initialState
  );

  React.useEffect(() => {
    sessionStorage.setItem(sessionStorageKey, value);
  }, [value]);

  return [value, setValue];
};

const dataFetchReducer = <TPayload>(
  state: UseEffectAsyncType<TPayload>,
  action: UseEffectAsyncType<TPayload>
): UseEffectAsyncType<TPayload> => {
  switch (action.type) {
    case 'INIT':
      return { ...state, isLoading: true, isError: false };
    case 'SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        payload: action.payload,
      };
    case 'FAILURE':
      return { ...state, isLoading: false, isError: true };
    default:
      throw new Error();
  }
};

interface UseEffectAsyncType<TPayload> {
  isLoading?: boolean;
  isError?: boolean;
  type?: string;
  payload?: TPayload;
}

/**
 * Use effect but with an async feedback on when the promise function is finished.
 * @param parameters Parameters passed to the async function
 * @param func the async function that will be executed
 * @param deps dependencies for the use effect
 * @returns State of the async operation.
 */
export const useEffectAsyncWithParameters = <TParameters, TResult>(
  parameters: TParameters,
  func: (parameters: TParameters) => Promise<TResult>,
  deps?: DependencyList | undefined
) => {
  const initialState: UseEffectAsyncType<TResult> = {
    isLoading: false,
    isError: false,
  };

  const [state, dispatch] = useReducer<
    Reducer<UseEffectAsyncType<TResult>, UseEffectAsyncType<TResult>>
  >(dataFetchReducer, initialState);

  useEffect(() => {
    let didCancel = false;

    const asyncWrapper = async () => {
      dispatch({ type: 'INIT' });

      try {
        const result = await func(parameters);

        if (!didCancel) {
          dispatch({ type: 'SUCCESS', payload: result });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FAILURE' });
        }
      }
    };

    asyncWrapper();

    return () => {
      didCancel = true;
    };
  }, deps);

  return [state];
};

/**
 * Use effect but with an async feedback on when the promise function is finished.
 * @param func the async function that will be executed
 * @param deps dependencies for the use effect
 * @returns State of the async operation.
 */
export const useEffectAsync = <TResult>(
  func: () => Promise<TResult>,
  deps?: DependencyList | undefined
) => {
  const initialState: UseEffectAsyncType<TResult> = {
    isLoading: false,
    isError: false,
  };

  const [state, dispatch] = useReducer<
    Reducer<UseEffectAsyncType<TResult>, UseEffectAsyncType<TResult>>
  >(dataFetchReducer, initialState);

  useEffect(() => {
    let didCancel = false;

    const asyncWrapper = async () => {
      dispatch({ type: 'INIT' });

      try {
        const result = await func();

        if (!didCancel) {
          dispatch({ type: 'SUCCESS', payload: result });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FAILURE' });
        }
      }
    };

    asyncWrapper();

    return () => {
      didCancel = true;
    };
  }, deps);

  return [state];
};
