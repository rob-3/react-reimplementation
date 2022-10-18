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
        root.append(...reactTreeToDOM(reactRoot));
      }
    }
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
)
