import { WidgetState, FarpatchWidget, makeNavView as makeNavItem } from "../interfaces";

export class SettingsWidget implements FarpatchWidget {
  index: number = 0;
  view: HTMLElement = document.createElement("div");
  navItem: HTMLElement;
  name: string;
  icon: string = "sliders-h";
  title: string = "Settings";
  updateState: (state: WidgetState) => void = () => { };

  constructor(name: string) {
    this.name = name;
    this.navItem = makeNavItem(this);
  }

  updateIndex(index: number): void {
    this.index = index;
  }

  onInit(): void {
    this.view.innerHTML = `
        <div class="fieldset-item">
        <picture aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <title>A note icon</title>
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </picture>
        <div class="input-stack">
          <label 
            for="media-volume" 
            id="media-volume" 
            aria-hidden="true">
              Media volume
          </label>
          <input 
            name="media-volume" 
            aria-labelledby="media-volume" 
            type="range" 
            value="3" 
            max="10" 
            style="--track-fill: 30%"
          >
        </div>
      </div>
      `;
    console.log("Initialized Dashboard Widget");
  }
  onFocus(element: HTMLElement): void {
    console.log("Displaying Dashboard Widget");
    element.appendChild(this.view);
  }
  onBlur(element: HTMLElement): void {
    console.log("Archiving Dashboard Widget");
    element.removeChild(this.view);
  }
}
