import type { Linter } from "eslint";
import importPlugin from "eslint-plugin-import";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";

export const baseConfigs: Linter.Config[] = [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/*.min.js",
      "**/package-lock.json",
      "**/pnpm-lock.yaml",
      "**/yarn.lock",
    ],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        console: "readonly",
        exports: "readonly",
        global: "readonly",
        module: "readonly",
        process: "readonly",
        require: "readonly",
      },
      sourceType: "module",
    },
    plugins: {
      import: importPlugin,
      perfectionist: perfectionistPlugin,
      "simple-import-sort": simpleImportSortPlugin,
    },
    rules: {
      // 변수 및 속성 이름을 카멜 케이스(camelCase)로 작성해야 함
      camelcase: "warn",
      // dot 표기법 사용을 권장하지만, dot 표기법이 어울리지 않을 때에만 경고를 발생시킵니다.
      "dot-notation": "warn",
      // 항상 엄격한 등호(===)를 사용하도록 권장하며, null과 관련된 비교에서는 무시합니다.
      eqeqeq: [
        "error",
        "always",
        {
          null: "ignore",
        },
      ],
      // 익명의 기본값 내보내기를 비허용합니다.
      "import/no-anonymous-default-export": [
        "error",
        {
          allowObject: true,
        },
      ],
      // 생성자 함수의 이름을 대문자로 시작해야 함을 확인한다.
      "new-cap": "warn",
      "no-alert": "warn",
      // console.log는 에러로 처리, 다른 console.*은 허용
      "no-console": [
        "error",
        {
          allow: [
            "warn",
            "error",
            "info",
            "debug",
            "trace",
            "group",
            "groupEnd",
          ],
        },
      ],
      "no-debugger": "warn",
      "no-empty": "off",
      // 블록 문 내에서 단독으로 사용되는 블록 금지
      "no-lone-blocks": "error",
      // 단독 if 문 사용을 권장하지만 else if를 사용하는 것은 허용합니다.
      "no-lonely-if": "off",
      // 코드 엔터 간격 조정
      "no-multiple-empty-lines": [
        "warn",
        {
          max: 1, // 최대 1개의 연속된 빈 줄 허용
          maxBOF: 0, // 파일 시작 부분에 빈 줄 허용하지 않음
          maxEOF: 0, // 파일 끝 부분에 빈 줄 허용하지 않음
        },
      ],
      // 중첩된 삼항 연산자 금지
      "no-nested-ternary": "error",
      // 함수 내에서 함수 파라미터의 값을 변경하는 것을 금지
      "no-param-reassign": "off",
      // 문자열 안에서 불필요한 템플릿 리터럴 구문(${})을 사용하지 않도록 경고
      "no-template-curly-in-string": "warn",
      // 불필요한 삼항 연산자를 경고합니다.
      "no-unneeded-ternary": [
        "warn",
        {
          defaultAssignment: false,
          // TODO: !!이거 워닝처리
        },
      ],
      // 접근할 수 없는 코드를 경고 ex)리턴문 뒤에 오는 코드
      "no-unreachable": "warn",
      // Optional chaining의 산술 연산을 비허용합니다.
      "no-unsafe-optional-chaining": [
        "warn",
        {
          disallowArithmeticOperators: true,
        },
      ],
      // 사용되지 않은 표현식을 확인하고 허용된 표현식을 설정에 따라 허용
      "no-unused-expressions": [
        "error",
        {
          // 이 속성을 true로 설정하면 단축 평가 논리 연산자를 사용한 표현식을 사용할 때
          // 경고를 발생시키지 않는다. 즉, &&나 ||와 같은 논리 연산자를 허용함.
          allowShortCircuit: true,
          // 이 속성을 true로 설정하면 템플릿 리터럴 내에서 태그드 템플릿을 사용한 표현식을 사용할 때
          // 경고를 발생시키지 않는다. 즉, 태그드 템플릿을 허용함.
          allowTaggedTemplates: true,
          // 이 속성을 true로 설정하면 삼항 연산자를 사용한 표현식을 사용할 때
          // 경고를 발생시키지 않는다. 즉, 삼항 연산자를 허용함.
          allowTernary: true,
        },
      ],
      // 사용되지 않은 변수를 확인하고, 설정에 따라 허용함.
      // @typescript-eslint/no-unused-vars를 사용 시 no-unused-vars: off해야 충돌안남
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // 변수에 할당 후 리턴하는 경우를 권장하지만, 불필요한 경우에만 경고를 발생시킵니다.
      "no-useless-rename": "warn",
      // 불필요한 return문 사용을 권장하지만, 필요한 경우에만 경고를 발생시킵니다.
      "no-useless-return": "warn",
      // var 사용을 금지하며, 대신 let이나 const를 사용하도록 권장합니다.
      "no-var": "error",
      // 객체의 속성을 축약형으로 표현하도록 권장합니다.
      "object-shorthand": [
        "warn",
        "always",
        {
          avoidQuotes: true,
          ignoreConstructors: false,
        },
      ],
      // 한 번에 여러 개의 변수를 선언하지 않도록 권장합니다.
      "one-var": ["warn", "never"],
      // 할당 연산자를 사용하도록 권장합니다.
      "operator-assignment": "warn",
      // named import/export는 알파벳순 정렬을 권장합니다.
      "perfectionist/sort-named-exports": "warn",
      "perfectionist/sort-named-imports": "warn",
      // 객체 리터럴·구조 분해 키 알파벳순 정렬 (sort-keys와 중복 사용 금지)
      "perfectionist/sort-object-types": "warn",
      "perfectionist/sort-objects": "warn",
      // 함수 콜백을 선호하는 경우 화살표 함수를 사용할 것
      "prefer-arrow-callback": "warn",
      "prefer-const": "error",
      // 객체나 배열의 비구조화 할당을 권장하며, 배열 대신 객체의 비구조화 할당을 허용합니다.
      "prefer-destructuring": [
        "warn",
        {
          AssignmentExpression: {
            array: true,
            object: false,
          },
          VariableDeclarator: {
            array: false,
            object: true,
          },
        },
      ],
      // Object.assign()보다 객체 전파 연산자({...})를 사용하도록 권장합니다.
      "prefer-object-spread": "warn",
      // 문자열 연결 대신 템플릿 리터럴을 사용하도록 권장합니다.
      "prefer-template": "warn",
      // import, export문 정렬을 권장합니다.
      "simple-import-sort/exports": "warn",
      "simple-import-sort/imports": "warn",
      // 주석 스타일을 규칙에 따라 권장합니다.
      "spaced-comment": [
        "warn",
        "always",
        {
          block: {
            balanced: true,
            exceptions: ["-", "+"],
            markers: ["=", "!", ":", "::"],
          },
          line: {
            exceptions: ["-", "+"],
            markers: ["=", "!", "/"],
          },
        },
      ],
    },
  },
];
