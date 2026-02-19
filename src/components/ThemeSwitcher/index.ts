/*!
 * Automad Theme UI Kit
 *
 * © 2026 Marc Anton Dahmen
 * Licensed under the MIT license
 */

import iconLight from '@/icons/light.svg';
import iconDark from '@/icons/dark.svg';
import { BaseComponent } from '@/BaseComponent';

type Theme = 'light' | 'dark';

const localStorageKey = 'ui-theme';

const getTheme = (): Theme => {
	const localScheme = localStorage.getItem(localStorageKey);

	if (localScheme) {
		return localScheme as Theme;
	}

	if (
		window.matchMedia &&
		window.matchMedia('(prefers-color-scheme: dark)').matches
	) {
		return 'dark';
	}

	return 'light';
};

class ThemeSwitcherComponent extends BaseComponent {
	static TAG_NAME = 'ui-theme-switcher';

	private labelLight = iconLight;

	private labelDark = iconDark;

	private toggleTheme(): void {
		const newTheme = getTheme() === 'light' ? 'dark' : 'light';

		localStorage.setItem(localStorageKey, newTheme);

		this.applyTheme(newTheme);
	}

	private applyTheme(theme: Theme): void {
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(theme);

		this.innerHTML = theme === 'light' ? this.labelDark : this.labelLight;
	}

	connectedCallback(): void {
		setTimeout(() => {
			const labelLightComponent = this.querySelector(
				ThemeSwitcherLabelLightComponent.TAG_NAME
			);

			if (labelLightComponent) {
				this.labelLight = labelLightComponent.innerHTML;
			}

			const labelDarkComponent = this.querySelector(
				ThemeSwitcherLabelDarkComponent.TAG_NAME
			);

			if (labelDarkComponent) {
				this.labelDark = labelDarkComponent.innerHTML;
			}

			this.applyTheme(getTheme());
			this.addEventListener('click', this.toggleTheme.bind(this));
		}, 0);
	}
}

class ThemeSwitcherLabelLightComponent extends BaseComponent {
	static TAG_NAME = 'ui-theme-switcher-label-light';

	connectedCallback(): void {
		this.style.display = 'none';
	}
}

class ThemeSwitcherLabelDarkComponent extends BaseComponent {
	static TAG_NAME = 'ui-theme-switcher-label-dark';

	connectedCallback(): void {
		this.style.display = 'none';
	}
}

customElements.define(ThemeSwitcherComponent.TAG_NAME, ThemeSwitcherComponent);
customElements.define(
	ThemeSwitcherLabelLightComponent.TAG_NAME,
	ThemeSwitcherLabelLightComponent
);
customElements.define(
	ThemeSwitcherLabelDarkComponent.TAG_NAME,
	ThemeSwitcherLabelDarkComponent
);
