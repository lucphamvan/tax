import { Card as RdCard, CardProps } from "@radix-ui/themes";
import style from "./card.module.css";
interface Props extends CardProps {
  children?: React.ReactNode;
}

export const Card = ({ children, ...props }: Props) => {
  return (
    <div {...props} className={`${style.kucard} ${props.className}`}>
      {children}
    </div>
  );
};
