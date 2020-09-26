import { Field, register, StringFieldDefinition } from '@formsey/core';
import { Components, Settings } from '@formsey/core/Components';
import { FieldDefinition } from '@formsey/core/FieldDefinitions';
import { InvalidError, InvalidErrors, InvalidEvent } from '@formsey/core/InvalidEvent';
import "@material/mwc-textarea/mwc-textarea.js";
import { TextArea } from "@material/mwc-textarea/mwc-textarea.js";
import { css, html } from "lit-element";
import { property, query } from "lit-element/lib/decorators.js";
import { ifDefined } from 'lit-html/directives/if-defined.js';

export class TextField extends Field<StringFieldDefinition, string> {
  @property({ type: String })
  value: string;

  @query("mwc-textarea")
  materialTextArea: TextArea

  static get styles() {
    return [...super.styles, css`
    mwc-textarea {
      width: 100%;
    }
  `]
  }

  render() {
    return html`<mwc-textarea label="${this.definition.label}" helper="${ifDefined(this.definition.helpText)}" ?autofocus="${this.definition.autofocus}" ?required="${this.definition.required}" autocomplete="${ifDefined(this.definition.autocomplete)}" @input="${this.changed}" @invalid="${this.invalid}" name="${this.definition.name}" placeholder="${ifDefined(this.definition.placeholder)}" .maxlength="${this.definition.maxlength}" .value="${this.value ? this.value : ''}"></mwc-textarea>`;
  }

  focusField(path: string) {
    if ( path == this.definition.name ) {
      this.materialTextArea.focus()
    }
  }
  firstUpdated() {
    this.materialTextArea.validityTransform = (newValue, nativeValidity) => {
      if (this.errors[this.definition.name] && this.errors[this.definition.name].custom) {
        return {
          valid: false,
          validityMessage: this.errors[this.definition.name].validityMessage,
          ...this.errors[this.definition.name].validityState
        };
      }
      return nativeValidity;
    }
  }

  validate(report: boolean) {
    if (report) {
      return this.materialTextArea.reportValidity() as boolean
    } else {
      return this.materialTextArea.checkValidity() as boolean
    }
  }

  invalid() {
    let validityState: ValidityState = this.materialTextArea.validity
    for (let key in validityState) {
      if (!validityState[key]) {
        delete validityState[key]
      }
    }
    let validityMessage = this.materialTextArea.validationMessage
    let customError = false
    if (validityState['validityMessage']) {
      validityMessage = validityState['validityMessage']
      delete validityState['validityMessage']
      customError = true
    }
    this.errors[this.definition.name] = new InvalidError(validityMessage, customError, validityState)
    this.dispatchEvent(new InvalidEvent(this.errors))
  }
}

register({
  type: "text",
  tag: "formsey-text-material",
  constructor: TextField,
  libraries: ["material" ],
  importPath: "@formsey/fields-material/TextField",
  factory: (components: Components, settings: Settings, definition: FieldDefinition, value: Object, parentPath: string, errors: InvalidErrors, changeHandler: any, invalidHandler: any, id?: string) => {
    return html`<formsey-text-material id="${ifDefined(id)}" .components=${components} .settings=${settings} .definition=${definition} .value=${value} .parentPath=${parentPath} .errors=${errors} @change="${changeHandler}" @input="${changeHandler}" @inputChange="${changeHandler}" @invalid=${invalidHandler}></formsey-text-material>`
  }
})