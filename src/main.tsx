/** @jsxRuntime classic */
import App from './App'
import { reconcile } from './diff'
import './index.css'

type FunctionComponent = (props: any) => ReactElement

export type ReactElement = string | number | null | {
  type: string | FunctionComponent,
  props: {
    [key: string]: unknown,
    children: ReactElement[],
  },
}

export type StringNode = {
  kind: 'string',
  value: string,
  node?: Text,
}

export type NumberNode = {
  kind: 'number',
  value: number,
  node?: Text,
}

export type EvaluatedTree = null | StringNode | NumberNode | {
  kind: 'html',
  type: string,
  props: {
    [key: string]: unknown,
    children: EvaluatedTree[],
  },
  node?: HTMLElement,
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

const evaluateElement = (reactTree: ReactElement): EvaluatedTree => {
  if (reactTree === null) {
    return null;
  }

  if (typeof reactTree === 'string') {
    return {
      kind: 'string',
      value: reactTree,
    }
  }
  if (typeof reactTree === 'number') {
    return {
      kind: 'number',
      value: reactTree,
    }
  }

  const { type, props } = reactTree;
  if (typeof type ==='string') {
    const evaluatedChildren = props.children.map(evaluateElement);
    return {
      kind: 'html',
      type,
      props: {
        ...props,
        children: evaluatedChildren,
      }
    }
  }
  return evaluateElement(type(props));
}

export const renderTree = (reactTree: EvaluatedTree): HTMLElement | Text | null => {
  if (reactTree === null) {
    return null;
  }

  if (reactTree.kind === 'number' || reactTree.kind === 'string') {
    const textNode = document.createTextNode(reactTree.value.toString());
    reactTree.node = textNode;
    return textNode;
  }

  const { type, props } = reactTree;
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
  const domChildren = children.map(renderTree).filter((x): x is NonNullable<Text | HTMLElement> => !!x);
  element.append(...domChildren);
  reactTree.node = element;
  return element;
}

let oldTree: EvaluatedTree = null;
const ReactDOM = {
  createRoot: (root: HTMLElement) => {
    return {
      render: (reactRoot: ReactElement) => {
        if (!oldTree) {
          oldTree = evaluateElement(reactRoot);
          const renderedTree = renderTree(oldTree);
          if (renderedTree) {
            root.replaceChildren(renderedTree);
          }
        } else {
          const evaluatedTree = evaluateElement(reactRoot);
          reconcile(oldTree as Required<NonNullable<EvaluatedTree>>, evaluatedTree!);
          oldTree = evaluatedTree;
          /*
          const renderedTree = renderTree(evaluatedTree);
          if (renderedTree) {
            root.replaceChildren(renderedTree);
          }
          */
          console.log(evaluatedTree);
        }
      }
    }
  }
}


let state: any[] = [];
let hasUsedDefault: boolean[] = [];
let willRerender = false;
const rerender = () => { 
  index = 0;
  root.render(<App />)
  willRerender = false;
};

type Setter<T> = (t: T) => T;

let index = 0;
export const useState = <T,>(initialState: T): [T, (valueOrFunction: T | Setter<T>) => void] => {
  const i = index;
  index++;
  if (!hasUsedDefault[i]) {
    state[i] = initialState;
    hasUsedDefault[i] = true;
  }
  return [state[i], (valOrFunction: T | Setter<T>) => { 
    if (typeof valOrFunction === 'function') {
      state[i] = (valOrFunction as any)(state[i]);
    } else {
      state[i] = valOrFunction
    }
    if (willRerender === false) {
      willRerender = true;
      setTimeout(rerender, 0);
    }
  }];
}

export const useEffect = (f: () => (void | (() => void)), deps: unknown[]) => {
  const i = index;
  index++;
  if (!hasUsedDefault[i]) {
    state[i] = deps;
    hasUsedDefault[i] = true;
    setTimeout(f, 0);
  } else {
    const oldDeps = state[i];
    for (let i = 0; i < deps.length; i++) {
      if (oldDeps[i] !== deps[i]) {
        setTimeout(f, 0);
        break;
      }
    }
    state[i] = deps;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <App />
)
