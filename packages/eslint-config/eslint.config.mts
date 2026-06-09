import { baseConfigs } from "./src/script/config/rule-base-config";
import { typescriptConfigs } from "./src/script/config/rule-typescript-config";

const eslintConfig = [...baseConfigs, ...typescriptConfigs];

export default eslintConfig;
