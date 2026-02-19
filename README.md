# Automad Theme UI Kit

A collection of native and headless web components that can be used in Automad themes. No framework required.

<!-- vim-markdown-toc GFM -->

- [Installation](#installation)
- [Search Component](#search-component)
  - [Usage](#usage)
  - [Results Template](#results-template)
- [Theme Switcher](#theme-switcher)
  - [Usage](#usage-1)

<!-- vim-markdown-toc -->

---

## Installation

You can install the UI kit using your preferred NPM package manager.

```bash
npm i -D automad-theme-ui-kit
```

Components can be imported separately as needed.

## Search Component

The _Search_ component provides an easy way to integrate a search dialog with _type-ahead_ instant feedback.

### Usage

Before you can use the component, it must be imported in some way into your theme's JavaScript bundle. For example in your main `index.ts` you can import it as follows:

```typescript
import 'automad-theme-ui-kit/Search';
```

Now you can use the component in your _Automad_ template like this:

```html
<ui-search
  src="/_api/public/pagelist"
  context="@{ origUrl }"
  class="kit-search"
  key="k"
>
  <ui-search-toggle class="kit-search__toggle" title="Ctrl + k">
    Search
  </ui-search-toggle>
  <ui-search-dialog class="kit-search__dialog" class:loading="loading">
    <ui-search-form class="kit-search__form">
      <input class="kit-search__input" type="search" placeholder="Search ..." />
    </ui-search-form>
    <ui-search-results class="kit-search__results">
      <ui-search-results-each class:selected="selected">
        <a href="{{ url }}" class="kit-search__results-item">
          <div class="kit-search__results-title">{{ title }}</div>
          <small class="kit-search__results-description">
            {{ :searchResultsContext | +hero | +main }}
          </small>
        </a>
      </ui-search-results-each>
      <ui-search-no-results>Nothing found.</ui-search-no-results>
    </ui-search-results>
  </ui-search-dialog>
</ui-search>
```

The example above shows the structure of components that can be freely style in order to fit the design of your page.

### Results Template

You can use the `{{ variable }}` syntax inside the `<ui-search-results-each>` component in order to access page data for search results. A `|` character can be used to define fallback fields in case a field has no value.

```html
<small class="kit-search__results-description">
  {{ :searchResultsContext | +hero | +main }}
</small>
```

Here we look for the `:searchResultsContext` field which gives us the searched term including surrounding context. When a search dialog opens and before we type anything into the search field, this field will be empty. In that case the `+hero` field is used and the `+main` field finally.

## Theme Switcher

The _ThemeSwitcher_ component provides a simple toggle for switching between light and dark mode. A user's selections is persisted in the browser's local storage.

### Usage

First, import the component into your bundle.

```typescript
import 'automad-theme-ui-kit/ThemeSwitcher';
```

Then add it to your _Automad_ template like this:

```html
<ui-theme-switcher>
  <ui-theme-switcher-label-dark>Dark</ui-theme-switcher-label-dark>
  <ui-theme-switcher-label-light>Light</ui-theme-switcher-label-light>
</ui-theme-switcher>
```

The switcher will add either the `light` or the `dark` class to the main `html` element according to the user's selection or browser settings.

Labels that indicate the active mode can be defined using the `<ui-theme-switcher-label-light>` and `<ui-theme-switcher-label-dark>` components as shown in the above example.

---

© 2026 Marc Anton Dahmen, MIT license
