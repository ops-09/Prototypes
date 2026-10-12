<!-- AUTO-GENERATED — do not edit — run npm run sync:ods-docs -->

# Ontario Design System — Component API

Extracted from `@ongov/ontario-design-system-component-library/dist/types/components.d.ts` (Components namespace).

Use only props listed below. If a prop is not listed, do not use it.

## OntarioAccordion

Ontario Accordion presents collapsible sections of content.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/accordions.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-accordion/

**Official links:**
- https://designsystem.ontario.ca/components/detail/accordions.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-accordion/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `accordionData` | `string | Accordion[]` | yes | Used to include individual accordion data for the accordion component. Accepts an array of Accordion (@see Accordion) items or a JSON string of that array.  The `content` is rendered either as plain text or HTML depending on `accordionContentType`. |
| `expandCollapseButton` | `string | ExpandCollapseButtonDetails` | no | Custom Expand/Collapse button text. |
| `language` | `Language` | no | The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If none are passed, it will default to English. |
| `name` | `string` | yes | The name of the accordion component.  This is not optional. |

## OntarioAside

Ontario Aside is used for related, non-essential information that supports content beside the main task flow.
For component selection guidance, see:
- https://designsystem.ontario.ca/components/detail/callouts-asides.html
- https://designsystem.ontario.ca/components/detail/page-alerts.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-aside/

**Official links:**
- https://designsystem.ontario.ca/components/detail/callouts-asides.html
- https://designsystem.ontario.ca/components/detail/page-alerts.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-aside/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | `string` | no | Optional text to be displayed as the content for the aside component. If a string is passed, it will automatically be nested in a paragraph tag.  HTML content can also be passed as the child/children of the aside component if additional/different elements for the content are needed. |
| `headingContent` | `string` | no | Text or HTML to be displayed as the heading of the aside. If the heading content should be displayed as HTML, the `headingContentType` needs to be set to `html`. |
| `headingContentType` | `HeadingContentType` | yes | The type of the heading content. If no prop is passed, it will default to string. |
| `headingType` | `HeadingLevelOptions` | no | The heading level of the aside heading. |
| `highlightColour` | `HighlightColourOptions` | no | Optional prop to choose the border colour of the aside. If none is passed, the default colour will be teal. |

## OntarioBackToTop

Ontario Back to Top helps users quickly return to the top of long pages.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/back-to-top.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-back-to-top/

**Official links:**
- https://designsystem.ontario.ca/components/detail/back-to-top.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-back-to-top/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `language` | `Language` | no | The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If no language prop is passed, it will default to English. |

## OntarioBadge

Ontario Badge displays concise status labels and metadata.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/badges.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-badge/

**Official links:**
- https://designsystem.ontario.ca/components/detail/badges.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-badge/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `ariaLabelText` | `string` | no | An aria label for screen readers.  Used to provide more context to screen readers if necessary.  This property is optional. |
| `colour` | `BadgeColour` | yes | The colour of the badge. |
| `label` | `string` | yes | The label for the badge.  Offical guidance is to keep the label length within 15 characters. |

## OntarioBlockquote

Ontario Blockquote displays quoted content with optional attribution.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/blockquote.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-blockquote/

**Official links:**
- https://designsystem.ontario.ca/components/detail/blockquote.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-blockquote/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `attribution` | `string` | no | Optional text to be displayed as the attribution (the author) of the quote. |
| `byline` | `string` | no | Optional text to be displayed for additional information about the attribution/author. |
| `quote` | `string` | yes | Text to be displayed as the quote.  Note that wrapping the quotes in quotations is not needed - this is handled through the component styles |

## OntarioButton

Ontario Button triggers actions and supports button or link behavior.
This component intentionally does not expose a `disabled` prop.
To support accessible and understandable form completion:
- keep actions available
- use validation and error messaging to guide corrections instead of disabling
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/buttons.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-button/
Disabled/read-only policy source:
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

**Official links:**
- https://designsystem.ontario.ca/components/detail/buttons.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-button/
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `ariaLabelText` | `string` | no | Provides more context as to what the button interaction is doing. This should only be used for accessibility purposes, if the button interaction requires more description than what the text provides.   This is optional. |
| `elementId` | `string` | no | The unique identifier of the button. This is optional - if no ID is passed, one will be generated. |
| `href` | `string` | no | When provided, the component renders as a native anchor for navigation use cases. This takes precedence over `htmlType`, so form-submission behaviour is disabled in link mode. |
| `htmlType` | `HtmlType` | yes | The native HTML button type the button should use.  If no `htmlType` is passed, it will default to `'button'`. This prop only affects the component when it renders as a native `<button>`. If `href` is provided, the component renders as a native `<a>` and `htmlType` is ignored. |
| `label` | `string` | no | Text to be displayed within the button. This will override the text provided through the host element textContent. |
| `rel` | `string` | no | Specifies the relationship of the linked document to the current document when `href` is provided. This prop has no effect unless the component is in link mode. |
| `target` | `string` | no | Specifies where to open the linked document when `href` is provided. This prop has no effect unless the component is in link mode. |
| `type` | `ButtonType` | yes | The type of button to render.  If no type is passed, it will default to 'secondary'. |

## OntarioCallout

Ontario Callout is used for supplementary, in-flow guidance that supports nearby content without elevating to a page-level alert.
For component selection guidance, see:
- https://designsystem.ontario.ca/components/detail/callouts-asides.html
- https://designsystem.ontario.ca/components/detail/page-alerts.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-callout/

