export const log = ({
  indent = 0,
  message,
}: {
  indent?: number;
  message: string;
}) => {
  console.info(
    `${Array(indent)
      .fill(null)
      .map(() => "  ")
      .join("")}${message}`
  );
};

export const logNewLine = () => {
  console.info("");
};
