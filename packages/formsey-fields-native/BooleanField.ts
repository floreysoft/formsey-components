import { BooleanFieldDefinition, ValueChangedEvent, LabeledField, register } from '@formsey/core';
import { html, property, query } from 'lit-element';

export class BooleanField extends LabeledField<BooleanFieldDefinition, boolean> {
  @property({ type: Boolean })
  value: boolean;

  @query("#checkbox")
  checkbox: HTMLInputElement

  renderField() {
    return html`<label class="bfl"><input id="checkbox" type="checkbox" @click="${this.clicked}" @focus="${this.focused}" @blur="${this.blurred}" ?checked="${this.value}" @change="${ e => { console.log("C"); e.stopPropagation()}}" @input="${ e => { console.log("I"); e.stopPropagation()}}" ?required="${this.definition.required}">${this.definition.label}</label>`;
  }

  clicked(e) {
    this.value = this.checkbox.checked
    this.dispatchEvent(new ValueChangedEvent("change", this.definition.name, this.value));
  }

  firstUpdated() {
    this.checkbox.indeterminate = this.definition.indeterminate
  }

  focusField(path: string) {
     this.checkbox.focus()
  }
}
register("formsey-boolean", BooleanField, "native", "boolean", "@formsey/fields-native/BooleanField")
