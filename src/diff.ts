import { EvaluatedTree, renderTree } from "./main";

export const reconcile = (oldTree: EvaluatedTree, newTree: EvaluatedTree, parent: HTMLElement) => {
	if (!oldTree && !newTree) {
		return;
	}

	if (!oldTree) {
		parent.append(renderTree(newTree)!);
		return;
	}

	if (!newTree) {
		const oldNode = oldTree.node;
		oldNode?.parentElement?.removeChild(oldNode);
		return;
	}
	if (oldTree.kind !== newTree.kind) {
		newTree.node = renderTree(newTree)!;
		oldTree.node!.replaceWith(newTree.node);
		return;
	}
	if (oldTree.kind === 'string' && newTree.kind === 'string') {
		if (oldTree.value.toString() !== newTree.value.toString()) {
			oldTree.node!.textContent = newTree.value.toString();
		}
		newTree.node = oldTree.node;
		return;
	}
	if (oldTree.kind === 'number' && newTree.kind === 'number') {
		if (oldTree.value.toString() !== newTree.value.toString()) {
			oldTree.node!.textContent = newTree.value.toString();
		}
		newTree.node = oldTree.node;
		return;
	}
	if (oldTree.kind === 'html' && newTree.kind === 'html') {
		if (oldTree.type !== newTree.type) {
			newTree.node = renderTree(newTree) as HTMLElement;
			oldTree.node!.replaceWith(newTree.node!);
			return;
		}
		const { children, onClick, ...props } = newTree.props;
		const oldNode = oldTree.node!;
		for (const [key, value] of Object.entries(props)) {
			if (key.startsWith('__')) {
				continue;
			}
			if (oldTree.props[key] === value) {
				continue;
			}
			if (key === 'className') {
				oldNode.className = String(value);
			}
			oldNode.setAttribute(key, String(value));
		}
		oldTree.node!.removeEventListener('click', oldTree.props.onClick as EventListenerOrEventListenerObject);
		if (typeof onClick === 'function') {
			oldTree.node!.addEventListener('click', onClick as EventListenerOrEventListenerObject);
		}
		let i = 0;
		while (i < oldTree.props.children.length) {
			reconcile(oldTree.props.children[i], children[i], oldTree.node!);
			i++;
		}
		while (i < children.length) {
			const newNode = renderTree(children[i])!;
			oldTree.props.children[0]?.node!.parentElement?.appendChild(newNode);
			children[i]!.node = newNode;
			i++;
		}
		newTree.node = oldTree.node;
		return;
	}
}
