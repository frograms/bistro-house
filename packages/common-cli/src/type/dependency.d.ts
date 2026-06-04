export type Dependency = {
  name: string;
  /** peerDependencies에만 쓰는 범위. 없으면 version 사용 */
  peerVersion?: string;
  targets: Array<"--save-peer" | "--save-dev" | "--save-prod">;
  version: string;
};
