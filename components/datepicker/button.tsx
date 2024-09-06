import { useButton, AriaButtonProps } from 'react-aria'
import React from 'react'
import styled from './button.module.css'
interface ButtonProps extends AriaButtonProps {
    children: React.ReactNode
}

const CalendarButton: React.FC<ButtonProps> = (props) => {
    const ref = React.useRef<HTMLButtonElement>(null)
    const { buttonProps } = useButton(props, ref)

    return (
        <button className={styled.button} {...buttonProps} ref={ref}>
            {props.children}
        </button>
    )
}

export const NavButton: React.FC<ButtonProps> = (props) => {
    const ref = React.useRef<HTMLButtonElement>(null)
    const { buttonProps } = useButton(props, ref)

    return (
        <button className={styled.navbutton} {...buttonProps} ref={ref}>
            {props.children}
        </button>
    )
}

export default CalendarButton
