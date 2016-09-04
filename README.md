# CSS.js

A library to quickly create CSS and animations with JavaScript.

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
[Code above in Codepen] (http://codepen.io/teroktolonen/full/wzvkKG)

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


## License

MIT. Or whatever you need.
