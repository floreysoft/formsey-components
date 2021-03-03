import { Field } from '@formsey/core/Field';
import { TextFieldDefinition } from '@formsey/core/FieldDefinitions';
import { InvalidError, InvalidEvent } from '@formsey/core/InvalidEvent';
import { getLibrary, Resources } from '@formsey/core/Registry';
import "@vaadin/vaadin-checkbox/vaadin-checkbox-group.js";
import "@vaadin/vaadin-checkbox/vaadin-checkbox.js";
import { TextAreaElement } from '@vaadin/vaadin-text-field/vaadin-text-area';
import "@vaadin/vaadin-text-field/vaadin-text-area.js";
import { html } from "lit";
import { customElement, property, query } from "lit/decorators";
import { ifDefined } from 'lit/directives/if-defined';

@customElement("formsey-text-vaadin")
export class TextField extends Field<TextFieldDefinition, string> {
  @property({ type: String })
  value: string;

  @query("vaadin-text-area")
  vaadinTextArea: TextAreaElement

  render() {
    const customValidity = this.errors.get(this.path())?.validityMessage || this.definition.customValidity
    return html`<vaadin-text-area style="display:flex" label="${ifDefined(this.definition.label)}" .helperText="${this.definition.helpText}" ?autofocus="${this.definition.autofocus}" ?required="${this.definition.required}" autocomplete="${ifDefined(this.definition.autocomplete)}" @input="${this.inputted}" @change="${this.changed}" name="${this.definition.name}" placeholder="${ifDefined(this.definition.placeholder)}" error-message="${ifDefined(customValidity)}" maxlength="${ifDefined(this.definition.maxlength)}" ?disabled="${this.definition.disabled}" pattern="${ifDefined(this.definition.pattern)}" preventinvalidinput="true" .value="${this.value ? this.value : ''}"></vaadin-text-area>`;
  }

  focusField(path: string) {
    if ( path == this.definition.name ) {
      this.vaadinTextArea.focus()
    }
  }

  validate(report: boolean) {
    this.valid = report ? this.vaadinTextArea.validate() : this.vaadinTextArea.checkValidity() as boolean
    if (!this.valid) {
      this.invalid()
    }
    return this.valid
  }

  invalid() {
    this.errors[this.definition.name] = new InvalidError(this.vaadinTextArea.errorMessage, false, { })
    this.dispatchEvent(new InvalidEvent(this.errors))
  }

}

getLibrary("vaadin").registerComponent("text", {
  importPath: "@formsey/fields-vaadin/TextField",
    template: ( { library, context, settings, definition, value, parentPath, errors, changeHandler, invalidHandler, id } : Resources<TextFieldDefinition, string> ) => {
    return html`<formsey-text-vaadin id="${ifDefined(id)}" .library=${library} .settings=${settings} .definition=${definition} .context=${context} .value=${value} .parentPath=${parentPath} .errors=${errors} @change="${changeHandler}" @input="${changeHandler}" @inputChange="${changeHandler}" @invalid=${invalidHandler}></formsey-text-vaadin>`
  }
})