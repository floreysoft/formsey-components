import { Components, getLibrary, Settings } from '@formsey/core/Components';
import { FieldDefinition, StringFieldDefinition } from '@formsey/core/FieldDefinitions';
import { InvalidErrors } from '@formsey/core/InvalidEvent';
import "@vaadin/vaadin-text-field/vaadin-password-field";
import { PasswordFieldElement } from '@vaadin/vaadin-text-field/vaadin-password-field';
import { customElement, html, query } from "lit-element";
import { ifDefined } from 'lit-html/directives/if-defined';
import { InputField } from './InputField';

@customElement("formsey-password-vaadin")
export class PasswordField extends InputField<StringFieldDefinition, string> {
  @query("vaadin-password-field")
  vaadinField: PasswordFieldElement

  renderField(customValidity: string) {
    return html`<vaadin-password-field style="display:flex" label="${ifDefined(this.definition.label)}" .revealButtonHidden="${this.settings?.['hideRevealPasswordButton']}" .helperText="${this.definition.helpText as string}" ?autofocus="${this.definition.autofocus}" ?required="${this.definition.required}" autocomplete="${ifDefined(this.definition.autocomplete)}" @input="${this.inputted}" @change="${this.changed}" name="${this.definition.name}" placeholder="${ifDefined(this.definition.placeholder)}" error-message="${ifDefined(customValidity)}" maxlength="${ifDefined(this.definition.maxlength)}" ?disabled="${this.definition.disabled}" pattern="${ifDefined(this.definition.pattern)}" preventinvalidinput="true" .value="${this.value ? this.value : ''}"></vaadin-password-field>`
  }
}

getLibrary("vaadin").registerComponent("password", {
  importPath: "@formsey/fields-vaadin/PasswordField",
  factory: (components: Components, settings: Settings, definition: FieldDefinition, value: string, parentPath: string, errors: InvalidErrors, changeHandler: any, invalidHandler: any, id?: string) => {
    return html`<formsey-password-vaadin id="${ifDefined(id)}" .components=${components} .settings=${settings} .definition=${definition} .value=${value} .parentPath=${parentPath} .errors=${errors} @change="${changeHandler}" @input="${changeHandler}" @inputChange="${changeHandler}" @invalid=${invalidHandler}></formsey-password-vaadin>`
  }
})