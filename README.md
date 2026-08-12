# content-mathml-parser

Contents MathML Parser

Append this script:

```html
<script src="https://onu032001.github.io/content-mathml-parser/lib/content-mathml-parser.js"></script>
```

Use the following code to parse Contents MathML:

```js
const mathmlString = `
  <math xmlns="http://www.w3.org/1998/Math/MathML">
    <!-- Contents MathML Contents -->
  </math>
`; // Set the Contents MathML string
const cmml = cmmlParser.parseFromString(mathmlString); // Parses Contents MathML string to element
let result = cmmlParser.calculate(result, { /* variables */ }); // Calculates the Contents MathML element
console.log(result); // Logs the calculated Contents MathML Element
```
