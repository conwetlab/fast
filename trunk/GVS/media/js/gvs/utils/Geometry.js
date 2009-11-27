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
    
    getNodeRectangle: function(/** DOMNode */ node) {
        var position = Utils.getPosition(node);
        return {
            'top': position.top,
            'left': position.left,
            'bottom': position.top + node.clientHeight,
            'right': position.left + node.clientWidth
        }
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
        }
    }
}); 
