import { ButtonFieldDefinition } from '@formsey/core/FieldDefinitions';
import { LabeledField } from '@formsey/core/LabeledField';
import { getIcon, getLibrary, Resources } from '@formsey/core/Registry';
import { html } from "lit";
import { customElement, property, query } from "lit/decorators";
import { ifDefined } from 'lit/directives/if-defined';


@customElement("formsey-button-vaadin")
export class ButtonField extends LabeledField<ButtonFieldDefinition, boolean> {
  @property({ type: Boolean })
  value: boolean;

  @query("button")
  button: HTMLButtonElement

  renderField() {
    const icon = typeof this.definition.icon == "string" ? getIcon(this.definition.icon) : this.definition.icon
    return html`<vaadin-button type="${ifDefined(this.definition.buttonType)}" @click="${this.clicked}" @focus="${this.focused}" @blur="${this.blurred}" ?disabled="${this.definition.disabled}"><div slot="prefix">${icon}</div>${this.definition.text}</vaadin-button>`;
  }

  focusField(): boolean {
    this.button.focus()
    return true
  }
}

getLibrary("vaadin").registerComponent("button", {
  importPath: "@formsey/fields-vaadin/ButtonField",
    template: ( { library, context, settings, definition, value, parentPath, errors, changeHandler, invalidHandler, id } : Resources<ButtonFieldDefinition, boolean> ) => {
    return html`<formsey-button-vaadin id="${ifDefined(id)}" .library=${library} .settings=${settings} .definition=${definition} .context=${context} .value=${value} .parentPath=${parentPath} .errors=${errors} @change="${changeHandler}" @input="${changeHandler}" @inputChange="${changeHandler}" @invalid=${invalidHandler}></formsey-button-vaadin>`
  }
})