# CSS.js

A library to quickly create CSS and animations with JavaScript without CSS files.

Test with
```html
<div class="moro"/> 
```
Then write
```javascript
css().bind(".moro", {
  width : "100px",
  height:"100px",
  "background-color" : "blue"
});

css().bind(".moro:hover", {
        "background" : "linear-gradient(#666, #333)"
    });

```
[Code above in Codepen](http://codepen.io/teroktolonen/full/wzvkKG)

## Animation

Having above example, but adding a class
```html
<div class="moro viewIn"/> 
```

Then:

```javascript
var inPosition = {
    "transform" : "translate(0,0)",
    
};
var outPosition = {
    "transform" : "translate(-130px,0px) rotate(90deg)",
    "opacity" : 0
};

css().animation("viewIn", {
    duration : "1s",
    "iteration-count" : 1,
},  outPosition,  inPosition); 
```

[Try in CodePen] (http://codepen.io/teroktolonen/full/LRYvGr)

## Gradient animation

Simple gradient animation is possible if you have two gradients and animate their opacity

[Try in CodePen] (http://codepen.io/teroktolonen/full/rraaZG/)

## Browser compatibility testing

Feedback is welcome. On the desktop browsers the limit goes on IE9, basic features work but not animations. IE10+ also animations work, so that's approximately the browser compatibility limit on desktop. On mobile at least Android 4.1 and 2.3 seems to work. On 2.2 the Codepen did not work :(. iOS 5 & 4 & 3 seem to work.

## License

MIT. Or whatever you need.
