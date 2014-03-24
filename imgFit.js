(function() {
    "use strict";

    var ImgFit = function() {
        this.settings = {
            style: {
                container: {
                    position: "relative",
                    overflow: "hidden"
                },

                image: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    opacity: 0,
                    width: "100%",
                    height: "auto"
                },

                transition: {
                    transition: "opacity .2s linear"
                }
            }
        };
    };

    ImgFit.prototype.getPrefix = function() {
        var style = window.getComputedStyle(document.documentElement),
            match = Array.prototype.join.call(style, "").match(/-(?:o|moz|webkit|ms)-/i);

        return match && match[0];
    };

    ImgFit.prototype.getStyle = function(element) {
        var tempStyle = element.getAttribute("style");

        if(tempStyle) {
            var currentStyle = tempStyle.split("; "),
                i = 0, length = currentStyle.length,
                temp;

            tempStyle = {};

            for( ; i < length; i++) {
                temp = currentStyle[i].split(": ");

                tempStyle[temp[0]] = temp[1];
            }
        }

        return tempStyle || {};
    };

    ImgFit.prototype.setStyle = function(element, style) {
        var i, margin,
            currentStyle = this.getStyle(element),
            tempStyle = [];

        for(i in style) {
            if(i === "transition") {
                var prefixTrans = this.prefix + i;

                style[prefixTrans] = style[i];

                delete style[i];

                i = prefixTrans;
            }

            if(currentStyle[i])
                delete currentStyle[i];

            currentStyle[i] = style[i];
        }

        for(i in currentStyle) {
            margin = i.split("margin");

            tempStyle.push((margin.length > 1 ? "margin-"+ margin[1].toLowerCase() : i) +": "+ currentStyle[i]);
        }

        element.setAttribute("style", tempStyle.join("; "));
    };

    ImgFit.prototype.setPosition = function(container, image) {
        if(image.offsetHeight === 0) {
            var self = this;

            setTimeout(function() {
                self.setPosition(container, image);
            }, 100);
        }
        else {
            if(image.offsetWidth / image.offsetHeight <= container.offsetWidth / container.offsetHeight) {
                this.setStyle(image, {
                    top: "50%",
                    opacity: 1,
                    marginTop: -image.offsetHeight / 2 + "px"
                });
            }
            else {
                this.setStyle(image, {
                    left: "50%",
                    opacity: 1,
                    width: "auto",
                    height: "100%"
                });

                image.style.marginLeft = -image.offsetWidth / 2 + "px";
            }
        }
    };

    ImgFit.prototype.fit = function(container) {
        var self = this,
            image = container.children[0];

        this.setStyle(container, this.settings.style.container);
        this.setStyle(image, this.settings.style.image);

        setTimeout(function() {
            self.setStyle(image, self.settings.style.transition);

            if(image.offsetWidth > 0 && image.offsetWidth === container.offsetWidth) {
                self.setPosition(container, image);
            }
            else {
                image.onload = function() {
                    self.setPosition(container, image);
                };
            }
        });
    };

    ImgFit.prototype.init = function(target) {
        this.prefix = this.getPrefix();

        var img = document.getElementsByClassName(target),
            i = 0, length = img.length;

        for( ; i < length; i++)
            this.fit(img[i]);
    };

    window.imgFit = new ImgFit();
})();

