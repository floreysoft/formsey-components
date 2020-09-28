import { CheckboxesFieldDefinition, Option, register, ValueChangedEvent } from '@formsey/core';
import { Components, Settings } from '@formsey/core/Components';
import { FieldDefinition } from '@formsey/core/FieldDefinitions';
import { InvalidError, InvalidErrors, InvalidEvent } from '@formsey/core/InvalidEvent';
import "@material/mwc-checkbox/mwc-checkbox.js";
import "@material/mwc-formfield/mwc-formfield.js";
import { CheckboxGroupElement } from '@vaadin/vaadin-checkbox/vaadin-checkbox-group';
import "@vaadin/vaadin-checkbox/vaadin-checkbox-group.js";
import "@vaadin/vaadin-checkbox/vaadin-checkbox.js";
import '@vaadin/vaadin-combo-box/vaadin-combo-box.js';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { css, html, TemplateResult } from "lit-element";
import { property, query } from "lit-element";
import { ifDefined } from 'lit-html/directives/if-defined';
import { VaadinField } from './VaadinField';


export class CheckboxesField extends VaadinField<CheckboxesFieldDefinition, string[]> {
  @property({ converter: Object })
  value: string[] = []

  @query("vaadin-checkbox-group")
  private vaadinCheckboxGroup: CheckboxGroupElement;

  @query("vaadin-text-field")
  otherTextField: TextFieldElement

  static get styles() {
    return [...super.styles, css`
    :host {
      display: flex;
      flex-direction: column;
      font-family: var(--lumo-font-family);
    }
    vaadin-text-field {
      position: relative;
      top: -2.4em;
      margin-bottom: -2.4em;
      left: 5em;
      flex-grow: 1;
    }
    .other {
      margin-top: 0.4em;
      display: flex;
      flex-direction: row;
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
        let option = this.definition.options[i] as Option
        let label = option.label ? option.label : option.value;
        let value = option.value ? option.value : option.label;
        let checked = this.value.includes(value);
        templates.push(html`<vaadin-checkbox .checked="${checked}" value="${value}">${label}</vaadin-checkbox>`);
      }
    }
    if (this.definition.other) {
      let checked = this.value.filter(value => this.definition.options.filter(option => value == (option.value ? option.value : option.label)).length == 0).length > 0
      templates.push(html`<vaadin-checkbox .checked="${checked}" class="other" value="__other">Other</vaadin-checkbox><vaadin-text-field @input="${this.changed}" ?disabled="${this.definition.disabled || !checked}"></vaadin-text-field>`);
    }
    let customValidity = this.definition.customValidity
    if (this.error && this.error.validityMessage) {
      customValidity = this.error.validityMessage
    }
    return html`<vaadin-checkbox-group @change="${this.changed}" label="${ifDefined(this.definition.label)}" theme="vertical" ?required="${this.definition.required}" ?disabled="${this.definition.disabled}" error-message="${ifDefined(customValidity)}" >${templates}</vaadin-checkbox-group>`;
  }

  focusField(path: string) {
    if ( path == this.definition.name ) {
      this.vaadinCheckboxGroup.focus()
    }
  }

  changed(e: Event) {
    let values = []
    let other = false
    for (let value of this.vaadinCheckboxGroup.value) {
      if (value == "__other") {
        other = true
        values.push(this.otherTextField.value)
      } else {
        values.push(value)
      }
    }
    if (!other && this.otherTextField) {
      this.otherTextField.value = ""
    }
    this.value = values
    this.requestUpdate()
    if (this.definition.name) {
      this.dispatchEvent(new ValueChangedEvent("inputChange", this.definition.name, this.value));
    }
    if (other) {
      this.updateComplete.then(() => {
        this.otherTextField.focus()
      })
    }
  }

  validate(report: boolean) {
    this.valid = this.vaadinCheckboxGroup.validate() as boolean
    if (!this.valid) {
      this.invalid()
    }
    return this.valid
  }

  invalid() {
    this.errors[this.definition.name] = new InvalidError(this.vaadinCheckboxGroup.errorMessage, false, { })
    this.dispatchEvent(new InvalidEvent(this.errors))
  }
}

register({
  type: "checkboxes",
  tag: "formsey-checkboxes-vaadin",
  constructor: CheckboxesField,
  libraries: ["vaadin" ],
  importPath: "@formsey/fields-vaadin/CheckboxesField",
  factory: (components: Components, settings: Settings, definition: FieldDefinition, value: Object, parentPath: string, errors: InvalidErrors, changeHandler: any, invalidHandler: any, id?: string) => {
    return html`<formsey-checkboxes-vaadin id="${ifDefined(id)}" .components=${components} .settings=${settings} .definition=${definition} .value=${value} .parentPath=${parentPath} .errors=${errors} @change="${changeHandler}" @input="${changeHandler}" @inputChange="${changeHandler}" @invalid=${invalidHandler}></formsey-checkboxes-vaadin>`
  }
})