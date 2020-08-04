import { FieldDefinition, LabeledField, register } from '@formsey/core';
import { css, html, property } from 'lit-element';

interface YouTubeFieldDefinition extends FieldDefinition {
  url: string
  width: string
  align: string
}

export class YouTubeField extends LabeledField<YouTubeFieldDefinition, string> {
  @property({ converter: Object })
  definition: YouTubeFieldDefinition;

  private readonly WATCH_PARAMETER = "watch?v=";
	private readonly YOUTU_PARAMETER = "youtu.be/";

  renderField() {
    let width = this.definition.width;
    let style = "width:"
		if ( width.endsWith("%") ) {
      // Set absolute height
			let widthInPercent : number = <number>(width.substring(0, width.lastIndexOf("%")) as unknown)
			let height = widthInPercent * 9 / 16;
			style += widthInPercent+"%;padding-bottom:"+height+"%"
		} else {
      if ( width.endsWith("px") ) {
        width = width.substring(0, width.lastIndexOf("px"));
			}
		  let widthInPixel = <number>(width as unknown);
			let heightInPixel = widthInPixel * 9 / 16;
			style += widthInPixel + "px;height:"+heightInPixel+"px"
		}
		var align = "";
		switch (this.definition.align) {
			case "center":
				align = "margin-left: auto;margin-right: auto;"
				break;
			case "right":
				align = "margin-left: auto;"
				break;
		}
		return html`<div class="fs-video" style="${style};${align}"><iframe src="//youtube.com/embed/${this.extractVideoId(this.definition.url)}"></iframe></div>`
  }

  protected extractVideoId(videoUrl: string) : string {
    let videoId = videoUrl;
		let watchIndex = videoUrl.indexOf(this.WATCH_PARAMETER);
		if ( watchIndex > 0 ) {
      videoId = videoUrl.substring(watchIndex + this.WATCH_PARAMETER.length)
		}
		let youtuIndex = videoUrl.indexOf(this.YOUTU_PARAMETER);
		if ( youtuIndex > 0 ) {
      videoId = videoUrl.substring(youtuIndex + this.YOUTU_PARAMETER.length)
		}
		let paramsIndex = videoUrl.indexOf("&");
		if ( paramsIndex > 0 ) {
      videoId = videoId.substring(0, paramsIndex);
		}
		paramsIndex = videoUrl.indexOf("?");
		if ( paramsIndex > 0 ) {
      videoId = videoId.substring(0, paramsIndex);
		}
		return videoId;
  }
}
register("formsey-youtube", YouTubeField, "native", "youtube", { importPath: "@formsey/fields-native/YouTubeField"})