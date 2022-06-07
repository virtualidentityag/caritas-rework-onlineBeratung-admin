/* eslint-disable  @typescript-eslint/ban-types */
import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { ButtonItem, Button } from "../button/Button";
import { Text } from "../text/Text";
import { Headline, HeadlineLevel } from "../headline/Headline";
import { ReactComponent as XIcon } from "../../resources/img/svg/x.svg";

export const OVERLAY_FUNCTIONS = {
  CLOSE: "CLOSE",
  CLOSE_SUCCESS: "CLOSE_SUCCESS",
  REDIRECT: "REDIRECT",
  REDIRECT_WITH_BLUR: "REDIRECT_WITH_BLUR",
  REDIRECT_TO_URL: "REDIRECT_TO_URL",
  LOGOUT: "LOGOUT",
  DEACTIVATE_ABSENCE: "DEACTIVATE_ABSENCE",
  COPY_LINK: "COPY_LINK",
  STOP_GROUP_CHAT: "STOP_GROUP_CHAT",
  LEAVE_GROUP_CHAT: "LEAVE_GROUP_CHAT",
  DELETE_ACCOUNT: "DELETE_ACCOUNT",
  DELETE_EMAIL: "DELETE_EMAIL",
  NEXT_STEP: "NEXT_STEP",
  PREV_STEP: "PREV_STEP",
  DELETE_SESSION: "DELETE_SESSION",
  FINISH_ANONYMOUS_CONVERSATION: "FINISH_ANONYMOUS_CONVERSATION",
  ARCHIVE: "ARCHIVE",
  CONFIRM_EDIT: "CONFIRM_EDIT",
};

export interface OverlayItem {
  buttonSet?: ButtonItem[];
  copy?: string;
  headline?: string;
  headlineStyleLevel?: HeadlineLevel;
  illustrationBackground?: "error" | "neutral" | "info";
  nestedComponent?: React.ReactNode;
  svg?: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  handleNextStep?: (callback: Function) => void;
  handleOverlay?: Function;
  step?: {
    icon: React.FunctionComponent<
      React.SVGProps<SVGSVGElement> & { title?: string }
    >;
    label: string;
  };
}

export const OverlayWrapper = (props: any) => {
  const overlay = document.getElementById("overlay");
  return overlay && ReactDOM.createPortal(props.children, overlay);
};

export function Overlay(props: {
  className?: string;
  item?: OverlayItem;
  handleOverlay?: Function;
  handleOverlayClose?: Function;
  items?: OverlayItem[];
}) {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeOverlay, setActiveOverlay] = useState<OverlayItem>(
    props.item
      ? { ...props.item, ...props.handleOverlay }
      : props.items![activeStep]
  );

  useEffect(() => {
    setActiveOverlay(
      props.item
        ? { ...props.item, ...props.handleOverlay }
        : props.items![activeStep]
    );
  }, [props.item, props.items]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.querySelector(".app")?.classList.add("app--blur");

    return () => {
      document.querySelector(".app")?.classList.remove("app--blur");
    };
  }, []);

  useEffect(() => {
    if (props.items) {
      setActiveOverlay(props.items[activeStep]);
    }
  }, [activeStep, props.items]);

  const handleButtonClick = (buttonFunction: string) => {
    if (buttonFunction === OVERLAY_FUNCTIONS.NEXT_STEP) {
      if (activeOverlay.handleNextStep) {
        activeOverlay.handleNextStep(() => {});
        setActiveStep(activeStep + 1);
      } else {
        setActiveStep(activeStep + 1);
      }
    } else if (buttonFunction === OVERLAY_FUNCTIONS.PREV_STEP) {
      setActiveStep(activeStep - 1);
    } else if (props.item && props.handleOverlay) {
      props.handleOverlay(buttonFunction);
    } else if (activeOverlay.handleOverlay) {
      activeOverlay.handleOverlay(buttonFunction);
    }
  };

  const getOverlayHeadline = () => {
    if (props.items?.some((item) => item.step)) {
      return `
				<span class="overlay__stepHeadline">
					<span class="overlay__stepHeadline--prefix">
						${activeStep + 1}${t("overlay.step.headline.prefix")}
					</span>
					${activeOverlay.headline}
				</span>
				`;
    }
    return activeOverlay.headline;
  };

  const illustration = activeOverlay.svg;
  return (
    <div
      className={clsx(
        props.className,
        "overlay",
        props.items!.length > 0 && "overlay--stepped",
        activeOverlay.svg && "overlay--illustration"
      )}
    >
      <div className="overlay__background" />
      <div className="overlay__content">
        {props.handleOverlayClose && (
          <XIcon
            className="overlay__closeIcon"
            onClick={(e) => props.handleOverlayClose!(e)}
          />
        )}
        {props.items?.some((item) => item.step) && (
          <div className="overlay__steps">
            {props.items.map((item, i) => {
              if (item.step) {
                const StepIcon = item.step?.icon;
                return (
                  <div
                    className={clsx("overlay__step", {
                      "overlay__step--active": i === activeStep,
                      "overlay__step--disabled": i > activeStep,
                    })}
                    key={i} // eslint-disable-line react/no-array-index-key
                  >
                    <div className="overlay__stepContent">
                      <div className="overlay__stepIcon">
                        <StepIcon />
                      </div>
                      <Text text={item.step.label} type="divider" />
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
        {activeOverlay.svg && (
          <div className="overlay__illustrationWrapper">
            <span
              className={clsx("overlay__illustration", {
                "overlay__illustration--error":
                  activeOverlay.illustrationBackground === "error",
                "overlay__illustration--info":
                  activeOverlay.illustrationBackground === "info",
                "overlay__illustration--neutral":
                  activeOverlay.illustrationBackground === "neutral",
              })}
            >
              {illustration}
            </span>
          </div>
        )}
        {activeOverlay.headline && (
          <Headline
            semanticLevel="3"
            text={getOverlayHeadline()!}
            styleLevel={activeOverlay.headlineStyleLevel}
          />
        )}
        {activeOverlay.copy && (
          <Text text={activeOverlay.copy} type="standard" />
        )}
        {activeOverlay.nestedComponent && (
          <div className="overlay__nestedComponent">
            {activeOverlay.nestedComponent}
          </div>
        )}
        {activeOverlay.buttonSet && activeOverlay.buttonSet.length > 0 && (
          <div className="overlay__buttons">
            {activeOverlay.buttonSet?.map((item, i) => (
              <Button
                disabled={item.disabled}
                item={item}
                key={`${i}-${item.type}`} // eslint-disable-line react/no-array-index-key
                buttonHandle={handleButtonClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
