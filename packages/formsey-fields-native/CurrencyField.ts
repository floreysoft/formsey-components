import { createField, LabeledField } from '@formsey/core';
import { FieldChangeEvent } from '@formsey/core/Events';
import { FieldDefinition, ListFieldDefinition } from '@formsey/core/FieldDefinitions';
import { getLibrary, Resources } from '@formsey/core/Registry';
import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { ifDefined } from 'lit/directives/if-defined.js';


let currencyCodes = ["AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY", "COP", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLL", "SOS", "SRD", "SSP", "STN", "SVC", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XDR", "XOF", "XPF", "XSU", "YER", "ZAR", "ZMW", "ZWL"]
// @ts-ignore
const currencyNames = new Intl.DisplayNames(navigator.languages, { type: 'currency' })
const options = currencyCodes.map(locale => {
  return { "label": `${currencyNames.of(locale)}`, "value": locale }
})

@customElement("formsey-currency")
export class CurrencyField extends LabeledField<FieldDefinition, string> {
  protected renderField() {
    return createField({ library: this.library, context: this.context, settings: this.settings, definition: { type: "select", name: this.definition?.name, searchThreshold: 10, options } as ListFieldDefinition, value: this.value, parentPath: this.path(), errors: this.errors, changeHandler: this.changed })
  }

  protected changed(e: CustomEvent) {
    this.value = e.detail.value
    this.dispatchEvent(new FieldChangeEvent(this.path(), this.value));
  }
}

getLibrary("native").registerComponent("currency", {
  importPath: "@formsey/fields-native/CurrencyField",
  template: ({ library, context, settings, definition, value, parentPath, errors, changeHandler, inputHandler, invalidHandler, id }: Resources<FieldDefinition, string>) => {
    return html`<formsey-currency id="${ifDefined(id)}" .library=${library} .settings=${settings} .definition=${definition as any} .context=${context} .value=${value as any} .parentPath=${parentPath} .errors=${errors} @input=${inputHandler} @change=${changeHandler} @invalid=${invalidHandler}></formsey-currency>`
  }
})