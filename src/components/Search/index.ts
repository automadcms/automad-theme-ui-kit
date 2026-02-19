/*!
 * Automad Theme UI Kit
 *
 * © 2026 Marc Anton Dahmen
 * Licensed under the MIT license
 */

import { BaseComponent } from '@/BaseComponent';
import { create, debounce } from '@/utils';
import iconSearch from '@/icons/search.svg';

const parseTemplateProps = (template: string): string[] => {
	const matches = [
		...Array.from(template.matchAll(/\{\{([^\}]+)\}\}/g)).map((m) =>
			m[1].trim()
		),
	];

	const props = matches.reduce((prev, current) => {
		prev = [...prev, ...current.split('|').map((m) => m.trim())];

		return prev;
	}, []);

	return props;
};

const renderTemplate = (
	template: string,
	data: Record<string, string>
): string => {
	return template.replaceAll(/\{\{([^\}]+)\}\}/g, (match, p1) => {
		const fields = p1.split('|').map((m: string) => m.trim());

		for (let i = 0; i < fields.length; i++) {
			if (data[fields[i]]) {
				return data[fields[i]];
			}
		}

		return '';
	});
};

class SearchComponent extends BaseComponent {
	static TAG_NAME = 'ui-search';

	private toggle: HTMLElement = null;

	private dialog: HTMLDialogElement = null;

	private form: HTMLElement = null;

	private input: HTMLInputElement = null;

	private resultTemplate: string = null;

	private noResultsHtml: string = null;

	private results: HTMLElement = null;

	private props: string[] = [];

	private api: string;

	private key: string;

	private context: string;

	private selectedIndex = 0;

	private classLoading = '';

	private classSelected = '';

	connectedCallback(): void {
		this.api = this.getAttribute('src') || '';
		this.context = this.getAttribute('context') || '';
		this.key = this.getAttribute('key') || 'k';

		this.removeAttribute('src');
		this.removeAttribute('context');

		setTimeout(this.init.bind(this), 0);
	}

