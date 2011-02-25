/*...............................licence...........................................
 *
 *    (C) Copyright 2011 FAST Consortium
 *
 *     This file is part of FAST Platform.
 *
 *     FAST Platform is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     FAST Platform is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with FAST Platform.  If not, see <http://www.gnu.org/licenses/>.
 *
 *     Info about members and contributors of the FAST Consortium
 *     is available at
 *
 *     http://fast.morfeo-project.eu
 *
 *...............................licence...........................................*/
/**
 * Notation:
 *    Rectangles are represented as objects:
 *       rectangle.left
 *       rectangle.top
 *       rectangle.botttom
 *       rectangle.right
 */
var Geometry = Class.create();

// **************** STATIC METHODS **************** //

Object.extend(Geometry, {

    /**
     * Calculate the cumulative offLimit offset and the effective delta for
     * an axis given the axis range and the current offLimit offset.
     *
     * @param Object range
     *     range.min
     *     range.max
     * @param Object delta
     * @param Object offLimit
     * @type Object result
     *     result.delta
     *     result.offLimit
     */
    updateAxis: function(/** Object */ range, /** Number */ delta, /** Number */ offLimit) {

        function _positiveUpdateAxis(/** Number */ max, /** Number */ delta, /** Number */ offLimit) {
            var result = new Object();

            if (delta > max) {
                // Stop at the limit
                result.delta = max;
                result.offLimit = offLimit + (delta - max);
            } else if (offLimit < 0) {
                // Decreasing offLimit
                if (delta + offLimit > 0) {
                    result.delta = delta + offLimit;
                    result.offLimit = 0;
                } else {
                    result.delta = 0;
                    result.offLimit = delta + offLimit;
                }
            } else {
                // No fx
                result.delta = delta;
                result.offLimit = offLimit;
            }

            return result;
        }

        if (delta >= 0) {
            return _positiveUpdateAxis(range.max, delta, offLimit);
        } else {
            var result = _positiveUpdateAxis(-range.min, -delta, -offLimit);
            result.delta = -result.delta;
            result.offLimit = -result.offLimit;
            return result;
        }
    },

    contains: function(/** Object */ container, /** Object */ element) {
        return (element.left >= container.left) &&
            (element.top >= container.top) &&
            (element.right <= container.right) &&
            (element.bottom <= container.bottom);
    },

    intersects: function(/** Object */ container, /** Object */ element) {
        return !((element.bottom < container.top) ||
            (element.left > container.right) ||
            (element.top > container.bottom) ||
            (element.right < container.left));
    },

    getRectangle: function(/** DOMNode */ node) {

        var position = Utils.getPosition(node);
        return {
            'top': position.top,
            'left': position.left,
            'bottom': position.top + node.offsetHeight,
            'right': position.left + node.offsetWidth
        };
    },

    getClientRectangle: function(/** DOMNode */ node) {
        var computedStyle = document.defaultView.getComputedStyle(node, null);
        var topBorder = computedStyle.getPropertyCSSValue('border-top-width').getFloatValue(CSSPrimitiveValue.CSS_PX);
        var leftBorder = computedStyle.getPropertyCSSValue('border-left-width').getFloatValue(CSSPrimitiveValue.CSS_PX);

        var position = Utils.getPosition(node);
        return {
            'top': position.top + topBorder,
            'left': position.left + leftBorder,
            'bottom': position.top + node.clientHeight,
            'right': position.left + node.clientWidth
        };
    },

    getCenter: function(/** DOMNode */ node) {
        return {
            'top': (node.clientHeight - node.clientTop) / 2,
            'left': (node.clientWidth - node.clientLeft) / 2
        };
    },

    dragRanges: function(/** Object */ container, /** Object */ element) {
        return {
            'x': {
                'min': Math.min(-element.left, 0),
                'max': Math.max((container.right - container.left) - element.right, 0)
            },
            'y': {
                'min': Math.min(-element.top, 0),
                'max': Math.max((container.bottom - container.top) - element.bottom, 0)
            }
        };
    },

    adaptDropPosition: function(/** Element */ containerElement, /** Element */ node) {
        var element = this.getRectangle(node);
        var containerBounds = this.getClientRectangle(containerElement);

        var width = element.right - element.left;
        var height = element.bottom - element.top;

        if (element.right > containerBounds.right)
            element.left = containerBounds.right - width;

        if (element.left < containerBounds.left)
            element.left = containerBounds.left;

        if (element.bottom > containerBounds.bottom)
            element.top = containerBounds.bottom - height;

        if (element.top < containerBounds.top)
            element.top = containerBounds.top;

        return {
            'left': element.left - containerBounds.left,
            'top': element.top - containerBounds.top
        };

    },

    adaptInitialPosition: function(/** Element */ containerElement, /** Element */ node,
                                    /** Object */ position) {
        var containerBounds = {
            'top': 0,
            'left': 0,
            'right': containerElement.offsetWidth,
            'bottom': containerElement.offsetHeight
        };

        var elementBounds = {
            'top': position.top,
            'left': position.left,
            'right': position.left + node.clientWidth,
            'bottom': position.top + node.clientHeight
        };

        var result = {
            'top': position.top,
            'left': position.left
        };

        if (elementBounds.right > containerBounds.right)
            result.left = containerBounds.right - node.offsetWidth;

        if (elementBounds.left < containerBounds.left)
            result.left = containerBounds.left;

        if (elementBounds.bottom > containerBounds.bottom)
            result.top = containerBounds.bottom - node.offsetHeight;

        if (elementBounds.top < containerBounds.top)
            result.top = containerBounds.top;

        return result;
    }
});