**Official links:**
- https://designsystem.ontario.ca/components/detail/callouts-asides.html
- https://designsystem.ontario.ca/components/detail/page-alerts.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-callout/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | `string` | no | Optional text to be displayed as the content for the callout component. If a string is passed, it will automatically be nested in a paragraph tag.  HTML content can also be passed as the child/children of the callout component if additional/different elements for the content are needed. |
| `headingContent` | `string` | no | Text or HTML to be displayed as the heading of the callout. If the heading content should be displayed as HTML, the `headingContentType` needs to be set to `html`. |
| `headingContentType` | `HeadingContentType` | yes | The type of the heading content. If no prop is passed, it will default to `string`. |
| `headingType` | `HeadingLevelOptions` | no | The heading level of the callout heading. |
| `highlightColour` | `HighlightColourOptions` | no | Optional prop to choose the border colour of the callout. If none is passed, the default colour will be teal. |

## OntarioCard

Ontario Card displays linked content summaries with optional media and metadata.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/cards.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-card/

**Official links:**
- https://designsystem.ontario.ca/components/detail/cards.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-card/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `ariaLabelText` | `string` | no | Provides more context as to what the card interaction is doing. This should only be used for accessibility purposes, if the card interaction requires more * * description than what the text provides.  This is optional. |
| `cardLink` | `string` | no | Action link for when the card is clicked.  This is optional. |
| `description` | `string` | no | Text to be displayed within the card description container.  This is optional. |
| `headerColour` | `HeaderColour` | no | Set the card's header colour.  This is optional. |
| `headingLevel` | `HeadingLevel` | yes | The heading level that the label will be rendered as. |
| `horizontalImagePositionType` | `HorizontalImagePositionType` | no | The position of the image when the card-type is set to 'horizontal'.  This prop is only necessry when the card-type is set to 'horizontal'. |
| `horizontalImageSizeType` | `HorizontalImageSizeType` | no | The size of the image when the card-type is set to 'horizontal'.  This prop is only necessry when the card-type is set to 'horizontal'. |
| `image` | `string` | no | Image to be displayed within the card image container.  This is optional. |
| `imageAltText` | `string` | no | Alt text for the card's image.  This is optional prop, but may be required for an image due to accessibility requirements.  You can find guidance on when to add alt text to an image on the Ontario.ca web content editing guide.  https://www.ontario.ca/page/ontario-ca-web-content-editing-guide#alt-text-image-accessibility  Note: This should default to an empty string ('') to ensure the alt attribute appears in the markup for decorative images. If left as undefined, the alt attribute will not render in markup. |
| `label` | `string` | yes | Text to be displayed within the header. |
| `layoutDirection` | `LayoutDirection` | no | The layout direction/orientation of the card.  If no type is passed, it will default to 'vertical'. |

## OntarioCardCollection

Ontario Card Collection lays out multiple cards in a responsive grid.
For component guidance, see:
- https://designsystem.ontario.ca/developer-docs/components/ontario-card-collection/

**Official links:**
- https://designsystem.ontario.ca/developer-docs/components/ontario-card-collection/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `cardsPerRow` | `CardsPerRow` | yes | The number of cards to display per row.  If no number is passed, it will default to 3. |

## OntarioCheckboxes

Ontario Checkboxes collects one or more selections from a defined option set.
This component intentionally does not expose group-level `readOnly` or `disabled` props.
To support accessible and understandable form completion:
- keep options and submission actions available
- use validation and error messaging to guide corrections
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/checkboxes.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-checkboxes/
Disabled/read-only policy source:
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

**Official links:**
- https://designsystem.ontario.ca/components/detail/checkboxes.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-checkboxes/
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `caption` | `Caption | string` | yes | The text to display for the checkbox legend. |
| `customOnBlur` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the checkbox onBlur event. |
| `customOnChange` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the checkbox onChange event. |
| `customOnFocus` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the checkbox onFocus event. |
| `errorMessage` | `string` | no | Set this to display an error message |
| `hintExpander` | `HintExpander | string` | no | Used to include the ontario-hint-expander component for the checkbox group. This is passed in as an object with key-value pairs.  This is optional. |
| `hintText` | `string | Hint` | no | Used to include the ontario-hint-text component for the checkbox group. This is optional. |
| `language` | `Language` | no | The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If no language is passed, it will default to English. |
| `name` | `string` | yes | The name for the checkboxes. The name value is used to reference form data after a form is submitted. |
| `options` | `CheckboxOption[] | string` | yes | The options for the checkbox group.  Each property will be passed in through an object in the options array. This can either be passed in as an object directly (if using react), or as a string in HTML. If there are multiple checkboxes in a fieldset, each checkbox will be displayed as an option.  In the example below, the options are being passed in as a string and there are two checkboxes to be displayed in the fieldset. |
| `required` | `boolean` | no | This is used to determine whether the checkbox is required or not. This prop also gets passed to the InputCaption utility to display either an optional or required flag in the label. If no prop is set, it will default to false (optional). |
| `value` | `string[] | string` | no | The currently selected checkbox option values.  The component keeps the host `value` in sync as users interact with the checkbox group. If `value` is provided, it takes precedence over any `checked` flags passed through `options`.  In HTML, pass `value` as a JSON string array. |

## OntarioCriticalAlert

Ontario Critical Alert communicates urgent, high-priority emergency information.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/critical-alerts.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-critical-alert/

