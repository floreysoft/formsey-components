import { ChangeEvent, CheckboxesFieldDefinition, createField, LabeledField, register, StringFieldDefinition } from '@formsey/core';
import { css, html, query, queryAll, TemplateResult } from 'lit-element';
import { StringField } from './StringField';

export class CheckboxesField extends LabeledField<CheckboxesFieldDefinition, string[]> {
  @query("formsey-string")
  otherTextField: StringField

  @queryAll("input[type=checkbox]")
  protected checkboxes: HTMLInputElement[]

  static get styles() {
    return [...super.styles, css`
    :host {
      display: flex;
      flex-direction: column;
    }
    label {
      font-family: var(--formsey-label-font-family, var(--formsey-font-family));
    }
    input[type="checkbox"] {
      width: 10px;
      height: 10px;
      margin: 0 5px 0 2px;
      transform: scale(1.5);
    }
    .other {
      display: grid;
      grid-template-columns: max-content minmax(10em,20em);
      grid-gap: 2em;
      align-items: center;
    }`]
  }

  renderField() {
    if (!this.value) {
      this.value = []
    }
    let templates: TemplateResult[] = [];
    if (this.definition.options) {
      for (let i = 0; i < this.definition.options.length; i++) {
        let option = this.definition.options[i]
        let label = option.label ? option.label : option.value;
        let value = option.value ? option.value : option.label;
        let checked = this.value.includes(value);
        templates.push(html`<div><label><input type="checkbox" .checked="${checked}" value="${value}" @change="${this.changed}">${label}</label></div>`);
      }
    }
    if (this.definition.other) {
      let other = this.value.filter(value => this.definition.options.filter(option => value == (option.value ? option.value : option.label)).length == 0)
      let checked = other.length > 0
      templates.push(html`<div class="other"><label><input type="checkbox" .checked="${checked}" name="${this.definition.name}" value="__other" @change="${this.changed}">Other</label>${createField(this.components, { type: "string", "name": "other", disabled: this.definition.disabled || !checked } as StringFieldDefinition, checked ? other[0] : "", null, (e) => this.changed(e), null)}</div>`);
    }
    let customValidity = this.definition.customValidity
    if (this.error && this.error.validityMessage) {
      customValidity = this.error.validityMessage
    }
    return html`${templates}`;
  }

  otherChanged(e: ChangeEvent<string>) {
    this.value = e.detail.value
    this.requestUpdate()
    if (this.definition.name) {
      this.dispatchEvent(new ChangeEvent(this.definition.name, this.value));
    }
  }

  changed(e: Event) {
    let values = []
    let other = false
    for (let value of this.values()) {
      if (value == "__other") {
        other = true
        this.otherTextField.definition.disabled = false
        values.push(this.otherTextField.value)
        this.otherTextField.requestUpdate()
        this.otherTextField.updateComplete.then(() => {
          this.otherTextField.focusField("other")
        })
      } else {
        values.push(value)
      }
    }
    if (!other && this.otherTextField) {
      this.otherTextField.value = ""
    }
    this.value = values
    if (this.definition.name) {
      this.dispatchEvent(new ChangeEvent(this.definition.name, this.value));
    }
  }

  private values(): string[] {
    let values = []
    this.checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        values.push(checkbox.value)
      }
    })
    return values;
  }
}
register("formsey-checkboxes", CheckboxesField)