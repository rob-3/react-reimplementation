import { EvaluatedTree, renderTree } from "./main";

export const reconcile = (oldTree: NonNullable<EvaluatedTree>, newTree: NonNullable<EvaluatedTree>) => {
	if (oldTree.kind !== newTree.kind) {
		newTree.node = renderTree(newTree)!;
		oldTree.node!.replaceWith(newTree.node);
		return;
	}
	if (oldTree.kind === 'string' && newTree.kind === 'string') {
		if (oldTree.value.toString() !== newTree.value.toString())
			oldTree.node!.textContent = newTree.value.toString();
		//oldTree.node!.parentElement!.innerText = newTree.value.toString();
		newTree.node = oldTree.node;
		return;
	}
	if (oldTree.kind === 'number' && newTree.kind === 'number') {
		if (oldTree.value.toString() !== newTree.value.toString())
			oldTree.node!.textContent = newTree.value.toString();
		//oldTree.node!.parentElement!.innerText = newTree.value.toString();
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
			if (oldTree.props[key] === value) {
				continue;
			}
			if (value === null || value === undefined) {
				continue;
			}
			if (key === 'className') {
				oldNode.className = value as string;
			}
			if (key.startsWith('__')) {
				continue;
			}
			oldNode.setAttribute(key, (value as any).toString());
		}
		oldTree.node!.removeEventListener('click', oldTree.props.onClick as EventListenerOrEventListenerObject);
		if (onClick) {
			oldTree.node!.addEventListener('click', onClick as EventListenerOrEventListenerObject);
		}
		let i = 0;
		while (i < oldTree.props.children.length) {
			/*
			const newNode = renderTree(children[i])!;
			oldTree.props.children[i]?.node!.replaceWith(newNode);
			children[i]!.node = newNode;
			i++;
			*/
			reconcile(oldTree.props.children[i]!, children[i]!);
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
