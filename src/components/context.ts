import * as React from 'react';

export interface LayoutContextValue {
  title: string;
  setTitle: (title: string) => void;
}

const LayoutContextDefaultValue = {} as LayoutContextValue;
export const LayoutContext = React.createContext(
  LayoutContextDefaultValue
);

export const useLayoutTitle = (myTitle: string) => {

  const { title, setTitle } = React.useContext(LayoutContext);
  const previousTitle = React.useRef(title);

  React.useEffect(() => {
    setTitle(myTitle);
  }, [setTitle, myTitle]);

  React.useEffect(() => () => {
    setTitle(previousTitle.current);
  }, [setTitle]);

};
