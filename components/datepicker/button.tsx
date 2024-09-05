import { useButton, AriaButtonProps } from "react-aria";
import React from "react";
import styled from "@emotion/styled";

interface ButtonProps extends AriaButtonProps {
	children: React.ReactNode;
}

const StyledButton = styled.button`
	padding: 8px 16px;
	font-size: 16px;
	color: white;
	border: none;
	border-top-right-radius: 4px;
	border-bottom-right-radius: 4px;
	cursor: pointer;
	background-color: #81d3a6;
`;

const Button: React.FC<ButtonProps> = (props) => {
	const ref = React.useRef<HTMLButtonElement>(null);
	const { buttonProps } = useButton(props, ref);

	return (
		<StyledButton {...buttonProps} ref={ref}>
			{props.children}
		</StyledButton>
	);
};

export default Button;
