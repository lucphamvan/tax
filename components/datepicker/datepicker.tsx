import React, { useRef } from "react";
import { useDatePicker } from "react-aria";
import { useDatePickerState } from "react-stately";
import { Button, Calendar, DateField, Dialog, Popover } from "./component";

interface DatePickerProps {
	label: string;
	// Add other props as needed based on useDatePickerState requirements
}

const DatePicker: React.FC<DatePickerProps> = (props) => {
	const state = useDatePickerState(props);
	const ref = useRef<HTMLDivElement>(null);
	const {
		groupProps,
		labelProps,
		fieldProps,
		buttonProps,
		dialogProps,
		calendarProps,
	} = useDatePicker(props, state, ref);

	return (
		<div
			style={{ display: "flex", flexDirection: "column", width: "100%" }}
		>
			<div {...labelProps}>{props.label}</div>
			<div
				{...groupProps}
				ref={ref}
				className="flex gap-1 items-center border-green-400 border rounded-md"
			>
				<DateField {...fieldProps} />
				<Button {...buttonProps}>🗓</Button>
			</div>
			{state.isOpen && (
				<Popover
					state={state}
					triggerRef={ref}
					placement="bottom start"
				>
					<Dialog {...dialogProps}>
						<Calendar {...calendarProps} />
					</Dialog>
				</Popover>
			)}
		</div>
	);
};

export default DatePicker;
