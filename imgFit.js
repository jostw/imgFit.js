(function() {
    "use strict";

    var ImgFit = function() {
        var prefix = getPrefix(),
            style = {
                container: {
                    position: "relative",
                    overflow: "hidden"
                },

                image: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "auto"
                },

                transition: {}
            };

        style.transition[prefix +"transition-property"] = "opacity";
        style.transition[prefix +"transition-duration"] = ".2s";
        style.transition[prefix +"transition-timing-function"] = "linear";
        style.transition[prefix +"transition-delay"] = 0;

        this.prefix = prefix;
        this.settings = { style: style };
    };

    var getPrefix = function() {
        if(!window.getComputedStyle)
            return "";

        var style = window.getComputedStyle(document.documentElement),
            match = Array.prototype.join.call(style, "").match(/-(?:o|moz|webkit|ms)-/i);

        return match && match[0];
    };

    var toCamel = function(string) {
        return string.replace(/(\-[a-z])/g, function($1) { return $1.toUpperCase().replace("-", ""); });
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
        var i, match,
            computedStyle = window.getComputedStyle(element),
            currentStyle = this.getStyle(element),
            tempStyle = [];

        for(i in style) {
            if(i.match(/transition/)) {
                currentStyle[i] = computedStyle[toCamel(i)] +", "+ style[i];
            }
            else {
                if(currentStyle[i])
                    delete currentStyle[i];

                currentStyle[i] = style[i];
            }
        }

        for(i in currentStyle) {
            match = i.match(/margin-|margin/);

            tempStyle.push((match ? "margin-"+ i.split(match[0])[1].toLowerCase() : i) +": "+ currentStyle[i]);
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
                    marginTop: -image.offsetHeight / 2 +"px"
                });
            }
            else {
                this.setStyle(image, {
                    left: "50%",
                    opacity: 1,
                    width: "auto",
                    height: "100%",
                    marginLeft: -(container.offsetHeight * image.offsetWidth / image.offsetHeight) / 2 +"px"
                });
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

            if(image.complete) {
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
        var img = document.querySelectorAll(target),
            i = 0, length = img.length;

        for( ; i < length; i++)
            this.fit(img[i]);
    };

    window.imgFit = new ImgFit();
})();
