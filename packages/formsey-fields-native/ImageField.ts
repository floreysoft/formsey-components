import { customElement, html, property, css } from 'lit-element';
import { ImageFieldDefinition, LabeledField } from '@formsey/core';

@customElement("formsey-image")
export class ImageField extends LabeledField<ImageFieldDefinition, string> {
  @property({ converter: Object })
  definition: ImageFieldDefinition;

  static get styles() {
    return [...super.styles, css`
    div {
      width: 100%;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    `]
  }

  renderField() {
    return html`<div style="text-align: ${this.definition.align}"><img src="${this.definition.url}" title="${this.definition.prompt}" style="width: ${this.definition.width}"></div>`
  }
}