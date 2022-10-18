import App from './App'
import './index.css'

type FunctionComponent = (props: any) => ReactElement

type ReactElement = string | number | null | {
  type: string | FunctionComponent,
  props: {
    [key: string]: unknown,
    children: ReactElement[],
  },
}

export const React = {
  createElement: (type: string | FunctionComponent, props: Record<string, {}>, ...children: any[]): ReactElement => {
    return {
      type,
      props: {
        ...props,
        children,
      }
    }
  }
}

const reactTreeToDOM = (reactTree: ReactElement): (HTMLElement | Text)[] => {
  if (reactTree === null) {
    return [];
  }

  if (typeof reactTree === 'string' || typeof reactTree === 'number') {
    return [document.createTextNode(reactTree.toString())];
  }

  const { type, props } = reactTree;
  if (typeof type ==='string') {
    const element = document.createElement(type);
    const { children, ...otherProps } = props;
    for (const [key, value] of Object.entries(otherProps)) {
      if (key === 'className') {
        element.className = value as string;
      } else if (key === 'onClick') {
        element.addEventListener('click', value as EventListener);
      } else if (key.startsWith('__')) {
        continue;
      } else {
        element.setAttribute(key, value as string);
      }
    }
    const domChildren = children.flatMap(reactTreeToDOM);
    element.append(...domChildren);
    return [element];
  }
  return reactTreeToDOM(type(props));
}

const ReactDOM = {
  createRoot: (root: HTMLElement) => {
    return {
      render: (reactRoot: ReactElement) => {
        root.replaceChildren(...reactTreeToDOM(reactRoot));
      }
    }
  }
}


let state: any = null;
let isFirstTime = true;
let willRerender = false;
const rerender = () => { 
  root.render(<App />)
  willRerender = false;
};

type Setter<T> = (t: T) => T;

export const useState = <T,>(initialState: T): [T, (valueOrFunction: T | Setter<T>) => void] => {
  if (isFirstTime) {
    state = initialState;
    isFirstTime = false;
  }
  return [state, (valOrFunction: T | Setter<T>) => { 
    if (typeof valOrFunction === 'function') {
      state = (valOrFunction as any)(state);
    } else {
      state = valOrFunction
    }
    if (willRerender === false) {
      willRerender = true;
      setTimeout(rerender, 0);
    }
  }];
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement); 
root.render(
  <App />
)
