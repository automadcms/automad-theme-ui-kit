/*
 * Automad Theme UI Kit
 *
 * © 2026 Marc Anton Dahmen
 * Licensed under the MIT license
 */

export const create = (
	tag: string,
	classes: string[] = [],
	attributes: object = {},
	parent: HTMLElement | null = null,
	innerHTML: string = null,
	prepend: boolean = false
): any => {
	const element = document.createElement(tag);

	classes.forEach((cls) => {
		element.classList.add(cls);
	});

	for (const [key, value] of Object.entries(attributes)) {
		element.setAttribute(key, value);
	}

	if (parent) {
		if (prepend) {
			parent.prepend(element);
		} else {
			parent.appendChild(element);
		}
	}

	if (innerHTML) {
		element.innerHTML = innerHTML;
	}

	return element;
};

export const debounce = (
	callback: (...args: any[]) => void,
	timeout: number = 200
): ((...args: any[]) => void) => {
	let timer: any;

	return (...args: any[]) => {
		clearTimeout(timer);

		timer = setTimeout(() => {
			callback.apply(this, args);
		}, timeout);
	};
};
