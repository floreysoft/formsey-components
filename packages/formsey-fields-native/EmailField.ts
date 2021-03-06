import { StringFieldDefinition } from '@formsey/core/FieldDefinitions';
import { getLibrary, Resources } from '@formsey/core/Registry';
import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { ifDefined } from 'lit/directives/if-defined.js';
import { StringField } from './StringField';

@customElement("formsey-email")
export class EmailField extends StringField {
  protected get type(): "email" {
    return "email"
  }
}

getLibrary("native").registerComponent("email", {
  importPath: "@formsey/fields-native/EmailField",
  template: ({ library, context, settings, definition, value, parentPath, errors, changeHandler, inputHandler, invalidHandler, id }: Resources<StringFieldDefinition, string>) => {
    return html`<formsey-email id="${ifDefined(id)}" .library=${library} .settings=${settings} .definition=${definition as any} .context=${context} .value=${value} .parentPath=${parentPath} .errors=${errors} @change=${changeHandler} @input=${inputHandler} @invalid=${invalidHandler}></formsey-email>`
  }
})
