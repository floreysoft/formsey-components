import { TextFieldDefinition } from '@formsey/core';
import "@vaadin/vaadin-text-field/vaadin-text-area.js";
import { customElement, html, property } from 'lit-element';
import { ifDefined } from "lit-html/directives/if-defined";
import { VaadinField } from './VaadinField';

@customElement("formsey-text-vaadin")
export class TextField extends VaadinField<TextFieldDefinition, string> {
  @property()
  value: string;

  renderField() {
    return html`<vaadin-text-area style="display:flex" @input="${this.valueChanged}" name="${this.definition.name}" placeholder="${ifDefined(this.definition.placeholder)}" .value="${ifDefined(this.value)}"></vaadin-text-area>`;
  }
}
