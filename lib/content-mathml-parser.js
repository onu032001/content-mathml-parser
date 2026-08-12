class ContentMathMLParser {
  constructor() {
    const thisObject = this;
    this.trigFuncs = [["sin", "cos", "tan"], [["sec", "cos"], ["csc", "sin"], ["cot", "tan"]]];
    this.domParser = new DOMParser();
    this.applications = {
      plus: (...args) => args.reduce((acc, item) => acc + item),
      minus(...args) {
        if (args.length === 1) return -args[0];
        return args[0] - args[1];
      },
      times: (...args) => args.reduce((acc, item) => acc * item),
      divide: (arg1, arg2) => arg1 / arg2,
      rem: (arg1, arg2) => arg1 % arg2,
      power: Math.pow,
      root(...args) {
        const { arrayArgs, objectArgs } = thisObject.extractArgs(args);
        if (objectArgs.degree) return Math.pow(arrayArgs[0], 1 / objectArgs.degree);
        return Math.sqrt(arrayArgs[0]);
      },
      ln: Math.log,
      log(...args) {
        const { arrayArgs, objectArgs } = thisObject.extractArgs(args);
        if (objectArgs.logbase) {
          return Math.log(arrayArgs[0]) / Math.log(objectArgs.logbase);
        }
        return Math.log10(arrayArgs[0]);
      },
      ...this.makeTrigFuncs(false),
      ...this.makeTrigFuncs(true),
      eq: (arg1, arg2) => arg1 === arg2,
      neq: (arg1, arg2) => arg1 !== arg2,
      gt: (arg1, arg2) => arg1 > arg2,
      lt: (arg1, arg2) => arg1 < arg2,
      geq: (arg1, arg2) => arg1 >= arg2,
      leq: (arg1, arg2) => arg1 <= arg2,
      and: (arg1, arg2) => arg1 && arg2,
      or: (arg1, arg2) => arg1 || arg2,
      not: arg1 => !arg1
    }
  }
  makeTrigFuncs(hyperbolic) {
    const hyperbolicControl = funcNames => funcNames.map(item => hyperbolic ? item + "h" : item);
    return {
      ...Object.fromEntries(hyperbolicControl(this.trigFuncs[0]).map(item => [item, Math[item]])),
      ...Object.fromEntries(hyperbolicControl(this.trigFuncs[0]).map(item => ["arc" + item, Math["a" + item]])),
      ...Object.fromEntries(hyperbolicControl(this.trigFuncs[1]).map(item => [item[0], arg => 1 / Math[item[1]](arg)])),
      ...Object.fromEntries(hyperbolicControl(this.trigFuncs[1]).map(item => ["arc" + item[0], arg => Math["a" + item[1]](1 / arg)]))
    };
  }
  extractArgs(args) {
    const arrayArgs = args.filter(item => !(item instanceof Object) || Array.isArray(args));
    const objectArgs = Object.assign({}, ...args.filter(item => item instanceof Object && !Array.isArray(args)));
    return { arrayArgs, objectArgs };
  }
  piecewise(vars, args) {
    for (const arg of args) {
      if (arg.piece) {
        if (this.calculate(arg.piece[1], vars)) return this.calculate(arg.piece[0], vars);
      } else if (arg.otherwise) return this.calculate(arg.otherwise, vars);
    }
    return;
  }
  parseFromString(mathml) {
    try {
      return this.domParser.parseFromString(mathml, "application/xml").documentElement;
    } catch (error) {
      throw new Error("Invalid MathML Structure.");
    }
  }
  applyOperator(func, ...args) {
    return func(...args);
  }
  calculate(mmlElement, vars) {
    const thisObject = this;
    switch (mmlElement.nodeName.toLowerCase()) {
      case "math":
        return this.calculate(mmlElement.firstElementChild, vars);
      case "cn":
        return Number(mmlElement.firstChild.textContent.trim());
      case "ci":
        return vars[mmlElement.firstChild.textContent.trim()];
      case "apply":
        return this.applyOperator(...Array.from(mmlElement.children).map(child => this.calculate(child, vars)));
      case "piecewise":
        return this.piecewise(vars, Array.from(mmlElement.children).map(child => this.calculate(child, vars)));
      case "piece":
        return {
          piece: mmlElement.children
        };
      case "otherwise":
        return {
          otherwise: mmlElement.firstElementChild
        };
      default: {
        const symbolName = mmlElement.nodeName.toLowerCase();
        const temp = this.applications[symbolName];
        if (temp) {
          return temp;
        }
        return {
          [symbolName]: this.calculate(mmlElement.firstElementChild, vars)
        };
      }
    }
  }
}

const cmmlParser = new ContentMathMLParser();
