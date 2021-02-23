import { StringFieldDefinition } from '@formsey/core';
import { Components, getLibrary, Resources, Settings } from '@formsey/core/Registry';
import { FieldDefinition } from '@formsey/core/FieldDefinitions';
import { InvalidErrors } from '@formsey/core/InvalidEvent';
import "@material/mwc-textfield/mwc-textfield.js";
import { TextField, TextFieldType } from "@material/mwc-textfield/mwc-textfield.js";
import { customElement, html, property, query } from "lit-element";
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { InputField } from './InputField';
@customElement("formsey-string-material")
export class StringField extends InputField<StringFieldDefinition, string> {
  @property({ type: String })
  value: string;

  @query("mwc-textfield")
  mwcTextField: TextField

  renderField(customValidity) {
    return html`<mwc-textfield label="${this.definition.label}" helper="${ifDefined(this.definition.helpText)}" type="${this.type}" ?autofocus="${this.definition.autofocus}" ?required="${this.definition.required}" autocomplete="${this.definition.autocomplete}" validationmessage="${ifDefined(customValidity)}" @change="${this.changed}" @input="${this.inputted}" @invalid="${this.invalid}" name="${this.definition.name}" placeholder="${ifDefined(this.definition.placeholder)}" maxlength="${ifDefined(this.definition.maxlength)}" pattern="${ifDefined(this.definition.pattern)}" ?disabled="${this.definition.disabled}" .value="${this.value && this.value.length > 0 ? this.value : ''}" ?charCounter="${!!this.definition.maxlength}"></mwc-textfield>`;
  }

  inputField() {
    return this.mwcTextField
  }

  protected get type() : TextFieldType {
    return "text"
  }
}

getLibrary("material").registerComponent("string", {
  importPath: "@formsey/fields-material/StringField",
    template: ( { library, context, settings, definition, value, parentPath, errors, changeHandler, invalidHandler, id } : Resources<StringFieldDefinition, string> ) => {
    return html`<formsey-string-material id="${ifDefined(id)}" .library=${library} .settings=${settings} .definition=${definition} .context=${context} .value=${value} .parentPath=${parentPath} .errors=${errors} @change="${changeHandler}" @input="${changeHandler}" @inputChange="${changeHandler}" @invalid=${invalidHandler}></formsey-string-material>`
  }
})