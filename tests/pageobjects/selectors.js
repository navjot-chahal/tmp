module.exports = class Selectors {
  static selectors = {
    contains: (text) => ({xpath: `//*[contains(text(),'${text}')]`}),
    exact: (text) => ({xpath: `//*[text()='${text}']`}),
    button: (text) => ({ xpath: `//button[text()="${text}"]` }),
    buttonContains: (text) => ({ xpath: `//button[contains(text(),'${text}')]` }),
    spanButton: (text) => ({ xpath: `//span[text()="${text}"]` }),
    input: (text, prop = "placeholder") => ({
      xpath: `//input[@${prop}="${text}"]`,
    }),
    id: (id) => ({ css: `#${id}` }),
    className: (className) => ({ css: `.${className}` }),
    userElm: (username) => ({ xpath: `//span[text()="${username}"]/..` }),
    option: (id, option) => ({ css: `#${id} > option[value="${option}"]` }),
  };
};