	private init(): void {
		this.initElements();

		this.props = parseTemplateProps(this.resultTemplate);
		this.search();
		this.initKeyHandlers();

		this.toggle.addEventListener('click', this.show.bind(this));
		this.toggle.addEventListener('keydown', (event: KeyboardEvent) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				this.show();
			}
		});

		this.input.addEventListener('input', debounce(this.search.bind(this)));

		window.addEventListener('keydown', (event: KeyboardEvent) => {
			if (event.ctrlKey || event.metaKey) {
				if (event.key === this.key) {
					event.preventDefault();
					this.show();
				}
			}
		});
	}

	private initElements(): void {
		this.toggle =
			this.querySelector<HTMLElement>(SearchToggleComponent.TAG_NAME) ||
			create(
				'span',
				['search-toggle'],
				{ title: `Ctrl + ${this.key}` },
				this,
				iconSearch
			);

		const dialogComponent = this.querySelector<HTMLElement>(
			SearchDialogComponent.TAG_NAME
		);

		this.classLoading = dialogComponent?.getAttribute('class:loading');
		this.dialog = create(
			'dialog',
			[dialogComponent?.className || 'ui-search__dialog'],
			{ closedby: 'any' },
			this
		);

		this.form =
			this.querySelector<HTMLElement>(SearchFormComponent.TAG_NAME) ??
			create('div', ['ui-search__form'], {});

		this.dialog.appendChild(this.form);

		this.input =
			this.querySelector<HTMLInputElement>('input') ||
			create('input', [], { type: 'search' }, this.form);

		this.results =
			this.querySelector<HTMLElement>(SearchResultsComponent.TAG_NAME) ||
			create('div', ['ui-search__results'], {});

		this.dialog.appendChild(this.results);

		const resultTemplate = this.results.querySelector(
			SearchResultsEachComponent.TAG_NAME
		);

		this.resultTemplate =
			resultTemplate?.innerHTML ||
			`
				<a href="{{ url }}" class="ui-search__results-item">
					<div class="ui-search__results-title">{{ title }}</div>
					<small class="ui-search__results-description">{{ :searchResultsContext | +hero | +main }}</small>
				</a>
			`;

		this.classSelected =
			resultTemplate?.getAttribute('class:selected') ||
			'ui-search__results-item--selected';

		resultTemplate?.remove();

		const noResultsWrapper = this.results.querySelector<HTMLElement>(
			SearchNoResultsComponent.TAG_NAME
		);

		this.noResultsHtml = noResultsWrapper?.innerHTML || 'Nothing found.';

		noResultsWrapper?.remove();

		dialogComponent?.remove();
	}

	private show(): void {
		this.dialog.showModal();
		this.input.focus();
	}

	private async requestApi(
		config: { key: string; value: string }[] = []
	): Promise<Record<string, string>[]> {
		const params = new URLSearchParams();

		params.append('shorten', '250');
		params.append('limit', '100');
		params.append('sort', ':searchResultsCount desc, :index asc');
		params.append('fields', this.props.join(','));

		config.forEach((c) => {
			params.append(c.key, c.value);
		});

		const response = await fetch(`${this.api}?${params.toString()}`);
		const { data } = await response.json();

		return Object.values(data) ?? [];
	}

	private async getDefaultResults(): Promise<Record<string, string>[]> {
		const items = await this.requestApi([
			{ key: 'type', value: 'related' },
			{ key: 'context', value: this.context },
		]);

		if (items.length) {
			return items;
		}

		return await this.requestApi();
	}

	private async search(): Promise<void> {
		this.dialog.classList.add(this.classLoading);

		const search = this.input.value.replace(/[^\w\s]+/g, ' ').trim();
		const items =
			search.length < 2
				? await this.getDefaultResults()
				: await this.requestApi([{ key: 'search', value: search }]);

		this.dialog.classList.remove(this.classLoading);

		this.results.innerHTML =
			(items.reduce((html, result: any, index: number) => {
				return `${html}${renderTemplate(this.resultTemplate, { ...result, index })}`;
			}, '') as string) || this.noResultsHtml;

		this.selectedIndex = 0;
		this.updateSelected();
	}

	private initKeyHandlers(): void {
		this.dialog.addEventListener('keydown', (event: KeyboardEvent) => {
			const count = this.results.children.length;

			switch (event.key) {
				case 'ArrowUp':
					event.preventDefault();
					this.selectedIndex =
						this.selectedIndex > 0
							? this.selectedIndex - 1
							: count - 1;
					break;
				case 'ArrowDown':
					event.preventDefault();
					this.selectedIndex =
						this.selectedIndex < count - 1
							? this.selectedIndex + 1
							: 0;
					break;
				case 'Enter':
					window.location.href =
						(
							this.results.children[
								this.selectedIndex
							] as HTMLAnchorElement
						)?.href ?? '';
					break;
			}

			this.updateSelected();
		});
	}

	private updateSelected(): void {
		const selected = this.results.children[this.selectedIndex];

		selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

		Array.from(
			this.results.querySelectorAll(`.${this.classSelected}`)
		).forEach((r) => {
			r.classList.remove(this.classSelected);
		});

		selected?.classList.add(this.classSelected);
	}
}

class SearchToggleComponent extends BaseComponent {
	static TAG_NAME = 'ui-search-toggle';
}

class SearchDialogComponent extends BaseComponent {
	static TAG_NAME = 'ui-search-dialog';
}

class SearchResultsComponent extends BaseComponent {
	static TAG_NAME = 'ui-search-results';
}

class SearchFormComponent extends BaseComponent {
	static TAG_NAME = 'ui-search-form';
}

class SearchResultsEachComponent extends BaseComponent {
	static TAG_NAME = 'ui-search-results-each';

	connectedCallback(): void {
		this.style.display = 'none';
	}
}

class SearchNoResultsComponent extends BaseComponent {
	static TAG_NAME = 'ui-search-no-results';

	connectedCallback(): void {
		this.style.display = 'none';
	}
}

customElements.define(SearchComponent.TAG_NAME, SearchComponent);
customElements.define(SearchToggleComponent.TAG_NAME, SearchToggleComponent);
customElements.define(SearchDialogComponent.TAG_NAME, SearchDialogComponent);
customElements.define(SearchFormComponent.TAG_NAME, SearchFormComponent);
customElements.define(SearchResultsComponent.TAG_NAME, SearchResultsComponent);
customElements.define(
	SearchResultsEachComponent.TAG_NAME,
	SearchResultsEachComponent
);
customElements.define(
	SearchNoResultsComponent.TAG_NAME,
	SearchNoResultsComponent
);
