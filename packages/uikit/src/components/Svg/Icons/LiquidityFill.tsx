import * as React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";

const Icon: React.FC<React.PropsWithChildren<SvgProps>> = (props) => {
  return (
    <Svg viewBox="0 0 20 20" {...props}>
      <image width="20" height="20" href="https://static.thenounproject.com/png/3316774-200.png" />
    </Svg>
  );
};

export default Icon;
