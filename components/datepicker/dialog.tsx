import React, { useRef } from "react";
import type { AriaDialogProps } from "react-aria";
import { useDialog } from "react-aria";

interface DialogProps extends AriaDialogProps {
	title?: React.ReactNode;
	children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ title, children, ...props }) => {
	const ref = useRef<HTMLDivElement>(null);
	const { dialogProps, titleProps } = useDialog(props, ref);

	return (
		<div {...dialogProps} ref={ref} style={{ padding: 30 }}>
			{title && (
				<h3 {...titleProps} style={{ marginTop: 0 }}>
					{title}
				</h3>
			)}
			{children}
		</div>
	);
};

export default Dialog;