**Official links:**
- https://designsystem.ontario.ca/components/detail/critical-alerts.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-critical-alert/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | `string | HTMLElement` | yes | Content for critical alert message. It can be either string or HTML content. The content is already wrapped in a paragraph tag, so if using HTML content, the paragraph tag can be ommitted. |

## OntarioDateInput

Ontario Date Input captures day, month, and year values as a single date field.
This component intentionally does not expose `readOnly` or `disabled` props.
To support accessible and understandable form completion:
- keep form fields and submission actions available
- use validation and error messaging to guide corrections
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/dates.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-date-input/
Disabled/read-only policy source:
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

**Official links:**
- https://designsystem.ontario.ca/components/detail/dates.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-date-input/
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `caption` | `Caption | string` | yes | The text to display as the input label |
| `dateOptions` | `string | Array<DateInputFieldType>` | no | An array value used to display date options. For example, only the day and month fields can be displayed by specifying the dateOptions as `["day", "month"]`, etc.  This is optional. If no prop for `dateOptions` is passed, it will default to `["day", "month", "year"]`. |
| `dateValidator` | `(day: string, month: string, year: string) => DateValidatorReturnType` | no | A function used to override internal date validation logic, which takes three arguments (i.e day, month and year) and returns an object of type `DateValidatorReturnType`  This is optional. If no prop for `dateValidator` is passed, it will default to internal validation function to validate the date input. |
| `elementId` | `string` | no | The unique identifier of the input. This is optional - if no ID is passed, one will be generated. |
| `hintText` | `string` | no | Used to include the ontario-hint-text component for the date input group.  This is optional. |
| `language` | `Language` | no | The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If none are passed, it will default to English. |
| `maxYear` | `number` | no | A number value indicating maximum value allowed for year input field of the date component.  This is optional. If no prop is passed, it will default to `9999`. |
| `minYear` | `number` | no | A number value indicating minimum value allowed for year input field of the date component.  This is optional. If no prop is passed, it will default to `999`. |
| `placeholder` | `DateInputPlaceholder | string` | no | An object value used to set the placeholder text for the day, month and year input fields. Any combination of the three input fields (i.e day, month, year) of the date component can be overridden.  This is optional. If no prop is passed, it will not display any placeholder text. |
| `required` | `boolean` | no | A boolean value to determine whether or not the date input is required.  This is optional. If no prop is passed, it will default to `false`. |
| `value` | `string` | no | The aggregate date value for the component.  Accepts either a plain ISO date (`YYYY-MM-DD`) or a full ISO 8601 timestamp. When a valid value is provided, the component hydrates the internal day, month, and year fields and normalizes the stored form value to a full UTC ISO timestamp (`YYYY-MM-DDT00:00:00.000Z`). |

## OntarioDropdownList

Ontario Dropdown List presents a selectable list of predefined options.
This component intentionally does not expose `readOnly` or `disabled` props.
To support accessible and understandable form completion:
- keep form fields and submission actions available
- use validation and error messaging to guide corrections
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/dropdown-lists.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-dropdown-list/
Disabled/read-only policy source:
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

**Official links:**
- https://designsystem.ontario.ca/components/detail/dropdown-lists.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-dropdown-list/
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `caption` | `Caption | string` | yes | The text to display for the dropdown list label. |
| `customOnBlur` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the dropdown onBlur event. |
| `customOnChange` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the dropdown onChange event. |
| `customOnFocus` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the dropdown onFocus event. |
| `elementId` | `string` | no | The ID for the dropdown list. If no ID is provided, one will be generated. |
| `errorMessage` | `string` | no | Set this to display an error message |
| `hintExpander` | `HintExpander | string` | no | Used to include the ontario-hint-expander component for the dropdown list component. This is passed in as an object with key-value pairs.  This is optional. |
| `hintText` | `string | Hint` | no | Used to include the ontario-hint-text component for the dropdown list. This is optional. |
| `isEmptyStartOption` | `boolean | string` | no | This prop is used to determine whether or not the initial option displayed is empty. If set to `true`, it will render the default “select” text. If set to a string, it will render the string value. |
| `language` | `Language` | no | The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If no language is passed, it will default to English. |
| `name` | `string` | yes | The name for the dropdown list. The name value is used to reference form data after a form is submitted. |
| `options` | `string | DropdownOption[]` | yes | The options for dropdown list.  Each option will be passed in through an object in the options array. This can either be passed in as an object directly (if using react), or as a string in HTML.  In the example below, the options are being passed in as a string and there are three dropdown options displayed. |
| `required` | `boolean` | no | This is used to determine whether the dropdown list is required or not. This prop also gets passed to the InputCaption utility to display either an optional or required flag in the label. If no prop is set, it will default to false (optional). |
| `value` | `string` | no | The currently selected dropdown value.  The component keeps the host `value` in sync as users interact with the dropdown. If `value` is provided, it takes precedence over any `selected` flags passed through `options`. |

## OntarioFieldset

Ontario Fieldset groups related form controls under a shared legend.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/fieldsets.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-fieldset/

**Official links:**
- https://designsystem.ontario.ca/components/detail/fieldsets.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-fieldset/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `legend` | `string` | yes | The text value used for the legend of the fieldset. |
| `legendSize` | `CaptionType` | yes | The size of the fieldset legend. If no prop is passed, it will be `default`. |

## OntarioFooter

Ontario Footer renders simple or expanded footer patterns for Ontario sites and applications.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/simple-footer.html
- https://designsystem.ontario.ca/components/detail/expanded-footer.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-footer/

