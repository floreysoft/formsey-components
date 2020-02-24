import { createField, Field, ValueChangedEvent, NestedFormDefinition } from '@formsey/core';
import { css, customElement } from 'lit-element';

@customElement("formsey-nested-form")
export class NestedFormField extends Field<NestedFormDefinition, Object> {
  static get styles() {
    return [...super.styles, css`
      :host {

      }`];
  }

  renderField() {
    if ( !this.value ) {
      this.value = this.definition.default ? this.definition.default : {}
    }
    return createField(this.configuration, { ...this.definition.form, name: this.definition.name }, this.value, (event: ValueChangedEvent<any>) => this.valueChanged(event), null);
  }

  protected valueChanged(e: any) {
    e.stopPropagation()
    if (e.name) {
      this.value[e.name] = e.value;
      this.dispatchEvent(new ValueChangedEvent(this.definition.name, this.value));
    }
  }
}