import { Field, FieldDefinition } from '@formsey/core';
import { css, customElement, html, property } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';

@customElement("formsey-section")
export class SectionField extends Field<FieldDefinition, void> {
  @property({ converter: Object })
  definition: FieldDefinition;

  static get styles() {
    return [...super.styles, css`
    * {
      font-family: var(--lumo-font-family);
    }

    header {
      font-size: var(--lumo-font-size-xl);
      font-weight: normal;
      color: var(--lumo-primary-contrast-color);
      background-color: var(--lumo-primary-color);
      padding: var(--lumo-space-xs) var(--lumo-space-m);
      margin-top: var(--lumo-space-s);
      clip-path: polygon(5px 0, 100% 0%, calc(100% - 5px) 100%, 0% 100%);
    }

    footer {
      font-size: var(--lumo-font-size-m);
      font-weight: normal;
      color: var(--lumo-body-text-color);
      padding: var(--lumo-space-s) 0 0 0;
    }`]
  }

  renderField() {
    return html`<header>${ifDefined(this.definition.prompt)}</header><footer>${ifDefined(this.definition.helpText)}</footer>`
  }
}