**Official links:**
- https://designsystem.ontario.ca/components/detail/simple-footer.html
- https://designsystem.ontario.ca/components/detail/expanded-footer.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-footer/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `assetBasePath` | `string` | yes | The base path to an assets folder containing the Design System assets |
| `footerLinks` | `FooterLinks | string` | yes | A prop that stores the required links for all footers. Available options are 'accessibilityLink', 'privacyLink', 'contactLink','termsOfUseLink' and 'printerLink' |
| `language` | `Language` | yes | The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If no language is passed, it will default to English. |
| `socialLinks` | `FooterSocialLinksProps | string` | yes | Social media links to render in the footer. Available options are 'facebook', 'twitter', 'instagram' and 'youtube' |
| `threeColumnOptions` | `ThreeColumnOptions | string` | no | Stores the titles and content for the expanded three column footer. |
| `topMargin` | `boolean` | yes | Top margin for the footer. By default, this prop is set to `true`, which adds a margin top value of `5rem`. If set to `false`, the top margin value will be set to zero. |
| `twoColumnOptions` | `TwoColumnOptions | string` | no | Stores the titles and content for the expanded two column footer. |
| `type` | `OntarioFooterType` | yes | The type of footer to be rendered. If no prop is provided, it will default to the 'default' type. |

## OntarioFormContainer

Ontario Form Container applies consistent spacing between grouped form elements.
For component guidance, see:
- https://designsystem.ontario.ca/developer-docs/components/ontario-form-container/

**Official links:**
- https://designsystem.ontario.ca/developer-docs/components/ontario-form-container/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `gap` | `'default' | 'condensed'` | yes | Defines the gap (bottom margin) between slotted form elements. If no gap prop is provided, it will default to 'default'. |

## OntarioHeader

Ontario Header renders Ontario.ca, application, and ServiceOntario header variants.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/ontario-header.html
- https://designsystem.ontario.ca/components/detail/application-header.html
- https://designsystem.ontario.ca/components/detail/service-ontario-header.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-header/

**Official links:**
- https://designsystem.ontario.ca/components/detail/ontario-header.html
- https://designsystem.ontario.ca/components/detail/application-header.html
- https://designsystem.ontario.ca/components/detail/service-ontario-header.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-header/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `applicationHeaderInfo` | `ApplicationHeaderInfo | string` | yes | Information pertaining to the application and ServiceOntario headers.  For the 'application' header type, this includes the application name, URL and optional props for the number of links in the subheader for desktop, tablet, and mobile views.  For the 'serviceOntario' header type, the 'title' property is used as the service name displayed in the subheader. |
| `assetBasePath` | `string` | yes | The base path to an assets folder containing the Design System assets |
| `customLanguageToggle` | `(event: globalThis.Event) => void` | no | A custom function to pass to the language toggle button. |
| `customSignInToggle` | `(event: globalThis.Event) => void` | no | A custom function to pass to the sign-in button. |
| `disableDynamicMenu` | `boolean` | yes | Option to disable fetching of the dynamic menu from the Ontario Header API.  When set to true, the static `menuItems` prop will be used instead of fetching from the API. When set to false (default), menu items are fetched dynamically from the Ontario Header API endpoint.  This property only applies to the 'ontario' header type. The 'application' and 'serviceOntario' types always use static menu items. |
| `language` | `Language` | no | The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If none is passed, it will default to English. |
| `languageToggleOptions` | `LanguageToggleOptions | string` | no | Information pertaining to the language toggle links. |
| `menuItems` | `MenuItem[] | string` | yes | The items that will go inside the menu dropdown.  For the 'ontario' header type, these items are displayed in the overflow menu. If `disableDynamicMenu` is false, static items will be overridden by dynamically fetched items from the Ontario Header API.  For the 'application' and 'serviceOntario' header types, these items are displayed in the subheader menu and overflow menu. |
| `signInMenuItems` | `MenuItem[] | string` | no | Information pertaining to the sign-in menu items for the Ontario header. |
| `type` | `OntarioHeaderType` | no | The type of header. |

## OntarioHeaderMenuTabs

Ontario Header Menu Tabs provides mobile and tablet tabbed navigation for header menus.
- Displays two tabs (Topics and Sign In) with overflow menu content.
- Manages keyboard navigation, focus trapping, and accessibility.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/ontario-header.html
- https://designsystem.ontario.ca/components/detail/application-header.html
- https://designsystem.ontario.ca/components/detail/service-ontario-header.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-header-menu-tabs/

**Official links:**
- https://designsystem.ontario.ca/components/detail/ontario-header.html
- https://designsystem.ontario.ca/components/detail/application-header.html
- https://designsystem.ontario.ca/components/detail/service-ontario-header.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-header-menu-tabs/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `autoDetectMode` | `boolean` | no | Enable auto-detect handoff mode. |
| `focusActiveTabOnOpen` | `boolean` | yes | Whether focus should move to the active tab when the menu opens. This should only be true for keyboard-triggered opens. |
| `language` | `Language` | no | The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If none is passed, it will default to English. |
| `signInMenuItems` | `MenuItem[] | string` | yes | Menu items for the "Sign In" tab. Can be passed as a MenuItem array or JSON string. |
| `topicsMenuItems` | `MenuItem[] | string` | yes | Menu items for the "Topics" tab. Can be passed as a MenuItem array or JSON string. |

## OntarioHeaderOverflowMenu

