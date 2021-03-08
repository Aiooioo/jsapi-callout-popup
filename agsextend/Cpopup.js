define([
  "dojo/query",
  "esri/widgets/support/GoTo",
  "esri/widgets/support/AnchorElementViewModel",
  "esri/core/watchUtils",
  "dojo/text!agsextend/polyline.top-left.svg",
  "dojo/text!agsextend/polyline.top-right.svg",
  "dojo/text!agsextend/polyline.bottom-left.svg",
  "dojo/text!agsextend/polyline.bottom-right.svg",
], function (
  query,
  GoTo,
  AnchorElementViewModel,
  watchUtils,
  polylineTopLeft,
  polylineTopRight,
  polylineBottomLeft,
  polylineBottomRight
) {
  return GoTo.GoToMixin(AnchorElementViewModel).createSubclass({
    declaredClass: "geoscene.custom.Popup",

    properties: {
      currentAlignment: {},
      pointerOffset: {},
    },

    constructor() {
      this._container = null;
      this.pointerOffset = 16;

      this.currentAlignment = "top-left";
      this.screenLocationEnabled = true;

      var that = this;
      watchUtils.watch(this, "screenLocation", function () {
        that._positionContainer();
      });
    },

    _calculateFullWidth(width) {
      if (
        this.currentAlignment === "top-left" ||
        this.currentAlignment === "bottom-left" ||
        this.currentAlignment === "top-right" ||
        this.currentAlignment === "bottom-right"
      ) {
        return width + this.pointerOffset;
      }

      return width;
    },

    _calculateAlignmentPosition(x, y, view, width) {
      var currentAlignment = this.currentAlignment;
      var pointerOffset = this.pointerOffset;
      var halfWidth = width / 2;
      var viewHeightOffset = view.height - y;
      var viewWidthOffset = view.width - x;
      var padding = this.view.padding;

      if (currentAlignment === "bottom-center") {
        return {
          top: y + pointerOffset - padding.top,
          left: x - halfWidth - padding.left,
        };
      }

      if (currentAlignment === "top-left") {
        return {
          bottom: viewHeightOffset + pointerOffset - padding.bottom,
          right: viewWidthOffset + pointerOffset - padding.right,
        };
      }

      if (currentAlignment === "bottom-left") {
        return {
          top: y + pointerOffset - padding.top,
          right: viewWidthOffset + pointerOffset - padding.right,
        };
      }

      if (currentAlignment === "top-right") {
        return {
          bottom: viewHeightOffset + pointerOffset - padding.bottom,
          left: x + pointerOffset - padding.left,
        };
      }

      if (currentAlignment === "bottom-right") {
        return {
          top: y + pointerOffset - padding.top,
          left: x + pointerOffset - padding.left,
        };
      }

      if (currentAlignment === "top-center") {
        return {
          bottom: viewHeightOffset + pointerOffset - padding.bottom,
          left: x - halfWidth - padding.left,
        };
      }

      return undefined;
    },

    _calculatePositionStyle(screenLocation, domWidth) {
      if (!this.view || !screenLocation || !domWidth) {
        return void 0;
      }

      var full = this._calculateFullWidth(domWidth);
      var position = this._calculateAlignmentPosition(
        screenLocation.x,
        screenLocation.y,
        this.view,
        full
      );
      if (!position) {
        return undefined;
      }

      return {
        top: position.top !== undefined ? `${position.top}px` : "auto",
        left: position.left !== undefined ? `${position.left}px` : "auto",
        bottom: position.bottom !== undefined ? `${position.bottom}px` : "auto",
        right: position.right !== undefined ? `${position.right}px` : "auto",
      };
    },

    _positionContainer() {
      var width = this._container.getBoundingClientRect().width;
      var positionStyle = this._calculatePositionStyle(
        this.screenLocation,
        width
      );

      if (!positionStyle) {
        return;
      }

      this._container.style.top = positionStyle.top;
      this._container.style.left = positionStyle.left;
      this._container.style.bottom = positionStyle.bottom;
      this._container.style.right = positionStyle.right;
    },

    _clearContent() {
      while (this._container.childNodes.length) {
        this._container.removeChild(this._container.childNodes[0]);
      }
    },

    _renderCalloutLine() {
      this.callout = document.createElement("div");
      // this.callout.innerHTML = polyline;
      switch (this.currentAlignment) {
        case "top-left":
          this.callout.innerHTML = polylineTopLeft;
          break;
        case "top-right":
          this.callout.innerHTML = polylineTopRight;
          break;
        case "bottom-left":
          this.callout.innerHTML = polylineBottomLeft;
          break;
        case "bottom-right":
          this.callout.innerHTML = polylineBottomRight;
          break;
        default:
          break;
      }

      this._container.appendChild(this.callout);
    },
    _renderPopupContent() {
      this.content = document.createElement("div");
      this.content.classList.add("esri-widget", "cpopup-content");
      this.content.style.position = "absolute";
      this.content.style.height = "60px";
      this.content.style.width = "180px";
      if (this.currentAlignment === "top-left") {
        this.content.style.left = "-180px";
        this.content.style.top = "-30px";
      } else if (this.currentAlignment === "top-right") {
        this.content.style.left = "120px";
        this.content.style.top = "-30px";
      } else if (this.currentAlignment === "bottom-right") {
        this.content.style.left = "120px";
        this.content.style.top = "90px";
      } else if (this.currentAlignment === "bottom-left") {
        this.content.style.left = "-180px";
        this.content.style.top = "90px";
      }

      this.content.innerHTML = "带导引线的弹出框内容";
      this._container.appendChild(this.content);
    },

    _renderContent() {
      this._clearContent();

      this._renderCalloutLine();
      this._renderPopupContent();
    },

    show() {
      var isViewReady = this.get("view.ready");

      if (!isViewReady) return;
      var container = this.view.container;
      var popupContainer = query(".esri-ui-manual-container", container)[0];
      if (!popupContainer) return;

      if (!this._container) {
        this._container = document.createElement("div");
        this._container.classList.add("esri-component");
        this._container.style.background = "transparent";

        popupContainer.appendChild(this._container);
      }
      this._setScreenLocation();

      this._renderContent();
      this._positionContainer();
    },
  });
});
