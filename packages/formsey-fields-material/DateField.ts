import { DateFieldDefinition, Field } from '@formsey/core';
import { Components, getLibrary, Settings } from '@formsey/core/Components';
import { FieldDefinition } from '@formsey/core/FieldDefinitions';
import { InvalidError, InvalidErrors, InvalidEvent } from '@formsey/core/InvalidEvent';
import "@material/mwc-textfield/mwc-textfield.js";
import { TextField, TextFieldType } from "@material/mwc-textfield/mwc-textfield.js";
import { css, customElement, html, property, query } from "lit-element";
import { ifDefined } from 'lit-html/directives/if-defined.js';

@customElement("formsey-date-material")
export class DateField extends Field<DateFieldDefinition, string> {
  @property({ type: String })
  value: string;

  @query("mwc-textfield")
  materialTextField: TextField

  static get styles() {
    return [...super.styles, css`
    mwc-textfield {
      width: 100%;
    }
  `]
  }

  renderField(customValidity : string) {
    return html`<mwc-textfield label="${this.definition.label}" helper="${ifDefined(this.definition.helpText)}" type="${this.type}" ?autofocus="${this.definition.autofocus}" ?required="${this.definition.required}" autocomplete="${this.definition.autocomplete}" validationmessage="${ifDefined(customValidity)}" @input="${this.changed}" @invalid="${this.invalid}" name="${this.definition.name}" placeholder="${ifDefined(this.definition.placeholder)}" min="${ifDefined(this.definition.max)}" max="${ifDefined(this.definition.max)}"  step="${ifDefined(this.definition.step)}" ?disabled="${this.definition.disabled}" .value="${this.value ? this.value : ''}" ></mwc-textfield>`;
  }

  firstUpdated() {
    this.materialTextField.validityTransform = (newValue, nativeValidity) => {
      const error = this.errors.get(this.path())
      if (error) {
        return {
          valid: false,
          validationMessage: error.validityMessage,
          ...error.validityState
        }
      }
      return nativeValidity;
    }
  }

  validate(report: boolean) {
    if (report) {
      return this.materialTextField.reportValidity() as boolean
    } else {
      return this.materialTextField.checkValidity() as boolean
    }
  }

  invalid() {
    let validityState: ValidityState = this.materialTextField.validity
    for (let key in validityState) {
      if (!validityState[key]) {
        delete validityState[key]
      }
    }
    let validationMessage = this.materialTextField.validationMessage
    if (validityState['validationMessage']) {
      validationMessage = validityState['validationMessage']
      delete validityState['validationMessage']
    }
    this.errors.set(this.path(), new InvalidError(validationMessage, false, validityState))
    this.dispatchEvent(new InvalidEvent(this.errors))
  }

  protected get type() : TextFieldType {
    return "date"
  }
}

getLibrary("material").registerComponent("date", {
  importPath: "@formsey/fields-material/DateField",
  factory: (components: Components, settings: Settings, definition: FieldDefinition, value: string, parentPath: string, errors: InvalidErrors, changeHandler: any, invalidHandler: any, id?: string) => {
    return html`<formsey-date-material id="${ifDefined(id)}" .components=${components} .settings=${settings} .definition=${definition} .value=${value} .parentPath=${parentPath} .errors=${errors} @change="${changeHandler}" @input="${changeHandler}" @inputChange="${changeHandler}" @invalid=${invalidHandler}></formsey-date-material>`
  }
})