import { ListFieldDefinition } from '@formsey/core';
import { InvalidError, InvalidEvent } from '@formsey/core/InvalidEvent';
import "@material/mwc-list/mwc-list-item";
import { Select } from "@material/mwc-select";
import "@material/mwc-select/mwc-select";
import { customElement, html, property, query, css } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { MaterialField } from './MaterialField';

@customElement("formsey-list-material")
export class ListField extends MaterialField<ListFieldDefinition, string> {
  @property({ type: String })
  value: string;

  @query("mwc-select")
  materialListField: Select

  static get styles() {
    return [...super.styles, css`
    mwc-select {
      width: 100%;
    }
  `]
  }

  renderField() {
    let customValidity = this.definition.customValidity
    if ( this.error ) {
      customValidity = this.error.validityMessage
    }
    return html`<mwc-select ?autofocus="${this.definition.autofocus}" ?required="${this.definition.required}" validationmessage="${ifDefined(customValidity)}" @selected="${this.valueChanged}" @invalid="${this.invalid}" name="${this.definition.name}" ?disabled="${this.definition.disabled}" .value="${ifDefined(this.value)}">
    ${this.definition.options.map(item => html`<mwc-list-item ?selected="${item.value ? item.value == this.value : item.label == this.value}" value="${item.value ? item.value : item.label}">${item.label ? item.label : item.value}</mwc-list-item>`)}
    </mwc-select>`;
  }


  renderFooter() {
    return;
  }

  firstUpdated() {
    this.materialListField.validityTransform = (newValue, nativeValidity) => {
      if ( this.error ) {
        return {
          valid: false,
          validationMessage: this.error.validityMessage,
          ...this.error.validityState
        }
      }
      return nativeValidity;
    }
  }

  validate(report : boolean) {
    if ( report ) {
      return this.materialListField.reportValidity() as boolean
    } else {
      return this.materialListField.checkValidity() as boolean
    }
  }

  invalid() {
    let validityState: ValidityState = this.materialListField.validity
    for (let key in validityState) {
      if (!validityState[key]) {
        delete validityState[key]
      }
    }
    let validationMessage = this.materialListField.validationMessage
    if ( validityState['validationMessage'] ) {
      validationMessage = validityState['validationMessage']
      delete validityState['validationMessage']
    }
    this.errors[this.definition.name] = this.error ? this.error : new InvalidError(validationMessage, false, validityState )
    this.dispatchEvent(new InvalidEvent(this.errors))
  }
}