Ontario Header Overflow Menu displays overflow navigation links for header contexts.
It can operate in two modes:
### Standalone Mode
Used when placed directly in the header (desktop view).
- Manages its own open/close state via `menuButtonToggled` event
- Automatically focuses first menu item when opened
- Sets up focus trap to keep keyboard navigation within menu
- Auto-closes when focus leaves the menu area
- **Emits**: `menuClosed` event when menu closes (for cleanup/state sync)
### Embedded Mode
Used when placed inside `ontario-header-menu-tabs` (mobile/tablet view).
- Parent component controls open/close state
- Parent component manages focus trap
- Menu is always visible when parent tab is active
- **Emits**: `endOfMenuReached` event when Tab is pressed on last item (for focus looping)
### Mode Detection
- Auto-detected based on DOM position (no prop needed).
- Checks if ancestor is `ontario-header-menu-tabs` or `.ontario-mobile-menu__panel`.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/ontario-header.html
- https://designsystem.ontario.ca/components/detail/application-header.html
- https://designsystem.ontario.ca/components/detail/service-ontario-header.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-header-overflow-menu/

**Official links:**
- https://designsystem.ontario.ca/components/detail/ontario-header.html
- https://designsystem.ontario.ca/components/detail/application-header.html
- https://designsystem.ontario.ca/components/detail/service-ontario-header.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-header-overflow-menu/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `focusFirstItemOnOpen` | `boolean` | no | Whether the standalone menu should move focus to the first item when opened. This should only be true for keyboard-triggered opens. |
| `isLastMenu` | `boolean` | no | Whether this is the last menu in a series of menus. If true, Tab from last item goes to next element on page. If false, Tab from last item emits focusNextElement for header to handle. |
| `language` | `Language` | no | The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If none is passed, it will default to English. |
| `menuItems` | `MenuItem[] | string` | yes | The menu items to display. Can be passed as a MenuItem array or JSON string.  The items that will go inside the menu. |
| `returnFocusToTriggerOnLastTab` | `boolean` | no | Whether Tab from the last menu item should return focus to the trigger button instead of moving to the next menu or next page element. |

## OntarioHintExpander

Ontario Hint Expander reveals optional supporting guidance on demand.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/hint-text.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-hint-expander/

**Official links:**
- https://designsystem.ontario.ca/components/detail/hint-text.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-hint-expander/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | `string` | yes | Content to display as the hint, once the expander is toggled open. Please note that any content that is passed into this prop will only be displayed as a string. If you would like to add HTML content, supply child content to the component. |
| `elementId` | `string` | no | Used to used to establish a relationship between hint text content and elements using aria-describedby. This is optional - if no ID is passed, one will be generated. |
| `hint` | `string` | yes | Text to display as the hint expander question/statement |
| `hintContentType` | `HintContentType` | no | The content type of the hint. If no prop is passed, it will default to a string. If the hint requires multiple lines or HTML, the `hintContentType` prop should be set to `html`. |

## OntarioHintText

Ontario Hint Text provides concise supporting instructions for form controls.
Use hint text to help users understand how to complete fields in a form.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/hint-text.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-hint-text/

**Official links:**
- https://designsystem.ontario.ca/components/detail/hint-text.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-hint-text/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `elementId` | `string` | no | The unique identifier of the element. This is optional - if no ID is passed, one will be generated. |
| `getHintTextId` | `() => Promise<string | undefined>` | yes | This method returns the ontario-hint-text id. It is used to make sure the hint text and `aria-describedby` value of other form components match when the internal hint text props are used. |
| `hint` | `string` | yes | Text to display as the hint text statement.  Setting the hint can be done using the host element textContent or through setting this property.  This property will take precedence. |
| `hintContentType` | `HintContentType` | no | The content type of the hint. If no prop is passed, it will default to a string. If the hint requires multiple lines or HTML, the `hintContentType` prop should be set to `html`. |

