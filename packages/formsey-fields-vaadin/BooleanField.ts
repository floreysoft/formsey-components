import { BooleanFieldDefinition, LabeledField, ValueChangedEvent } from '@formsey/core';
import { CheckboxElement } from "@vaadin/vaadin-checkbox";
import "@vaadin/vaadin-checkbox/vaadin-checkbox.js";
import "@vaadin/vaadin-checkbox/vaadin-checkbox-group.js";
import { css, customElement, html, property, query } from 'lit-element';

@customElement("formsey-boolean-vaadin")
export class BooleanField extends LabeledField<BooleanFieldDefinition, boolean> {
  @property({ type: Boolean })
  value: boolean;

  @query("vaadin-checkbox")
  private checkbox: CheckboxElement;

  static get styles() {
    return [...super.styles, css`
    vaadin-checkbox {
      font-family: var(--lumo-font-family);
      font-size: var(--lumo-font-size-m);
    }`]
  }

  renderField() {
    return html`<vaadin-checkbox-group label="${this.definition.prompt}" theme="vertical"><vaadin-checkbox @change="${(event) => this.valueChanged(event)}" .indeterminate="${this.definition.indeterminate}" .checked=${this.value}>${this.definition.prompt}</vaadin-checkbox></vaadin-checkbox-group>`;
  }

  renderHeader() {
    return
  }

  renderFooter() {
    return this.definition.helpText ? html`<div class="help-text">${this.definition.helpText}</div>` : undefined
  }

  protected valueChanged(e: any) {
    this.value = this.checkbox.checked;
    if ( this.definition.name ) {
      this.dispatchEvent(new ValueChangedEvent(this.definition.name, this.value));
    }
  }
}