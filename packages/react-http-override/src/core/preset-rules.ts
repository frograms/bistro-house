const PRESET_RULE_PREFIX = "preset:";

export const presetRuleId = (presetId: string, index: number): string =>
  `${PRESET_RULE_PREFIX}${presetId}:${index}`;

export const presetIdOf = (ruleId: string): string | null => {
  if (!ruleId.startsWith(PRESET_RULE_PREFIX)) return null;
  const lastColon = ruleId.lastIndexOf(":");
  if (lastColon < PRESET_RULE_PREFIX.length) return null;
  return ruleId.slice(PRESET_RULE_PREFIX.length, lastColon);
};