import { LabeledField, SignatureFieldDefinition, ChangeEvent } from '@formsey/core';
import { css, customElement, query, html, property } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import SignaturePad from 'signature_pad';

@customElement("formsey-signature")
export class SignatureField extends LabeledField<SignatureFieldDefinition, string> {
  private readonly ICON_DELETE = html`<svg viewBox="0 0 32 32"><title>Delete</title><path d="M20 4v-4h-8v4h-8v4h24v-4zM24 10v16h-4v-16h-2v16h-4v-16h-2v16h-4v-16h-2v17c0 2 1 3 3 3h14c2 0 3-1 3-3v-17h-2z"></path></svg>`

  @property({ type: String })
  value: string;

  @property({ type: Number })
  width: Number;

  @property({ type: Number })
  height: Number;

  signaturePad: SignaturePad;

  @query("#signature-pad")
  canvas: HTMLCanvasElement

  static get styles() {
    return [...super.styles, css`
    .pad {
      position: relative;
      width: 100%;
      height: 200px;
      box-sizing: border-box;
      border-radius: var(--formsey-input-border-radius, 4px);
      border: 1px solid var(--formsey-input-border-color, #d5d5d5);
    }

    .pad:focus-within {
      border: 1px solid var(--formsey-primary-color,  #020b2f);
    }

    canvas {
      width: 100%;
      height: 100%;
      outline: none;
    }

    svg {
      position: absolute;
      width: 16px;
      right: 8px;
      top: 8px;
      fill: var(--formsey-primary-color,  #020b2f);
      stroke-width: 0;
    }
    `]
  }

  renderField() {
    return html`<div class="pad" width="${ifDefined(this.definition.width)}px" height="${ifDefined(this.definition.height)}px"><canvas id="signature-pad" tabindex="0"></canvas><svg viewBox="0 0 32 32" @click="${this.clear}"><title>Clear</title><path d="M20 4v-4h-8v4h-8v4h24v-4zM24 10v16h-4v-16h-2v16h-4v-16h-2v16h-4v-16h-2v17c0 2 1 3 3 3h14c2 0 3-1 3-3v-17h-2z"></path></svg></div>`;
  }

  firstUpdated() {
    if (this.canvas) {
      this.signaturePad = new SignaturePad(this.canvas);
      this.signaturePad.on();
      this.signaturePad.onEnd = (event: MouseEvent | Touch) => this.onStrokeEnd(event);
      this.updateComplete.then(() => this.resizeCanvas())
    }
  }

  resizeCanvas() {
    var ratio = Math.max(window.devicePixelRatio || 1, 1);
    this.canvas.width = this.canvas.offsetWidth * ratio;
    this.canvas.height = this.canvas.offsetHeight * ratio;
    this.canvas.getContext("2d").scale(ratio, ratio);
    // this.signaturePad.clear();
  }

  protected clear(e: Event) {
    this.resizeCanvas()
    this.signaturePad.clear();
    this.value = "";
    if (this.definition.name) {
      this.dispatchEvent(new ChangeEvent(this.definition.name, this.value));
    }
  }

  protected onStrokeEnd(e: MouseEvent | Touch) {
    this.value = this.signaturePad.toDataURL();
    if (this.definition.name) {
      this.dispatchEvent(new ChangeEvent(this.definition.name, this.value));
    }
  }
}