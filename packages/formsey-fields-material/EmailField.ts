import { getLibrary, Resources } from '@formsey/core/Registry';
import { StringFieldDefinition } from '@formsey/core/FieldDefinitions';
import { TextFieldType } from "@material/mwc-textfield/mwc-textfield.js";
import { customElement, html } from "lit-element";
import { ifDefined } from 'lit-html/directives/if-defined';
import { StringField } from './StringField';
@customElement("formsey-email-material")
export class EmailField extends StringField {
  protected get type(): TextFieldType {
    return "email"
  }
}

getLibrary("material").registerComponent("email", {
  importPath: "@formsey/fields-material/EmailField",
  template: ({ library, context, settings, definition, value, parentPath, errors, changeHandler, invalidHandler, id }: Resources<StringFieldDefinition, string>) => {
    return html`<formsey-email-material id="${ifDefined(id)}" .library=${library} .settings=${settings} .definition=${definition} .context=${context} .value=${value} .parentPath=${parentPath} .errors=${errors} @change="${changeHandler}" @input="${changeHandler}" @inputChange="${changeHandler}" @invalid=${invalidHandler}></formsey-email-material>`
  }
})