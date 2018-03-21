module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "standard",
    "standard-react",
    "standard-jsx",
    "plugin:jsx-a11y/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    // "eslint:recommended",
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true
    },
    "sourceType": "module"
  },
  "plugins": [
    "jest",
    "import",
    "jsx-a11y"
  ],
  "globals": {
    "it":true,
    "fail": true,
    "console":true,
    "protractor": true,
    "browser": true,
    "by": true,
    "element": true,
    "expect": true,
    "jest": true,
    "describe":true,
    "xdescribe": true,
    "assert": true,
    "test": true,
    "beforeEach": true,
    "afterEach": true,
    "beforeAll": true,
    "afterAll": true
  },
  "rules": {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "never"
    ],
    "react/no-unused-prop-types": 0,
    "react/prop-types": 0,
    "jsx-a11y/alt-text": [
      2,
      {
        "elements": [
          "img",
          "object",
          "area",
          "input[type=\"image\"]"
        ],
        "img": [
          "Image"
        ],
        "object": [
          "Object"
        ],
        "area": [
          "Area"
        ],
        "input[type=\"image\"]": [
          "InputImage"
        ]
      }
    ],
    "jsx-a11y/anchor-has-content": [
      2,
      {
        "components": [
          "Anchor"
        ]
      }
    ],
    "jsx-a11y/no-distracting-elements": [
      2,
      {
        "elements": [
          "marquee",
          "blink"
        ]
      }
    ],
    "jsx-a11y/aria-role": [ 2, {
            "ignoreNonDOM": true
    }],
    "jsx-a11y/no-autofocus": 0,
    "jsx-a11y/img-redundant-alt": [
      2,
      {
        "components": [
          "Image"
        ],
        "words": [
          "Bild",
          "Foto"
        ]
      }
    ],
    "jsx-a11y/interactive-supports-focus": [
      "error",
      {
        "tabbable": [
          "button",
          "checkbox",
          "link",
          "searchbox",
          "spinbutton",
          "switch",
          "textbox"
        ]
      }
    ],
    "jsx-a11y/label-has-for": [
      2,
      {
        "components": [
          "Label"
        ],
        "required": {
          "every": [
            "nesting",
            "id"
          ]
        }
      }
    ],
    "jsx-a11y/media-has-caption": [
      2,
      {
        "audio": [
          "Audio"
        ],
        "video": [
          "Video"
        ],
        "track": [
          "Track"
        ]
      }
    ],
    "jsx-a11y/no-static-element-interactions": [
      "error",
      {
        "handlers": [
          "onClick",
          "onMouseDown",
          "onMouseUp",
          "onKeyPress",
          "onKeyDown",
          "onKeyUp"
        ]
      }
    ]
  }
};