## OntarioInput

Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconAccount {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconAdd {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconAddAlt {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconAlertError {
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconAlertInformation {
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconAlertSuccess {
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconAlertWarning {
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconArrowUp {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconAttach {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconBookmarkOff {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconBookmarkOn {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconCalendar {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconCamera {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconChevronDown {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconChevronLeft {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconChevronRight {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconChevronUp {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconClock {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconClose {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconCloseHeader {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconCloud {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconCollapse {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconCreditCard {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconCriticalAlertWarning {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconDelete {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconDocument {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconDownload {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconDropdownArrow {
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconEdit {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconEmail {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconExpand {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconExport {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconFacebook {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconFacebookAlt {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconFavouriteOff {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconFavouriteOn {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconFilter {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconFlickr {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconGrid {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconHelp {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconInstagram {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconInteracEn {
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconInteracEnAlt {
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconInteracFr {
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconInteracFrAlt {
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconLinkedin {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconLinkedinAlt {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconList {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconLiveChat {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconLocationOff {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconLocationOn {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconLockOff {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconLockOn {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconMap {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconMastercard {
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconMastercardAlt {
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconMediaFastForward {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconMediaFastRewind {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconMediaPause {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconMediaPlay {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconMediaStop {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconMenu {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconMenuHeader {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconMicrophoneOff {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconMicrophoneOn {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconMoreAccounts {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconMoreVertical {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconNewWindow {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconNext {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconNotification {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconPasswordHide {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconPasswordShow {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconPhone {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconPhoto {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconPinLocationOff {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconPinLocationOn {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconPrevious {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconPrint {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconRemove {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconRemoveAlt {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconReplay {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconRssFeed {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSave {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSearch {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSearchWhite {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSentiment1 {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSentiment2 {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSentiment3 {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSentiment4 {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSentiment5 {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSettings {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconShare {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSort {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSortAlphabeticalAscending {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSortAlphabeticalDescending {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSortAscending {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSortDescending {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconSortVariant {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconTag {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconTextMessage {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconTimer {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconTransportBicycle {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconTransportBus {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconTransportCar {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconTransportWalk {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconTty {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconTune {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconTwitter {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconTwitterAlt {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconUpload {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconVideo {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconVisa {
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconVoteDislike {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconVoteLike {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconVpnKey {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconWheelchair {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconWifi {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
interface OntarioIconYoutube {
/**
Set the icon's colour.
@default 'black'
/
colour: IconColour;
/**
The icon width will autogenerate the height since the icons are in square format, thus preserving the aspect ratio.
@default 24
/
iconWidth: IconSize;
/**
Whether the icon is decorative and should be hidden from assistive technologies. When set to true, the icon will have aria-hidden="true" and role="img" will be removed from the SVG element. When set to false (default), the icon is exposed to assistive technologies with role="img".
@default false
/
isDecorative: boolean;
}
/**
Ontario Input captures single-line text input.
This component intentionally does not expose `readOnly` or `disabled` props.
To support accessible and understandable form completion:
- keep form fields and submission actions available
- use validation and error messaging to guide corrections
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/text-inputs.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-input/
Disabled/read-only policy source:
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

**Official links:**
- https://designsystem.ontario.ca/components/detail/text-inputs.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-input/
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `caption` | `Caption | string` | yes | The text to display as the input label |
| `customOnBlur` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the input onBlur event. |
| `customOnChange` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the input onChange event. |
| `customOnFocus` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the input onFocus event. |
| `customOnInput` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the input onInput event. |
| `elementId` | `string` | no | The unique identifier of the input. This is optional - if no ID is passed, one will be generated. |
| `enableLiveValidation` | `boolean` | yes | Enable live validation on the input.  Custom live validation can be performed using an `inputValidator` validation function.  It will also validate the `required` state if no errors are returned from the `inputValidator`.  Please set a `requiredValidationMessage` to report concisely to the end user what they are required to set. |
| `errorMessage` | `string` | no | Set this to display an error message. |
| `hintExpander` | `HintExpander | string` | no | Used to include the ontario-hint-expander component for the input component. This is passed in as an object with key-value pairs.  This is optional. |
| `hintText` | `string | Hint` | no | Used to include the ontario-hint-text component for the input. This is optional. |
| `inputValidator` | `(value?: string) => Promise<{ errorMessage?: string } | null | undefined>` | no | Validate the validity of the input value `onBlur`.  This `async` function should return a result to trigger an error message.  Returning `undefined` or `null` will clear it. |
| `language` | `Language` | no | The width of the input field. If no value is assigned, it will present as the `default` input width. / inputWidth: \| '2-char-width' \| '3-char-width' \| '4-char-width' \| '5-char-width' \| '7-char-width' \| '10-char-width' \| '20-char-width' \| 'default'; /** The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If no language is passed, it will default to English. |
| `name` | `string` | yes | The name assigned to the input. The name value is used to reference form data after a form is submitted. |
| `required` | `boolean` | no | This is used to determine whether the input is required or not. This prop also gets passed to the InputCaption utility to display either an optional or required flag in the label. If no prop is set, it will default to false (optional).  _Please add a validation messaging using `requiredValidationMessage` if setting this property._ |
| `requiredValidationMessage` | `string` | yes | Custom error message to display if a required field is not filled out.  _Please add a custom message when setting an input as required_. |
| `type` | `'text' | 'tel' | 'email' | 'password'` | yes | The input type value.  If no `type` is provided, it will default to 'text'. |
| `value` | `string` | no | The input content value.  This is optional. |

## OntarioLanguageToggle

Ontario Language Toggle switches the interface between supported languages.
For component guidance, see:
- https://designsystem.ontario.ca/developer-docs/components/ontario-language-toggle/

**Official links:**
- https://designsystem.ontario.ca/developer-docs/components/ontario-language-toggle/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `customLanguageToggle` | `(event: globalThis.Event) => void` | no | A custom function to pass to the language toggle button.  This is optional. |
| `language` | `Language` | no | The language of the component.  In most cases, the language toggle should be the source of truth for determining the site language.  Only pass a language value here if necessary. |
| `size` | `'default' | 'small'` | no | The size of the language toggle button.  If no prop is passed, it will be set to the `default` size. |
| `url` | `string` | no | The URL to change to when the language toggle button is clicked.  This is optional. |

## OntarioLoadingIndicator

Ontario Loading Indicator communicates in-progress loading states.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/loading-indicator.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-loading-indicator/

**Official links:**
- https://designsystem.ontario.ca/components/detail/loading-indicator.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-loading-indicator/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `fullScreenOverlay` | `boolean` | no | A boolean value to determine whether the loading indicator overlay covers the full page or not. By default, this is set to `true`.  If set to `false`, the loading indicator overlay will be positioned absolutely relative to its container. Note that this will only work if the containing element has a style rule specifying it to be positioned relatively. |
| `isLoading` | `boolean` | yes | A boolean value to determine whether or not the loading indicator is loading (i.e: is visible) or not. |
| `language` | `Language` | no | The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If no language is passed, it will default to English. |
| `message` | `string` | no | The message that tells the user what is happening or why the user is waiting. If no message prop is passed, it will default to "Loading". Translations for this default message are included.  This is optional. |
| `type` | `'small' | 'large'` | yes | The type of loading indicator to render. |

## OntarioPageAlert

Ontario Page Alert is used for high-importance status messages that apply to the whole page
(for example informational, warning, success, or error outcomes).
For component selection guidance, see:
- https://designsystem.ontario.ca/components/detail/page-alerts.html
- https://designsystem.ontario.ca/components/detail/callouts-asides.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-page-alert/

**Official links:**
- https://designsystem.ontario.ca/components/detail/page-alerts.html
- https://designsystem.ontario.ca/components/detail/callouts-asides.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-page-alert/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | `string` | yes | The main content for the page alert. This can be rendered as either string or HTML content. |
| `heading` | `string` | yes | The heading for the page alert. |
| `type` | `PageAlertType` | yes | The type of page alert to render. If no value is provided, the `informational` type alert would be rendered.  There are four possible values for page alert: `informational`, `warning`, `success` or `error`. |

## OntarioRadioButtons

Ontario Radio Buttons captures a single choice from a defined option set.
This component intentionally does not expose group-level `readOnly` or `disabled` props.
To support accessible and understandable form completion:
- keep options and submission actions available
- use validation and error messaging to guide corrections
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/radio-buttons.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-radio-buttons/
Disabled/read-only policy source:
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

**Official links:**
- https://designsystem.ontario.ca/components/detail/radio-buttons.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-radio-buttons/
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `caption` | `Caption | string` | yes | The text to display for the radio button legend. |
| `customOnBlur` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the radio input onBlur event. |
| `customOnChange` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the radio input onChange event. |
| `customOnFocus` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the radio input onFocus event. |
| `errorMessage` | `string` | no | Set this to display an error message |
| `hintExpander` | `HintExpander | string` | no | Used to include the ontario-hint-expander component for the radio button group. This is passed in as an object with key-value pairs.  This is optional. |
| `hintText` | `string | Hint` | no | Used to include the ontario-hint-text component for radio button group. This is optional. |
| `language` | `Language` | no | The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If no language is passed, it will default to English. |
| `name` | `string` | yes | The name assigned to the radio button. The name value is used to reference form data after a form is submitted. |
| `options` | `string | RadioOption[]` | yes | The options for the radio button group.  Each property will be passed in through an object in the options array. This can either be passed in as an object directly (if using react), or as a string in HTML. If there are multiple radio buttons in a group, each radio button will be displayed as an option.  In the example below, the options are being passed in as a string and there are two radio buttons to be displayed in the group. |
| `required` | `boolean` | no | This is used to determine whether the radio button is required or not. This prop also gets passed to the InputCaption utility to display either an optional or required flag in the label. If no prop is set, it will default to false (optional). |
| `value` | `string` | no | The currently selected radio option value.  The component keeps the host `value` in sync as users interact with the radio group. If `value` is provided, it takes precedence over any `checked` flags passed through `options`. |

## OntarioSearchBox

Ontario Search Box captures and submits search queries.
This component intentionally does not expose `readOnly` or `disabled` props.
To support accessible and understandable form completion:
- keep form fields and submission actions available
- use validation and error messaging to guide corrections
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/search-box.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-search-box/
Disabled/read-only policy source:
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

**Official links:**
- https://designsystem.ontario.ca/components/detail/search-box.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-search-box/
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `caption` | `Caption | string` | yes | The text to display as the input label |
| `customOnBlur` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the input onBlur event. |
| `customOnChange` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the input onChange event. |
| `customOnFocus` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the input onFocus event. |
| `customOnInput` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the input onInput event. |
| `elementId` | `string` | no | The unique identifier of the search-box component. This is optional - if no ID is passed, one will be generated. |
| `hintText` | `string | Hint` | no | Used to include the ontario-hint-text component for the search-box. This is optional. |
| `language` | `Language` | no | The language of the component. This is used for translations. If none is passed, it will default to English. |
| `performSearch` | `(value?: string) => Promise<void>` | no | This Function to perform a search operation. This function will be called when the search submit button is triggered. The value argument is used for as search term to use for the search operation. This parameter is optional. The performSearch prop can be set dynamically using JavaScript, allowing you to define custom search functionality when the search form is submitted. |
| `required` | `boolean` | no | This is used to determine whether the dropdown list is required or not. This prop gets passed to the InputCaption utility to display either an optional or required flag in the label. If no prop is set, it will default to false (optional). |
| `value` | `string` | no | The value of the search term. This is optional. |

## OntarioStepIndicator

Ontario Step Indicator communicates progress through multi-step flows.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/step-indicator.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-step-indicator/

**Official links:**
- https://designsystem.ontario.ca/components/detail/step-indicator.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-step-indicator/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `backButtonUrl` | `string` | no | URL for the back element to set a path for where the link will lead.  If a URL is passed in, the back element will display as an anchor tag. The back element will require either the backButtonURL prop or the customOnClick prop to be passed in order for the back element to display. |
| `currentStep` | `number` | no | A number value to indicate which step the user is currently on. |
| `customOnClick` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the back button onClick event.  If this function is passed in, the back element will display as a button. The back element will require either the backButtonURL prop or the customOnClick prop to be passed in order for the back element to display. |
| `language` | `Language` | no | The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If none are passed, it will default to English. |
| `numberOfSteps` | `number` | no | A number value to indicate to the user the total number of steps the form has. |
| `percentageComplete` | `number` | no | A number value to indicate to the user the percentage of the form that has been completed. |
| `showBackButton` | `boolean` | no | A boolean value to determine whether or not the back button is displayed for the step indicator.  This is optional. If no prop is passed, it will default to `false`. |

## OntarioTable

Ontario Table presents structured tabular data with accessible semantics.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/tables.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-table/

**Official links:**
- https://designsystem.ontario.ca/components/detail/tables.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-table/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `caption` | `string | undefined` | no | Specifies the caption (or title) of the table.  This is optional. |
| `condensed` | `boolean | undefined` | no | Used to specify whether or not table data in cells should have reduced top and bottom padding. This is useful for pages with multiple data-heavy tables such as a budget or financial data.  This is optional. By default it will be set to “false”. |
| `fullWidth` | `boolean | undefined` | no | Used to specify whether or not the table should extend the full width of its container.  This is optional. By default, it will be set to “false” |
| `tableColumns` | `string | TableColumnOptions[]` | yes | Used to define the columns of the table. |
| `tableData` | `string | TableRowOptions[]` | yes | Used to define the table body data. Note that the keys passed to the `data` object in the tableData should match the keys of the columns defined in the tableColumns prop. |
| `zebraStripes` | `'auto' | 'disabled' | 'enabled' | undefined` | no | Indicates whether or not the table data should have alternate row zebra striping.  This is optional. By default, zebra striping will be added when the table rows extend 5 rows. If zebra striping is needed to table rows less than 5 rows, the prop should be set to “enabled”. If no zebra stripes are needed, it should be set to “disabled”.  The default will be set to “auto”. |

## OntarioTask

Ontario Task represents an individual task item and status within a task list.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/task-list.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-task/

**Official links:**
- https://designsystem.ontario.ca/components/detail/task-list.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-task/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `deactivateLink` | `boolean` | yes | Disables the task link when set to `true`.  Default is `false`, meaning the link will be active if provided. |
| `headingLevel` | `TaskHeadingLevel` | yes | Allows consumers to define the heading level for the task label.  Accepts 'h2', 'h3' or 'h4'. Default is 'h3'. |
| `hintText` | `string | Hint` | no | Used to include the ontario-hint-text component for the task.  This is optional. |
| `label` | `string` | yes | Specifies the label of the task.  This is required to provide the name of the task. |
| `language` | `Language` | no | The language of the component.  This is used for translations, and is by default set through event listeners checking for a language property from the header. If no language is passed, it will default to English. |
| `link` | `string` | no | Specifies an optional link associated with the task.  If provided, clicking the task will navigate to this URL. |
| `taskId` | `string` | yes | A unique id for the task.  This is required. |
| `taskStatus` | `TaskStatuses` | yes | Defines the status of the task, with default set to 'NotStarted'.  Accepts values from `TaskStatuses` enum: `NotStarted`, `InProgress`, `Completed`, etc. |

## OntarioTaskList

Ontario Task List groups and summarizes related tasks.
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/task-list.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-task-list/

**Official links:**
- https://designsystem.ontario.ca/components/detail/task-list.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-task-list/

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `headingLevel` | `TaskListHeadingLevel` | yes | Allows consumers to define the heading level for the task list component.  Accepts 'h1', 'h2', 'h3' or 'h4'. Default is 'h2'. |
| `label` | `string` | yes | The label prop used for the task list heading. |
| `language` | `Language` | no | The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If none are passed, it will default to English. |

## OntarioTextarea

Ontario Textarea captures multi-line text input.
This component intentionally does not expose `readOnly` or `disabled` props.
To support accessible and understandable form completion:
- keep form fields and submission actions available
- use validation and error messaging to guide corrections
For component guidance, see:
- https://designsystem.ontario.ca/components/detail/text-areas.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-textarea/
Disabled/read-only policy source:
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

**Official links:**
- https://designsystem.ontario.ca/components/detail/text-areas.html
- https://designsystem.ontario.ca/developer-docs/components/ontario-textarea/
- https://designsystem.ontario.ca/components/detail/buttons.html#disabled-buttons

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `caption` | `Caption | string` | yes | The text to display as the textarea label. |
| `customOnBlur` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the textarea onBlur event. |
| `customOnChange` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the textarea onChange event. |
| `customOnFocus` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the textarea onFocus event. |
| `customOnInput` | `(event: globalThis.Event) => void` | no | Used to add a custom function to the textarea onInput event. |
| `elementId` | `string` | no | The unique identifier of the textarea. This is optional - if no ID is passed, one will be generated. |
| `errorMessage` | `string` | no | Set this to display an error message |
| `hintExpander` | `HintExpander | string` | no | Used to include the ontario-hint-expander component for the textarea component. This is passed in as an object with key-value pairs.  This is optional. |
| `hintText` | `string | Hint` | no | Used to include the ontario-hint-text component for the textarea. This is optional. |
| `language` | `Language` | no | The language of the component. This is used for translations, and is by default set through event listeners checking for a language property from the header. If no language is passed, it will default to English. |
| `name` | `string` | yes | The name assigned to the textarea. The name value is used to reference form data after a form is submitted. |
| `required` | `boolean` | no | This is used to determine whether the textarea is required or not. This prop also gets passed to the InputCaption utility to display either an optional or required flag in the label. If no prop is set, it will default to false (optional). |
| `value` | `string` | no | The textarea content value. |

