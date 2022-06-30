const { yellow } = require("kleur");

const normalizeCondition = function(rawCondition) {
  if (rawCondition instanceof Array) {
    return rawCondition;
  }

  let type = typeof rawCondition;
  if (type === "string" || type === "function" || type === "object") {
    return [rawCondition];
  }

  throw TypeError("The property `when` should be of type Boolean, String, Array, Object or Function");
};

const getType = function(value) {
  if (value instanceof RegExp) {
    return "regexp";
  }
  return typeof value;
};

const isActive = function(rawCondition, envForTesting) {
  if (rawCondition == undefined) {
    return true;
  }

  if (typeof rawCondition === "boolean") {
    return rawCondition;
  }

  let env = envForTesting ?? process.env;

  let conditions = normalizeCondition(rawCondition);
  orLoop: for (const condition of conditions) {
    const type = getType(condition);
    switch (type) {
      case "string":
        const v = env[condition];
        if (v) {
          return true;
        }
        break;
      case "function":
        if (condition()) {
          return true;
        }
        break;
      case "boolean":
        if (condition) {
          return true;
        }
        break;
      case "object":
        if (condition.constructor.name !== "Object") {
          console.log(yellow(`The property \`when\` should be of type Boolean, String, RegExp, Function, Object or Array of them. ${ condition } is of type a subclass of Object. eleventy-sass treats it as an Object.`));
        }
        for (const key in condition) {
          const expected = condition[key];
          const actual = env[key];
          let type = getType(expected);
          switch (type) {
            case "string":
              if (actual !== expected) {
                continue orLoop;
              }
              break;
            case "function":
              if (!expected(actual)) {
                continue orLoop;
              }
              break;
            case "boolean":
              if (expected) {
                if (actual == undefined || actual === "") {
                  continue orLoop;
                }
              } else {
                if (actual != undefined && actual !== "") {
                  continue orLoop;
                }
              }
              break;
            case "regexp":
              if (!expected.test(actual)) {
                continue orLoop;
              }
              break;
            default:
              throw TypeError("If you set an object or objects to `when` property, the properties of the object(s) must be of type String, RegExp, Function or Boolean.");
          }
        }
        return true;
      default:
        throw TypeError("If you set an array to `when` property, the elements of the array must be of type Boolean, String, Object or Function");
    }
  }
  return false;
};

module.exports = isActive;
