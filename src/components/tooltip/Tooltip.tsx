import { ReactNode, useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';

export const DIRECTION_TOP = 'top';
export const DIRECTION_BOTTOM = 'bottom';
export const DIRECTION_LEFT = 'left';
export const DIRECTION_RIGHT = 'right';

const TOOLTIP_POSITION_CENTER = 'center';
const TOOLTIP_POSITION_LEFT = 'left';
const TOOLTIP_POSITION_RIGHT = 'right';
const TOOLTIP_POSITION_TOP = 'top';
const TOOLTIP_POSITION_BOTTOM = 'bottom';

export interface TooltipProps {
    direction?: typeof DIRECTION_TOP | typeof DIRECTION_BOTTOM | typeof DIRECTION_LEFT | typeof DIRECTION_RIGHT;
    children: ReactNode;
    trigger: ReactNode;
    className?: string;
}

type Postition = {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
};

export const Tooltip = ({ direction, children, trigger, className }: TooltipProps) => {
    const infoRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState<boolean>(false);
    const [positioned, setPositioned] = useState<boolean>(true);
    const [position, setPosition] = useState<Postition>({});
    const [tooltipPosition, setTooltipPosition] = useState('center');

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (
                !infoRef.current?.contains(event.target) &&
                !event.target.getAttribute('data-agency-info-id') &&
                !event.target.closest('[data-agency-info-id]')
            ) {
                if (visible) {
                    setVisible(false);
                }
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [visible]);

    useEffect(() => {
        if (!triggerRef.current || !visible || !infoRef.current) {
            return;
        }

        const triggerBoundingClientRect = triggerRef.current.children[0].getBoundingClientRect();

        const triggerX = triggerBoundingClientRect.x;
        const triggerY = triggerBoundingClientRect.y;
        const triggerWidth = triggerBoundingClientRect.width;
        const triggerHeight = triggerBoundingClientRect.height;

        const infoBoundingClientRect = infoRef.current.getBoundingClientRect();
        const infoHeight = infoBoundingClientRect.height;
        const infoWidth = infoBoundingClientRect.width;

        const triggerComputedStyle = window.getComputedStyle(triggerRef.current.children[0]);

        const pos: Postition = {};

        switch (direction) {
            case DIRECTION_LEFT:
                pos.left = (infoWidth + 15) * -1;
                break;
            case DIRECTION_RIGHT:
                pos.right = (infoWidth + 15) * -1;
                break;
            case DIRECTION_TOP:
                pos.top = (infoHeight + 15) * -1;
                break;
            case DIRECTION_BOTTOM:
            default:
                pos.bottom = (infoHeight + 15) * -1;
                break;
        }

        if (direction === DIRECTION_LEFT || direction === DIRECTION_RIGHT) {
            const top = Math.floor(infoHeight / 2 - triggerHeight / 2);

            if (triggerY + top + triggerHeight > document.body.clientHeight) {
                pos.bottom = triggerHeight / 2 - 18 + parseInt(triggerComputedStyle.marginBottom, 10);
                setTooltipPosition(TOOLTIP_POSITION_TOP);
            } else if (triggerY - top - triggerHeight < 0) {
                pos.top = triggerHeight / 2 - 18 + parseInt(triggerComputedStyle.marginTop, 10);
                setTooltipPosition(TOOLTIP_POSITION_BOTTOM);
            } else {
                pos.top = top * -1;
                setTooltipPosition(TOOLTIP_POSITION_CENTER);
            }
        } else {
            const left = Math.floor(infoWidth / 2 - triggerWidth / 2);

            if (triggerX + left + triggerWidth > document.body.clientWidth) {
                pos.right = triggerWidth / 2 - 18 + parseInt(triggerComputedStyle.marginRight, 10);
                setTooltipPosition(TOOLTIP_POSITION_LEFT);
            } else if (triggerX - left - triggerWidth < 0) {
                pos.left = triggerWidth / 2 - 18 + parseInt(triggerComputedStyle.marginLeft, 10);
                setTooltipPosition(TOOLTIP_POSITION_RIGHT);
            } else {
                pos.left = left * -1;
                setTooltipPosition(TOOLTIP_POSITION_CENTER);
            }
        }

        setPosition(pos);
        setPositioned(true);
    }, [visible, triggerRef, infoRef, direction]);

    useEffect(() => {
        if (!visible) {
            setPosition({});
            setPositioned(false);
        }
    }, [visible]);

    return (
        <div
            aria-hidden="true"
            className={`tooltip tooltip--${direction || DIRECTION_BOTTOM} ${className}`}
            onClick={() => {
                setVisible(!visible);
            }}
            onMouseEnter={() => {
                if (!isMobile) {
                    setVisible(true);
                }
            }}
            onMouseLeave={() => {
                if (!isMobile) {
                    setVisible(false);
                }
            }}
        >
            <div ref={triggerRef} className="tooltip__trigger">
                {trigger}
            </div>

            {visible && (
                <div
                    className={`tooltip__content tooltip__content--${
                        positioned ? 'visible' : 'hidden'
                    } tooltip__content--position-${tooltipPosition}`}
                    style={{
                        ...position,
                    }}
                    ref={infoRef}
                >
                    {children}
                </div>
            )}
        </div>
    );
};
